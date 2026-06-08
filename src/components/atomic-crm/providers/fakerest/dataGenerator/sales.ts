import type { Sale } from "../../../types";
import type { Db } from "./types";

const sales: Sale[] = [
  {
    id: 0,
    user_id: "0",
    first_name: "Marina",
    last_name: "Costa",
    email: "marina@prymeira.digital",
    password: "demo",
    administrator: true,
    disabled: false,
  },
  {
    id: 1,
    user_id: "1",
    first_name: "Lucas",
    last_name: "Andrade",
    email: "lucas@prymeira.digital",
    password: "demo",
    administrator: false,
    disabled: false,
  },
  {
    id: 2,
    user_id: "2",
    first_name: "Beatriz",
    last_name: "Lima",
    email: "beatriz@prymeira.digital",
    password: "demo",
    administrator: false,
    disabled: false,
  },
  {
    id: 3,
    user_id: "3",
    first_name: "Rafael",
    last_name: "Torres",
    email: "rafael@prymeira.digital",
    password: "demo",
    administrator: false,
    disabled: false,
  },
  {
    id: 4,
    user_id: "4",
    first_name: "Camila",
    last_name: "Rocha",
    email: "camila@prymeira.digital",
    password: "demo",
    administrator: false,
    disabled: false,
  },
  {
    id: 5,
    user_id: "5",
    first_name: "Thiago",
    last_name: "Nunes",
    email: "thiago@prymeira.digital",
    password: "demo",
    administrator: false,
    disabled: false,
  },
];

export const generateSales = (_: Db): Sale[] => [...sales];
