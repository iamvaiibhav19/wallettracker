"use client";

import useOutsideClick from "@/hooks/useOutsideClick";
import { cn } from "@/lib/utils";
import useSidebarStore from "@/store/sidebarStore";
import Image from "next/image";
import Link from "next/link";
import { NavigationItems } from "./NavigationItems";

export const playlists = [
  "Recently Added",
  "Recently Played",
  "Top Songs",
  "Top Albums",
  "Top Artists",
  "Logic Discography",
  "Bedtime Beats",
  "Feeling Happy",
  "I miss Y2K Pop",
  "Runtober",
  "Mellow Days",
  "Eminem Essentials",
];

function Sidebar() {
  const { mobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();
  const sidebarRef = useOutsideClick(() => {
    if (mobileSidebarOpen) {
      toggleMobileSidebar();
    }
  });

  return (
    <aside
      ref={sidebarRef}
      id="page-sidebar"
      aria-label="Main Sidebar Navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-border bg-white transition-transform duration-500 ease-out lg:w-60 lg:translate-x-0",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="flex flex-col h-screen">
        {/* Logo */}
        <div className="flex h-16 w-full flex-none items-center px-4 justify-start border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/logo/logo.svg" alt="Logo" height={20} width={100} className="rounded-full w-[80%] mx-auto" />
          </Link>
        </div>

        {/* Accordion Navigation */}
        <NavigationItems className="flex-grow" playlists={playlists} />

        {/* Footer or bottom content */}
        <div className="mt-auto flex flex-col w-full">
          <div className="flex justify-center gap-2 py-3 px-4 bg-brand-lighter h-10">
            <p className="text-xs font-medium text-brand-darker">© 2025 Wallet Tracker</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
