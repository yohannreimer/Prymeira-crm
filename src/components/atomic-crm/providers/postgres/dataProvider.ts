import {
  withLifecycleCallbacks,
  type CreateParams,
  type DataProvider,
  type GetListParams,
  type Identifier,
  type ResourceCallbacks,
  type UpdateParams,
} from "ra-core";

import type {
  ContactNote,
  ConvertLeadInput,
  ConvertLeadResult,
  Deal,
  DealNote,
  Lead,
  Proposal,
  Sale,
  SalesFormData,
  SignUpData,
} from "../../types";
import type { ConfigurationContextValue } from "../../root/ConfigurationContext";
import {
  runDealCreatedAutomations,
  runDealUpdatedAutomations,
  runLeadCreatedAutomations,
  runProposalUpdatedAutomations,
} from "../commons/automationEngine";
import { convertLead as convertLeadRecord } from "../commons/convertLead";
import { mergeContacts as mergeContactsRecord } from "../commons/mergeContacts";
import {
  buildProposalNumber,
  getNextProposalStatusData,
} from "../../proposals/proposalUtils";
import { getPostgresAccessToken } from "./authToken";
import {
  invitePrymeiraProductMember,
} from "../../prymeira/accountApi";

export type SyncCurrentSaleInput = {
  clerk_user_id: string;
  email: string;
  name: string | null;
  workspace_id: string;
  workspace_role: string;
  product_role: string;
};

const getApiBaseUrl = () =>
  (import.meta.env.VITE_CRM_API_URL || "/api").replace(/\/$/, "");

const getCurrentWorkspaceId = () =>
  window.localStorage.getItem("prymeira.workspace_id");

const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = await getPostgresAccessToken();
  if (!token) throw new Error("Missing Prymeira access token");

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || "CRM API request failed");
  }
  return payload as T;
};

const toQuery = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, JSON.stringify(value));
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

const makeRecordPath = (resource: string, id?: Identifier) =>
  `/records/${encodeURIComponent(resource)}${
    id == null ? "" : `/${encodeURIComponent(String(id))}`
  }`;

const getNextProposalNumber = async (dataProvider: DataProvider) => {
  const { data: proposals } = await dataProvider.getList<Proposal>(
    "proposals",
    {
      filter: {},
      sort: { field: "id", order: "DESC" },
      pagination: { page: 1, perPage: 1 },
    },
  );
  const latestId = Number(proposals[0]?.id);

  return buildProposalNumber(Number.isFinite(latestId) ? latestId + 1 : 1);
};

const makeBaseDataProvider = () =>
  ({
    async getList(resource: string, params: GetListParams) {
      return request<{ data: any[]; total: number }>(
        `${makeRecordPath(resource)}${toQuery({
          filter: params.filter ?? {},
          sort: params.sort ?? { field: "id", order: "ASC" },
          pagination: params.pagination ?? { page: 1, perPage: 25 },
        })}`,
      );
    },
    async getOne(resource: string, params: any) {
      return request<{ data: any }>(makeRecordPath(resource, params.id));
    },
    async getMany(resource: string, params: any) {
      const response = await request<{ data: any[]; total: number }>(
        `${makeRecordPath(resource)}${toQuery({
          filter: { "id@in": params.ids },
          sort: { field: "id", order: "ASC" },
          pagination: { page: 1, perPage: Math.max(params.ids.length, 1) },
        })}`,
      );
      return { data: response.data };
    },
    async getManyReference(resource: string, params: any) {
      return this.getList(resource, {
        ...params,
        filter: {
          ...params.filter,
          [`${params.target}@eq`]: params.id,
        },
      });
    },
    async create(resource: string, params: any) {
      return request<{ data: any }>(makeRecordPath(resource), {
        method: "POST",
        body: JSON.stringify(params.data),
      });
    },
    async update(resource: string, params: any) {
      return request<{ data: any }>(makeRecordPath(resource, params.id), {
        method: "PUT",
        body: JSON.stringify(params.data),
      });
    },
    async updateMany(resource: string, params: any) {
      await Promise.all(
        params.ids.map((id: Identifier) =>
          this.update(resource, {
            id,
            data: params.data,
            previousData: params.previousData,
          }),
        ),
      );
      return { data: params.ids };
    },
    async delete(resource: string, params: any) {
      return request<{ data: any }>(makeRecordPath(resource, params.id), {
        method: "DELETE",
      });
    },
    async deleteMany(resource: string, params: any) {
      await Promise.all(
        params.ids.map((id: Identifier) =>
          this.delete(resource, { id, previousData: params.previousData }),
        ),
      );
      return { data: params.ids };
    },
  }) satisfies DataProvider;

