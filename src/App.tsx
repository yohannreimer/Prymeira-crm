import { ClerkProvider } from "@clerk/clerk-react";
import { CRM } from "@/components/atomic-crm/root/CRM";
import { PrymeiraAccessGate } from "@/components/atomic-crm/prymeira/PrymeiraAccessGate";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkConfig() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="max-w-md space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Configure a Prymeira Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Defina VITE_CLERK_PUBLISHABLE_KEY para entrar no CRM.
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
