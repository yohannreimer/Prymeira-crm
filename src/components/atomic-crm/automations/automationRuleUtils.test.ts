import { describe, expect, it } from "vitest";

import {
  describeAutomationRule,
  normalizeAutomationParams,
} from "./automationRuleUtils";

describe("automationRuleUtils", () => {
  it("normalizes invalid numeric params to safe defaults", () => {
    expect(
      normalizeAutomationParams("proposal.sent-follow-up", {
        dueInDays: -2,
        taskType: "",
        taskText: "",
      }),
    ).toEqual({
      dueInDays: 2,
      taskType: "follow-up",
      taskText: "Acompanhar proposta: {{proposal.title}}",
      assignee: "record_owner",
    });
  });

  it("describes a known rule in pt-BR", () => {
    expect(describeAutomationRule("proposal.sent-follow-up")).toEqual({
      trigger: "Proposta marcada como enviada",
      condition: "Status mudou para enviada",
      action: "Criar tarefa de follow-up",
    });
  });
});
