import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";

import { useConfigurationLoader } from "../root/useConfigurationLoader";
import { Sidebar } from "./Sidebar";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto print:max-w-none print:px-0 print:pt-0"
        id="main-content"
      >
        <div className="mx-auto max-w-screen-xl px-8 py-6">
          <ErrorBoundary FallbackComponent={Error}>
            <Suspense
              fallback={<Skeleton className="h-12 w-12 rounded-full" />}
            >
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <div className="print:hidden">
        <Notification />
      </div>
    </div>
  );
};
