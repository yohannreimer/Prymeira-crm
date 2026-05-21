import { describe, it, expect } from "vitest";
import type { RaRecord } from "ra-core";
import { validateItemsInUse } from "./SettingsPage";

describe("validateItemsInUse", () => {
  const deals: RaRecord[] = [
    {
      id: 1,
      stage: "won",
      category: "ui-design",
      deal_type: "quick",
      lost_reason: null,
    },
    {
      id: 2,
      stage: "lost",
      category: "copywriting",
      deal_type: "consultative",
      lost_reason: "price",
    },
    {
      id: 3,
      stage: "opportunity",
      category: "ui-design",
      deal_type: "quick",
      lost_reason: null,
    },
  ];

  it("returns undefined when items is undefined", () => {
    expect(validateItemsInUse(undefined, deals, "stage", "stages")).toBe(
      undefined,
    );
  });

  it("returns undefined when all in-use values are present", () => {
    const items = [
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
      { value: "opportunity", label: "Opportunity" },
    ];
    expect(validateItemsInUse(items, deals, "stage", "stages")).toBe(undefined);
  });

  it("returns an error when an in-use value is removed", () => {
    const items = [
      { value: "won", label: "Won" },
      { value: "opportunity", label: "Opportunity" },
    ];
    expect(validateItemsInUse(items, deals, "stage", "stages")).toBe(
      "Cannot remove stages that are still used by deals: lost",
    );
  });

  it("lists all missing in-use values", () => {
    const items = [{ value: "opportunity", label: "Opportunity" }];
    const result = validateItemsInUse(items, deals, "stage", "stages");
    expect(result).toContain("won");
    expect(result).toContain("lost");
  });

  it("returns an error when there are duplicate slugs", () => {
    const items = [
      { value: "won", label: "Won" },
      { value: "won", label: "Won again" },
      { value: "lost", label: "Lost" },
      { value: "opportunity", label: "Opportunity" },
    ];
    expect(validateItemsInUse(items, deals, "stage", "stages")).toBe(
      "Duplicate stages: won",
    );
  });

  it("detects duplicates via slug fallback when value is empty", () => {
    const items = [
      { value: "", label: "Won" },
      { value: "won", label: "Already won" },
      { value: "lost", label: "Lost" },
      { value: "opportunity", label: "Opportunity" },
    ];
    expect(validateItemsInUse(items, deals, "stage", "stages")).toBe(
      "Duplicate stages: won",
    );
  });

  it("returns 'Validating…' when deals have not loaded yet", () => {
    const items = [{ value: "won", label: "Won" }];
    expect(validateItemsInUse(items, undefined, "stage", "stages")).toBe(
      "Validating…",
    );
  });

  it("ignores deals with a falsy value for the checked field", () => {
    const dealsWithEmpty: RaRecord[] = [
      { id: 1, stage: "won", category: "" },
      { id: 2, stage: "won", category: null },
    ];
    const items = [{ value: "other", label: "Other" }];
    expect(
      validateItemsInUse(items, dealsWithEmpty, "category", "categories"),
    ).toBe(undefined);
  });

  it("works with the category field", () => {
    const items = [{ value: "ui-design", label: "UI Design" }];
    expect(
      validateItemsInUse(items, deals, "category", "categories"),
    ).toContain("copywriting");
  });

  it("works with the deal_type field", () => {
    const items = [{ value: "consultative", label: "Consultative Sale" }];
    expect(
      validateItemsInUse(items, deals, "deal_type", "deal types"),
    ).toContain("quick");
  });

  it("works with the lost_reason field and ignores null values", () => {
    const items = [{ value: "timing", label: "Timing" }];
    expect(
      validateItemsInUse(items, deals, "lost_reason", "lost reasons"),
    ).toContain("price");
  });
});
