// lib/inngest/client.ts
import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "pdf-chat-webapp-nextjs-supabase",
  checkpointing: {
    maxRuntime: "240s",
  },
  // This is the key - auto detects local vs prod
  isDev: process.env.NODE_ENV !== "production",
})
