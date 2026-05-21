import { ClerkLoading, SignIn, useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState, type ReactNode } from "react";
import { getDataProvider } from "../providers/postgres/dataProvider";
import { setPostgresAccessTokenProvider } from "../providers/postgres/authToken";
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

const APP_PRIMARY = "#8b5cf6";
const APP_PRIMARY_RGB = "139,92,246";

// ── Decorative element: CRM funnel stages ──────────────────────────────────
function VinculaFunnelDecoration() {
  const STAGES = [
    { w: 340, active: false },
    { w: 265, active: true },
    { w: 195, active: false },
    { w: 130, active: false },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        left: 0,
        right: 0,
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="56"
        viewBox="0 0 400 56"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        {STAGES.map((s, i) => (
          <rect
            key={i}
            x={(400 - s.w) / 2}
            y={i * 12}
            width={s.w}
            height={7}
            rx={3}
            fill={
              s.active
                ? "rgba(139,92,246,0.72)"
                : "rgba(246,242,232,0.11)"
            }
          />
        ))}
      </svg>
    </div>
  );
}

// ── Branded login layout ───────────────────────────────────────────────────
function VinculaLoginLayout() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const brandStyle: React.CSSProperties = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
  };
  const authStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 380,
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.6s ease 0.18s, transform 0.6s ease 0.18s",
  };

  const FEATURES = [
    "Pipeline de vendas",
    "Gestão de contatos",
    "Funil de leads",
    "Relatórios",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#0a0a09",
        fontFamily:
          '"Area Normal","Aptos","SF Pro Display","Segoe UI Variable",system-ui,sans-serif',
      }}
    >
      {/* Brand panel */}
      <div
        style={{
          width: "min(52%, 580px)",
          flexShrink: 0,
          background:
            "linear-gradient(155deg, #0a0810 0%, #12091a 50%, #1a0d26 100%)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 56px",
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -80,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${APP_PRIMARY_RGB},0.07) 0%, transparent 68%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 80,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${APP_PRIMARY_RGB},0.04) 0%, transparent 68%)`,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={brandStyle}>
          {/* Eyebrow */}
          <span
            style={{
              display: "block",
              marginBottom: 28,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: `rgba(${APP_PRIMARY_RGB}, 0.45)`,
            }}
          >
            by Prymeira
          </span>

          {/* Logo + name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: APP_PRIMARY,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 8px 28px rgba(${APP_PRIMARY_RGB},0.32), 0 2px 8px rgba(${APP_PRIMARY_RGB},0.18)`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <line
                  x1="3"
                  y1="5"
                  x2="17"
                  y2="5"
                  stroke="#171716"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <line
                  x1="5.5"
                  y1="9"
                  x2="14.5"
                  y2="9"
                  stroke="#171716"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <line
                  x1="8"
                  y1="13"
                  x2="12"
                  y2="13"
                  stroke="#171716"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#f6f2e8",
                lineHeight: 1,
              }}
            >
              Vincula CRM
            </span>
          </div>

          {/* Headline */}
          <p
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#f6f2e8",
              maxWidth: "11em",
            }}
          >
            Do lead ao{" "}
            <span style={{ color: APP_PRIMARY }}>cliente fidelizado.</span>
          </p>

          {/* Sub-tagline */}
          <p
            style={{
              margin: "0 0 36px",
              fontSize: 15,
              fontWeight: 450,
              lineHeight: 1.65,
              color: "#6a6460",
              maxWidth: "30ch",
            }}
          >
            Gerencie relacionamentos, acompanhe negociações e feche mais vendas
            com clareza.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FEATURES.map((f) => (
              <span
                key={f}
                style={{
                  border: "1px solid rgba(246,242,232,0.09)",
                  borderRadius: 999,
                  padding: "6px 13px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(246,242,232,0.38)",
                  letterSpacing: "0.01em",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative funnel */}
        <VinculaFunnelDecoration />

        {/* Gradient fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: "linear-gradient(to top, #0a0810, transparent)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Auth panel */}
      <div
        style={{
          flex: 1,
          background: "#0f0e14",
          borderLeft: "1px solid rgba(246,242,232,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
        }}
      >
        <div style={authStyle}>
          <ClerkLoading>
            <div style={{ display: "grid", gap: 11, padding: "24px 0" }}>
              {[100, 78, 100, 100, 52].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: i === 4 ? 44 : 14,
                    width: `${w}%`,
                    borderRadius: 7,
                    background: "#1a1820",
                    opacity: 0.55,
                  }}
                />
              ))}
            </div>
          </ClerkLoading>
          <SignIn
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: APP_PRIMARY,
                colorBackground: "#0f0e14",
                colorInputBackground: "#1a1820",
                colorInputText: "#f6f2e8",
                colorText: "#f6f2e8",
                colorTextSecondary: "#9e9589",
                colorNeutral: "#6a6460",
                borderRadius: "10px",
                fontFamily:
                  '"Area Normal","Aptos","SF Pro Display",system-ui,sans-serif',
                fontSize: "14px",
              },
              elements: {
                rootBox: { width: "100%" },
                card: {
                  background: "transparent",
                  boxShadow: "none",
                  border: "none",
                  padding: 0,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Loading spinner ────────────────────────────────────────────────────────
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

// ── Gate ───────────────────────────────────────────────────────────────────
export function PrymeiraAccessGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setPostgresAccessTokenProvider(null);
      return;
    }

    setPostgresAccessTokenProvider(() => getToken());
    return () => setPostgresAccessTokenProvider(null);
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

      const sale = await getDataProvider().syncCurrentSale!({
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
  if (!isSignedIn) return <VinculaLoginLayout />;
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
