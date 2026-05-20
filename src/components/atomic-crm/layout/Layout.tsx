import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";

import { useConfigurationLoader } from "../root/useConfigurationLoader";
import Header from "./Header";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>
      <main
        className="mx-auto max-w-screen-xl px-4 pt-4 print:max-w-none print:px-0 print:pt-0"
        id="main-content"
      >
        <ErrorBoundary FallbackComponent={Error}>
          <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      <div className="print:hidden">
        <Notification />
      </div>
    </>
  );
};
