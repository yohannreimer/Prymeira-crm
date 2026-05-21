import { afterEach, describe, expect, it, vi } from "vitest";
import { getInitialLocale, i18nProvider } from "./i18nProvider";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("i18nProvider", () => {
  it("registers pt-BR, en, and fr locales", () => {
    expect(i18nProvider.getLocales?.()).toEqual([
      { locale: "pt-BR", name: "Português (Brasil)" },
      { locale: "en", name: "English" },
      { locale: "fr", name: "Français" },
    ]);
  });

  it("translates the language key in Brazilian Portuguese", async () => {
    await i18nProvider.changeLocale("pt-BR");

    expect(i18nProvider.translate("crm.language")).toBe("Idioma");
  });

  it("translates the language key in french", async () => {
    await i18nProvider.changeLocale("fr");

    expect(i18nProvider.translate("crm.language")).toBe("Langue");
  });

  it("falls back to english for unknown locales", async () => {
    await i18nProvider.changeLocale("es");

    expect(i18nProvider.translate("crm.language")).toBe("Language");
  });

  it("uses customized password reset overrides for en, fr, and pt-BR", async () => {
    await i18nProvider.changeLocale("en");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Check your emails for a Reset Password message.",
    );

    await i18nProvider.changeLocale("fr");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Consultez vos emails pour trouver le message de réinitialisation du mot de passe.",
    );

    await i18nProvider.changeLocale("pt-BR");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Verifique seu email para encontrar a mensagem de redefinição de senha.",
    );
  });

  it("translates recently added fr crm keys", async () => {
    await i18nProvider.changeLocale("fr");

    expect(i18nProvider.translate("resources.deals.empty.title")).toBe(
      "Aucune affaire trouvée",
    );
  });

  it("translates proposals and automation rules in Brazilian Portuguese", async () => {
    await i18nProvider.changeLocale("pt-BR");

    expect(
      i18nProvider.translate("resources.proposals.name", { smart_count: 2 }),
    ).toBe("Propostas");
    expect(
      i18nProvider.translate("resources.automation_rules.name", {
        smart_count: 2,
      }),
    ).toBe("Automações");
    expect(i18nProvider.translate("resources.agenda.kinds.proposal")).toBe(
      "Proposta",
    );
    expect(i18nProvider.translate("crm.dashboard.proposals.title")).toBe(
      "Propostas",
    );
    expect(i18nProvider.translate("crm.settings.automations")).toBe(
      "Automações",
    );
    expect(
      i18nProvider.translate("resources.proposal_templates.name", {
        smart_count: 2,
      }),
    ).toBe("Templates de proposta");
    expect(i18nProvider.translate("resources.proposals.action.duplicate")).toBe(
      "Duplicar",
    );
    expect(
      i18nProvider.translate("resources.proposals.action.export_pdf"),
    ).toBe("Exportar PDF");
    expect(
      i18nProvider.translate(
        "resources.proposals.notifications.duplicate_error",
      ),
    ).toBe("Não foi possível duplicar a proposta");
    expect(
      i18nProvider.translate("resources.proposal_templates.empty.title"),
    ).toBe("Nenhum template de proposta cadastrado");
    expect(
      i18nProvider.translate("resources.sales_goals.name", {
        smart_count: 2,
      }),
    ).toBe("Metas comerciais");
  });

  it("translates advanced dashboard keys in all CRM locales", async () => {
    const advancedDashboardKeys = [
      "revenue_forecast.title",
      "revenue_forecast.weighted_deals",
      "revenue_forecast.open_proposals",
      "revenue_forecast.total",
      "goal_progress.title",
      "goal_progress.revenue",
      "goal_progress.won_deals",
      "goal_progress.sent_proposals",
      "goal_progress.empty",
      "funnel_conversion.title",
      "funnel_conversion.leads",
      "funnel_conversion.converted_leads",
      "funnel_conversion.deals_with_proposal",
      "funnel_conversion.accepted_proposals",
      "funnel_conversion.won_deals",
      "pipeline_aging.title",
      "pipeline_aging.open_deal_age",
      "pipeline_aging.stale_deals",
      "pipeline_aging.sent_proposal_age",
      "seller_ranking.title",
      "seller_ranking.won_amount",
      "seller_ranking.weighted_amount",
      "seller_ranking.accepted_proposals",
      "seller_ranking.overdue_tasks",
      "seller_ranking.empty",
      "loss_reasons.title",
      "loss_reasons.empty",
    ].map((key) => `crm.dashboard.advanced.${key}`);

    await i18nProvider.changeLocale("pt-BR");
    expect(
      i18nProvider.translate("crm.dashboard.advanced.revenue_forecast.title"),
    ).toBe("Previsão de receita");
    expect(
      i18nProvider.translate("crm.dashboard.advanced.goal_progress.title"),
    ).toBe("Progresso de metas");
    expect(
      i18nProvider.translate("crm.dashboard.advanced.funnel_conversion.title"),
    ).toBe("Conversão do funil");
    expect(
      i18nProvider.translate("crm.dashboard.advanced.loss_reasons.title"),
    ).toBe("Motivos de perda");

    for (const locale of ["pt-BR", "en", "fr"]) {
      await i18nProvider.changeLocale(locale);

      for (const key of advancedDashboardKeys) {
        expect(i18nProvider.translate(key)).not.toBe(key);
      }
    }
  });

  it("uses browser french locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "fr-FR",
      languages: ["fr-FR", "en-US"],
    });

    expect(getInitialLocale()).toBe("fr");
  });

  it("uses browser Portuguese locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "pt-BR",
      languages: ["pt-BR", "en-US"],
    });

    expect(getInitialLocale()).toBe("pt-BR");
  });

  it("defaults to Brazilian Portuguese when browser locale is unsupported", () => {
    vi.stubGlobal("navigator", {
      language: "es-ES",
      languages: ["es-ES", "pt-BR"],
    });

    expect(getInitialLocale()).toBe("pt-BR");
  });
});
