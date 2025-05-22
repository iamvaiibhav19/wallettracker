"use client";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div id="page-container" className="mx-auto flex min-h-screen w-full flex-col bg-gray-50 lg:pl-60">
      <Sidebar />
      <Header />
      <main id="page-content" className="relative flex flex-col md:flex-row max-w-full pt-16 h-screen overflow-hidden">
        <div className="relative flex-grow mx-auto flex-1 flex flex-col w-full h-full max-w-10xl p-4 lg:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}

export default layout;
