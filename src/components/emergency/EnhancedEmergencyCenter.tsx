import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Share2, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Users,
  Activity,
  Zap,
  Navigation,
  Heart,
  MessageSquare
} from 'lucide-react';
import { useEmergency } from '@/hooks/useEmergency';
import { locationService, LocationData } from '@/utils/LocationService';
import { pushNotificationService } from '@/utils/PushNotificationService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  specialty: string[];
  rating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const EnhancedEmergencyCenter = () => {
  const { triggerEmergency, cancelEmergency, isEmergencyActive } = useEmergency();
  const { toast } = useToast();
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [locationSharingDuration, setLocationSharingDuration] = useState(60); // minutes
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [emergencyType, setEmergencyType] = useState('General Emergency');
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  useEffect(() => {
    getCurrentLocation();
    fetchEmergencyContacts();
    setupLocationTracking();
  }, []);

  useEffect(() => {
    if (sosCountdown !== null && sosCountdown > 0) {
      const timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosCountdown === 0) {
      handleConfirmSOS();
      setSosCountdown(null);
    }
  }, [sosCountdown]);

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentPosition();
      setCurrentLocation(location);
      fetchNearbyHospitals(location);
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location Error",
        description: "Could not get your current location",
        variant: "destructive"
      });
    }
  };

  const setupLocationTracking = async () => {
    try {
      const permission = await locationService.requestPermission();
      if (permission) {
        await locationService.startLocationTracking({
          enableHighAccuracy: true,
          minInterval: 60000 // Update every minute during emergency
        });
      }
    } catch (error) {
      console.error('Error setting up location tracking:', error);
    }
  };

  const fetchEmergencyContacts = async () => {
    // Mock data - in real app, fetch from Supabase
    const mockContacts: EmergencyContact[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        phone_number: '+1-555-0123',
        relationship: 'Spouse',
        is_primary: true
      },
      {
        id: '2',
        name: 'Dr. Michael Smith',
        phone_number: '+1-555-0456',
        relationship: 'Doctor',
        is_primary: false
      }
    ];
    setEmergencyContacts(mockContacts);
  };

  const fetchNearbyHospitals = (location: LocationData) => {
    // Mock hospitals data
    const mockHospitals: Hospital[] = [
      {
        id: '1',
        name: 'City General Hospital',
        address: '123 Medical Center Dr',
        phone: '+1-555-7890',
        distance: '0.8 km',
        specialty: ['Emergency', 'Trauma', 'Cardiology'],
        rating: 4.5,
        coordinates: {
          lat: location.latitude + 0.01,
          lng: location.longitude + 0.01
        }
      },
      {
        id: '2',
        name: 'Metropolitan Medical Center',
        address: '456 Health Plaza',
        phone: '+1-555-7891',
        distance: '1.2 km',
        specialty: ['Emergency', 'Surgery', 'Pediatrics'],
        rating: 4.3,
        coordinates: {
          lat: location.latitude - 0.01,
          lng: location.longitude + 0.005
        }
      }
    ];
    setNearbyHospitals(mockHospitals);
  };

  const handleSOSInitiate = () => {
    setSosCountdown(5); // 5-second countdown
    toast({
      title: "SOS Initiated",
      description: "Emergency alert will be sent in 5 seconds. Tap to cancel.",
    });
  };

  const handleCancelSOS = () => {
    setSosCountdown(null);
    toast({
      title: "SOS Cancelled",
      description: "Emergency alert has been cancelled",
    });
  };

  const handleConfirmSOS = async () => {
    try {
      const result = await triggerEmergency(emergencyType, emergencyMessage);
      if (result.success) {
        // Send push notification to user
        await pushNotificationService.sendLocalNotification({
          title: "Emergency Alert Sent",
          body: `SOS alert sent to ${result.contactsNotified} contacts`,
          tag: 'emergency-sent'
        });
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
    }
  };

  const handleLocationSharing = async () => {
    try {
      if (!isLocationSharing) {
        const success = await locationService.shareLocationWithContacts(locationSharingDuration * 60 * 1000);
        if (success) {
          setIsLocationSharing(true);
          toast({
            title: "Location Sharing Started",
            description: `Sharing location for ${locationSharingDuration} minutes`,
          });

          // Auto-stop after duration
          setTimeout(() => {
            setIsLocationSharing(false);
            toast({
              title: "Location Sharing Stopped",
              description: "Location sharing has ended",
            });
          }, locationSharingDuration * 60 * 1000);
        }
      } else {
        setIsLocationSharing(false);
        toast({
          title: "Location Sharing Stopped",
          description: "Location sharing has been manually stopped",
        });
      }
    } catch (error) {
      console.error('Error managing location sharing:', error);
      toast({
        title: "Error",
        description: "Failed to manage location sharing",
        variant: "destructive"
      });
    }
  };

  const handleCallContact = (phoneNumber: string, name: string) => {
    if (window.navigator && 'userAgent' in window.navigator) {
      window.location.href = `tel:${phoneNumber}`;
    }
    toast({
      title: "Calling",
      description: `Calling ${name}...`,
    });
  };

  const handleNavigateToHospital = (hospital: Hospital) => {
    const url = `https://maps.google.com/maps?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`;
    window.open(url, '_blank');
    toast({
      title: "Navigation",
      description: `Opening directions to ${hospital.name}`,
    });
  };

  const emergencyTypes = [
    'General Emergency',
    'Medical Emergency',
    'Accident',
    'Lost/Stranded',
    'Safety Threat',
    'Natural Disaster'
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Status */}
      <Card className={cn(
        "border-2 transition-all duration-300",
        isEmergencyActive ? "border-destructive bg-destructive/5" : "border-border"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className={cn(
              "w-5 h-5",
              isEmergencyActive ? "text-destructive animate-pulse" : "text-primary"
            )} />
            Emergency Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                isEmergencyActive ? "bg-destructive animate-pulse" : "bg-green-500"
              )} />
              <span className="font-medium">
                {isEmergencyActive ? "Emergency Active" : "Safe"}
              </span>
            </div>
            {currentLocation && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location Available
              </Badge>
            )}
          </div>

          {/* SOS Button with Countdown */}
          <div className="text-center mb-4">
            {sosCountdown !== null ? (
              <div className="space-y-4">
                <div className="text-6xl font-bold text-destructive animate-pulse">
                  {sosCountdown}
                </div>
                <Button
                  onClick={handleCancelSOS}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Cancel SOS
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSOSInitiate}
                className="w-32 h-32 rounded-full bg-destructive hover:bg-destructive/90 text-white text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isEmergencyActive}
              >
                <div className="flex flex-col items-center">
                  <ShieldAlert className="w-8 h-8 mb-1" />
                  SOS
                </div>
              </Button>
            )}
          </div>

          {isEmergencyActive && (
            <Alert className="border-destructive bg-destructive/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Emergency mode is active. Your contacts have been notified and are tracking your location.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Emergency Configuration */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-type">Emergency Type</Label>
                <select
                  id="emergency-type"
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {emergencyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-message">Custom Message (Optional)</Label>
                <Textarea
                  id="emergency-message"
                  placeholder="Additional information about your emergency..."
                  value={emergencyMessage}
                  onChange={(e) => setEmergencyMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Location Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically share location during emergencies
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emergency alerts and updates
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{contact.name}</h4>
                          {contact.is_primary && (
                            <Badge variant="secondary">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contact.relationship} • {contact.phone_number}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCallContact(contact.phone_number, contact.name)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospitals">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyHospitals.map((hospital) => (
                  <div key={hospital.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{hospital.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{hospital.address}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {hospital.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {hospital.rating}/5
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCallContact(hospital.phone, hospital.name)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigateToHospital(hospital)}
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialty.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Location with Contacts</Label>
                  <p className="text-sm text-muted-foreground">
                    {isLocationSharing ? 'Currently sharing location' : 'Location sharing is off'}
                  </p>
                </div>
                <Switch
                  checked={isLocationSharing}
                  onCheckedChange={handleLocationSharing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Sharing Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="1440"
                  value={locationSharingDuration}
                  onChange={(e) => setLocationSharingDuration(Number(e.target.value))}
                />
              </div>

              {currentLocation && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Current Location</h4>
                  <p className="text-sm text-muted-foreground">
                    Lat: {currentLocation.latitude.toFixed(6)}<br />
                    Lng: {currentLocation.longitude.toFixed(6)}<br />
                    Accuracy: ±{currentLocation.accuracy?.toFixed(0)}m
                  </p>
                </div>
              )}

              <Button
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Update Current Location
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedEmergencyCenter;