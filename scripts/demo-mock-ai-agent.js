const { createMockSalesAgent } = require("./mock-ai-agent");
const { createMockMcpTools, loadMockData } = require("./mock-mcp-tools");

function run() {
  const leadId = process.argv[2] || "2";
  const tools = createMockMcpTools(loadMockData());
  const agent = createMockSalesAgent(tools, { trace: printTrace });

  console.log(`\nDemo: AI agent strategy workflow for lead ${leadId}\n`);
  const result = agent.generateStrategyForLead({ lead_id: leadId });

  console.log("\nFinal response returned to UI:");
  console.log(JSON.stringify(result, null, 2));
}

function printTrace(event, details) {
  const label = {
    "agent.start": "AI Agent",
    "tool.call": "AI Agent -> MCP Tool",
    "tool.result": "MCP Tool -> AI Agent",
    "agent.draft": "AI Agent",
    "agent.fallback": "AI Agent",
    "agent.done": "AI Agent",
  }[event];

  console.log(`[${label}] ${event}`);
  console.log(JSON.stringify(details, null, 2));
  console.log("");
}

run();
