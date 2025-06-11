import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { storeDoc } from "./storeDocs.js"; // your existing Supabase vector insertion logic

export async function processPdfUpload({
  filePath,
  sessionId,
}: {
  filePath: string;
  sessionId: string;
}) {
  const loader = new PDFLoader(filePath, { parsedItemSeparator: "" });
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  for (const chunk of chunks) {
    await storeDoc(chunk.pageContent, sessionId);
  }

  console.log("✅ PDF processed and embedded for:", sessionId);
}