const getDataProviderWithCustomMethods = () => {
  const baseDataProvider = makeBaseDataProvider();

  return {
    ...baseDataProvider,
    async signUp({ email, password }: SignUpData) {
      return { id: email, email, password };
    },
    async salesCreate(body: SalesFormData) {
      const token = await getPostgresAccessToken();
      if (!token) throw new Error("Missing Prymeira access token");
      await invitePrymeiraProductMember(token, {
        email: body.email,
        name: [body.first_name, body.last_name].filter(Boolean).join(" "),
        role: body.administrator ? "admin" : "member",
      });

      const { data } = await baseDataProvider.create<Sale>("sales", {
        data: {
          ...body,
          clerk_user_id: `manual:${body.email}`,
          disabled: body.disabled ?? false,
          administrator: body.administrator ?? false,
        },
      });
      return data;
    },
    async salesUpdate(
      id: Identifier,
      data: Partial<Omit<SalesFormData, "password">>,
    ) {
      const { data: updatedData } = await baseDataProvider.update<Sale>(
        "sales",
        {
          id,
          data,
          previousData: { id },
        },
      );
      return updatedData;
    },
    async syncCurrentSale(input: SyncCurrentSaleInput) {
      const response = await request<{ data: Sale }>("/auth/sync-current-sale", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return response.data;
    },
    async updatePassword(_id: Identifier) {
      return true;
    },
    async unarchiveDeal(deal: Deal) {
      const { data: deals } = await baseDataProvider.getList<Deal>("deals", {
        filter: { stage: deal.stage },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "index", order: "ASC" },
      });

      const updatedDeals = deals.map((d, index) => ({
        ...d,
        index: d.id === deal.id ? 0 : index + 1,
        archived_at: d.id === deal.id ? null : d.archived_at,
      }));

      return Promise.all(
        updatedDeals.map((updatedDeal) =>
          baseDataProvider.update("deals", {
            id: updatedDeal.id,
            data: updatedDeal,
            previousData: deals.find((d) => d.id === updatedDeal.id),
          }),
        ),
      );
    },
    async isInitialized() {
      return true;
    },
    async mergeContacts(sourceId: Identifier, targetId: Identifier) {
      return mergeContactsRecord(sourceId, targetId, baseDataProvider);
    },
    async convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult> {
      return convertLeadRecord(baseDataProvider, input);
    },
    async getConfiguration(): Promise<ConfigurationContextValue> {
      const { data } =
        await request<{ data: ConfigurationContextValue }>("/configuration");
      return data ?? {};
    },
    async updateConfiguration(
      config: ConfigurationContextValue,
    ): Promise<ConfigurationContextValue> {
      const { data } = await request<{ data: ConfigurationContextValue }>(
        "/configuration",
        {
          method: "PUT",
          body: JSON.stringify({ config }),
        },
      );
      return data ?? {};
    },
  } satisfies DataProvider;
};

export interface CrmDataProvider extends DataProvider {
  signUp: (data: SignUpData) => Promise<{ id: Identifier; email: string; password: string }>;
  salesCreate: (body: SalesFormData) => Promise<Sale>;
  salesUpdate: (
    id: Identifier,
    data: Partial<Omit<SalesFormData, "password">>,
  ) => Promise<Sale>;
  syncCurrentSale?: (input: SyncCurrentSaleInput) => Promise<Sale>;
  updatePassword: (id: Identifier) => Promise<boolean>;
  unarchiveDeal: (deal: Deal) => Promise<unknown>;
  isInitialized: () => Promise<boolean>;
  mergeContacts: (sourceId: Identifier, targetId: Identifier) => Promise<unknown>;
  convertLead: (input: ConvertLeadInput) => Promise<ConvertLeadResult>;
  getConfiguration: () => Promise<ConfigurationContextValue>;
  updateConfiguration: (
    config: ConfigurationContextValue,
  ) => Promise<ConfigurationContextValue>;
}

