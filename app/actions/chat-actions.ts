'use server'

import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server'

export async function getAllChats() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return null
        }
        return await db.query.chats.findMany({
            where: eq(chats.userId, user.id),
            orderBy: (chats, { desc }) => [desc(chats.createdAt)],
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
}