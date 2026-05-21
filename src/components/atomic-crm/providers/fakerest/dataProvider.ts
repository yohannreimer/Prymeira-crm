import {
  withLifecycleCallbacks,
  type CreateParams,
  type DataProvider,
  type GetListParams,
  type Identifier,
  type ResourceCallbacks,
  type UpdateParams,
} from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";

import type {
  Company,
  Contact,
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
  Task,
} from "../../types";
import type { ConfigurationContextValue } from "../../root/ConfigurationContext";
import {
  addWorkspaceToCreateParams,
  isTenantResource,
} from "../../prymeira/tenantResources";
import { getActivityLog } from "../commons/activity";
import {
  runDealCreatedAutomations,
  runDealUpdatedAutomations,
  runLeadCreatedAutomations,
  runProposalUpdatedAutomations,
} from "../commons/automationEngine";
import { convertLead as convertLeadRecord } from "../commons/convertLead";
import { getCompanyAvatar } from "../commons/getCompanyAvatar";
import { getContactAvatar } from "../commons/getContactAvatar";
import { mergeContacts } from "../commons/mergeContacts";
import {
  buildProposalNumber,
  getNextProposalStatusData,
} from "../../proposals/proposalUtils";
import type { CrmDataProvider } from "../types";
import {
  authProvider as defaultAuthProvider,
  USER_STORAGE_KEY,
} from "./authProvider";
import generateData, {
  addDefaultWorkspaceId,
  DEFAULT_WORKSPACE_ID,
} from "./dataGenerator";
import type { Db } from "./dataGenerator/types";
import { withSupabaseFilterAdapter } from "./internal/supabaseAdapter";

const TASK_MARKED_AS_DONE = "TASK_MARKED_AS_DONE";
const TASK_MARKED_AS_UNDONE = "TASK_MARKED_AS_UNDONE";
const TASK_DONE_NOT_CHANGED = "TASK_DONE_NOT_CHANGED";

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

const processCompanyLogo = async (params: any) => {
  let logo = params.data.logo;

  if (typeof logo !== "object" || logo === null || !logo.src) {
    logo = await getCompanyAvatar(params.data);
  } else if (logo.rawFile instanceof File) {
    const base64Logo = await convertFileToBase64(logo);
    logo = { src: base64Logo, title: logo.title };
  }

  return {
    ...params,
    data: {
      ...params.data,
      logo,
    },
  };
};

async function processContactAvatar(
  params: UpdateParams<Contact>,
): Promise<UpdateParams<Contact>>;

async function processContactAvatar(
  params: CreateParams<Contact>,
): Promise<CreateParams<Contact>>;

async function processContactAvatar(
  params: CreateParams<Contact> | UpdateParams<Contact>,
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
  const { data } = params;
  if (data.avatar?.src || !data.email_jsonb || !data.email_jsonb.length) {
    return params;
  }
  const avatarUrl = await getContactAvatar(data);

  // Clone the data and modify the clone
  const newData = { ...data, avatar: { src: avatarUrl || undefined } };

  return { ...params, data: newData };
}

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

async function fetchAndUpdateCompanyData(
  params: UpdateParams<Contact>,
  dataProvider: DataProvider,
): Promise<UpdateParams<Contact>>;

async function fetchAndUpdateCompanyData(
  params: CreateParams<Contact>,
  dataProvider: DataProvider,
): Promise<CreateParams<Contact>>;

async function fetchAndUpdateCompanyData(
  params: CreateParams<Contact> | UpdateParams<Contact>,
  dataProvider: DataProvider,
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
  const { data } = params;
  const newData = { ...data };

  if (!newData.company_id) {
    return params;
  }

  const { data: company } = await dataProvider.getOne("companies", {
    id: newData.company_id,
  });

  if (!company) {
    return params;
  }

  newData.company_name = company.name;
  return { ...params, data: newData };
}

export interface CreateFakeRestDataProviderOptions {
  db?: Db;
  latency?: number;
  authProvider?: Pick<typeof defaultAuthProvider, "getIdentity">;
  silent?: boolean;
}

const processConfigLogo = async (logo: any): Promise<string> => {
  if (typeof logo === "string") return logo;
  if (logo?.rawFile instanceof File) {
    return (await convertFileToBase64(logo)) as string;
  }
  return logo?.src ?? "";
};

const preserveAttachmentMimeType = <
  NoteType extends { attachments?: Array<{ rawFile?: File; type?: string }> },
>(
  note: NoteType,
): NoteType => ({
  ...note,
  attachments: (note.attachments ?? []).map((attachment) => ({
    ...attachment,
    type: attachment.type ?? attachment.rawFile?.type,
  })),
});

