import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest/inngest-client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { documentId, chatId } = await req.json();

        if (!documentId) {
            return NextResponse.json({ error: "documentId is required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch document and verify user ownership
        const document = await db.query.documents.findFirst({
            where: eq(documents.id, documentId),
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (document.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden: You do not own this document" }, { status: 403 });
        }

        // Trigger background Inngest ingestion pipeline
        await inngest.send({
            name: "pdf/ingest.requested",
            data: {
                documentId: document.id,
                userId: user.id,
                storagePath: document.storagePath,
                backetName: "pdfs",
                fileName: document.fileName,
                pineconeNamespace: document.pineconeNamespace,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Background ingestion pipeline initiated",
            documentId: document.id,
            chatId,
        });
    } catch (error: any) {
        console.error("Error in /api/chats/background-process:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
