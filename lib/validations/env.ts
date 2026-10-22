// lib/env.ts
import { z } from "zod"

const envSchema = z.object({
  // required server secrets - fail if missing
  PINECONE_API_KEY: z.string().trim().min(1, "PINECONE_API_KEY is required"),
  PINECONE_INDEX: z.string().trim().min(1),
  GOOGLE_GEMINI_API_KEY: z.string().trim().min(1),
  DATABASE_URL: z.string().trim().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
  SUPABASE_SECRET_KEY: z.string().trim().min(1),

  // optional - give default
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

type Env = z.infer<typeof envSchema>

// This line is the gate. If any key missing, it throws immediately on boot.
export const env: Env = (() => {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error("❌ Invalid env vars:", parsed.error.flatten().fieldErrors)
    throw new Error("Missing env vars - check Vercel + Inngest dashboards")
  }
  return parsed.data
})()