const withDemoWorkspaceFilter = (resource: string, params: GetListParams) => {
  if (!isTenantResource(resource)) {
    return params;
  }

  return {
    ...params,
    filter: {
      ...params.filter,
      workspace_id: DEFAULT_WORKSPACE_ID,
    },
  };
};

export const createDataProvider = ({
  db = generateData(),
  latency = 300,
  authProvider,
  silent = false,
}: CreateFakeRestDataProviderOptions = {}): CrmDataProvider => {
  const baseDataProvider = fakeRestDataProvider(
    addDefaultWorkspaceId(db),
    !silent,
    latency,
  );
  const taskUpdateTypes = new Map<Identifier, string>();
  const previousDealsForAutomation = new Map<Identifier, Deal>();
  const previousProposalsForAutomation = new Map<Identifier, Proposal>();
  const getIdentity = async () =>
    authProvider?.getIdentity?.() ?? defaultAuthProvider.getIdentity?.();

  const updateCompany = async (
    companyId: Identifier,
    updateFn: (company: Company) => Partial<Company>,
  ) => {
    const { data: company } = await dataProvider.getOne<Company>("companies", {
      id: companyId,
    });

    return await dataProvider.update("companies", {
      id: companyId,
      data: {
        ...updateFn(company),
      },
      previousData: company,
    });
  };

  const workspaceScopedBaseDataProvider = {
    ...baseDataProvider,
    getList(resource: string, params: GetListParams) {
      return baseDataProvider.getList(
        resource,
        withDemoWorkspaceFilter(resource, params),
      );
    },
  } as DataProvider;

  const dataProviderWithCustomMethod: CrmDataProvider = {
    ...baseDataProvider,
    async getList(resource: string, params: any) {
      const scopedParams = withDemoWorkspaceFilter(resource, params);
      if (resource === "activity_log") {
        const {
          filter = {},
          pagination = { page: 1, perPage: 10 },
        } = scopedParams;
        const all = await getActivityLog(
          withSupabaseFilterAdapter(workspaceScopedBaseDataProvider),
          filter.company_id,
          filter.sales_id,
        );
        const { page, perPage } = pagination;
        const start = (page - 1) * perPage;
        return {
          data: all.slice(start, start + perPage),
          total: all.length,
        } as any;
      }
      return baseDataProvider.getList(resource, scopedParams);
    },
    async create(resource: string, params: CreateParams) {
      return baseDataProvider.create(
        resource,
        addWorkspaceToCreateParams(resource, params, DEFAULT_WORKSPACE_ID),
      );
    },
    unarchiveDeal: async (deal: Deal) => {
      // get all deals where stage is the same as the deal to unarchive
      const { data: deals } = await baseDataProvider.getList<Deal>("deals", {
        filter: { stage: deal.stage, workspace_id: DEFAULT_WORKSPACE_ID },
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
          dataProvider.update("deals", {
            id: updatedDeal.id,
            data: updatedDeal,
            previousData: deals.find((d) => d.id === updatedDeal.id),
          }),
        ),
      );
    },
    signUp: async ({
      email,
      password,
      first_name,
      last_name,
    }: SignUpData): Promise<{
      id: string;
      email: string;
      password: string;
    }> => {
      const user = await dataProvider.create("sales", {
        data: {
          email,
          first_name,
          last_name,
        },
      });

      return {
        ...user.data,
        password,
      };
    },
    salesCreate: async ({ ...data }: SalesFormData): Promise<Sale> => {
      const response = await dataProvider.create("sales", {
        data: {
          ...data,
          password: "new_password",
        },
      });

      return response.data;
    },
    salesUpdate: async (
      id: Identifier,
      data: Partial<Omit<SalesFormData, "password">>,
    ): Promise<Sale> => {
      const { data: previousData } = await dataProvider.getOne<Sale>("sales", {
        id,
      });

      if (!previousData) {
        throw new Error("User not found");
      }

      const { data: sale } = await dataProvider.update<Sale>("sales", {
        id,
        data,
        previousData,
      });
      return { ...sale, user_id: sale.id.toString() };
    },
    isInitialized: async (): Promise<boolean> => {
      const sales = await dataProvider.getList<Sale>("sales", {
        filter: {},
        pagination: { page: 1, perPage: 1 },
        sort: { field: "id", order: "ASC" },
      });
      if (sales.data.length === 0) {
        return false;
      }
      return true;
    },
    updatePassword: async (id: Identifier): Promise<true> => {
      const currentUser = await getIdentity();
      if (!currentUser) {
        throw new Error("User not found");
      }
      const { data: previousData } = await dataProvider.getOne<Sale>("sales", {
        id: currentUser.id,
      });

      if (!previousData) {
        throw new Error("User not found");
      }

      await dataProvider.update("sales", {
        id,
        data: {
          password: "demo_newPassword",
        },
        previousData,
      });

      return true;
    },
    mergeContacts: async (sourceId: Identifier, targetId: Identifier) => {
      return mergeContacts(sourceId, targetId, baseDataProvider);
    },
    convertLead: async (
      input: ConvertLeadInput,
    ): Promise<ConvertLeadResult> => {
      return convertLeadRecord(dataProvider, input);
    },
    getConfiguration: async (): Promise<ConfigurationContextValue> => {
      const { data } = await baseDataProvider.getOne("configuration", {
        id: 1,
      });
      return (data?.config as ConfigurationContextValue) ?? {};
    },
    updateConfiguration: async (
      config: ConfigurationContextValue,
    ): Promise<ConfigurationContextValue> => {
      const { data: prev } = await baseDataProvider.getOne("configuration", {
        id: 1,
      });
      await baseDataProvider.update("configuration", {
        id: 1,
        data: { config },
        previousData: prev,
      });
      return config;
    },
  };

  const dataProvider = withLifecycleCallbacks(
    withSupabaseFilterAdapter(dataProviderWithCustomMethod),
    [
      {
        resource: "configuration",
        beforeUpdate: async (params) => {
          const config = params.data.config;
          if (config) {
            config.lightModeLogo = await processConfigLogo(
              config.lightModeLogo,
            );
            config.darkModeLogo = await processConfigLogo(config.darkModeLogo);
          }
          return params;
        },
      },
      {
        resource: "sales",
        beforeCreate: async (params) => {
          const { data } = params;
          // If administrator role is not set, we simply set it to false
          if (data.administrator == null) {
            data.administrator = false;
          }
          return params;
        },
        afterSave: async (data) => {
          // Since the current user is stored in localStorage in fakerest authProvider
          // we need to update it to keep information up to date in the UI
          const currentUser = await getIdentity();
          if (currentUser?.id === data.id) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
          }
          return data;
        },
        beforeDelete: async (params) => {
          if (params.meta?.identity?.id == null) {
            throw new Error("Identity MUST be set in meta");
          }

          const newSaleId = params.meta.identity.id as Identifier;

          const [companies, contacts, contactNotes, deals] = await Promise.all([
            dataProvider.getList("companies", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
            dataProvider.getList("contacts", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
            dataProvider.getList("contact_notes", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
            dataProvider.getList("deals", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
          ]);

          await Promise.all([
            dataProvider.updateMany("companies", {
              ids: companies.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
            dataProvider.updateMany("contacts", {
              ids: contacts.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
            dataProvider.updateMany("contact_notes", {
              ids: contactNotes.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
            dataProvider.updateMany("deals", {
              ids: deals.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
          ]);

          return params;
        },
      } satisfies ResourceCallbacks<Sale>,
      {
        resource: "contacts",
        beforeCreate: async (createParams, dataProvider) => {
          const params = {
            ...createParams,
            data: {
              ...createParams.data,
              first_seen:
                createParams.data.first_seen ?? new Date().toISOString(),
              last_seen:
                createParams.data.last_seen ?? new Date().toISOString(),
            },
          };
          const newParams = await processContactAvatar(params);
          return fetchAndUpdateCompanyData(newParams, dataProvider);
        },
        afterCreate: async (result) => {
          if (result.data.company_id != null) {
            await updateCompany(result.data.company_id, (company) => ({
              nb_contacts: (company.nb_contacts ?? 0) + 1,
            }));
          }

          return result;
        },
        beforeUpdate: async (params) => {
          const newParams = await processContactAvatar(params);
          return fetchAndUpdateCompanyData(newParams, dataProvider);
        },
        afterDelete: async (result) => {
          if (result.data.company_id != null) {
            await updateCompany(result.data.company_id, (company) => ({
              nb_contacts: (company.nb_contacts ?? 1) - 1,
            }));
          }

          return result;
        },
      } satisfies ResourceCallbacks<Contact>,
      {
        resource: "tasks",
        afterCreate: async (result, dataProvider) => {
          // update the task count in the related contact
          const { contact_id } = result.data;
          if (contact_id == null) {
            return result;
          }
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          await dataProvider.update("contacts", {
            id: contact_id,
            data: {
              nb_tasks: (contact.nb_tasks ?? 0) + 1,
            },
            previousData: contact,
          });
          return result;
        },
        beforeUpdate: async (params) => {
          const { data, previousData } = params;
          if (previousData.done_date !== data.done_date) {
            taskUpdateTypes.set(
              params.id,
              data.done_date ? TASK_MARKED_AS_DONE : TASK_MARKED_AS_UNDONE,
            );
          } else {
            taskUpdateTypes.set(params.id, TASK_DONE_NOT_CHANGED);
          }
          return params;
        },
        afterUpdate: async (result, dataProvider) => {
          // update the contact: if the task is done, decrement the nb tasks, otherwise increment it
          const { contact_id } = result.data;
          if (contact_id == null) {
            return result;
          }
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          const taskUpdateType =
            taskUpdateTypes.get(result.data.id) ?? TASK_DONE_NOT_CHANGED;
          if (taskUpdateType !== TASK_DONE_NOT_CHANGED) {
            await dataProvider.update("contacts", {
              id: contact_id,
              data: {
                nb_tasks:
                  taskUpdateType === TASK_MARKED_AS_DONE
                    ? (contact.nb_tasks ?? 0) - 1
                    : (contact.nb_tasks ?? 0) + 1,
              },
              previousData: contact,
            });
          }
          taskUpdateTypes.delete(result.data.id);
          return result;
        },
        afterDelete: async (result, dataProvider) => {
          // update the task count in the related contact
          const { contact_id } = result.data;
          if (contact_id == null) {
            return result;
          }
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          await dataProvider.update("contacts", {
            id: contact_id,
            data: {
              nb_tasks: (contact.nb_tasks ?? 0) - 1,
            },
            previousData: contact,
          });
          return result;
        },
      } satisfies ResourceCallbacks<Task>,
      {
        resource: "companies",
        beforeCreate: async (params) => {
          const createParams = await processCompanyLogo(params);

          return {
            ...createParams,
            data: {
              ...createParams.data,
              created_at: new Date().toISOString(),
            },
          };
        },
        beforeUpdate: async (params) => {
          return await processCompanyLogo(params);
        },
        afterUpdate: async (result, dataProvider) => {
          // get all contacts of the company and for each contact, update the company_name
          const { id, name } = result.data;
          const { data: contacts } = await dataProvider.getList("contacts", {
            filter: { company_id: id },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: "id", order: "ASC" },
          });

          const contactIds = contacts.map((contact) => contact.id);
          await dataProvider.updateMany("contacts", {
            ids: contactIds,
            data: { company_name: name },
          });
          return result;
        },
      } satisfies ResourceCallbacks<Company>,
      {
        resource: "leads",
        beforeCreate: async (params) => {
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
        beforeUpdate: async (params) => ({
          ...params,
          data: {
            ...params.data,
            updated_at: new Date().toISOString(),
          },
        }),
      } satisfies ResourceCallbacks<Lead>,
      {
        resource: "deals",
        beforeCreate: async (params) => {
          const now = new Date().toISOString();

          return applyDealCommercialDefaults(
            {
              ...params,
              data: {
                ...params.data,
                created_at: now,
                updated_at: now,
              },
            },
            now,
          );
        },
        afterCreate: async (result) => {
          await updateCompany(result.data.company_id, (company) => ({
            nb_deals: (company.nb_deals ?? 0) + 1,
          }));
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
            data: {
              ...params.data,
              updated_at: new Date().toISOString(),
            },
          });
        },
        afterUpdate: async (result) => {
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
        afterDelete: async (result) => {
          await updateCompany(result.data.company_id, (company) => ({
            nb_deals: (company.nb_deals ?? 1) - 1,
          }));

          return result;
        },
      } satisfies ResourceCallbacks<Deal>,
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
            (
              await dataProvider.getOne<Proposal>("proposals", {
                id: params.id,
              })
            ).data;

          previousProposalsForAutomation.set(params.id, previousProposal);
          return applyProposalDefaults({
            ...params,
            previousData: previousProposal,
          });
        },
        afterUpdate: async (result) => {
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
      {
        resource: "contact_notes",
        beforeSave: async (params) => preserveAttachmentMimeType(params),
      } satisfies ResourceCallbacks<ContactNote>,
      {
        resource: "deal_notes",
        beforeSave: async (params) => preserveAttachmentMimeType(params),
      } satisfies ResourceCallbacks<DealNote>,
    ],
  ) as CrmDataProvider;

  return dataProvider;
};

export const dataProvider = createDataProvider();

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of dataprovider decoration.
 */
const convertFileToBase64 = (file: { rawFile: Blob }): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    // We know result is a string as we used readAsDataURL
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file.rawFile);
  });
