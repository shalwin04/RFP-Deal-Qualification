import { START, END, StateGraph } from "@langchain/langgraph";
import { GraphState } from "./graphState.js";
import { redFlagAgent } from "../agents/redFlagAgent.js";
import { strategicFitAgent } from "../agents/strategicFitAgent.js";
import { customerReadinessAgent } from "../agents/customerReadinessAgent.js";
// Later: import other agents and aggregator

const graph = new StateGraph(GraphState)
  .addNode("redFlagAgent", redFlagAgent)
  .addNode("strategicFitAgent", strategicFitAgent)
  .addNode("customerReadinessAgent", customerReadinessAgent)
  .addEdge(START, "redFlagAgent")
  .addEdge("redFlagAgent", "strategicFitAgent")
  .addEdge("strategicFitAgent", "customerReadinessAgent")
  .addEdge("customerReadinessAgent", END);

const compiledGraph = graph.compile();

export { compiledGraph };
