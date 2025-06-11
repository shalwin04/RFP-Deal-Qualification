import { START, END, StateGraph } from "@langchain/langgraph";
import { GraphState } from "./graphState.js";
import { redFlagAgent } from "../agents/redFlagAgent.js";
import { strategicFitAgent } from "../agents/strategicFitAgent.js";
// Later: import other agents and aggregator

const graph = new StateGraph(GraphState)
  .addNode("redFlagAgent", redFlagAgent)
  .addNode("strategicFitAgent", strategicFitAgent)
  .addEdge(START, "redFlagAgent")
  .addEdge("redFlagAgent", "strategicFitAgent")
  .addEdge("strategicFitAgent", END);

const compiledGraph = graph.compile();

export { compiledGraph };
