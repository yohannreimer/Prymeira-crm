import { createContext, useContext } from "react";
import type { PrymeiraAccessContextValue } from "./types";

const PrymeiraAccessContext =
  createContext<PrymeiraAccessContextValue | null>(null);

export const PrymeiraAccessProvider = PrymeiraAccessContext.Provider;

export const usePrymeiraAccess = () => {
  const value = useContext(PrymeiraAccessContext);
  if (!value) {
    throw new Error("usePrymeiraAccess must be used inside PrymeiraAccessGate");
  }
  return value;
};
