import { ClerkProvider } from "@clerk/clerk-react";
import { CRM } from "@/components/atomic-crm/root/CRM";
import { PrymeiraAccessGate } from "@/components/atomic-crm/prymeira/PrymeiraAccessGate";
import { VinculaLandingPage } from "@/components/atomic-crm/landing/VinculaLandingPage";
import { PrymeiraAccessDenied } from "@/components/atomic-crm/prymeira/PrymeiraAccessDenied";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const _APP_PRIMARY = "#8b5cf6";
const _APP_PRIMARY_RGB = "139,92,246";

function MissingClerkConfig() {
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
      }}
    >
      <section
        style={{
          maxWidth: 400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <span
          style={{
            marginBottom: 24,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: `rgba(${_APP_PRIMARY_RGB}, 0.45)`,
          }}
        >
          by Prymeira
        </span>
        <img
          src="/appIcon/192.png"
          alt="Vincula"
          style={{ width: 48, height: 48, objectFit: "contain", display: "block", marginBottom: 20 }}
        />
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#f6f2e8",
          }}
        >
          Configuração ausente.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.6,
            color: "#6a6460",
          }}
        >
          Defina{" "}
          <code
            style={{ color: `rgba(${_APP_PRIMARY_RGB},0.75)`, fontSize: 13 }}
          >
            VITE_CLERK_PUBLISHABLE_KEY
          </code>{" "}
          para entrar no Vincula CRM.
        </p>
      </section>
    </main>
  );
}

const App = () => {
  // Public preview routes (dev only)
  if (window.location.pathname === "/landing") return <VinculaLandingPage />;
  if (window.location.pathname === "/__preview_denied__")
    return <PrymeiraAccessDenied decision={{ allowed: false, reason: "no_entitlement", product_key: "crm", status: "inactive" }} />;
  if (window.location.pathname === "/__preview_error__")
    return <PrymeiraAccessDenied error={new Error("Não foi possível verificar seu acesso. Tente novamente.")} />;

  if (!clerkPublishableKey) return <MissingClerkConfig />;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <PrymeiraAccessGate>
        <CRM />
      </PrymeiraAccessGate>
    </ClerkProvider>
  );
};

export default App;
