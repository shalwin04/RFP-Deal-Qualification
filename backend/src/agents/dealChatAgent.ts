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
 * Deal Chat Agent – responds to user questions with insights based on all agent outputs.
 */
export async function dealChatAgent(state: typeof GraphState.State): Promise<string> {
  console.log("---DEAL CHAT AGENT---");

  const {
    question,
    redFlags = [],
    documents = [],
    strategicFitScore,
    strategicFitScoreBreakdown = {},
    customerReadinessScore,
    customerReadinessScoreBreakdown = {},
    competitiveEdgeScore,
    competitiveEdgeScoreBreakdown = {},
    strategicUpsideScore,
    strategicUpsideScoreBreakdown = {},
    qualificationVerdict,
    strategyIdeas = [],
  } = state;

  const rfpContext = documents.map((doc) => doc.pageContent).join("\n\n").slice(0, 3000);

  const prompt = ChatPromptTemplate.fromTemplate(`
You are DealGPT – an AI deal advisor helping a team respond to RFPs and make go/no-go decisions.

Using the provided data and context from various qualification agents, respond to the user's question. Provide a helpful, insightful, and action-oriented response.

Context:
---
📝 RFP Extract:
{rfpContext}

🚩 Red Flags:
{redFlags}

✅ Strategic Fit Score: {strategicFitScore}
{strategicFitScoreBreakdown}

👥 Customer Readiness Score: {customerReadinessScore}
{customerReadinessScoreBreakdown}

💼 Competitive Edge Score: {competitiveEdgeScore}
{competitiveEdgeScoreBreakdown}

📈 Strategic Upside Score: {strategicUpsideScore}
{strategicUpsideScoreBreakdown}

📊 Qualification Verdict: {qualificationVerdict}
💡 Strategy Suggestions: {strategyIdeas}

User Question:
"{question}"

Respond concisely and clearly. If applicable, recommend specific actions to improve win probability.
`);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const output = await chain.invoke({
    question,
    redFlags: redFlags.join("\n"),
    rfpContext,
    strategicFitScore: strategicFitScore?.toFixed(2) ?? "N/A",
    strategicFitScoreBreakdown: JSON.stringify(strategicFitScoreBreakdown, null, 2),
    customerReadinessScore: customerReadinessScore?.toFixed(2) ?? "N/A",
    customerReadinessScoreBreakdown: JSON.stringify(customerReadinessScoreBreakdown, null, 2),
    competitiveEdgeScore: competitiveEdgeScore?.toFixed(2) ?? "N/A",
    competitiveEdgeScoreBreakdown: JSON.stringify(competitiveEdgeScoreBreakdown, null, 2),
    strategicUpsideScore: strategicUpsideScore?.toFixed(2) ?? "N/A",
    strategicUpsideScoreBreakdown: JSON.stringify(strategicUpsideScoreBreakdown, null, 2),
    qualificationVerdict: qualificationVerdict ?? "REVIEW",
    strategyIdeas: strategyIdeas.join("\n"),
  });

 
  return output.trim();

}
