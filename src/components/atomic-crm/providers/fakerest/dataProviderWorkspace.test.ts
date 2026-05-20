import { describe, expect, it } from "vitest";

import generateData, { DEFAULT_WORKSPACE_ID } from "./dataGenerator";
import { createDataProvider } from "./dataProvider";
import { tenantResources } from "../../prymeira/tenantResources";
import type { Db } from "./dataGenerator/types";

const otherWorkspaceId = "00000000-0000-0000-0000-000000000002";

const createDb = (): Db =>
  ({
    companies: [
      {
        id: 1,
        name: "Demo Co",
        workspace_id: DEFAULT_WORKSPACE_ID,
      },
      {
        id: 2,
        name: "Other Co",
        workspace_id: otherWorkspaceId,
      },
    ],
    contacts: [],
    contact_notes: [],
    deals: [],
    pipelines: [],
    deal_notes: [],
    leads: [],
    proposal_templates: [],
    proposal_template_items: [],
    proposals: [],
    proposal_items: [],
    automation_rules: [],
    sales: [],
    sales_goals: [],
    tags: [],
    automation_runs: [],
    tasks: [],
    configuration: [
      {
        id: 1,
        workspace_id: DEFAULT_WORKSPACE_ID,
        config: {},
      },
    ],
  }) as unknown as Db;

describe("FakeRest workspace isolation", () => {
  it("adds the demo workspace to all generated tenant seed records", () => {
    const db = generateData() as any;

    tenantResources.forEach((resource) => {
      const records = db[resource] ?? [];

      records.forEach((record: { workspace_id?: string }) => {
        expect(record.workspace_id, resource).toBe(DEFAULT_WORKSPACE_ID);
      });
    });
  });

  it("filters tenant list reads to the demo workspace", async () => {
    const dataProvider = createDataProvider({
      db: createDb(),
      latency: 0,
      silent: true,
    });

    const result = await dataProvider.getList("companies", {
      filter: {},
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 1,
      workspace_id: DEFAULT_WORKSPACE_ID,
    });
  });

  it("adds the demo workspace to tenant creates", async () => {
    const dataProvider = createDataProvider({
      db: createDb(),
      latency: 0,
      silent: true,
    });

    const result = await dataProvider.create("tags", {
      data: { name: "priority", color: "#ff0000" },
    });

    expect(result.data).toMatchObject({
      name: "priority",
      workspace_id: DEFAULT_WORKSPACE_ID,
    });
  });
});
