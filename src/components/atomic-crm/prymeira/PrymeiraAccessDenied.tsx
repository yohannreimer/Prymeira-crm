import { Button } from "@/components/ui/button";
import { buildPrymeiraAccessDeniedUrl, getPrymeiraHubUrl } from "./accountApi";
import type { PrymeiraAccessDecision } from "./types";

export function PrymeiraAccessDenied(props: {
  decision?: PrymeiraAccessDecision;
  error?: Error;
}) {
  const href = props.decision
    ? buildPrymeiraAccessDeniedUrl(props.decision)
    : getPrymeiraHubUrl();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-md space-y-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Acesso nao liberado
        </h1>
        <p className="text-sm text-muted-foreground">
          {props.error?.message ??
            "A Prymeira Account nao encontrou uma liberacao ativa para este CRM."}
        </p>
        <Button asChild>
          <a href={href}>Abrir Prymeira Account</a>
        </Button>
      </section>
    </main>
  );
}
