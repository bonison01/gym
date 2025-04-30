
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { Users, Calendar, IndianRupee, X, LogOut, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const routes = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Calendar className="mr-2 h-5 w-5" />,
  },
  {
    title: "Members",
    href: "/members",
    icon: <Users className="mr-2 h-5 w-5" />,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: <IndianRupee className="mr-2 h-5 w-5" />,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: <DollarSign className="mr-2 h-5 w-5" />,
  },
];

interface SidebarNavProps {
  className?: string;
  onClose?: () => void;
}

export function SidebarNav({ className, onClose }: SidebarNavProps) {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <nav className={cn("h-full flex flex-col", className)}>
      <div className="flex items-center justify-between px-4 py-6 border-b">
        <h1 className="text-2xl font-bold text-fitlife-700">
          FitLife
          <span className="text-fitlife-500">Tracker</span>
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      <div className="flex-1 py-6 overflow-auto">
        <div className="px-3 space-y-1">
          {routes.map((route) => (
            <NavLink
              key={route.href}
              to={route.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-2 px-3 rounded-md text-base font-medium transition-colors",
                  isActive
                    ? "bg-fitlife-100 text-fitlife-700"
                    : "text-gray-600 hover:bg-fitlife-50 hover:text-fitlife-600"
                )
              }
            >
              {route.icon}
              {route.title}
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t">
        {user && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{user.email}</p>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 text-center">
          FitLife Membership Tracker v1.0
        </p>
      </div>
    </nav>
  );
}
