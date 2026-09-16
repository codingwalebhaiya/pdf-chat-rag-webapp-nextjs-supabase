import { NextResponse } from "next/server";
import { createServer } from "@/actions/auth-actions";
import { db } from "@/lib/db";
import { chats, documents } from "@/lib/db/schema";
import { inngest } from "@/lib/inngest/inngest-client"


// Define the exact shape of your event payload
interface IngestRequestedEvent {
    name: "pdf/ingest.requested";
    data: {
        documentId: string;
        userId: string;
        fileName: string;
        backetName: string;
        storagePath: string;
        pineconeNamespace: string;
    };
};

export async function POST(req: Request) {
    const { documentId, fileName, mimeType, backetName, fileSize, storagePath } = await req.json();

    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pineconeNamespace = `tenant_user_${user.id.toString()}`;
    const chatId = crypto.randomUUID();

    // insert document and chat in transaction as the user can redirect to the chat page 
    // without uploading the document, as uploading is a async process
    // transaction is good practice ?? - yes it is , in case of error it will rollback the data and db will be in consistent state 

    const result = await db.transaction(async (tx) => {
        const [doc] = await tx
            .insert(documents)
            .values({
                id: documentId,
                userId: user.id,
                fileName,
                mimeType,
                fileSize,
                storagePath,
                fileStatus: "pending",
                pineconeNamespace,

            })
            .returning();

        const [chat] = await tx
            .insert(chats)
            .values({
                id: chatId,
                userId: user.id,
                documentId,
                title: fileName, // title with file extension
            })
            .returning();

        return { doc, chat };
    });

    // Send event to Inngest
    await inngest.send({
        name: "pdf/ingest.requested",  // This matches the event used in `createFunction`
        data: {
            documentId: result.doc.id,
            userId: user.id,
            fileName,
            storagePath,
            backetName,
            pineconeNamespace: result.doc.pineconeNamespace,
        },
    } as IngestRequestedEvent

    );

    // Return immediately — client redirects to /c/[chatId]
    return NextResponse.json({
        success: true,
        documentId: result.doc.id,
        chatId: result.chat.id
    });
}