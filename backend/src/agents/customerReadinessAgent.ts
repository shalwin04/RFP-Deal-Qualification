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

export async function customerReadinessAgent(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---CUSTOMER READINESS AGENT---");

  const retriever = await getRetriever(state.sessionId);
  const documents = await retriever.invoke("Assess customer readiness");
  const context = documents.map((doc) => doc.pageContent).join("\n\n");

  const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert deal qualification analyst.
Assess the customer readiness based on the following criteria.
Score each between 1–5 and compute the weighted contribution based on the specified weights.

Criteria:
1. Stakeholder Clarity (Weight: 10%) – Are goals and success metrics clearly defined?
2. Decision-Maker Access (Weight: 5%) – Are sponsors or influencers identified or reachable?
3. Project Background (Weight: 5%) – Are pain points, urgency, or past attempts explained?

RFP Content:
{context}

Return your output as JSON:
{{
  "scoreBreakdown": [
    {{
      "criteria": "Stakeholder Clarity",
      "score": 4,
      "weight": 0.10,
      "weightedScore": 0.4,
      "reason": "Success criteria outlined clearly."
    }},
    {{
      "criteria": "Decision-Maker Access",
      "score": 3,
      "weight": 0.05,
      "weightedScore": 0.15,
      "reason": "Sponsors mentioned but not directly accessible."
    }},
    {{
      "criteria": "Project Background",
      "score": 5,
      "weight": 0.05,
      "weightedScore": 0.25,
      "reason": "The RFP highlights urgency and past failed projects."
    }}
  ],
  "totalScore": 0.8
}}
  `);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const output = await chain.invoke({ context });

  let customerReadinessScoreBreakdown = [];
  let customerReadinessScore = 0;

  try {
    const clean = output.trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    customerReadinessScoreBreakdown = parsed.scoreBreakdown;
    customerReadinessScore = parsed.totalScore;
    console.log("✅ Customer readiness parsed:", customerReadinessScoreBreakdown, customerReadinessScore);
  } catch (err) {
    console.error("❌ Failed to parse customer readiness output:", err, "\nRaw Output:", output);
  }

  return {
    customerReadinessScoreBreakdown,
    customerReadinessScore,
  };
}
