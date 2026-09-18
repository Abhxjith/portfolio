"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Sanity Studio aborts in-flight fetches when panes remount / you navigate.
 * That throws AbortError as an unhandled rejection — expected, not a real bug.
 * Next.js Turbopack surfaces it in the overlay; swallow it on /studio only.
 * @see https://github.com/sanity-io/sanity/issues/4951
 */
export default function StudioAbortGuard({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const name = reason?.name ?? "";
      const message =
        typeof reason?.message === "string"
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "";

      if (
        name === "AbortError" ||
        message.includes("signal is aborted") ||
        message.includes("The operation was aborted")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);

  return children;
}
