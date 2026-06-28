const assert = require("assert/strict");

const { createMockMcpTools, loadMockData } = require("./mock-mcp-tools");

function run() {
  const seedData = loadMockData();
  const tools = createMockMcpTools(seedData);

  testLeadMetrics(tools);
  testLeadContextSorting(tools);
  testNoContextFallback(tools);
  testCreateMissingStrategy(tools);
  testUpdateExistingStrategy(tools);
  testValidation(tools);
  testUnknownLead(tools);
  testSeedFileIsNotMutated(seedData);

  console.log("mock MCP tool tests passed");
}

function testLeadMetrics(tools) {
  assert.deepEqual(tools.getLeadMetrics({ lead_id: "2" }), {
    deal_value: 15000,
    stage: "Proposal",
    interaction_count: 4,
  });
}

function testLeadContextSorting(tools) {
  const context = tools.getLeadContext({ lead_id: "2" });

  assert.equal(context.length, 3);
  assert.deepEqual(
    context.map((interaction) => interaction.id),
    ["53", "2", "52"],
  );
  assert.ok(context.every((interaction) => interaction.notes.length <= 1000));
}

function testNoContextFallback(tools) {
  assert.deepEqual(tools.getLeadContext({ lead_id: "50" }), []);
  assert.deepEqual(tools.generateStrategy({ lead_id: "50" }), {
    lead_id: "50",
    message: "Insufficient context to form strategy",
  });
}

function testCreateMissingStrategy(tools) {
  const before = tools.snapshot();
  assert.equal(
    before.ai_strategies.some((strategy) => strategy.lead_id === "45"),
    false,
  );

  const strategy = tools.generateStrategy({ lead_id: "45" });
  const after = tools.snapshot();

  assert.equal(strategy.lead_id, "45");
  assert.equal(strategy.risk_level, "Medium");
  assert.equal(
    after.ai_strategies.some((item) => item.lead_id === "45"),
    true,
  );
  assert.equal(
    after.interactions.find((interaction) => interaction.lead_id === "45")
      .ai_analyzed,
    true,
  );
}

function testUpdateExistingStrategy(tools) {
  const before = tools.snapshot();
  const beforeCount = before.ai_strategies.length;
  const beforeStrategy = before.ai_strategies.find(
    (strategy) => strategy.lead_id === "2",
  );

  const updated = tools.updateLeadStrategy({
    lead_id: "2",
    icebreaker: "Hi Jane, checking in after the latest committee review.",
    next_step: "Send a final commercial summary.",
    risk_level: "Low",
    risk_justification: "Recent interactions show active buying intent.",
    generated_at: "2026-06-28T18:00:00Z",
  });
  const after = tools.snapshot();

  assert.equal(after.ai_strategies.length, beforeCount);
  assert.equal(updated.id, beforeStrategy.id);
  assert.equal(updated.generated_at, "2026-06-28T18:00:00Z");
  assert.deepEqual(
    after.interactions
      .filter((interaction) => ["53", "2", "52"].includes(interaction.id))
      .map((interaction) => interaction.ai_analyzed),
    [true, true, true],
  );
}

function testValidation(tools) {
  assert.throws(
    () =>
      tools.updateLeadStrategy({
        lead_id: "2",
        icebreaker: "Hi Jane",
        next_step: "Follow up.",
        risk_level: "Urgent",
        risk_justification: "Invalid level.",
      }),
    /Invalid risk level/,
  );

  assert.throws(
    () =>
      tools.updateLeadStrategy({
        lead_id: "2",
        icebreaker: "",
        next_step: "Follow up.",
        risk_level: "Low",
        risk_justification: "Missing icebreaker.",
      }),
    /Invalid strategy payload field: icebreaker/,
  );
}

function testUnknownLead(tools) {
  assert.throws(
    () => tools.getLeadMetrics({ lead_id: "missing" }),
    /Lead not found: missing/,
  );
}

function testSeedFileIsNotMutated(seedData) {
  assert.equal(
    seedData.ai_strategies.some((strategy) => strategy.lead_id === "45"),
    false,
  );
  assert.equal(
    seedData.interactions.find((interaction) => interaction.lead_id === "45")
      .ai_analyzed,
    false,
  );
}

run();
