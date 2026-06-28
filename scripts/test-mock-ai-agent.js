const assert = require("assert/strict");

const { createMockSalesAgent } = require("./mock-ai-agent");
const { createMockMcpTools, loadMockData } = require("./mock-mcp-tools");

function run() {
  testAgentUsesMcpToolSequence();
  testAgentFallbackDoesNotUpdateStrategy();
  testAgentCreatesStrategyForMissingStrategyLead();
  testAgentMarksContextInteractionsAnalyzed();

  console.log("mock AI agent tests passed");
}

function testAgentUsesMcpToolSequence() {
  const tools = createRecordingTools(createMockMcpTools(loadMockData()));
  const agent = createMockSalesAgent(tools);

  const result = agent.generateStrategyForLead({ lead_id: "2" });

  assert.equal(result.lead_id, "2");
  assert.deepEqual(tools.calls, [
    "getLeadMetrics",
    "getLeadContext",
    "updateLeadStrategy",
  ]);
}

function testAgentFallbackDoesNotUpdateStrategy() {
  const tools = createRecordingTools(createMockMcpTools(loadMockData()));
  const agent = createMockSalesAgent(tools);

  const result = agent.generateStrategyForLead({ lead_id: "50" });

  assert.deepEqual(result, {
    lead_id: "50",
    message: "Insufficient context to form strategy",
  });
  assert.deepEqual(tools.calls, ["getLeadMetrics", "getLeadContext"]);
}

function testAgentCreatesStrategyForMissingStrategyLead() {
  const tools = createMockMcpTools(loadMockData());
  const agent = createMockSalesAgent(tools);

  assert.equal(
    tools.snapshot().ai_strategies.some((strategy) => strategy.lead_id === "45"),
    false,
  );

  const strategy = agent.generateStrategyForLead({ lead_id: "45" });

  assert.equal(strategy.lead_id, "45");
  assert.equal(strategy.risk_level, "Low");
  assert.match(strategy.icebreaker, /latest email/i);
  assert.equal(
    tools.snapshot().ai_strategies.some((item) => item.lead_id === "45"),
    true,
  );
}

function testAgentMarksContextInteractionsAnalyzed() {
  const tools = createMockMcpTools(loadMockData());
  const agent = createMockSalesAgent(tools);

  agent.generateStrategyForLead({ lead_id: "2" });

  const snapshot = tools.snapshot();
  const analyzedById = new Map(
    snapshot.interactions.map((interaction) => [
      interaction.id,
      interaction.ai_analyzed,
    ]),
  );

  assert.equal(analyzedById.get("53"), true);
  assert.equal(analyzedById.get("2"), true);
  assert.equal(analyzedById.get("52"), true);
}

function createRecordingTools(tools) {
  const calls = [];

  return {
    calls,
    getLeadMetrics(input) {
      calls.push("getLeadMetrics");
      return tools.getLeadMetrics(input);
    },
    getLeadContext(input) {
      calls.push("getLeadContext");
      return tools.getLeadContext(input);
    },
    updateLeadStrategy(input) {
      calls.push("updateLeadStrategy");
      return tools.updateLeadStrategy(input);
    },
  };
}

run();
