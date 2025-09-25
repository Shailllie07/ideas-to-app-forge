import { useState, useEffect } from "react";
import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Plane, 
  Train, 
  Hotel, 
  MapPin,
  Trash2,
  Check
} from "lucide-react";

interface Notification {
  id: string;
  type: 'booking' | 'weather' | 'safety' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  icon: 'plane' | 'train' | 'hotel' | 'weather' | 'alert' | 'info';
  actionUrl?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Load mock notifications
    setMockNotifications();
  }, []);

  const setMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "booking",
        title: "Flight Confirmation",
        message: "Your flight DEL-BOM on Dec 25, 2024 has been confirmed. Check-in opens 24 hours before departure.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: "medium",
        icon: "plane"
      },
      {
        id: "2",
        type: "weather",
        title: "Weather Alert",
        message: "Heavy rain expected in Mumbai on Dec 26-27. Consider carrying an umbrella and plan for possible delays.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false,
        priority: "high",
        icon: "weather"
      },
      {
        id: "3",
        type: "booking",
        title: "Hotel Booking Update",
        message: "Your reservation at Grand Hotel Mumbai has been upgraded to a premium room at no extra cost!",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: true,
        priority: "low",
        icon: "hotel"
      },
      {
        id: "4",
        type: "safety",
        title: "Emergency Contact Update",
        message: "Remember to update your emergency contacts before your upcoming trip to Mumbai.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        read: false,
        priority: "medium",
        icon: "alert"
      },
      {
        id: "5",
        type: "system",
        title: "New Features Available",
        message: "Offline maps for Mumbai are now available for download. Stay connected even without internet!",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: "low",
        icon: "info"
      }
    ];
    setNotifications(mockNotifications);
  };

  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications;
    return notifications.filter(n => n.type === activeTab);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (icon: Notification['icon']) => {
    switch (icon) {
      case 'plane': return <Plane className="w-5 h-5" />;
      case 'train': return <Train className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'weather': return <MapPin className="w-5 h-5" />;
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-muted-foreground';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header title="Notifications" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">Stay updated with your travel plans and important alerts</p>
            </div>
            
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full h-12 bg-card/50 backdrop-blur">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                All
              </TabsTrigger>
              <TabsTrigger value="booking" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                Bookings
              </TabsTrigger>
              <TabsTrigger value="weather" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                Weather
              </TabsTrigger>
              <TabsTrigger value="safety" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                Safety
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {getFilteredNotifications().length > 0 ? (
                getFilteredNotifications().map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`border-0 shadow-lg bg-card/80 backdrop-blur transition-all hover:shadow-xl ${
                      !notification.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full bg-primary/10 ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.icon)}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {notification.type}
                            </Badge>
                            <Badge 
                              variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                              className="capitalize text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                onClick={() => markAsRead(notification.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark as Read
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteNotification(notification.id)}
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium mb-2">No notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeTab === "all" 
                          ? "You're all caught up! No new notifications to show."
                          : `No ${activeTab} notifications to show.`
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Notifications;