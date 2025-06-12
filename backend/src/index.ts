import express, { Request, Response } from "express";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { processPdfUpload } from "./utils/processPDFUpload.js";
import { compiledGraph } from "./graph/graph.js";
import { dealChatAgent } from "./agents/dealChatAgent.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const sessionStates = new Map<string, any>();
/**
 * 📄 Route: Upload PDF + run agents (excluding chat agent)
 */
app.post("/upload-pdf", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId || "demo-session";
    const filePath = req.file?.path;

    if (!filePath) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    await processPdfUpload({ filePath, sessionId });
    fs.unlink(filePath, () => {}); // Delete local temp file

    // ⏱️ Trigger Graph to compute qualification + store in memory (excluding chat)
    const fullState = await compiledGraph.invoke({ sessionId });
    sessionStates.set(sessionId, fullState); // ✅ Cache it for reuse

    res.json({ message: "✅ PDF processed and agents executed.", sessionId });
  } catch (e) {
    console.error("❌ Upload failed:", e);
    res.status(500).json({ error: "Upload failed" });
  }
});

/**
 * 💬 Route: Ask a question – run only the dealChatAgent node
 */
app.post("/ask-deal-agent", async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId || "demo-session";
    const question = req.body.question;

    if (!question) {
      res.status(400).json({ error: "Missing question" });
      return;
    }

    const cachedState = sessionStates.get(sessionId);
    if (!cachedState) {
      res.status(400).json({ error: "No session found. Upload an RFP first." });
      return;
    }

    // Inject latest question into cached state
    const fullStateWithQuestion = { ...cachedState, question };

    // 💬 Use it to generate AI reply
    const answer = await dealChatAgent(fullStateWithQuestion);

    res.json({ answer });
  } catch (e) {
    console.error("❌ Deal chat error:", e);
    res.status(500).json({ error: "Failed to generate response" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
