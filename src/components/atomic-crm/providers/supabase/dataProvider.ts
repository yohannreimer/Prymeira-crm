import { supabaseDataProvider } from "ra-supabase-core";
import {
  fetchUtils,
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
  RAFile,
  Sale,
  SalesFormData,
  SignUpData,
} from "../../types";
import type { ConfigurationContextValue } from "../../root/ConfigurationContext";
import { ATTACHMENTS_BUCKET } from "../commons/attachments";
import {
  runDealCreatedAutomations,
  runDealUpdatedAutomations,
  runLeadCreatedAutomations,
  runProposalUpdatedAutomations,
} from "../commons/automationEngine";
import { convertLead as convertLeadRecord } from "../commons/convertLead";
import {
  buildProposalNumber,
  getNextProposalStatusData,
} from "../../proposals/proposalUtils";
import { getIsInitialized } from "./authProvider";
import { getSupabaseAccessToken, getSupabaseClient } from "./supabase";
import { withTenantDataProvider } from "./tenantDataProvider";

export const createPrymeiraSupabaseHttpClient =
  (apiKey: string) => async (url: string, options: any = {}) => {
    const token = await getSupabaseAccessToken();
    const headers =
      options.headers instanceof Headers
        ? options.headers
        : new Headers(options.headers ?? {});

    headers.set("apikey", apiKey);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    return fetchUtils.fetchJson(url, {
      ...options,
      headers,
      user: token
        ? {
            authenticated: true,
            token: `Bearer ${token}`,
          }
        : options.user,
    });
  };

const getBaseDataProvider = () =>
  supabaseDataProvider({
    instanceUrl: import.meta.env.VITE_SUPABASE_URL,
    apiKey: import.meta.env.VITE_SB_PUBLISHABLE_KEY,
    supabaseClient: getSupabaseClient(),
    httpClient: createPrymeiraSupabaseHttpClient(
      import.meta.env.VITE_SB_PUBLISHABLE_KEY,
    ),
    sortOrder: "asc,desc.nullslast" as any,
  });

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

export type SyncCurrentSaleInput = {
  clerk_user_id: string;
  email: string;
  name: string | null;
  workspace_id: string;
  workspace_role: string;
  product_role: string;
};

export const buildSyncCurrentSaleRequestBody = (
  input: SyncCurrentSaleInput,
) => {
  const [first_name, ...rest] = (input.name || input.email).split(" ");

  return {
    action: "sync_current",
    clerk_user_id: input.clerk_user_id,
    email: input.email,
    first_name,
    last_name: rest.join(" ") || " ",
    workspace_id: input.workspace_id,
    workspace_role: input.workspace_role,
    product_role: input.product_role,
  };
};

export const buildAttachmentStoragePath = ({
  fileName,
  randomValue,
  workspaceId,
}: {
  fileName: string;
  randomValue: number;
  workspaceId: string;
}) => {
  const fileParts = fileName.split(".");
  const fileExt = fileParts.length > 1 ? `.${fileName.split(".").pop()}` : "";
  return `${workspaceId}/${randomValue}${fileExt}`;
};

const getCurrentWorkspaceId = () =>
  window.localStorage.getItem("prymeira.workspace_id");

const requireCurrentWorkspaceId = () => {
  const workspaceId = getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Missing Prymeira workspace context");
  }
  return workspaceId;
};

const processCompanyLogo = async (params: any) => {
  const logo = params.data.logo;

  if (logo?.rawFile instanceof File) {
    await uploadToBucket(logo);
  }

  return {
    ...params,
    data: {
      ...params.data,
      logo,
    },
  };
};

