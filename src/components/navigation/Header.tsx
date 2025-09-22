import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Bell, 
  Menu,
  Settings,
  Plane
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  className?: string;
  rightAction?: React.ReactNode;
}

const Header = ({ 
  title, 
  showBack = false, 
  showNotifications = true,
  showMenu = false,
  className,
  rightAction
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide header on auth and onboarding pages
  if (location.pathname === "/auth" || location.pathname === "/onboarding") {
    return null;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full bg-card/95 backdrop-blur border-b border-border",
      className
    )}>
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-3">
            {showBack ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-accent"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : showMenu ? (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent"
              >
                <Menu className="w-5 h-5" />
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                  <Plane className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    JourneyXWave
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Center section */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {rightAction}
            
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotifications}
                className="hover:bg-accent relative"
              >
                <Bell className="w-5 h-5" />
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="hover:bg-accent"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;