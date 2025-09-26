import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Bell, 
  Menu,
  Settings,
  Plane,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
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
  const { user, profile, signOut } = useAuthContext();

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={profile?.avatar_url} 
                      alt={profile?.display_name || "User"} 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                      {getInitials(profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.display_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/emergency')}>
                  Emergency Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;