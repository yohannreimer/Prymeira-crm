// src/components/atomic-crm/prymeira/PrymeiraAccessDenied.tsx
import { useEffect } from "react";
import { Lock, AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import { buildPrymeiraAccessDeniedUrl, getPrymeiraHubUrl } from "./accountApi";
import type { PrymeiraAccessDecision } from "./types";

export function PrymeiraAccessDenied(props: {
  decision?: PrymeiraAccessDecision;
  error?: Error;
}) {
  const href = props.decision
    ? buildPrymeiraAccessDeniedUrl(props.decision)
    : getPrymeiraHubUrl();

  const isError = !!props.error;

  // Always redirect to Hub — whether access was denied or an error occurred
  useEffect(() => {
    if (import.meta.env.MODE === "test") return;
    if (new URLSearchParams(window.location.search).get("preview") === "1") return;
    window.location.assign(href);
  }, [href]);

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="h-14 border-b border-border bg-card flex items-center px-6">
        <div className="flex items-center gap-2.5">
          <img src="/appIcon/32.png" alt="Vincula" style={{ width: 28, height: 28, objectFit: "contain", display: "block" }} />
          <span className="text-sm font-bold text-foreground tracking-tight">
            Vincula CRM
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-[520px] mx-auto px-6" style={{ paddingTop: "clamp(56px, 12vh, 120px)" }}>
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
          {isError
            ? <AlertTriangle size={20} strokeWidth={1.8} />
            : <Lock size={20} strokeWidth={1.8} />
          }
        </div>

        {/* Eyebrow */}
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">
          {isError ? "Erro de acesso" : "Produto bloqueado"}
        </p>

        {/* Heading */}
        <h1 className="text-[28px] font-black tracking-tight text-foreground mb-2 leading-tight">
          Vincula CRM
        </h1>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-6">
          {isError
            ? (props.error?.message ?? "Ocorreu um erro ao verificar o acesso.")
            : "Sua conta está autenticada, mas o Vincula CRM ainda não foi liberado pela Prymeira Account. Levando você ao Hub para revisar o acesso."}
        </p>

        {/* CTA */}
        {isError ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 font-bold text-foreground hover:opacity-70 transition-opacity"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={15} strokeWidth={1.9} />
            Tentar novamente
          </button>
        ) : (
          <a
            href={href}
            className="inline-flex items-center gap-2 font-bold text-foreground hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={15} strokeWidth={1.9} />
            Voltar ao Hub
          </a>
        )}
      </main>
    </div>
  );
}
