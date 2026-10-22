import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) throw new Error("Missing PINECONE_API_KEY")
if (!process.env.PINECONE_INDEX) throw new Error("Missing PINECONE_INDEX")


const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
})

const index = pinecone.Index(process.env.PINECONE_INDEX!)
export default index
