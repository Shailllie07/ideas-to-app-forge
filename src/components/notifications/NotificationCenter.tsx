import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Settings, 
  MapPin, 
  Plane, 
  AlertTriangle,
  MessageSquare,
  Cloud,
  Calendar,
  Phone,
  Mail,
  X,
  Check,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { pushNotificationService } from '@/utils/PushNotificationService';
import { locationService } from '@/utils/LocationService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  locationAlerts: boolean;
  bookingUpdates: boolean;
  weatherAlerts: boolean;
  emergencyAlerts: boolean;
  collaborationUpdates: boolean;
  reminderNotifications: boolean;
}

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: false,
    emailEnabled: true,
    smsEnabled: false,
    locationAlerts: true,
    bookingUpdates: true,
    weatherAlerts: true,
    emergencyAlerts: true,
    collaborationUpdates: true,
    reminderNotifications: true
  });

  useEffect(() => {
    initializeNotificationSettings();
  }, []);

  const initializeNotificationSettings = async () => {
    // Check if push notifications are supported and get current status
    if (pushNotificationService.isSupported()) {
      const isSubscribed = pushNotificationService.isSubscribed();
      setSettings(prev => ({ ...prev, pushEnabled: isSubscribed }));
    }

    // Load settings from user preferences
    // This would typically come from the user's profile or settings
  };

  const handlePushToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const initialized = await pushNotificationService.initialize();
        if (initialized) {
          const subscription = await pushNotificationService.subscribe();
          if (subscription) {
            setSettings(prev => ({ ...prev, pushEnabled: true }));
            toast({
              title: "Push Notifications Enabled",
              description: "You'll now receive push notifications",
            });
          }
        }
      } else {
        const unsubscribed = await pushNotificationService.unsubscribe();
        if (unsubscribed) {
          setSettings(prev => ({ ...prev, pushEnabled: false }));
          toast({
            title: "Push Notifications Disabled",
            description: "You won't receive push notifications anymore",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update push notification settings",
        variant: "destructive"
      });
    }
  };

  const handleLocationAlertsToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const permitted = await locationService.requestPermission();
        if (permitted) {
          setSettings(prev => ({ ...prev, locationAlerts: true }));
          toast({
            title: "Location Alerts Enabled",
            description: "You'll receive alerts based on your location",
          });
        }
      } else {
        locationService.stopLocationTracking();
        setSettings(prev => ({ ...prev, locationAlerts: false }));
        toast({
          title: "Location Alerts Disabled",
          description: "Location-based alerts have been turned off",
        });
      }
    } catch (error) {
      console.error('Error toggling location alerts:', error);
      toast({
        title: "Error",
        description: "Failed to update location alert settings",
        variant: "destructive"
      });
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    if (key === 'pushEnabled') {
      handlePushToggle(value);
    } else if (key === 'locationAlerts') {
      handleLocationAlertsToggle(value);
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Plane className="w-4 h-4 text-blue-500" />;
      case 'weather':
        return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-green-500" />;
      case 'collaboration':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'reminder':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleNotificationAction = async (notificationId: string, action: string) => {
    // Handle notification-specific actions like "View Trip", "Call Contact", etc.
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    if (action === 'mark_read') {
      await markAsRead(notificationId);
    } else if (action === 'delete') {
      await deleteNotification(notificationId);
    } else if (action === 'view' && notification.action_url) {
      window.open(notification.action_url, '_blank');
      await markAsRead(notificationId);
    }
  };

  if (showSettings) {
    return (
      <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Delivery Methods
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={(checked) => handleSettingChange('pushEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Email updates</p>
                </div>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => handleSettingChange('emailEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <div>
                  <Label className="font-medium">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Text messages</p>
                </div>
              </div>
              <Switch
                checked={settings.smsEnabled}
                onCheckedChange={(checked) => handleSettingChange('smsEnabled', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Notification Types
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Location Alerts</Label>
                  <p className="text-sm text-muted-foreground">Proximity and location-based alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.locationAlerts}
                onCheckedChange={(checked) => handleSettingChange('locationAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Booking Updates</Label>
                  <p className="text-sm text-muted-foreground">Flight, hotel, and transport updates</p>
                </div>
              </div>
              <Switch
                checked={settings.bookingUpdates}
                onCheckedChange={(checked) => handleSettingChange('bookingUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Weather Alerts</Label>
                  <p className="text-sm text-muted-foreground">Weather warnings and updates</p>
                </div>
              </div>
              <Switch
                checked={settings.weatherAlerts}
                onCheckedChange={(checked) => handleSettingChange('weatherAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Emergency Alerts</Label>
                  <p className="text-sm text-muted-foreground">Safety and emergency notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.emergencyAlerts}
                onCheckedChange={(checked) => handleSettingChange('emergencyAlerts', checked)}
                disabled // Always enabled for safety
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Collaboration Updates</Label>
                  <p className="text-sm text-muted-foreground">Trip collaboration notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.collaborationUpdates}
                onCheckedChange={(checked) => handleSettingChange('collaborationUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <div>
                  <Label className="font-medium">Reminders</Label>
                  <p className="text-sm text-muted-foreground">Trip and task reminders</p>
                </div>
              </div>
              <Switch
                checked={settings.reminderNotifications}
                onCheckedChange={(checked) => handleSettingChange('reminderNotifications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up! We'll notify you when something new happens.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {notifications.slice(0, 50).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-l-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors",
                    getPriorityColor(notification.priority),
                    !notification.is_read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            !notification.is_read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              High Priority
                            </Badge>
                          )}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimeAgo(notification.created_at)}</span>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notification.action_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(notification.id, 'view')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(notification.id, 'mark_read')}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNotificationAction(notification.id, 'delete')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;