const getDataProviderWithCustomMethods = () => {
  const baseDataProvider = getBaseDataProvider();

  return {
    ...baseDataProvider,
    async getList(resource: string, params: GetListParams) {
      if (resource === "companies") {
        return baseDataProvider.getList("companies_summary", params);
      }
      if (resource === "contacts") {
        return baseDataProvider.getList("contacts_summary", params);
      }
      if (resource === "activity_log") {
        const { data, total } = await baseDataProvider.getList(
          "activity_log",
          params,
        );
        // Rename snake_case view columns to camelCase to match Activity type
        return {
          data: data.map((row: any) => ({
            ...row,
            contactNote: row.contact_note ?? undefined,
            dealNote: row.deal_note ?? undefined,
            contact_note: undefined,
            deal_note: undefined,
          })),
          total,
        };
      }

      return baseDataProvider.getList(resource, params);
    },
    async getOne(resource: string, params: any) {
      if (resource === "companies") {
        return baseDataProvider.getOne("companies_summary", params);
      }
      if (resource === "contacts") {
        return baseDataProvider.getOne("contacts_summary", params);
      }

      return baseDataProvider.getOne(resource, params);
    },

    async signUp({ email, password, first_name, last_name }: SignUpData) {
      const response = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
          },
        },
      });

      if (!response.data?.user || response.error) {
        console.error("signUp.error", response.error);
        throw new Error(response?.error?.message || "Failed to create account");
      }

      // Update the is initialized cache
      (getIsInitialized as any)._is_initialized_cache = true;

      return {
        id: response.data.user.id,
        email,
        password,
      };
    },
    async salesCreate(body: SalesFormData) {
      const workspace_id =
        (body as SalesFormData & { workspace_id?: string }).workspace_id ??
        requireCurrentWorkspaceId();
      const { data, error } = await getSupabaseClient().functions.invoke<{
        data: Sale;
      }>("users", {
        method: "POST",
        body: {
          ...body,
          workspace_id,
        },
      });

      if (!data || error) {
        console.error("salesCreate.error", error);
        const errorDetails = await (async () => {
          try {
            return (await error?.context?.json()) ?? {};
          } catch {
            return {};
          }
        })();
        throw new Error(errorDetails?.message || "Failed to create the user");
      }

      return data.data;
    },
    async salesUpdate(
      id: Identifier,
      data: Partial<Omit<SalesFormData, "password">>,
    ) {
      const { email, first_name, last_name, administrator, avatar, disabled } =
        data;
      const workspace_id =
        (data as Partial<Sale>).workspace_id ?? requireCurrentWorkspaceId();

      const { data: updatedData, error } =
        await getSupabaseClient().functions.invoke<{
          data: Sale;
        }>("users", {
          method: "PATCH",
          body: {
            sales_id: id,
            email,
            first_name,
            last_name,
            administrator,
            disabled,
            avatar,
            workspace_id,
          },
        });

      if (!updatedData || error) {
        console.error("salesCreate.error", error);
        throw new Error("Failed to update account manager");
      }

      return updatedData.data;
    },
    async syncCurrentSale(input: SyncCurrentSaleInput) {
      const { data, error } = await getSupabaseClient().functions.invoke<{
        data: Sale;
      }>("users", {
        method: "POST",
        body: buildSyncCurrentSaleRequestBody(input),
      });

      if (!data || error) {
        console.error("syncCurrentSale.error", error);
        throw new Error("Failed to sync current CRM user");
      }

      return data.data;
    },
    async updatePassword(id: Identifier) {
      const { data: passwordUpdated, error } =
        await getSupabaseClient().functions.invoke<boolean>("update_password", {
          method: "PATCH",
          body: {
            sales_id: id,
          },
        });

      if (!passwordUpdated || error) {
        console.error("update_password.error", error);
        throw new Error("Failed to update password");
      }

      return passwordUpdated;
    },
    async unarchiveDeal(deal: Deal) {
      // get all deals where stage is the same as the deal to unarchive
      const { data: deals } = await baseDataProvider.getList<Deal>("deals", {
        filter: { stage: deal.stage },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "index", order: "ASC" },
      });

      // set index for each deal starting from 1, if the deal to unarchive is found, set its index to the last one
      const updatedDeals = deals.map((d, index) => ({
        ...d,
        index: d.id === deal.id ? 0 : index + 1,
        archived_at: d.id === deal.id ? null : d.archived_at,
      }));

      return await Promise.all(
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
      return getIsInitialized();
    },
    async mergeContacts(sourceId: Identifier, targetId: Identifier) {
      const { data, error } = await getSupabaseClient().functions.invoke(
        "merge_contacts",
        {
          method: "POST",
          body: {
            loserId: sourceId,
            winnerId: targetId,
            workspace_id: requireCurrentWorkspaceId(),
          },
        },
      );

      if (error) {
        console.error("merge_contacts.error", error);
        throw new Error("Failed to merge contacts");
      }

      return data;
    },
    async convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult> {
      return convertLeadRecord(baseDataProvider, input);
    },
    async getConfiguration(): Promise<ConfigurationContextValue> {
      const { data } = await baseDataProvider.getOne("configuration", {
        id: 1,
      });
      return (data?.config as ConfigurationContextValue) ?? {};
    },
    async updateConfiguration(
      config: ConfigurationContextValue,
    ): Promise<ConfigurationContextValue> {
      const { data } = await baseDataProvider.update("configuration", {
        id: 1,
        data: { config },
        previousData: { id: 1 },
      });
      return data.config as ConfigurationContextValue;
    },
  } satisfies DataProvider;
};

