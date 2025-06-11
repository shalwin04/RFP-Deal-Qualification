import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "./supabase.js";
import dotenv from "dotenv";
dotenv.config();

const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GOOGLE_API_KEY });

export async function storeDoc(text: string, sessionId: string, section?: string) {
  const embedding = await embeddings.embedQuery(text);

  const { error } = await supabase.from("pdf_embeddings").insert([{
    content: text,
    embedding,
    session_id: sessionId,
    section: section || null,
  }]);

  if (error) console.error("❌ Error inserting embedding:", error);
}
