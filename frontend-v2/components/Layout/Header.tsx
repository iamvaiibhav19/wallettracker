"use client";
import { Button } from "@/components/ui/button";
import useSidebarStore from "@/store/sidebarStore";
import { motion } from "framer-motion"; // Import framer-motion
import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Notifications from "./Notifications";
import UserDropdown from "./UserDropdown";
import useUserStore from "@/store/userStore";

const Header = () => {
  const [greeting, setGreeting] = useState("");
  const { mobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const hour = new Date().getHours();
    let greetingMessage = "";
    let emoji = "";

    if (hour >= 5 && hour < 12) {
      greetingMessage = "Good Morning";
      emoji = "🌅";
    } else if (hour >= 12 && hour < 18) {
      greetingMessage = "Good Afternoon";
      emoji = "🌞";
    } else if (hour >= 18 && hour < 21) {
      greetingMessage = "Good Evening";
      emoji = "🌇";
    } else {
      greetingMessage = "Good Night";
      emoji = "🌙";
    }

    setGreeting(`${greetingMessage} ${emoji}`);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 flex-none items-center bg-white border-b border-border lg:pl-60">
      <div className="mx-auto flex w-full max-w-10xl justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="lg:hidden">
            <Button size="icon" variant="outline" className="shadow-none" onClick={() => toggleMobileSidebar()}>
              <MenuIcon size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="greet">
              <p className="text-lg font-semibold text-slate-900 ">
                Hello! <span className="">{user?.name || "Guest"}</span>
              </p>
              {/* Animate greeting text */}
              <motion.p
                className="text-sm font-medium text-slate-500"
                key={greeting} // Animate on greeting change
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}>
                {greeting}
              </motion.p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mr-2">
          {/* Notification Icon */}
          <Notifications />
          {/* User Icon */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
