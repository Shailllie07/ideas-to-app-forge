import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Plane, 
  Map, 
  Shield, 
  User,
  Bell
} from "lucide-react";

const navItems = [
  { 
    label: "Home", 
    path: "/", 
    icon: Home 
  },
  { 
    label: "Trips", 
    path: "/trips", 
    icon: Plane 
  },
  { 
    label: "Maps", 
    path: "/maps", 
    icon: Map 
  },
  { 
    label: "Emergency", 
    path: "/emergency", 
    icon: Shield 
  },
  { 
    label: "Profile", 
    path: "/profile", 
    icon: User 
  },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide bottom nav on auth and onboarding pages
  if (location.pathname === "/auth" || location.pathname === "/onboarding") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <IconComponent 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isActive && "text-primary"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}

                {/* Notification badge for Emergency */}
                {item.path === "/emergency" && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;