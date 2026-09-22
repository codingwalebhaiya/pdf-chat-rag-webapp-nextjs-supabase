import chatModel from "@/utils/ai/chatModel"
import { ragPrompt } from "@/utils/ai/prompt"
import { StringOutputParser } from "@langchain/core/output_parsers"

interface IGenerationProps {
    query: string;
    retrievedContext: string
}

const generateAnswer = async ({ query, retrievedContext }: IGenerationProps) => {
    const chain = ragPrompt.pipe(chatModel).pipe(new StringOutputParser());
    const answer = await chain.invoke(
        {
            query,
            retrievedContext
        }
    )

    return answer;

}
export default generateAnswer;