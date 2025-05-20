"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import useOutsideClick from "@/hooks/useOutsideClick";

import { cn } from "@/lib/utils";
import { XMarkIcon } from "@heroicons/react/24/outline";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// export const mobileSidebarAtom = atom({
//   key: "mobileSidebar",
//   default: false,
// });

function Sidebar() {
  const router = useRouter();
  const sidebarRef = useOutsideClick(() => {
    setMobileSidebarOpen(false);
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
        <div className="flex h-16 w-full flex-none items-center px-4 justify-start lg:justify-start border-b border-slate-200">
          <h3 className="text-lg font-bold tracking-wide text-gray-900 ">Sidebar</h3>
          <div className="lg:hidden ml-auto">
            <Button size="icon" variant="outline" className="shadow-none" onClick={() => setMobileSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-900" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
