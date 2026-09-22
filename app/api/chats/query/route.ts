
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { messages } from "@/lib/db/schema";
import generateAnswer from "@/lib/rag/generation";
import retrival from "@/lib/rag/retriever";

export async function POST(req: Request) {

    try {
        const { query, chatId } = await req.json();

        if (!query || query.trim().length === 0) return NextResponse.json({ error: "Query is required" }, { status: 400 });
        if (!chatId) return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const chat = await db.query.chats.findFirst({
            where: (chats, { eq }) => eq(chats.id, chatId),
        });

        if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

        const document = await db.query.documents.findFirst({
            where: (documents, { eq }) => eq(documents.id, chat.documentId),
        });

        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        // store user message in db
        await db.insert(messages).values({
            chatId,
            content: query,
            role: "user",
            citations: [],
        });

        // retreive the similar chunks from pinecone
        const similarChunks = await retrival({ query, namespace: document.pineconeNamespace, documentId: document.id })
        console.log("similarty chunks ", similarChunks[0])

        // build citations
        const sources = similarChunks.map((doc) => ({
            fileName: doc.metadata.fileName as string,
            pageNumber: doc.metadata['loc.pageNumber'] as number,
        }));

        // retreive the content from the chunks
        const retrievedContext = similarChunks
            .map((doc) => doc.pageContent)
            .join("\n\n");

        // generate the answer
        const answer = await generateAnswer({ query, retrievedContext })
        console.log("answer", answer)

        // store ai message in db
        await db.insert(messages).values({
            chatId,
            content: answer,
            role: "assistant",
            citations: sources,
        })

        return NextResponse.json({ success: true, data: { answer, sources } });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
    }

}