const DEFAULT_LOCALE = "pt-BR";
const DEFAULT_CURRENCY = "BRL";

type FormatCurrencyOptions = {
  maximumFractionDigits?: number;
};

const getFractionDigits = (amount: number, maximumFractionDigits?: number) => {
  if (maximumFractionDigits != null) return maximumFractionDigits;

  return Number.isInteger(amount) ? 0 : 2;
};

export const centsToCurrencyUnits = (amount: number) => amount / 100;

export const formatCurrencyAmount = (
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
  options: FormatCurrencyOptions = {},
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: getFractionDigits(
      amount,
      options.maximumFractionDigits,
    ),
  }).format(amount);

export const formatCurrencyCents = (
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
  options: FormatCurrencyOptions = {},
) =>
  formatCurrencyAmount(centsToCurrencyUnits(amount), currency, locale, options);
