// lib/inngest/functions/ingest-pdf.ts
import { inngest } from "../inngest-client";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "@/lib/supabase/admin.client";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";

const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

const pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX!);

export const ingestPdf = inngest.createFunction(

  {
    id: "ingest-pdf",
    triggers: {
      event: "pdf/ingest.requested"
    },
    onFailure: async ({ error }) => {
      console.log(error);
    }
  },

  async ({ event, step, logger }) => {
    // throwing a standard error
    if (!event.data.documentId) {
      throw new Error("documentId is required");
    }

    logger.info(`event.data ${JSON.stringify(event.data)}`); // for local testing in terminal

    const { documentId, userId, fileName, backetName, storagePath, pineconeNamespace } = event.data;

    //step 1 : update document status to processing 
    await step.run("update-doc-status-to-processing", async () => {
      await db
        .update(documents)
        .set({ fileStatus: "processing" })
        .where(eq(documents.id, documentId));
    })

    // step 2 : Download pdf as a buffter from Supabase Storage and chunk it 
    const chunks = await step.run("download-pdf-from-supabase", async () => {
      const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
        .from(backetName)
        .download(storagePath);

      if (downloadErr) {
        // Retry the job if download fails
        throw new Error(`Failed to download: ${downloadErr.message}`);
      }

      if (!fileData) {
        throw new Error("File not found");
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer).toString("base64");

      // split pdf into chunkes
      const buffer = Buffer.from(fileBuffer, "base64");
      const blob = new Blob([buffer], { type: 'application/pdf' });

      const loader = new PDFLoader(blob, {
        splitPages: true,  // split  page by page  
      });
      const pages = await loader.load();


      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
        separators: ["\n\n", "\n", ".", " "], // splitting by double newline, then single newline, then dot, then space
      });

      const chunkedDocs = await splitter.splitDocuments(pages);
      if (chunkedDocs.length === 0) {
        console.log('No text content found extracted from the PDF.');
        return;
      }

      // chunkedDocs convert into pinecone Records
      const chunks = chunkedDocs.map((doc, index) => {
        const pageNumber = doc.metadata?.loc?.pageNumber ?? doc.metadata?.pageNumber ?? 0;

        return {
          id: `${documentId}:${index}`,
          text: doc.pageContent as string, // your Pinecone integrated embedding index needs the field configured in its field_map.
          pageNumber,
          chunkIndex: index,


        }


      })

      return chunks;
    })

    // step 3 : upsert records to pinecone 
    await step.run("upsert-records-to-pinecone", async () => {

      if (!chunks) {
        throw new Error("No chunks found");
      }
      const records = chunks.map((chunk) => ({

        id: chunk.id,
        text: chunk.text,
        // pinecone will automatically take these fields as metadata.
        documentId,
        userId,
        fileName,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,

      })



      )

      await pineconeIndex.upsertRecords(
        {
          records,
          namespace: pineconeNamespace
        }
      );

    })

    // step 4: Update status to ready
    await step.run("update-doc-status-to-complete", async () => {

      await db
        .update(documents)
        .set({
          fileStatus: "complete",

        })
        .where(eq(documents.id, documentId));
    })


    // Return success event (optional — you can return anything)
    return {
      success: true,
      documentId,
      status: "complete",
    };
  }
);



