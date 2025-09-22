import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Trash2, Settings } from "lucide-react";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header 
        title="Notifications" 
        showBack={true}
        rightAction={
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        }
      />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with your travel plans</p>
            </div>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* Empty State */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center">
                <Bell className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="mb-2">No notifications yet</CardTitle>
              <CardDescription className="mb-6 max-w-md mx-auto">
                You'll see booking updates, flight delays, weather alerts, and other important travel information here.
              </CardDescription>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notification Categories */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Travel Updates</CardTitle>
                <CardDescription>
                  Flight delays, gate changes, and booking confirmations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push notifications</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Safety Alerts</CardTitle>
                <CardDescription>
                  Weather warnings and emergency notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push notifications</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Notifications;