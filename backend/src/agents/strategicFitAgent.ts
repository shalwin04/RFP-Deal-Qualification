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
    You are a strategic deal advisor. Assess the RFP based on the criteria below. 
    For each, return:
    - a score between 1 and 5 (where 5 = excellent fit)
    - the reason for the score
    - the weightedScore (score * weight)
    
    Scoring Weights:
    - Market Alignment: 10%
    - Win Probability: 10%
    - Delivery Capability: 10%
    - Business Justification: 5%
    
    Example JSON output:
    {{
      "scoreBreakdown": [
        {{
          "criteria": "Market Alignment",
          "score": 5,
          "weight": 0.10,
          "weightedScore": 0.5,
          "reason": "Strong match with our core domain (healthcare)."
        }},
        {{
          "criteria": "Win Probability",
          "score": 4,
          "weight": 0.10,
          "weightedScore": 0.4,
          "reason": "We have prior engagement with the sponsor."
        }},
        {{
          "criteria": "Delivery Capability",
          "score": 5,
          "weight": 0.10,
          "weightedScore": 0.5,
          "reason": "We have a full delivery team available in region."
        }},
        {{
          "criteria": "Business Justification",
          "score": 4,
          "weight": 0.05,
          "weightedScore": 0.2,
          "reason": "Moderate revenue potential but good long-term client."
        }}
      ],
      "totalScore": 1.6
    }}
    
    Now analyze the RFP content below and return the JSON object:
    
    RFP Content:
    {context}
    `);
    

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const output = await chain.invoke({ context });

  let strategicFitScoreBreakdown = [];
  let strategicFitScore = 0;

  try {
    const clean = output.trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    strategicFitScoreBreakdown = parsed.scoreBreakdown;
    strategicFitScore = parsed.totalScore;
    console.log("✅ Strategic fit parsed:", strategicFitScoreBreakdown, strategicFitScore);
  } catch (err) {
    console.error("Failed to parse strategic fit output:", err, "\nRaw:", output);
  }

  return {
    strategicFitScoreBreakdown,
    strategicFitScore,
  };
}

