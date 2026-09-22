import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const chatModel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    model: "gemini-2.5-flash", 
    temperature: 0 // For RAG, low temperature is usually useful because you want the model to stay grounded in retrieved information.
})

export default chatModel;