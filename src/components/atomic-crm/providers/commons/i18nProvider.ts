import { mergeTranslations } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import frenchMessages from "ra-language-french";
import { raSupabaseEnglishMessages } from "ra-supabase-language-english";
import { raSupabaseFrenchMessages } from "ra-supabase-language-french";
import { englishCrmMessages } from "./englishCrmMessages";
import { frenchCrmMessages } from "./frenchCrmMessages";
import {
  portugueseAdminMessages,
  raSupabasePortugueseMessages,
} from "./portugueseAdminMessages";
import { portugueseCrmMessages } from "./portugueseCrmMessages";

const raSupabaseEnglishMessagesOverride = {
  "ra-supabase": {
    auth: {
      password_reset: "Check your emails for a Reset Password message.",
    },
  },
};

const raSupabaseFrenchMessagesOverride = {
  "ra-supabase": {
    auth: {
      password_reset:
        "Consultez vos emails pour trouver le message de réinitialisation du mot de passe.",
    },
  },
};

const englishCatalog = mergeTranslations(
  englishMessages,
  raSupabaseEnglishMessages,
  raSupabaseEnglishMessagesOverride,
  englishCrmMessages,
);

const frenchCatalog = mergeTranslations(
  englishCatalog,
  frenchMessages,
  raSupabaseFrenchMessages,
  raSupabaseFrenchMessagesOverride,
  frenchCrmMessages,
);

const portugueseCatalog = mergeTranslations(
  englishCatalog,
  portugueseAdminMessages,
  raSupabasePortugueseMessages,
  portugueseCrmMessages,
);

export const getInitialLocale = (): "en" | "fr" | "pt-BR" => {
  if (typeof navigator === "undefined") {
    return "pt-BR";
  }

  const browserLocale = navigator.languages?.[0] ?? navigator.language;
  if (browserLocale?.toLowerCase().startsWith("pt")) {
    return "pt-BR";
  }
  if (browserLocale?.toLowerCase().startsWith("fr")) {
    return "fr";
  }

  return "pt-BR";
};

export const i18nProvider = polyglotI18nProvider(
  (locale) => {
    if (locale === "pt-BR") {
      return portugueseCatalog;
    }
    if (locale === "fr") {
      return frenchCatalog;
    }
    return englishCatalog;
  },
  getInitialLocale(),
  [
    { locale: "pt-BR", name: "Português (Brasil)" },
    { locale: "en", name: "English" },
    { locale: "fr", name: "Français" },
  ],
  { allowMissing: true },
);

export const testI18nProvider = polyglotI18nProvider(
  () => englishCatalog,
  "en",
  [{ locale: "en", name: "English" }],
  { allowMissing: true },
);
