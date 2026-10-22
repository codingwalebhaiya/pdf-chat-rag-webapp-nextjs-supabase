import { Pinecone } from "@pinecone-database/pinecone"
import { env } from "../validations/env"

const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
})

const index = pinecone.Index(env.PINECONE_INDEX)
export default index
