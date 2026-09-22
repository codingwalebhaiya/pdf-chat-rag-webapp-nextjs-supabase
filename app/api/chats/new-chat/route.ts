import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, documents } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin.client";

export async function POST(req: Request) {
    try {
        const { fileName, mimeType, fileSize } = await req.json();

        if (!fileName || !fileSize) {
            return NextResponse.json({ error: "fileName and fileSize are required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const documentId = crypto.randomUUID();
        const chatId = crypto.randomUUID();
        const storagePath = `${user.id}/${documentId}/${fileName}`;
        const bucketName = "pdfs";
        const pineconeNamespace = `tenant_user_${user.id.toString()}`;

        // Generate Signed Upload URL from Supabase Storage using admin client
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .createSignedUploadUrl(storagePath);

        if (uploadError || !uploadData) {
            console.error("Error creating signed upload URL:", uploadError);
            return NextResponse.json(
                { error: uploadError?.message || "Failed to generate signed upload URL" },
                { status: 500 }
            );
        }

        // Insert document and chat in database transaction
        const result = await db.transaction(async (tx) => {
            const [doc] = await tx
                .insert(documents)
                .values({
                    id: documentId,
                    userId: user.id,
                    fileName,
                    mimeType: mimeType || "application/pdf",
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
                    title: fileName,
                })
                .returning();

            return { doc, chat };
        });

        return NextResponse.json({
            success: true,
            chatId: result.chat.id,
            documentId: result.doc.id,
            storagePath,
            signedUploadUrl: uploadData.signedUrl,
            token: uploadData.token,
            path: uploadData.path,
        });
    } catch (error: any) {
        console.error("Error in /api/chats/new-chat:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}