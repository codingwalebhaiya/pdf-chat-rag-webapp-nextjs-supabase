import { inngest } from "../inngest-client";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "@/lib/supabase/admin.client";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { embeddingModel } from "@/utils/ai/embeddingModel"
import { PineconeStore } from "@langchain/pinecone";
import pineconeIndex from "@/lib/pinecone/pineconeIndex";

interface IEventData {
  documentId: string;
  userId: string;
  fileName: string;
  backetName: string;
  storagePath: string;
  pineconeNamespace: string;
}

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

    const { documentId, userId, backetName, fileName, storagePath, pineconeNamespace } = event.data as IEventData;

    //step 1 : update document status to processing 
    await step.run("update-doc-status-to-processing", async () => {
      await db
        .update(documents)
        .set({ fileStatus: "processing" })
        .where(eq(documents.id, documentId));
    })

    logger.info(`documentId ${documentId} status updated to processing`);

    // step 2 : Download pdf as a buffter from Supabase Storage and chunk it 
    const chunksWithMetadata = await step.run("download-pdf-from-supabase", async () => {
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

      // extract text from the fileData 
      const loader = new PDFLoader(fileData, {
        splitPages: true,  // split  page by page  
      });
      const pages = await loader.load()
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
        separators: ["\n\n", "\n", ".", " "], // splitting by double newline, then single newline, then dot, then space
      });

      const chunkedDocs = await splitter.splitDocuments(pages);
      console.log("chunkedDocs", chunkedDocs[0])
      console.log("pages", pages[0])
      if (chunkedDocs.length === 0) {
        // update document status to failed
        await db
          .update(documents)
          .set({ fileStatus: "failed" })
          .where(eq(documents.id, documentId));
        logger.info('No text content found extracted from the PDF.');
        return;
      }

      logger.info("Chunks", chunkedDocs);

      // add metadata in every chunk 
      return chunkedDocs.map((chunk) => {
        return {
          ...chunk,
          metadata: {
            ...chunk.metadata,
            documentId,
            userId,
            fileName
          },
        }
      });


    })

    logger.info(`Chunks: ${JSON.stringify(chunksWithMetadata)}`);

    // step 3 : store chunk in pinecone 
    await step.run("upsert-records-to-pinecone", async () => {
      if (!chunksWithMetadata) {
        throw new Error("No chunks found");
      }

      // store in pinecone 
      // usecase of fromDocuments - only in the time of chunk and upsert to pinecone
      await PineconeStore.fromDocuments(
        chunksWithMetadata,
        embeddingModel,
        {
          namespace: pineconeNamespace,
          pineconeIndex
        }

      )

    })
    logger.info(`Chunks upserted to pinecone`);

    // step 4: Update status to ready
    await step.run("update-doc-status-to-complete", async () => {
      await db
        .update(documents)
        .set({
          fileStatus: "complete",
        })
        .where(eq(documents.id, documentId));
    })
    logger.info(`documentId ${documentId} status updated to complete`);

    return {
      success: true,
      documentId,
      status: "complete",
    };
  }
);
