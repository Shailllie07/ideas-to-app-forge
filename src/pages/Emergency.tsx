import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Phone, 
  MapPin, 
  Heart, 
  Users, 
  AlertTriangle,
  Hospital,
  Siren
} from "lucide-react";

const Emergency = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 pb-20">
      <Header title="Emergency Center" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-destructive rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Emergency Center</h1>
            <p className="text-muted-foreground">Your safety is our priority</p>
          </div>

          {/* SOS Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <CardContent className="text-center py-8">
              <Siren className="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-bold mb-2">Emergency SOS</h2>
              <p className="mb-6 opacity-90">
                In case of emergency, tap the SOS button to alert your contacts
              </p>
              <div className="text-sm opacity-80">
                The floating SOS button is always available on every screen
              </div>
            </CardContent>
          </Card>

          {/* Emergency Services */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Hospital className="w-5 h-5" />
                  <span>Nearest Hospital</span>
                </CardTitle>
                <CardDescription>
                  Find medical facilities near your location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Hospitals
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Phone className="w-5 h-5" />
                  <span>Emergency Contacts</span>
                </CardTitle>
                <CardDescription>
                  Manage your emergency contact list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Contacts
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Medical Information */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Medical Information</span>
              </CardTitle>
              <CardDescription>
                Store important medical details for emergencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  No medical information stored yet
                </p>
                <Button variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Add Medical Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Safety Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Always inform someone about your travel plans</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Keep emergency contacts updated and accessible</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Download offline maps for your destination</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Carry important documents and medical information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Emergency;