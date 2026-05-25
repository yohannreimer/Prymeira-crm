// src/components/atomic-crm/login/VinculaLoginPage.tsx
import { ClerkLoading, SignIn } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const APP_PRIMARY = "#8b5cf6";
const APP_PRIMARY_RGB = "139,92,246";

// ── Decorative element: pipeline funnel bars ───────────────────────────────
function VinculaFunnelDecoration() {
  const stages = [
    { w: 320, opacity: 0.10 },
    { w: 248, opacity: 0.20 },
    { w: 180, opacity: 0.55 },
    { w: 118, opacity: 0.22 },
    { w: 62,  opacity: 0.14 },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 52,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        pointerEvents: "none",
      }}
    >
      {stages.map((s, i) => (
        <div
          key={i}
          style={{
            width: s.w,
            height: 7,
            borderRadius: 4,
            background: i === 2
              ? `rgba(${APP_PRIMARY_RGB}, 0.72)`
              : `rgba(246,242,232,${s.opacity})`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main login layout ──────────────────────────────────────────────────────
export function VinculaLoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const FEATURES = ["Pipeline de vendas", "Gestão de contatos", "Propostas", "Automações"];

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
      <style>{`
        .vc-clerk .cl-card,
        .vc-clerk .cl-card * { background: transparent !important; box-shadow: none !important; border: none !important; }
        .vc-clerk .cl-formFieldInput {
          background: #1e1c2a !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          color: #f6f2e8 !important;
          border-radius: 10px !important;
          height: 42px !important;
          padding: 0 14px !important;
        }
        .vc-clerk .cl-formFieldInput:focus {
          border-color: ${APP_PRIMARY} !important;
          box-shadow: 0 0 0 2px rgba(${APP_PRIMARY_RGB},0.18) !important;
        }
        .vc-clerk .cl-formButtonPrimary {
          background: ${APP_PRIMARY} !important;
          color: #fff !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          height: 44px !important;
          font-size: 14px !important;
          box-shadow: 0 4px 16px rgba(${APP_PRIMARY_RGB},0.28) !important;
        }
        .vc-clerk .cl-formButtonPrimary:hover { background: #7c3aed !important; }
        .vc-clerk .cl-socialButtonsBlockButton {
          background: #1e1c2a !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          color: #f6f2e8 !important;
          border-radius: 10px !important;
          height: 42px !important;
        }
        .vc-clerk .cl-socialButtonsBlockButton:hover { background: #252334 !important; }
        .vc-clerk .cl-dividerLine { background: rgba(255,255,255,0.06) !important; }
        .vc-clerk .cl-dividerText { color: #5e5a6a !important; }
        .vc-clerk .cl-footerActionLink { color: ${APP_PRIMARY} !important; }
        .vc-clerk .cl-footer,
        .vc-clerk .cl-footerAction { background: transparent !important; }
        .vc-clerk .cl-card { padding: 0 !important; }
        .vc-clerk .cl-headerTitle { color: #f6f2e8 !important; font-size: 20px !important; font-weight: 700 !important; }
        .vc-clerk .cl-headerSubtitle { color: #7e7a8a !important; }
      `}</style>

      {/* ── Brand panel ── */}
      <div
        style={{
          width: "min(52%, 580px)",
          flexShrink: 0,
          background:
            "linear-gradient(155deg, #0a0810 0%, #12091a 50%, #1a0d26 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
        }}
      >
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: -100, left: -80, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, rgba(${APP_PRIMARY_RGB},0.07) 0%, transparent 68%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 80, right: -60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(${APP_PRIMARY_RGB},0.04) 0%, transparent 68%)`, pointerEvents: "none" }} />

        {/* Eyebrow */}
        <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease", position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: `rgba(${APP_PRIMARY_RGB}, 0.45)` }}>
            by Prymeira
          </span>
        </div>

        {/* Identity */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo + name */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div
              style={{
                width: 44, height: 44,
                background: APP_PRIMARY,
                borderRadius: 11,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 8px 28px rgba(${APP_PRIMARY_RGB},0.32), 0 2px 8px rgba(${APP_PRIMARY_RGB},0.18)`,
              }}
            >
              {/* CRM / funnel icon */}
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <line x1="3"   y1="5"  x2="17" y2="5"  stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
                <line x1="5.5" y1="9"  x2="14.5" y2="9"  stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
                <line x1="8"   y1="13" x2="12"   y2="13" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: "#f6f2e8", lineHeight: 1 }}>
              Vincula CRM
            </span>
          </div>

          {/* Headline */}
          <p style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#f6f2e8", maxWidth: "12em" }}>
            Do lead ao{" "}
            <span style={{ color: APP_PRIMARY }}>cliente fidelizado.</span>
          </p>

          <p style={{ margin: "0 0 32px", fontSize: 15, fontWeight: 450, lineHeight: 1.65, color: "#6a6460", maxWidth: "30ch" }}>
            Gerencie relacionamentos, acompanhe negociações e feche mais vendas com clareza.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
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

        <div />

        {/* Funnel decoration */}
        <VinculaFunnelDecoration />

        {/* Bottom gradient */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 52, background: "linear-gradient(to top, #0a0810, transparent)", pointerEvents: "none" }} />
      </div>

      {/* ── Auth panel ── */}
      <div
        style={{
          flex: 1,
          background: "#100f18",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
        }}
      >
        <div
          className="vc-clerk"
          style={{
            width: "100%",
            maxWidth: 400,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.18s, transform 0.6s ease 0.18s",
          }}
        >
          {/* Custom heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: "#f6f2e8" }}>
              Acesse sua conta
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6a6460", lineHeight: 1.5 }}>
              Bem-vindo de volta ao Vincula CRM
            </p>
          </div>

          <ClerkLoading>
            <div style={{ display: "grid", gap: 10 }}>
              {[100, 100, 100, 52].map((w, i) => (
                <div key={i} style={{ height: i === 3 ? 44 : 42, width: `${w}%`, borderRadius: 10, background: "#1e1c2a", opacity: 0.5 }} />
              ))}
            </div>
          </ClerkLoading>

          <SignIn
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: APP_PRIMARY,
                colorBackground: "#100f18",
                colorInputBackground: "#1e1c2a",
                colorInputText: "#f6f2e8",
                colorText: "#f6f2e8",
                colorTextSecondary: "#9e9589",
                colorNeutral: "#6a6460",
                borderRadius: "10px",
                fontFamily: '"Area Normal","Aptos","SF Pro Display",system-ui,sans-serif',
                fontSize: "14px",
              },
              elements: {
                rootBox: { width: "100%" },
                card: { background: "transparent", boxShadow: "none", border: "none", padding: 0 },
                header: { display: "none" },
                footer: { background: "transparent" },
                footerAction: { background: "transparent" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
