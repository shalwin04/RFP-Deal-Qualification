// src/App.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface Message {
  role: "user" | "agent";
  content: string;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sessionId] = useState<string>(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:3001/ask-deal-agent", {
        question: input,
        sessionId,
      });

      const agentMsg = {
        role: "agent" as const,
        content:
          res.data.redFlags?.length > 0
            ? `Red Flags:\n${res.data.redFlags.map((f: any, i: number) => `\n${i + 1}. ${f.flag} → ${f.action}`)}`
            : res.data.message || "✅ No red flags found.",
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "agent", content: "⚠️ Failed to fetch response." }]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    try {
      const res = await axios.post("http://localhost:3001/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) => [...prev, { role: "agent", content: res.data.message }]);
    } catch (err) {
      console.error("Upload error:", err);
      setMessages((prev) => [...prev, { role: "agent", content: "⚠️ File upload failed." }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Deal Qualification Assistant</h1>

      <div className="w-full max-w-2xl bg-white p-4 rounded shadow overflow-y-auto flex-1 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg shadow text-sm whitespace-pre-wrap max-w-lg ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto text-right"
                : "bg-green-100 mr-auto text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full max-w-2xl mt-4 space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm file:px-4 file:py-2 file:border file:border-gray-300 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Upload PDF
          </button>
        </div>

        <div className="flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a deal-related question..."
            className="flex-1 p-2 border border-gray-300 rounded-l"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-6 rounded-r hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
