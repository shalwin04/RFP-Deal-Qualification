import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "./supabase.js";
import dotenv from "dotenv";

dotenv.config();

export async function getRetriever(sessionId: string) {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
    client: supabase,
    tableName: "pdf_embeddings",
    queryName: "match_documents",
  });

  return vectorStore.asRetriever({
    filter: { user_session_id: sessionId },
  });
}
