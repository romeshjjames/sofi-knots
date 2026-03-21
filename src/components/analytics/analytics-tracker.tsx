"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution, trackAnalyticsEvent } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    captureAttribution(search ? `?${search}` : "", pathname);
    void trackAnalyticsEvent({
      eventName: "page_view",
      path: pathname,
      metadata: {
        query: search || null,
      },
    });
  }, [pathname, searchParams]);

  return null;
}
