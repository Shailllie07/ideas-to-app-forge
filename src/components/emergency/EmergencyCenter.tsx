import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Phone, MapPin, Heart, Shield, Users, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const EmergencyCenter = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [sosActive, setSosActive] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const { toast } = useToast();

  // Mock nearby hospitals data
  const mockHospitals: Hospital[] = [
    {
      id: "1",
      name: "All India Institute of Medical Sciences",
      address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
      phone: "011-26588500",
      distance: "2.3 km",
      specialty: ["Emergency", "Cardiology", "Trauma"],
      rating: 4.8
    },
    {
      id: "2",
      name: "Max Super Speciality Hospital",
      address: "FC-50, C & D Block, Shalimar Bagh, New Delhi",
      phone: "011-26692851",
      distance: "3.7 km",
      specialty: ["Emergency", "Surgery", "ICU"],
      rating: 4.6
    },
    {
      id: "3", 
      name: "Apollo Hospital",
      address: "Mathura Road, Sarita Vihar, New Delhi",
      phone: "011-26925858",
      distance: "5.1 km",
      specialty: ["Emergency", "Neurology", "Orthopedics"],
      rating: 4.5
    }
  ];

  useEffect(() => {
    fetchEmergencyContacts();
    setNearbyHospitals(mockHospitals);
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    }
  };

  const triggerSOS = async () => {
    setSosActive(true);
    setLocationShared(true);
    
    // Simulate location sharing and emergency alert
    toast({
      title: "🚨 SOS Alert Activated",
      description: "Emergency contacts have been notified with your location",
    });

    // Simulate automatic call to primary contact after 5 seconds
    setTimeout(() => {
      if (emergencyContacts.length > 0) {
        const primaryContact = emergencyContacts.find(contact => contact.is_primary) || emergencyContacts[0];
        toast({
          title: "📞 Calling Emergency Contact",
          description: `Connecting to ${primaryContact.name} (${primaryContact.phone_number})`,
        });
      }
    }, 5000);
  };

  const deactivateSOS = () => {
    setSosActive(false);
    setLocationShared(false);
    toast({
      title: "SOS Deactivated", 
      description: "Emergency alert has been cancelled",
    });
  };

  const callEmergencyContact = (contact: EmergencyContact) => {
    // In a real app, this would initiate a phone call
    window.open(`tel:${contact.phone_number}`, '_self');
  };

  const callHospital = (hospital: Hospital) => {
    window.open(`tel:${hospital.phone}`, '_self');
  };

  const getDirections = (hospital: Hospital) => {
    // In a real app, this would open maps with directions
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${hospital.name}`,
    });
  };

  const shareLocation = () => {
    setLocationShared(true);
    toast({
      title: "Location Shared",
      description: "Your current location has been shared with emergency contacts",
    });
  };

  return (
    <div className="space-y-6">
      {/* SOS Status */}
      {sosActive && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-destructive">SOS ACTIVE</h3>
                  <p className="text-sm text-muted-foreground">Emergency services and contacts have been alerted</p>
                </div>
              </div>
              <Button variant="outline" onClick={deactivateSOS}>
                Cancel Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOS Button */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Emergency SOS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Instantly alert your emergency contacts and share your location
            </p>
            <Button
              onClick={triggerSOS}
              disabled={sosActive}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-16 text-lg font-bold"
            >
              <AlertTriangle className="w-6 h-6 mr-2" />
              {sosActive ? "SOS ACTIVE" : "EMERGENCY SOS"}
            </Button>
          </CardContent>
        </Card>

        {/* Location Sharing */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={locationShared ? "default" : "secondary"}>
                {locationShared ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Location Shared
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Not Shared
                  </>
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Share your real-time location with emergency contacts
            </p>
            <Button
              onClick={shareLocation}
              disabled={locationShared}
              variant="outline"
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {locationShared ? "Location Shared" : "Share Location"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emergencyContacts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No emergency contacts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add trusted contacts who can help in emergencies
              </p>
              <Button variant="outline">Add Emergency Contact</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{contact.name}</h4>
                        {contact.is_primary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      <p className="text-sm font-mono">{contact.phone_number}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => callEmergencyContact(contact)}
                    className="bg-gradient-to-r from-accent to-accent/80"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Hospitals */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Nearest Hospitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nearbyHospitals.map((hospital) => (
              <div key={hospital.id} className="p-4 border border-border/50 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold">{hospital.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {hospital.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{hospital.distance} away</Badge>
                      <Badge variant="secondary">★ {hospital.rating}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {hospital.specialty.map((spec) => (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => callHospital(hospital)}
                    className="flex-1 bg-destructive hover:bg-destructive/90"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Hospital
                  </Button>
                  <Button
                    onClick={() => getDirections(hospital)}
                    variant="outline"
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Services */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Emergency Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.open('tel:100', '_self')}
              className="h-16 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <div className="text-center">
                <Phone className="w-6 h-6 mx-auto mb-1" />
                <div className="font-bold">Police</div>
                <div className="text-sm">100</div>
              </div>
            </Button>
            
            <Button
              onClick={() => window.open('tel:101', '_self')}
              className="h-16 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <div className="text-center">
                <Phone className="w-6 h-6 mx-auto mb-1" />
                <div className="font-bold">Fire</div>
                <div className="text-sm">101</div>
              </div>
            </Button>
            
            <Button
              onClick={() => window.open('tel:108', '_self')}
              className="h-16 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <div className="text-center">
                <Phone className="w-6 h-6 mx-auto mb-1" />
                <div className="font-bold">Ambulance</div>
                <div className="text-sm">108</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyCenter;