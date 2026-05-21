# Caixa De Leads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first functional Leads inbox so raw commercial opportunities can be qualified before becoming companies, contacts, and deals.

**Architecture:** Add `leads` as a normal Atomic CRM resource with Supabase schema, RLS, FakeRest data, React list/create/edit/show pages, navigation, pt-BR messages, and a custom `convertLead` dataProvider method. Keep conversion in the frontend dataProvider for this first version: create company/contact/deal, then mark the lead as converted.

**Tech Stack:** React 19, TypeScript, Vite, ra-core, shadcn-admin-kit, shadcn/ui, Tailwind CSS v4, Supabase/Postgres, FakeRest, Vitest.

---

## Tasks

- [ ] Add lead domain types and conversion payload/result types.
- [ ] Add Supabase `leads` table, trigger, RLS policies, grants, and local migration.
- [ ] Add FakeRest lead seed data.
- [ ] Add `convertLead` to Supabase and FakeRest data providers.
- [ ] Add lead conversion unit tests for the reusable conversion helper.
- [ ] Add lead UI resource: list, create, edit, show, conversion action.
- [ ] Register the resource in desktop and mobile admin/navigation.
- [ ] Add pt-BR/en/fr translations.
- [ ] Apply migration locally and run focused tests, typecheck, and build/lint if needed.
