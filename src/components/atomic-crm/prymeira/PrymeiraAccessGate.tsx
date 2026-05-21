import { SignIn, useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState, type ReactNode } from "react";
import { getDataProvider } from "../providers/supabase/dataProvider";
import { setSupabaseAccessTokenProvider } from "../providers/supabase/supabase";
import {
  checkPrymeiraProductAccess,
  syncPrymeiraCustomer,
} from "./accountApi";
import { PrymeiraAccessProvider } from "./PrymeiraAccessContext";
import { PrymeiraAccessDenied } from "./PrymeiraAccessDenied";
import type {
  PrymeiraAccessContextValue,
  PrymeiraAccessDecision,
} from "./types";

type GateState =
  | { status: "loading" }
  | { status: "denied"; decision: PrymeiraAccessDecision }
  | { status: "error"; error: Error }
  | { status: "allowed"; value: PrymeiraAccessContextValue };

function PrymeiraAccessLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div
        aria-label="Carregando"
        className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
        role="status"
      />
    </main>
  );
}

export function PrymeiraAccessGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setSupabaseAccessTokenProvider(null);
      return;
    }

    setSupabaseAccessTokenProvider(() => getToken());
    return () => setSupabaseAccessTokenProvider(null);
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    let active = true;
    const clerkUser = user;
    setState({ status: "loading" });
    window.localStorage.removeItem("prymeira.workspace_id");

    async function loadAccess() {
      const token = await getToken();
      if (!active) return;

      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (!token) throw new Error("Sessao Clerk sem token.");
      if (!email) throw new Error("Perfil Clerk sem email principal.");

      const sync = await syncPrymeiraCustomer(token, {
        clerk_user_id: clerkUser.id,
        email,
        name: clerkUser.fullName ?? clerkUser.firstName ?? undefined,
      });
      if (!active) return;

      const decision = await checkPrymeiraProductAccess(token);
      if (!active) return;

      if (!decision.allowed || !decision.workspace_id) {
        setState({ status: "denied", decision });
        return;
      }

      const sale = await getDataProvider().syncCurrentSale({
        clerk_user_id: clerkUser.id,
        email,
        name: clerkUser.fullName ?? null,
        workspace_id: decision.workspace_id,
        workspace_role: decision.workspace_role ?? sync.workspace.role,
        product_role: decision.product_role ?? "member",
      });
      if (!active) return;

      window.localStorage.setItem(
        "prymeira.workspace_id",
        decision.workspace_id,
      );

      setState({
        status: "allowed",
        value: {
          token,
          clerkUserId: clerkUser.id,
          email,
          name: clerkUser.fullName ?? null,
          sale,
          workspace: sync.workspace,
          decision: {
            ...decision,
            allowed: true,
            workspace_id: decision.workspace_id,
            workspace_role: decision.workspace_role ?? sync.workspace.role,
            product_role: decision.product_role ?? "member",
          },
        },
      });
    }

    loadAccess().catch((error: unknown) => {
      if (!active) return;
      setState({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });

    return () => {
      active = false;
    };
  }, [getToken, isLoaded, isSignedIn, user]);

  if (!isLoaded) return <PrymeiraAccessLoading />;
  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <SignIn routing="hash" />
      </main>
    );
  }
  if (state.status === "loading") return <PrymeiraAccessLoading />;
  if (state.status === "error") {
    return <PrymeiraAccessDenied error={state.error} />;
  }
  if (state.status === "denied") {
    return <PrymeiraAccessDenied decision={state.decision} />;
  }

  return (
    <PrymeiraAccessProvider value={state.value}>
      {children}
    </PrymeiraAccessProvider>
  );
}
