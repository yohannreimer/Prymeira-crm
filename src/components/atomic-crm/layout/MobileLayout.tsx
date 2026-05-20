import { Error } from "@/components/admin/error";
import { Notification } from "@/components/admin/notification";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useConfigurationLoader } from "../root/useConfigurationLoader";
import { MobileNavigation } from "./MobileNavigation";

export const MobileLayout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  return (
    <>
      <main id="main-content">
        <ErrorBoundary FallbackComponent={Error}>
          <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      <div className="print:hidden">
        <MobileNavigation />
      </div>
      <div className="print:hidden">
        <Notification mobileOffset={{ bottom: "72px" }} />
      </div>
    </>
  );
};
