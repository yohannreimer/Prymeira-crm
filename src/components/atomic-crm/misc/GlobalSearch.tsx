import { BriefcaseBusiness, FileText, Search, Users } from "lucide-react";
import { useGetList } from "ra-core";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import type { Company, Contact, Deal } from "../types";

const match = (value: string | null | undefined, q: string) =>
  value?.toLowerCase().includes(q.toLowerCase()) ?? false;

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Fetch all records once when palette opens — filter client-side for reliability
  const { data: allContacts } = useGetList<Contact>(
    "contacts",
    {
      pagination: { page: 1, perPage: 500 },
      sort: { field: "last_name", order: "ASC" },
    },
    { enabled: open },
  );
  const { data: allCompanies } = useGetList<Company>(
    "companies",
    {
      pagination: { page: 1, perPage: 200 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open },
  );
  const { data: allDeals } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: 200 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open },
  );

  const q = query.trim();

  const contacts = useMemo(() => {
    if (!q || !allContacts) return [];
    return allContacts
      .filter(
        (c) =>
          match(c.first_name, q) ||
          match(c.last_name, q) ||
          match(c.company_name, q) ||
          c.email_jsonb?.some((e) => match(e.email, q)),
      )
      .slice(0, 7);
  }, [allContacts, q]);

  const companies = useMemo(() => {
    if (!q || !allCompanies) return [];
    return allCompanies
      .filter((c) => match(c.name, q) || match(c.city, q))
      .slice(0, 5);
  }, [allCompanies, q]);

  const deals = useMemo(() => {
    if (!q || !allDeals) return [];
    return allDeals.filter((d) => match(d.name, q)).slice(0, 5);
  }, [allDeals, q]);

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const hasContacts = contacts.length > 0;
  const hasCompanies = companies.length > 0;
  const hasDeals = deals.length > 0;
  const hasAny = hasContacts || hasCompanies || hasDeals;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/30 hover:bg-sidebar-accent hover:text-sidebar-foreground/60 transition-colors"
        aria-label="Busca global (⌘K)"
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar contatos, empresas, negócios..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {q.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Digite para buscar...
            </div>
          )}
          {q.length > 0 && !hasAny && (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}
          {hasContacts && (
            <CommandGroup heading="Contatos">
              {contacts.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => go(`/contacts/${c.id}/show`)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    {c.first_name} {c.last_name}
                  </span>
                  {c.company_name && (
                    <span className="text-muted-foreground text-xs">
                      · {c.company_name}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {hasContacts && hasCompanies && <CommandSeparator />}
          {hasCompanies && (
            <CommandGroup heading="Empresas">
              {companies.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => go(`/companies/${c.id}/show`)}
                  className="gap-2"
                >
                  <BriefcaseBusiness className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{c.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(hasContacts || hasCompanies) && hasDeals && <CommandSeparator />}
          {hasDeals && (
            <CommandGroup heading="Negócios">
              {deals.map((d) => (
                <CommandItem
                  key={d.id}
                  onSelect={() => go(`/deals/${d.id}/show`)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{d.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
