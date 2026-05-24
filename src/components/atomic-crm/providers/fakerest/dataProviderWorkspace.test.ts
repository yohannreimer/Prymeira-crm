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
        sales_id: 1,
      },
      {
        id: 2,
        name: "Other Co",
        workspace_id: otherWorkspaceId,
        sales_id: 2,
      },
    ],
    contacts: [],
    contact_notes: [],
    deals: [
      {
        id: 10,
        name: "Demo deal",
        workspace_id: DEFAULT_WORKSPACE_ID,
        company_id: 1,
        contact_ids: [],
        category: "consulting",
        stage: "opportunity",
        description: "",
        amount: 1000,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        expected_closing_date: "2026-02-01",
        sales_id: 1,
        index: 1,
      },
      {
        id: 20,
        name: "Other deal",
        workspace_id: otherWorkspaceId,
        company_id: 2,
        contact_ids: [],
        category: "consulting",
        stage: "opportunity",
        description: "",
        amount: 2000,
        created_at: "2026-01-02T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
        expected_closing_date: "2026-02-01",
        sales_id: 2,
        index: 1,
      },
    ],
    pipelines: [],
    deal_notes: [],
    leads: [],
    proposal_templates: [],
    proposal_template_items: [],
    proposals: [],
    proposal_items: [],
    automation_rules: [],
    sales: [
      {
        id: 1,
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        administrator: true,
        workspace_id: DEFAULT_WORKSPACE_ID,
      },
      {
        id: 2,
        first_name: "Other",
        last_name: "User",
        email: "other@example.com",
        administrator: true,
        workspace_id: otherWorkspaceId,
      },
    ],
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

  it("generates deals with stages from their assigned pipeline", () => {
    const db = generateData() as any;
    const pipelineById = new Map<any, any>(
      db.pipelines.map((pipeline: any) => [pipeline.id, pipeline]),
    );

    db.deals.forEach((deal: any) => {
      const pipeline = pipelineById.get(deal.pipeline_id);
      const stageValues = pipeline.stages.map((stage: any) => stage.value);

      expect(stageValues, deal.name).toContain(deal.stage);
    });

    db.pipelines.forEach((pipeline: any) => {
      pipeline.stages.forEach((stage: any) => {
        const indexes = db.deals
          .filter(
            (deal: any) =>
              deal.pipeline_id === pipeline.id && deal.stage === stage.value,
          )
          .map((deal: any) => deal.index)
          .sort((left: number, right: number) => left - right);

        expect(indexes, `${pipeline.name}:${stage.value}`).toEqual(
          indexes.map((_: number, index: number) => index),
        );
      });
    });
  });

  it("generates valid stage task template seed data", () => {
    const db = generateData() as any;
    const pipelineById = new Map<any, any>(
      db.pipelines.map((pipeline: any) => [pipeline.id, pipeline]),
    );

    db.stage_task_templates.forEach((template: any) => {
      const pipeline = pipelineById.get(template.pipeline_id);

      expect(pipeline, template.name).toBeDefined();
      expect(
        pipeline.stages.map((stage: any) => stage.value),
        template.name,
      ).toContain(template.stage);
      expect(template.workspace_id, template.name).toBe(DEFAULT_WORKSPACE_ID);
      expect(["manual", "automatic"], template.name).toContain(template.mode);
      expect(template.assignee, template.name).toBe("record_owner");
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

  it("keeps activity log scoped to the demo workspace", async () => {
    const dataProvider = createDataProvider({
      db: createDb(),
      latency: 0,
      silent: true,
    });

    const result = await dataProvider.getList("activity_log", {
      filter: {},
      pagination: { page: 1, perPage: 10 },
      sort: { field: "date", order: "DESC" },
    });

    expect(result.data.map((record) => record.id)).toEqual([
      "deal.10.created",
      "company.1.created",
    ]);
  });

  it("adds the demo workspace when signing up a demo user", async () => {
    const dataProvider = createDataProvider({
      db: createDb(),
      latency: 0,
      silent: true,
    });

    const user = await dataProvider.signUp({
      email: "new@example.com",
      password: "secret",
      first_name: "New",
      last_name: "User",
    });

    expect(user).toMatchObject({
      email: "new@example.com",
      workspace_id: DEFAULT_WORKSPACE_ID,
    });
  });

  it("unarchives only deals from the demo workspace", async () => {
    const dataProvider = createDataProvider({
      db: createDb(),
      latency: 0,
      silent: true,
    });

    await dataProvider.unarchiveDeal({
      id: 10,
      stage: "opportunity",
      workspace_id: DEFAULT_WORKSPACE_ID,
    } as any);

    const { data: otherDeal } = await dataProvider.getOne("deals", { id: 20 });

    expect(otherDeal).toMatchObject({
      id: 20,
      index: 1,
      workspace_id: otherWorkspaceId,
    });
  });
});
