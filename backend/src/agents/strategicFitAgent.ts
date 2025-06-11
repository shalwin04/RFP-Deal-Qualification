import { getRetriever } from "../utils/retriever.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { type RunnableConfig } from "@langchain/core/runnables";
import { type GraphState } from "../graph/graphState.js";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-1.5-flash",
});

/**
 * Strategic Fit Agent – evaluates strategic alignment of the RFP
 * across key feasibility dimensions and assigns scores.
 */
export async function strategicFitAgent(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---STRATEGIC FIT AGENT---");

  const retriever = await getRetriever(state.sessionId);
  const documents = await retriever.invoke("Assess RFP strategic alignment");
  const context = documents.map((doc) => doc.pageContent).join("\n\n");

  const prompt = ChatPromptTemplate.fromTemplate(`
You are a strategic deal advisor. Assess the RFP against the following criteria. For each, return:
- a score from 0.0 to 1.0
- a justification (1-2 sentences)

Criteria:
1. Market Alignment (0.10 weight) – Does the RFP align with our core industries or domains?
2. Win Probability (0.10 weight) – Do we have prior wins, sponsor connections, or history?
3. Delivery Capability (0.10 weight) – Can we deliver this well with current resources?
4. Business Justification (0.05 weight) – Is there strong revenue/margin or long-term value?

RFP Content:
{context}

Return a JSON object like this:[[{
{
  "scoreBreakdown": [
    { "criteria": "Market Alignment", "score": 0.8, "reason": "Well aligned with our core healthcare vertical." },
    { "criteria": "Win Probability", "score": 0.6, "reason": "Limited prior engagement, but known sponsor." },
    { "criteria": "Delivery Capability", "score": 0.9, "reason": "We have strong delivery capacity in region." },
    { "criteria": "Business Justification", "score": 0.7, "reason": "Reasonable revenue and future expansion potential." }
  ],
  "totalScore": 1.65
  }}]]
`);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const output = await chain.invoke({ context });

  let scoreBreakdown = [];
  let totalScore = 0;

  try {
    const clean = output.trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    scoreBreakdown = parsed.scoreBreakdown;
    totalScore = parsed.totalScore;
  } catch (err) {
    console.error("Failed to parse strategic fit output:", err, "\nRaw:", output);
  }

  return {
    scoreBreakdown,
    score: totalScore,
  };
}
