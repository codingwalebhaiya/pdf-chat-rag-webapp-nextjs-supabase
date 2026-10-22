import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { env } from "@/lib/validations/env"

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: env.GOOGLE_GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0, // For RAG, low temperature is usually useful because you want the model to stay grounded in retrieved information.
})

export default chatModel

// best balance for free tier
//model: "gemini-2.5-flash"

// if you hit RPM limit, switch to Lite
//model: "gemini-2.5-flash-lite" // or "gemini-3.5-flash-lite"

// embeddings to replace text-embedding-3-large
//model: "gemini-embedding-001" // 3072 dims, or 768 if you set dimensions
