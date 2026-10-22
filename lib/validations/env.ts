import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    // required server secrets - fail if missing, never sent to browser
    PINECONE_API_KEY: z.string().trim().min(1, "PINECONE_API_KEY is required"),
    PINECONE_INDEX: z.string().trim().min(1),
    GOOGLE_GEMINI_API_KEY: z.string().trim().min(1),
    DATABASE_URL: z.string().trim().min(1), // use .url() if it's full postgres:// url, .min(1) is safer for all
    SUPABASE_SECRET_KEY: z.string().trim().min(1),
    INNGEST_SIGNING_KEY: z.string().trim().min(1),
    INNGEST_EVENT_KEY: z.string().trim().min(1),
  },
  client: {
    // only NEXT_PUBLIC_ here - this is what browser can see
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
  },
  runtimeEnv: {
    // map process.env here - required for Next.js 15+ with Turbopack
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_INDEX: process.env.PINECONE_INDEX,
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
  emptyStringAsUndefined: true, // "" is treated as missing
  // skipValidation: !!process.env.SKIP_ENV_VALIDATION, // uncomment to skip during docker build
})