const processFile = async (fileLike: any): Promise<any> => {
  if (!fileLike?.rawFile || !(fileLike.rawFile instanceof File)) {
    return fileLike;
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(fileLike.rawFile);
  });
  return {
    src: dataUrl,
    title: fileLike.title || fileLike.rawFile.name,
    path: fileLike.path,
    type: fileLike.rawFile.type,
  };
};

const processConfigLogo = async (logo: any): Promise<string> => {
  if (typeof logo === "string") return logo;
  const processed = await processFile(logo);
  return processed?.src ?? "";
};

const processCompanyLogo = async (params: any) => ({
  ...params,
  data: {
    ...params.data,
    logo: await processFile(params.data.logo),
  },
});

const getDealProbability = (
  stage: Deal["stage"] | undefined,
  probability: Deal["probability"] | undefined,
) => {
  if (stage === "won") return 100;
  if (stage === "lost") return 0;
  return probability === undefined ? 25 : probability;
};

const applyDealCommercialDefaults = <
  T extends CreateParams<Deal> | UpdateParams<Deal>,
>(
  params: T,
  now = new Date().toISOString(),
): T => {
  const previousData =
    "previousData" in params
      ? (params.previousData as Deal | undefined)
      : undefined;
  const stage = params.data.stage ?? previousData?.stage;
  const probability = getDealProbability(
    stage,
    params.data.probability === undefined
      ? previousData?.probability
      : params.data.probability,
  );

  return {
    ...params,
    data: {
      ...params.data,
      deal_type: params.data.deal_type ?? previousData?.deal_type ?? "consultative",
      probability,
      source: params.data.source ?? previousData?.source ?? null,
      lost_reason: params.data.lost_reason ?? previousData?.lost_reason ?? null,
      next_action_at:
        params.data.next_action_at ?? previousData?.next_action_at ?? null,
      last_activity_at:
        params.data.last_activity_at ?? previousData?.last_activity_at ?? now,
    },
  };
};

const applyProposalDefaults = <
  T extends CreateParams<Proposal> | UpdateParams<Proposal>,
>(
  params: T,
  now = new Date().toISOString(),
): T => {
  const previousData =
    "previousData" in params
      ? (params.previousData as Proposal | undefined)
      : undefined;
  const status = (params.data.status ??
    previousData?.status ??
    "draft") as Proposal["status"];
  const statusData =
    previousData && previousData.status !== status
      ? getNextProposalStatusData(status, new Date(now))
      : { status };

  return {
    ...params,
    data: {
      ...params.data,
      ...statusData,
      currency: params.data.currency ?? previousData?.currency ?? "BRL",
      subtotal: params.data.subtotal ?? previousData?.subtotal ?? 0,
      discount_amount:
        params.data.discount_amount ?? previousData?.discount_amount ?? 0,
      tax_amount: params.data.tax_amount ?? previousData?.tax_amount ?? 0,
      total: params.data.total ?? previousData?.total ?? 0,
      created_at: params.data.created_at ?? previousData?.created_at ?? now,
      updated_at: now,
    },
  };
};

const previousDealsForAutomation = new Map<Identifier, Deal>();
const previousProposalsForAutomation = new Map<Identifier, Proposal>();

