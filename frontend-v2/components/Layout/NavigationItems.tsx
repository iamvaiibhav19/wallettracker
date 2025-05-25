import { cn } from "@/lib/utils";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { CircleDollarSign, GoalIcon, HelpCircle, LayoutDashboardIcon, Settings, Wallet2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

// Centralized route definitions
const ROUTES = {
  dashboard: "/dashboard",
  budget: "/budget-expenses",
  transactions: "/transactions",
  bills: "/bills-payments",
  notifications: "/notifications",
  settings: "/settings",
  support: "/help-support",
  accounts: "/accounts",
  categories: "/categories",
};

// Reusable NavigationButton component
function NavigationButton({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) {
  const router = useRouter();

  const handleClick = () => {
    console.log(`Navigating to ${path}`);
    router.push(path);
  };

  return (
    <Button variant="ghost" className="w-full justify-start cursor-pointer hover:bg-brand-lighter" onClick={handleClick}>
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

// Main NavigationItems component
export function NavigationItems({ className }: { className?: string }) {
  const generalItems = [
    { label: "Dashboard", icon: LayoutDashboardIcon, path: ROUTES.dashboard },
    { label: "Budget & Expenses", icon: GoalIcon, path: ROUTES.budget },
    { label: "Transactions", icon: CircleDollarSign, path: ROUTES.transactions },
    { label: "Bill & Payments", icon: Wallet2Icon, path: ROUTES.bills },
  ];

  const userItems = [
    { label: "Notifications", icon: BellAlertIcon, path: ROUTES.notifications },
    { label: "Accounts", icon: Wallet2Icon, path: ROUTES.accounts },
    { label: "Categories", icon: CircleDollarSign, path: ROUTES.categories },
    { label: "Settings", icon: Settings, path: ROUTES.settings },
    { label: "Help & Support", icon: HelpCircle, path: ROUTES.support },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm tracking-tight font-semibold text-brand-dark">General</h2>
          <div className="space-y-1 ml-4">
            {generalItems.map((item) => (
              <NavigationButton key={item.label} icon={item.icon} label={item.label} path={item.path} />
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm tracking-tight font-semibold text-brand-dark">User</h2>
          <div className="space-y-1 ml-4">
            {userItems.map((item) => (
              <NavigationButton key={item.label} icon={item.icon} label={item.label} path={item.path} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
