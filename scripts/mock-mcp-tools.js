const fs = require("fs");
const path = require("path");

const VALID_RISK_LEVELS = new Set(["Low", "Medium", "High"]);

function loadMockData(filePath = path.join(__dirname, "..", "mock_data.json")) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function createMockMcpTools(seedData = loadMockData()) {
  const data = structuredClone(seedData);

  function getLead(leadId) {
    return data.leads.find((lead) => lead.id === String(leadId));
  }

  function assertKnownLead(leadId) {
    const lead = getLead(leadId);
    if (!lead) {
      const error = new Error(`Lead not found: ${leadId}`);
      error.code = "LEAD_NOT_FOUND";
      throw error;
    }
    return lead;
  }

  function getLeadInteractions(leadId) {
    return data.interactions
      .filter((interaction) => interaction.lead_id === String(leadId))
      .sort(
        (left, right) =>
          Date.parse(right.interaction_date) - Date.parse(left.interaction_date),
      );
  }

  function getLeadMetrics({ lead_id }) {
    const lead = assertKnownLead(lead_id);
    const interactionCount = data.interactions.filter(
      (interaction) => interaction.lead_id === lead.id,
    ).length;

    return {
      deal_value: lead.deal_value,
      stage: lead.stage,
      interaction_count: interactionCount,
    };
  }

  function getLeadContext({ lead_id }) {
    assertKnownLead(lead_id);

    return getLeadInteractions(lead_id)
      .slice(0, 3)
      .map((interaction) => ({
        id: interaction.id,
        type: interaction.type,
        notes: interaction.notes.slice(0, 1000),
        interaction_date: interaction.interaction_date,
      }));
  }

  function updateLeadStrategy(payload) {
    const lead = assertKnownLead(payload.lead_id);
    validateStrategyPayload(payload);

    const contextIds = new Set(
      getLeadContext({ lead_id: lead.id }).map((interaction) => interaction.id),
    );

    const strategy = {
      id: existingStrategyId(data.ai_strategies, lead.id),
      lead_id: lead.id,
      icebreaker: payload.icebreaker,
      next_step: payload.next_step,
      risk_level: payload.risk_level,
      risk_justification: payload.risk_justification,
      generated_at: payload.generated_at || new Date().toISOString(),
    };

    const existingIndex = data.ai_strategies.findIndex(
      (item) => item.lead_id === lead.id,
    );
    if (existingIndex >= 0) {
      data.ai_strategies[existingIndex] = strategy;
    } else {
      data.ai_strategies.push(strategy);
    }

    data.interactions = data.interactions.map((interaction) =>
      contextIds.has(interaction.id)
        ? { ...interaction, ai_analyzed: true }
        : interaction,
    );

    return strategy;
  }

  function generateStrategy({ lead_id }) {
    const lead = assertKnownLead(lead_id);
    const context = getLeadContext({ lead_id: lead.id });

    if (context.length === 0) {
      return {
        lead_id: lead.id,
        message: "Insufficient context to form strategy",
      };
    }

    const latest = context[0];
    return updateLeadStrategy({
      lead_id: lead.id,
      icebreaker: `Hi ${lead.contact_person.split(" ")[0]}, following up on ${latest.type.toLowerCase()} notes from ${formatDate(latest.interaction_date)}.`,
      next_step: nextStepForStage(lead.stage),
      risk_level: riskLevelForStage(lead.stage),
      risk_justification: `Based on ${context.length} recent interaction${context.length === 1 ? "" : "s"} and current stage ${lead.stage}.`,
    });
  }

  function snapshot() {
    return structuredClone(data);
  }

  return {
    getLeadMetrics,
    getLeadContext,
    updateLeadStrategy,
    generateStrategy,
    snapshot,
  };
}

function validateStrategyPayload(payload) {
  const requiredFields = [
    "lead_id",
    "icebreaker",
    "next_step",
    "risk_level",
    "risk_justification",
  ];

  for (const field of requiredFields) {
    if (typeof payload[field] !== "string" || payload[field].trim() === "") {
      const error = new Error(`Invalid strategy payload field: ${field}`);
      error.code = "INVALID_STRATEGY_PAYLOAD";
      throw error;
    }
  }

  if (!VALID_RISK_LEVELS.has(payload.risk_level)) {
    const error = new Error(`Invalid risk level: ${payload.risk_level}`);
    error.code = "INVALID_RISK_LEVEL";
    throw error;
  }
}

function existingStrategyId(strategies, leadId) {
  const existing = strategies.find((strategy) => strategy.lead_id === leadId);
  if (existing) {
    return existing.id;
  }
  const numericIds = strategies
    .map((strategy) => Number(strategy.id))
    .filter(Number.isFinite);
  return String(Math.max(0, ...numericIds) + 1);
}

function riskLevelForStage(stage) {
  if (stage === "Lost") return "High";
  if (stage === "Lead") return "Medium";
  return "Low";
}

function nextStepForStage(stage) {
  switch (stage) {
    case "Lead":
      return "Schedule a discovery call.";
    case "Contacted":
      return "Send a tailored follow-up and ask for decision criteria.";
    case "Proposal":
      return "Confirm proposal blockers and next approval date.";
    case "Won":
      return "Coordinate handoff to onboarding.";
    case "Lost":
      return "Move to nurture and set a future check-in.";
    default:
      return "Review the latest interaction and choose the next action.";
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

module.exports = {
  createMockMcpTools,
  loadMockData,
};
