import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { env } from "@/lib/validations/env"

export const embeddingModel = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GOOGLE_GEMINI_API_KEY,
  model: "gemini-embedding-001",
})

// NOTE:

//gemini-embedding-2: The current flagship model, which supports multimodal inputs (text, images, audio, video, PDFs) natively.
// gemini-embedding-001: The primary successor for pure text workloads
