import { ChatPromptTemplate } from "@langchain/core/prompts";

export const ragPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `
You are a document question-answering assistant.

Answer the user's question using ONLY the provided context.

Rules:

1. Do not invent information.
2. If the answer cannot be found in the context, say:
   "I couldn't find the answer in the provided documents."
3. Give a concise but useful answer.
4. Do not use outside knowledge.

Context:

{retrievedContext}
`,
    ],

    [
        "human",
        "{query}",
    ],
]);