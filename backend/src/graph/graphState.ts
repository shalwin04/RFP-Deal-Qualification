import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  question: Annotation<string>(),
  sessionId: Annotation<string>(),
  documents: Annotation<any[]>(),
  redFlags: Annotation<string[]>(),
  strategicFitScore: Annotation<number>(),
  strategicFitScoreBreakdown: Annotation<Record<string, number>>(),
  customerReadinessScore: Annotation<number>(),
  customerReadinessScoreBreakdown: Annotation<Record<string, number>>(),
  qualificationVerdict: Annotation<"GO" | "REVIEW" | "NO-GO">(),
  strategyIdeas: Annotation<string[]>(),
  competitiveEdgeScore: Annotation<number>(),
  competitiveEdgeScoreBreakdown: Annotation<Record<string, number>>(),
  strategicUpsideScore: Annotation<number>(),
  strategicUpsideScoreBreakdown: Annotation<Record<string, number>>(),
});
