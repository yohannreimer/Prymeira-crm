import { describe, expect, it } from "vitest";

import {
  centsToCurrencyUnits,
  formatCurrencyAmount,
  formatCurrencyCents,
} from "./formatCurrency";

describe("formatCurrency", () => {
  const normalizeSpaces = (value: string) => value.replace(/\s/g, " ");

  it("formats deal amounts as currency units", () => {
    expect(normalizeSpaces(formatCurrencyAmount(1000, "BRL", "pt-BR"))).toBe(
      "R$ 1.000",
    );
  });

  it("formats cent-based proposal values explicitly", () => {
    expect(normalizeSpaces(formatCurrencyCents(100000, "BRL", "pt-BR"))).toBe(
      "R$ 1.000",
    );
    expect(centsToCurrencyUnits(25000)).toBe(250);
  });
});
