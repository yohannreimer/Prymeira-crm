import { useEffect } from "react";
import { buildPrymeiraAccessDeniedUrl, getPrymeiraHubUrl } from "./accountApi";
import type { PrymeiraAccessDecision } from "./types";

const APP_PRIMARY = "#8b5cf6";
const APP_PRIMARY_RGB = "139,92,246";

export function PrymeiraAccessDenied(props: {
  decision?: PrymeiraAccessDecision;
  error?: Error;
}) {
  const href = props.decision
    ? buildPrymeiraAccessDeniedUrl(props.decision)
    : getPrymeiraHubUrl();

  useEffect(() => {
    if (props.error) return;
    if (import.meta.env.MODE === "test") return;
    window.location.assign(href);
  }, [href, props.error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(155deg, #0a0810 0%, #12091a 50%, #1a0d26 100%)",
        fontFamily:
          '"Area Normal","Aptos","SF Pro Display","Segoe UI Variable",system-ui,sans-serif',
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${APP_PRIMARY_RGB},0.06) 0%, transparent 68%)`,
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
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

        {/* Logo mark */}
        <div
          style={{
            width: 52,
            height: 52,
            background: APP_PRIMARY,
            borderRadius: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: `0 8px 28px rgba(${APP_PRIMARY_RGB},0.32), 0 2px 8px rgba(${APP_PRIMARY_RGB},0.18)`,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
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

        {/* App name */}
        <span
          style={{
            display: "block",
            marginBottom: 20,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#f6f2e8",
          }}
        >
          Vincula CRM
        </span>

        {/* Heading */}
        <h1
          style={{
            margin: "0 0 12px",
            fontSize: 26,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#f6f2e8",
          }}
        >
          {props.error ? "Erro de acesso." : "Produto bloqueado."}
        </h1>

        {/* Message */}
        <p
          style={{
            margin: "0 0 32px",
            fontSize: 15,
            lineHeight: 1.6,
            color: "#6a6460",
            maxWidth: "34ch",
          }}
        >
          {props.error?.message ??
            "Sua conta está autenticada, mas a Prymeira Account ainda não liberou o Vincula CRM. Estamos levando você ao Hub para revisar o acesso."}
        </p>

        {/* Manual fallback link */}
        <a
          href={href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 24px",
            background: APP_PRIMARY,
            color: "#fff",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: `0 4px 18px rgba(${APP_PRIMARY_RGB},0.3)`,
            fontFamily: "inherit",
            transition: "opacity 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Voltar ao Hub
        </a>
      </section>
    </main>
  );
}
