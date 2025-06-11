import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  question: Annotation<string>(),
  sessionId: Annotation<string>(),
  documents: Annotation<any[]>(),
  redFlags: Annotation<string[]>(),
  score: Annotation<number>(),
  scoreBreakdown: Annotation<Record<string, number>>(),
  qualificationVerdict: Annotation<"GO" | "REVIEW" | "NO-GO">(),
  strategyIdeas: Annotation<string[]>(),
});
