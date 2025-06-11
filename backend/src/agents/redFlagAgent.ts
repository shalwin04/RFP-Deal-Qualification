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
 * RedFlagAgent - analyzes the retrieved RFP content and identifies red flags
 * with detailed reasoning based on the qualification framework.
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */
export async function redFlagAgent(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---REDFLAG AGENT---");

  const retriever = await getRetriever(state.sessionId);
  const documents = await retriever.invoke("Review the RFP for red flags");
  const context = documents.map((doc) => doc.pageContent).join("\n\n");

  const prompt = ChatPromptTemplate.fromTemplate(`
You are an experienced RFP qualification analyst.

Your task is to review the provided RFP content and identify potential RED FLAGS that might reduce the likelihood of winning the deal or delivering it successfully. Use the table below as guidance and explain your reasoning for each red flag you identify.

Red Flag Criteria:
- Just added to meet vendor minimum → Consider disqualification → Low win probability → RFP
- Scope favors another vendor → Escalate to BD/Legal → Indicates bias → RFP+internal
- Unrealistic timeline or budget → Flag delivery risk → May harm quality or reputation → RFP
- No stakeholder access → Escalate internally → Prevents discovery → RFP+internal
- Vague/missing evaluation criteria → Seek clarification → Unpredictable selection → RFP

Return a list of red flag objects in the following JSON format:

[
  {{
    "flag": "<short label of the issue>",
    "action": "<recommended action>",
    "reason": "<reasoning why this is a risk based on the RFP content>",
    "source": "<RFP or internal>"
  }}
]

Carefully analyze the RFP content below:

{context}

Your output must be a clean JSON array with at least the reasoning in detail.
`);

  const redFlagChain = prompt.pipe(model).pipe(new StringOutputParser());
  const output = await redFlagChain.invoke({ context });

  let redFlags: any[] = [];
  try {
    const clean = output.trim().replace(/```json|```/g, "").trim();
    redFlags = JSON.parse(clean);
    console.log("✅ Red flags parsed:", redFlags);
  } catch (err) {
    console.error("Failed to parse red flags:", err, "\nRaw output:\n", output);
  }

  return { redFlags };
}
