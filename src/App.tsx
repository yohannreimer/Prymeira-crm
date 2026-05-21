import { ClerkProvider } from "@clerk/clerk-react";
import { CRM } from "@/components/atomic-crm/root/CRM";
import { PrymeiraAccessGate } from "@/components/atomic-crm/prymeira/PrymeiraAccessGate";

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
        <div
          style={{
            width: 48,
            height: 48,
            background: _APP_PRIMARY,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: `0 8px 28px rgba(${_APP_PRIMARY_RGB},0.3)`,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
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
