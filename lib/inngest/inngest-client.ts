// lib/inngest/client.ts
import { Inngest } from "inngest"
import { env } from "../validations/env"

export const inngest = new Inngest({
  id: "pdf-chat-webapp-nextjs-supabase",
  checkpointing: {
    maxRuntime: "240s",
  },
  // This is the key - auto detects local vs prod
  isDev: env.NODE_ENV === "development",
})
