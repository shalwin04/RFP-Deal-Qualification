import express, { Request, Response } from "express";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { processPdfUpload } from "./utils/processPDFUpload.js";
import { compiledGraph } from "./graph/graph.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Route: Upload and process PDF
app.post("/upload-pdf", upload.single("file"), async (req :Request, res :Response) => {
  try {
    const sessionId = req.body.sessionId || "demo-session";
    const filePath = req.file?.path;

    if (!filePath) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    await processPdfUpload({ filePath, sessionId });

    // Optional: delete local file after embedding
    fs.unlink(filePath, () => {});

    res.json({ message: "✅ PDF processed and embedded.", sessionId });
  } catch (e) {
    console.error("❌ Upload failed:", e);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Route: Run Deal Agent Graph
app.post("/ask-deal-agent", async (req :Request, res :Response) => {
  try {
    const sessionId = req.body.sessionId || "demo-session";
    const question = req.body.question;

    if (!question) {
      res.status(400).json({ error: "Missing question" });
      return;
    }

    const inputs = { question, sessionId };
    const config = {
        configurable: {
          thread_id: `user-signin-${Date.now()}`,
        },
      };

    let responsePayload = {
      redFlags: [] as string[],
      message: "No agent response.",
    };

    for await (const output of await compiledGraph.stream(inputs, config)) {
      const key = Object.keys(output)[0];
      const value = output[key as keyof typeof output];

      if (key === "redFlagAgent" && "redFlags" in value) {
        responsePayload.redFlags = value.redFlags || [];
        responsePayload.message = "Red flags detected.";
      }
    }

    res.json(responsePayload);
  } catch (e) {
    console.error("❌ Agent error:", e);
    res.status(500).json({ error: "Agent processing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
