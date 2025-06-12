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
 * Competitive Edge Agent – evaluates competitive positioning across
 * key differentiators and assigns scores.
 */
export async function competitiveEdgeAgent(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---COMPETITIVE EDGE AGENT---");

  const retriever = await getRetriever(state.sessionId);
  const documents = await retriever.invoke("Evaluate competitive edge for this deal");
  const context = documents.map((doc) => doc.pageContent).join("\n\n");

  const prompt = ChatPromptTemplate.fromTemplate(`
You are a deal pursuit strategist.
Analyze the provided RFP and internal inputs to assess competitive strength based on the following:

Criteria:
1. Relevant Experience (10%) – Do we have comparable wins, references, or IP?
2. Differentiators (10%) – Are our AI, automation, or platform features unique?
3. Client Relationship (10%) – Do we have prior engagement, rapport, or insights?

Score each on a scale of 1 (poor) to 5 (excellent). Then compute the weightedScore using the given weight.
    weightedScore = (score × weight

RFP Content and Notes:
{context}

Return your output as a JSON object like this:

{{
  "scoreBreakdown": [
    {{
      "criteria": "Relevant Experience",
      "score": 4,
      "weight": 0.10,
      "weightedScore": 0.4,
      "reason": "Two previous wins in the same industry and scope."
    }},
    {{
      "criteria": "Differentiators",
      "score": 5,
      "weight": 0.10,
      "weightedScore": 0.5,
      "reason": "Proprietary AI platform with automation tools."
    }},
    {{
      "criteria": "Client Relationship",
      "score": 3,
      "weight": 0.10,
      "weightedScore": 0.3,
      "reason": "We’ve had informal interactions with the procurement head."
    }}
  ],
  "totalScore": 1.2
}}
`);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const output = await chain.invoke({ context });

  let competitiveEdgeScoreBreakdown = [];
  let competitiveEdgeScore = 0;

  try {
    const clean = output.trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    competitiveEdgeScoreBreakdown = parsed.scoreBreakdown;
    competitiveEdgeScore = parsed.totalScore;
    console.log("✅ Competitive edge parsed:", competitiveEdgeScoreBreakdown, competitiveEdgeScore);
  } catch (err) {
    console.error("❌ Failed to parse competitive edge output:", err, "\nRaw Output:", output);
  }

  return {
    competitiveEdgeScoreBreakdown,
    competitiveEdgeScore,
  };
}
