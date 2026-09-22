import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

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
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const document = await db.query.documents.findFirst({
            where: eq(documents.id, chat.documentId),
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            status: document.fileStatus,
        });
    } catch (error: any) {
        console.error("Error in /api/chats/[chatId]/status:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
