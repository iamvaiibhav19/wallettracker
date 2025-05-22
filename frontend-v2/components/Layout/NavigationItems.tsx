import { cn } from "@/lib/utils";
import { Bell, CircleDollarSign, GoalIcon, HelpCircle, LayoutDashboardIcon, Settings, Wallet2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { BellAlertIcon } from "@heroicons/react/24/outline";

export function NavigationItems({ className }: { className?: string; playlists?: string[] }) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm tracking-tight font-semibold text-brand-dark">General</h2>
          <div className="space-y-1 ml-4">
            <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter">
              <LayoutDashboardIcon className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter">
              <GoalIcon className="mr-2 h-4 w-4" />
              Budget & Expenses
            </Button>
            <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter">
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Transactions
            </Button>
            <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter">
              <Wallet2Icon className="mr-2 h-4 w-4" />
              Bill & Payments
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm tracking-tight font-semibold text-brand-dark">User</h2>
          <div className="space-y-1 ml-4">
            <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter">
              <BellAlertIcon className="mr-2 h-6 w-6" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
