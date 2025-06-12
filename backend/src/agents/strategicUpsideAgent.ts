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

export async function strategicUpsideAgent(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---STRATEGIC UPSIDE AGENT---");

  const retriever = await getRetriever(state.sessionId);
  const documents = await retriever.invoke("Evaluate strategic upside of this deal");
  const context = documents.map((doc) => doc.pageContent).join("\n\n");

  const prompt = ChatPromptTemplate.fromTemplate(`
    You are a strategic sales advisor. Your task is to evaluate the *strategic upside* of a potential deal.
    
    Assess the RFP using the two criteria below. For each, provide:
    - A score between 1 to 5
    - A clear reason for the score
    - The weight
    - The calculated weightedScore (score × weight)
    
    Scoring Criteria:
    1. Long-Term Potential (Weight: 10%)  
       🔍 Ask: Can this lead to expansion, upsell, or land-and-expand?  
       🟢 Ask internal sales/SME if unclear.
    
    2. Brand or Market Value (Weight: 5%)  
       🔍 Ask: Does this win enhance the brand or break into a new market segment?  
       🟡 Use external data or AI search if unclear.
    
    Return your output as a clean JSON object like:
    {{
      "scoreBreakdown": [
        {{
          "criteria": "Long-Term Potential",
          "score": 4,
          "weight": 0.10,
          "weightedScore": 0.4,
          "reason": "Strong opportunity to upsell post-implementation."
        }},
        {{
          "criteria": "Brand or Market Value",
          "score": 3,
          "weight": 0.05,
          "weightedScore": 0.15,
          "reason": "Moderate brand visibility in a growing segment."
        }}
      ],
      "totalScore": 0.55
    }}
    
    RFP Content:
    {context}
  `);
    

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const output = await chain.invoke({ context });

  let strategicUpsideScoreBreakdown = [];
  let strategicUpsideScore = 0;

  try {
    const clean = output.trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    strategicUpsideScoreBreakdown = parsed.scoreBreakdown;
    strategicUpsideScore = parsed.totalScore;
    console.log("✅ Strategic upside parsed:", strategicUpsideScoreBreakdown, strategicUpsideScore);
  } catch (err) {
    console.error("❌ Failed to parse strategic upside output:", err, "\nRaw Output:", output);
  }

  return {
    strategicUpsideScoreBreakdown,
    strategicUpsideScore,
  };
}
