function createMockSalesAgent(tools, options = {}) {
  const trace = options.trace || (() => {});

  return {
    generateStrategyForLead,
  };

  function generateStrategyForLead({ lead_id }) {
    trace("agent.start", {
      lead_id: String(lead_id),
      message: "AI agent received a request to generate a lead strategy.",
    });

    trace("tool.call", {
      tool: "getLeadMetrics",
      input: { lead_id: String(lead_id) },
      reason: "The agent must fetch deterministic CRM metrics instead of guessing.",
    });
    const metrics = tools.getLeadMetrics({ lead_id });
    trace("tool.result", {
      tool: "getLeadMetrics",
      output: metrics,
    });

    trace("tool.call", {
      tool: "getLeadContext",
      input: { lead_id: String(lead_id) },
      reason: "The agent needs only recent scoped context, not the full history.",
    });
    const context = tools.getLeadContext({ lead_id });
    trace("tool.result", {
      tool: "getLeadContext",
      output: {
        interaction_count: context.length,
        interaction_ids: context.map((interaction) => interaction.id),
      },
    });

    if (context.length === 0) {
      const fallback = {
        lead_id: String(lead_id),
        message: "Insufficient context to form strategy",
      };
      trace("agent.fallback", {
        output: fallback,
        reason: "No interaction context was available, so the agent must not invent a strategy.",
      });
      return fallback;
    }

    const draft = draftStrategy({ lead_id, metrics, context });
    trace("agent.draft", {
      output: draft,
      reason: "The agent drafted a schema-shaped strategy from tool outputs.",
    });

    trace("tool.call", {
      tool: "updateLeadStrategy",
      input: draft,
      reason: "The final answer must be written through the strategy update tool.",
    });
    const saved = tools.updateLeadStrategy(draft);
    trace("tool.result", {
      tool: "updateLeadStrategy",
      output: saved,
    });
    trace("agent.done", {
      lead_id: String(lead_id),
      message: "AI agent completed the strategy workflow.",
    });

    return saved;
  }
}

function draftStrategy({ lead_id, metrics, context }) {
  const latest = context[0];

  return {
    lead_id: String(lead_id),
    icebreaker: buildIcebreaker(latest),
    next_step: buildNextStep(metrics.stage),
    risk_level: buildRiskLevel(metrics, context),
    risk_justification: buildRiskJustification(metrics, context),
  };
}

function buildIcebreaker(latest) {
  return `Following up on your latest ${latest.type.toLowerCase()}: ${latest.notes}`;
}

function buildNextStep(stage) {
  switch (stage) {
    case "Lead":
      return "Ask for a 15-minute discovery call and confirm the business problem.";
    case "Contacted":
      return "Send a concise recap and ask for decision criteria.";
    case "Proposal":
      return "Confirm proposal blockers, decision owner, and approval timeline.";
    case "Won":
      return "Introduce onboarding and confirm kickoff details.";
    case "Lost":
      return "Move to nurture and schedule a future check-in.";
    default:
      return "Review the latest interaction and choose the next sales action.";
  }
}

function buildRiskLevel(metrics, context) {
  const notes = context.map((item) => item.notes.toLowerCase()).join(" ");

  if (metrics.stage === "Lost") return "High";
  if (notes.includes("budget") || notes.includes("competitor")) return "High";
  if (metrics.stage === "Proposal") return "Medium";
  return "Low";
}

function buildRiskJustification(metrics, context) {
  return `Stage is ${metrics.stage}, deal value is ${metrics.deal_value}, and ${context.length} recent interaction${context.length === 1 ? "" : "s"} were available.`;
}

module.exports = {
  createMockSalesAgent,
};
