"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation"; // If you're using Next.js router

const UserDropdown = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Add your logout logic here, e.g., clear auth tokens
    alert("Logging out...");
    // Redirect to login page, for example:
    router.push("/login");
  };

  const handleSettings = () => {
    // Redirect to settings page
    router.push("/settings");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserIcon className="text-gray-600 h-6 w-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto mt-2 " align="end">
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer ">
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
