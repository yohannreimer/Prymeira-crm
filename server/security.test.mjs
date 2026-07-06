import assert from "node:assert/strict";
import test from "node:test";

import {
  bodyLimitForPath,
  buildCorsHeaders,
  decodeJwtPayload,
  filterSalesUpdatePayload,
  isAdminAccess,
  requireWriteAccess,
  workspaceReferenceRules,
} from "./security.js";

const memberAuth = {
  workspaceId: "00000000-0000-4000-8000-000000000001",
  workspaceRole: "member",
  productRole: "member",
  clerkUserId: "user_member",
};

const adminAuth = {
  ...memberAuth,
  workspaceRole: "owner",
  productRole: "admin",
};

test("write access requires admin role for administrative resources", () => {
  assert.equal(isAdminAccess(memberAuth), false);
  assert.equal(isAdminAccess(adminAuth), true);

  assert.throws(
    () => requireWriteAccess(memberAuth, "configuration", "update"),
    /Not authorized/,
  );
  assert.throws(
    () => requireWriteAccess(memberAuth, "automation_rules", "insert"),
    /Not authorized/,
  );

  assert.doesNotThrow(() =>
    requireWriteAccess(adminAuth, "configuration", "update"),
  );
});

test("non-admin sales updates are limited to own profile fields", () => {
  assert.deepEqual(
    filterSalesUpdatePayload(memberAuth, {
      email: "seller@example.com",
      first_name: "Seller",
      administrator: true,
      product_role: "admin",
      disabled: true,
    }),
    {
      email: "seller@example.com",
      first_name: "Seller",
    },
  );

  assert.deepEqual(
    filterSalesUpdatePayload(adminAuth, {
      email: "seller@example.com",
      administrator: true,
      product_role: "admin",
    }),
    {
      email: "seller@example.com",
      administrator: true,
      product_role: "admin",
    },
  );
});

test("body limits stay low by default and allow attachment-heavy note routes", () => {
  assert.equal(bodyLimitForPath("/api/records/companies"), 2 * 1024 * 1024);
  assert.equal(bodyLimitForPath("/api/configuration"), 8 * 1024 * 1024);
  assert.equal(bodyLimitForPath("/api/records/contact_notes"), 35 * 1024 * 1024);
  assert.equal(bodyLimitForPath("/api/records/deal_notes/123"), 35 * 1024 * 1024);
});

test("CORS reflects only configured origins", () => {
  const allowed = buildCorsHeaders("https://vincula.prymeiradigital.com.br", {
    CORS_ORIGINS: "https://vincula.prymeiradigital.com.br",
  });
  assert.equal(
    allowed["access-control-allow-origin"],
    "https://vincula.prymeiradigital.com.br",
  );

  const denied = buildCorsHeaders("https://evil.example", {
    CORS_ORIGINS: "https://vincula.prymeiradigital.com.br",
  });
  assert.equal(denied["access-control-allow-origin"], undefined);
});

test("Clerk JWT payload is decoded after Hub access verification", () => {
  const payload = Buffer.from(
    JSON.stringify({ sub: "user_123", email: "person@example.com" }),
  ).toString("base64url");
  assert.deepEqual(decodeJwtPayload(`x.${payload}.y`), {
    sub: "user_123",
    email: "person@example.com",
  });
});

test("workspace reference rules cover CRM relationships enforced outside RLS", () => {
  assert.deepEqual(workspaceReferenceRules.deals.single.company_id, "companies");
  assert.deepEqual(workspaceReferenceRules.deals.single.pipeline_id, "pipelines");
  assert.deepEqual(workspaceReferenceRules.deals.array.contact_ids, "contacts");
  assert.deepEqual(workspaceReferenceRules.proposals.single.template_id, "proposal_templates");
  assert.deepEqual(workspaceReferenceRules.tasks.single.sales_id, "sales");
});
