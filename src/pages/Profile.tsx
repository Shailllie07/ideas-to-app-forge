import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Settings, 
  Heart, 
  Users, 
  Bell, 
  Shield,
  Moon,
  LogOut,
  Edit
} from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header title="Profile" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="pt-8 pb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.user_metadata?.name || user?.email?.split('@')[0]}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Account Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-3" />
                Personal Information
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-3" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Moon className="w-4 h-4 mr-3" />
                Appearance
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Settings */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Safety & Emergency</span>
              </CardTitle>
              <CardDescription>
                Manage your safety settings and emergency information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="w-4 h-4 mr-3" />
                Emergency Contacts
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Heart className="w-4 h-4 mr-3" />
                Medical Information
              </Button>
            </CardContent>
          </Card>

          {/* Travel Preferences */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Travel Preferences</CardTitle>
              <CardDescription>
                Customize your travel experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <p>No preferences set yet</p>
                <p className="text-sm mt-1">Configure your travel preferences to get better recommendations</p>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="pt-6">
              <Button 
                onClick={handleSignOut}
                variant="destructive" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Profile;