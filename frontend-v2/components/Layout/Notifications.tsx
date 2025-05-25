"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BellAlertIcon } from "@heroicons/react/24/outline";

const notifications = [
  { id: 1, message: "📬 New message from Sarah" },
  { id: 2, message: '✅ Your task "UI Review" was completed' },
  { id: 3, message: "🚀 New feature deployed: Dark Mode" },
  { id: 4, message: "📅 Meeting at 3 PM with Product Team" },
];

const Notifications = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BellAlertIcon className="text-gray-600 h-6 w-6 cursor-pointer hover:text-gray-800 transition-colors duration-200" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 mt-2" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((note) => (
          <DropdownMenuItem key={note.id}>{note.message}</DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-blue-600 hover:underline cursor-pointer">View all notifications</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
