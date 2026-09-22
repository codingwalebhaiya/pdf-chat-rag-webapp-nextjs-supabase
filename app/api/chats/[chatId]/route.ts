import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, documents, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin.client";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;

        if (!chatId) {
            return NextResponse.json({ error: "chatId is required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chat = await db.query.chats.findFirst({
            where: eq(chats.id, chatId),
        });

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        if (chat.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden: You do not own this chat" }, { status: 403 });
        }

        const document = await db.query.documents.findFirst({
            where: eq(documents.id, chat.documentId),
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Fetch past messages
        const chatMessages = await db.query.messages.findMany({
            where: eq(messages.chatId, chatId),
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });

        // Generate private Signed Read URL with 1-hour expiration
        let signedUrl: string | null = null;
        try {
            const { data: signedData, error: signedError } = await supabaseAdmin.storage
                .from("pdfs")
                .createSignedUrl(document.storagePath, 3600);

            if (!signedError && signedData?.signedUrl) {
                signedUrl = signedData.signedUrl;
            } else {
                console.error("Error creating signed read URL:", signedError);
            }
        } catch (signedErr) {
            console.error("Signed URL creation failed:", signedErr);
        }

        return NextResponse.json({
            success: true,
            chat,
            document,
            signedUrl,
            messages: chatMessages,
        });
    } catch (error: any) {
        console.error("Error in /api/chats/[chatId]:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
