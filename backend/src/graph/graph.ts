import { START, END, StateGraph } from "@langchain/langgraph";
import { GraphState } from "./graphState.js";
import { redFlagAgent } from "../agents/redFlagAgent.js";
import { strategicFitAgent } from "../agents/strategicFitAgent.js";
import { customerReadinessAgent } from "../agents/customerReadinessAgent.js";
import { strategicUpsideAgent } from "../agents/strategicUpsideAgent.js";
// Later: import other agents and aggregator

const graph = new StateGraph(GraphState)
  .addNode("redFlagAgent", redFlagAgent)
  .addNode("strategicFitAgent", strategicFitAgent)
  .addNode("customerReadinessAgent", customerReadinessAgent)
  .addNode("strategicUpsideAgent", strategicUpsideAgent)
  .addEdge(START, "redFlagAgent")
  .addEdge("redFlagAgent", "strategicFitAgent")
  .addEdge("strategicFitAgent", "customerReadinessAgent")
  .addEdge("customerReadinessAgent", "strategicUpsideAgent")
  .addEdge("strategicUpsideAgent", END);

const compiledGraph = graph.compile();

export { compiledGraph };
