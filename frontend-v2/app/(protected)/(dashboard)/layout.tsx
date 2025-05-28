"use client";

import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function Layout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div id="page-container" className="mx-auto flex min-h-screen w-full flex-col bg-gray-50 lg:pl-60">
        <Sidebar />
        <Header />
        <main id="page-content" className="relative flex flex-col md:flex-row max-w-full pt-16 h-screen overflow-hidden">
          <div className="relative flex-grow mx-auto flex-1 flex flex-col w-full h-full max-w-10xl p-4 lg:p-6 overflow-auto">{children}</div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default Layout;
