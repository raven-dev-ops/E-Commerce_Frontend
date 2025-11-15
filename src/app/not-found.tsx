// src/app/not-found.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const pathname = usePathname();
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setQueryString(window.location.search.replace(/^\?/, ""));
    }
  }, []);

  useEffect(() => {
    // Surface additional context in the browser console to debug unexpected 404s.
    console.warn("[404] Route was not found by Next.js runtime", {
      pathname,
      searchParams: queryString,
      hints: [
        "Ensure this path exists under src/app and is committed to main.",
        "Confirm Netlify deployed the latest commit (check Deploys tab).",
        "If this page depends on API data, verify the backend returns 200 for the requested resource.",
      ],
    });
  }, [pathname, queryString]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-10 px-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-lg text-gray-700">
          Sorry, the route <span className="font-mono">{pathname || "/"}</span>{" "}
          isn&rsquo;t part of the current deploy.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-gray-50 rounded-lg border border-gray-200 p-4 text-left text-sm text-gray-700 space-y-2">
        <p className="font-semibold text-gray-900">Next steps to investigate:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check the Netlify deploy log for the latest commit.</li>
          <li>Verify the page file exists under <code>src/app</code> and was committed.</li>
          <li>If the page relies on backend data, confirm the API responded successfully.</li>
        </ol>
        {queryString && (
          <p className="text-xs text-gray-500">
            Query: <span className="font-mono break-all">{queryString}</span>
          </p>
        )}
      </div>

      <Link
        href="/"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
