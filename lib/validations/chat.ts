// lib/validations/chat.ts
import { z } from "zod";

export const chatMessageSchema = z.object({
    chatId: z.string().uuid(),
    content: z.string().min(1).max(4000),
});