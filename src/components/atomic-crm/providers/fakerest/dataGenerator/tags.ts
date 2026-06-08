import type { Db } from "./types";

const tags = [
  { id: 0, name: "decisor", color: "#dbeafe" },
  { id: 1, name: "contato quente", color: "#fee2e2" },
  { id: 2, name: "financeiro", color: "#dcfce7" },
  { id: 3, name: "operações", color: "#fef3c7" },
  { id: 4, name: "evento", color: "#ede9fe" },
  { id: 5, name: "prioridade", color: "#ffe4e6" },
  { id: 6, name: "upsell", color: "#cffafe" },
  { id: 7, name: "implantação", color: "#e0f2fe" },
];

export const generateTags = (_: Db) => [...tags];