type SupabaseCrmDataProvider = ReturnType<
  typeof getDataProviderWithCustomMethods
>;

export type CrmDataProvider = Omit<SupabaseCrmDataProvider, "syncCurrentSale"> &
  Partial<Pick<SupabaseCrmDataProvider, "syncCurrentSale">>;

const processConfigLogo = async (logo: any): Promise<string> => {
  if (typeof logo === "string") return logo;
  if (logo?.rawFile instanceof File) {
    await uploadToBucket(logo);
    return logo.src;
  }
  return logo?.src ?? "";
};

const getDealProbability = (
  stage: Deal["stage"] | undefined,
  probability: Deal["probability"] | undefined,
) => {
  if (stage === "won") {
    return 100;
  }
  if (stage === "lost") {
    return 0;
  }
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
      deal_type:
        params.data.deal_type === undefined
          ? (previousData?.deal_type ?? "consultative")
          : params.data.deal_type,
      probability,
      source:
        params.data.source === undefined
          ? (previousData?.source ?? null)
          : params.data.source,
      lost_reason:
        params.data.lost_reason === undefined
          ? (previousData?.lost_reason ?? null)
          : params.data.lost_reason,
      next_action_at:
        params.data.next_action_at === undefined
          ? (previousData?.next_action_at ?? null)
          : params.data.next_action_at,
      last_activity_at:
        params.data.last_activity_at === undefined
          ? (previousData?.last_activity_at ?? now)
          : params.data.last_activity_at,
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
    beforeSave: async (data: ContactNote, _, __) => {
      if (data.attachments) {
        data.attachments = await Promise.all(
          data.attachments.map((fi) => uploadToBucket(fi)),
        );
      }
      return data;
    },
  },
  {
    resource: "deal_notes",
    beforeSave: async (data: DealNote, _, __) => {
      if (data.attachments) {
        data.attachments = await Promise.all(
          data.attachments.map((fi) => uploadToBucket(fi)),
        );
      }
      return data;
    },
  },
  {
    resource: "sales",
    beforeSave: async (data: Sale, _, __) => {
      if (data.avatar) {
        await uploadToBucket(data.avatar);
      }
      return data;
    },
  },
  {
    resource: "contacts",
    beforeGetList: async (params) => {
      return applyFullTextSearch([
        "first_name",
        "last_name",
        "company_name",
        "title",
        "email",
        "phone",
        "background",
      ])(params);
    },
  },
  {
    resource: "companies",
    beforeGetList: async (params) => {
      return applyFullTextSearch([
        "name",
        "phone_number",
        "website",
        "zipcode",
        "city",
        "state_abbr",
      ])(params);
    },
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
    beforeUpdate: async (params) => {
      return await processCompanyLogo(params);
    },
  },
  {
    resource: "contacts_summary",
    beforeGetList: async (params) => {
      return applyFullTextSearch(["first_name", "last_name"])(params);
    },
  },
  {
    resource: "leads",
    beforeGetList: async (params) => {
      return applyFullTextSearch([
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "company_name",
        "source",
        "interest",
      ])(params);
    },
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
      await runLeadCreatedAutomations(dataProvider, {
        lead: result.data,
      });
      return result;
    },
    beforeUpdate: async (params: UpdateParams<Lead>) => {
      return {
        ...params,
        data: {
          ...params.data,
          updated_at: new Date().toISOString(),
        },
      };
    },
  },
  {
    resource: "deals",
    beforeGetList: async (params) => {
      return applyFullTextSearch(["name", "category", "description"])(params);
    },
    beforeCreate: async (params) => {
      return applyDealCommercialDefaults(params);
    },
    afterCreate: async (result, dataProvider) => {
      await runDealCreatedAutomations(dataProvider, {
        deal: result.data,
      });
      return result;
    },
    beforeUpdate: async (params, dataProvider) => {
      const previousDeal =
        (params.previousData as Deal | undefined) ??
        (await dataProvider.getOne<Deal>("deals", { id: params.id })).data;

      previousDealsForAutomation.set(params.id, previousDeal);
      return applyDealCommercialDefaults({
        ...params,
        previousData: previousDeal,
      });
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
      return applyProposalDefaults({
        ...params,
        previousData: previousProposal,
      });
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

export const getDataProvider = (): SupabaseCrmDataProvider => {
  if (import.meta.env.VITE_SUPABASE_URL === undefined) {
    throw new Error("Please set the VITE_SUPABASE_URL environment variable");
  }
  if (import.meta.env.VITE_SB_PUBLISHABLE_KEY === undefined) {
    throw new Error(
      "Please set the VITE_SB_PUBLISHABLE_KEY environment variable",
    );
  }
  const dataProvider = withLifecycleCallbacks(
    getDataProviderWithCustomMethods(),
    lifeCycleCallbacks,
  ) as SupabaseCrmDataProvider;

  return withTenantDataProvider(dataProvider, () => getCurrentWorkspaceId());
};

const applyFullTextSearch = (columns: string[]) => (params: GetListParams) => {
  if (!params.filter?.q) {
    return params;
  }
  const { q, ...filter } = params.filter;
  return {
    ...params,
    filter: {
      ...filter,
      "@or": columns.reduce((acc, column) => {
        if (column === "email")
          return {
            ...acc,
            [`email_fts@ilike`]: q,
          };
        if (column === "phone")
          return {
            ...acc,
            [`phone_fts@ilike`]: q,
          };
        else
          return {
            ...acc,
            [`${column}@ilike`]: q,
          };
      }, {}),
    },
  };
};

const uploadToBucket = async (fi: RAFile) => {
  if (!fi.src.startsWith("blob:") && !fi.src.startsWith("data:")) {
    // Sign URL check if path exists in the bucket
    if (fi.path) {
      const { error } = await getSupabaseClient()
        .storage.from(ATTACHMENTS_BUCKET)
        .createSignedUrl(fi.path, 60);

      if (!error) {
        return fi;
      }
    }
  }

  const dataContent = fi.src
    ? await fetch(fi.src)
        .then((res) => {
          if (res.status !== 200) {
            return null;
          }
          return res.blob();
        })
        .catch(() => null)
    : fi.rawFile;

  if (dataContent == null) {
    // We weren't able to download the file from its src (e.g. user must be signed in on another website to access it)
    // or the file has no content (not probable)
    // In that case, just return it as is: when trying to download it, users should be redirected to the other website
    // and see they need to be signed in. It will then be their responsibility to upload the file back to the note.
    return fi;
  }

  const file = fi.rawFile;
  const filePath = buildAttachmentStoragePath({
    fileName: file.name,
    randomValue: Math.random(),
    workspaceId: requireCurrentWorkspaceId(),
  });
  const { error: uploadError } = await getSupabaseClient()
    .storage.from(ATTACHMENTS_BUCKET)
    .upload(filePath, dataContent);

  if (uploadError) {
    console.error("uploadError", uploadError);
    throw new Error("Failed to upload attachment");
  }

  const { data } = getSupabaseClient()
    .storage.from(ATTACHMENTS_BUCKET)
    .getPublicUrl(filePath);

  fi.path = filePath;
  fi.src = data.publicUrl;

  // save MIME type
  const mimeType = file.type;
  fi.type = mimeType;

  return fi;
};