const lifeCycleCallbacks: ResourceCallbacks[] = [
  {
    resource: "configuration",
    beforeUpdate: async (params) => {
      const config = params.data.config;
      if (config) {
        config.lightModeLogo = await processConfigLogo(config.lightModeLogo);
        config.darkModeLogo = await processConfigLogo(config.darkModeLogo);
      }
      return params;
    },
  },
  {
    resource: "contact_notes",
    beforeSave: async (data: ContactNote) => ({
      ...data,
      attachments: data.attachments
        ? await Promise.all(data.attachments.map((file) => processFile(file)))
        : data.attachments,
    }),
  },
  {
    resource: "deal_notes",
    beforeSave: async (data: DealNote) => ({
      ...data,
      attachments: data.attachments
        ? await Promise.all(data.attachments.map((file) => processFile(file)))
        : data.attachments,
    }),
  },
  {
    resource: "sales",
    beforeSave: async (data: Sale) => ({
      ...data,
      avatar: await processFile(data.avatar),
    }),
  },
  {
    resource: "companies",
    beforeCreate: async (params) => {
      const createParams = await processCompanyLogo(params);
      return {
        ...createParams,
        data: {
          created_at: new Date().toISOString(),
          ...createParams.data,
        },
      };
    },
    beforeUpdate: async (params) => processCompanyLogo(params),
  },
  {
    resource: "leads",
    beforeCreate: async (params: CreateParams<Lead>) => {
      const now = new Date().toISOString();
      return {
        ...params,
        data: {
          status: "new",
          temperature: "warm",
          created_at: now,
          updated_at: now,
          ...params.data,
        },
      };
    },
    afterCreate: async (result, dataProvider) => {
      await runLeadCreatedAutomations(dataProvider, { lead: result.data });
      return result;
    },
    beforeUpdate: async (params: UpdateParams<Lead>) => ({
      ...params,
      data: {
        ...params.data,
        updated_at: new Date().toISOString(),
      },
    }),
  },
  {
    resource: "deals",
    beforeCreate: async (params) => applyDealCommercialDefaults(params),
    afterCreate: async (result, dataProvider) => {
      await runDealCreatedAutomations(dataProvider, { deal: result.data });
      return result;
    },
    beforeUpdate: async (params, dataProvider) => {
      const previousDeal =
        (params.previousData as Deal | undefined) ??
        (await dataProvider.getOne<Deal>("deals", { id: params.id })).data;
      previousDealsForAutomation.set(params.id, previousDeal);
      return applyDealCommercialDefaults({ ...params, previousData: previousDeal });
    },
    afterUpdate: async (result, dataProvider) => {
      const previousDeal = previousDealsForAutomation.get(result.data.id);
      if (previousDeal) {
        await runDealUpdatedAutomations(dataProvider, {
          previousDeal,
          deal: result.data,
        });
      }
      previousDealsForAutomation.delete(result.data.id);
      return result;
    },
  },
  {
    resource: "proposals",
    beforeCreate: async (
      params: CreateParams<Proposal>,
      dataProvider: DataProvider,
    ) => {
      const now = new Date().toISOString();
      const number =
        params.data.number ?? (await getNextProposalNumber(dataProvider));
      return applyProposalDefaults(
        {
          ...params,
          data: {
            ...params.data,
            number,
            created_at: params.data.created_at ?? now,
            updated_at: now,
          },
        },
        now,
      );
    },
    beforeUpdate: async (params: UpdateParams<Proposal>, dataProvider) => {
      const previousProposal =
        (params.previousData as Proposal | undefined) ??
        (await dataProvider.getOne<Proposal>("proposals", { id: params.id }))
          .data;
      previousProposalsForAutomation.set(params.id, previousProposal);
      return applyProposalDefaults({ ...params, previousData: previousProposal });
    },
    afterUpdate: async (result, dataProvider) => {
      const previousProposal = previousProposalsForAutomation.get(
        result.data.id,
      );
      if (previousProposal) {
        await runProposalUpdatedAutomations(dataProvider, {
          previousProposal,
          proposal: result.data,
        });
      }
      previousProposalsForAutomation.delete(result.data.id);
      return result;
    },
  } satisfies ResourceCallbacks<Proposal>,
];

export const getDataProvider = (): CrmDataProvider => {
  const dataProvider = withLifecycleCallbacks(
    getDataProviderWithCustomMethods(),
    lifeCycleCallbacks,
  ) as CrmDataProvider;

  return {
    ...dataProvider,
    async create(resource: string, params: CreateParams) {
      if (!getCurrentWorkspaceId()) {
        throw new Error("Missing Prymeira workspace context");
      }
      return dataProvider.create(resource, params);
    },
  };
};
