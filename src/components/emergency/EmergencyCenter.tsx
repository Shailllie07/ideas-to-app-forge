import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Phone, 
  MapPin, 
  Users, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Share2
} from "lucide-react";
import HospitalLocator from "./HospitalLocator";
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
      {/* Emergency Status Card */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/20 rounded-full">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Safety Status</h3>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              Safe
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full h-12 bg-card/50 backdrop-blur">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            <Shield className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="hospitals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            Hospitals
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-destructive/20 to-destructive/30 rounded-2xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="font-semibold">Emergency Contacts</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick access to your emergency contacts and medical information
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Contacts
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Nearest Hospitals</h3>
                  <p className="text-sm text-muted-foreground">
                    Find and navigate to the closest medical facilities
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Find Hospitals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Sharing */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Location Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Share Location with Emergency Contacts</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow emergency contacts to see your current location
                  </p>
                </div>
                <Badge variant="outline">Disabled</Badge>
              </div>
              <Button variant="outline" className="w-full">
                Enable Location Sharing
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Information */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Emergency Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Emergency Numbers
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Police:</span>
                      <span className="font-mono">112</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ambulance:</span>
                      <span className="font-mono">108</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fire:</span>
                      <span className="font-mono">101</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Medical Info
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Blood Type: Not set</p>
                    <p>Allergies: None recorded</p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
                      Add Medical Information
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* I'm Safe Button */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-accent/20 to-accent/30 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Send Safety Update</h3>
                  <p className="text-sm text-muted-foreground">
                    Let your emergency contacts know you're safe
                  </p>
                </div>
                <Button className="w-full bg-gradient-to-r from-accent to-accent/90">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I'm Safe - Notify Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospitals">
          <HospitalLocator />
        </TabsContent>

        <TabsContent value="contacts">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Emergency Contacts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your emergency contacts in the Profile section
                </p>
                <Button variant="outline">
                  Go to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyCenter;