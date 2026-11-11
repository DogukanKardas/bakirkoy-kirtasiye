"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const ThemeContext = createContext<{
  dark: boolean;
  toggle: () => void;
}>({ dark: false, toggle: () => {} });

export function useAdminTheme() {
  return useContext(ThemeContext);
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
});

export function AdminProviders({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("bk-admin-theme") === "dark");
  }, []);

  const toggle = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("bk-admin-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ dark, toggle }}>
        <div className={dark ? "admin-dark" : ""}>
          <div className="min-h-screen bg-[var(--paper-deep)] text-[var(--ink)]">
            {children}
          </div>
        </div>
        <Toaster richColors position="bottom-right" />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
