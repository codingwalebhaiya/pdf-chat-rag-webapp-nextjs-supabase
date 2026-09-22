
import { embeddingModel } from "@/utils/ai/embeddingModel";
import { PineconeStore } from "@langchain/pinecone";
import pineconeIndex from "../pinecone/pineconeIndex";


const retrival = async ({ query, namespace, documentId }: {
    query: string,
    namespace: string,
    documentId: string
}) => {

    // pinecone store 
    const vectorStore = await PineconeStore.fromExistingIndex(
        embeddingModel,
        {
            pineconeIndex: pineconeIndex,
            namespace,
        }
    )

    const results = await vectorStore.similaritySearch(
        query,
        5,
        {
            documentId: {
                $eq: documentId
            }
        }
    )

    return results;
}

export default retrival;