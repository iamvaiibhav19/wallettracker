"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useUserStore from "@/store/userStore";
import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const UserDropdown = () => {
  const { clearUser } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    // Clear user state
    clearUser();
    // Remove token from session storage
    sessionStorage.removeItem("token");
    // Redirect to login page
    router.push("/login");
  };

  const handleSettings = () => {
    // Redirect to settings page
    router.push("/settings");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserIcon className="text-gray-600 h-6 w-6 cursor-pointer hover:text-gray-800 transition-colors duration-200" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto mt-2 " align="end">
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer ">
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
