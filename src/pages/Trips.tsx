import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin } from "lucide-react";

const Trips = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header title="My Trips" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Trips</h1>
              <p className="text-muted-foreground">Manage your travel plans and bookings</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="w-4 h-4 mr-2" />
              Plan New Trip
            </Button>
          </div>

          {/* Empty State */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="mb-2">No trips planned yet</CardTitle>
              <CardDescription className="mb-6 max-w-md mx-auto">
                Start planning your next adventure! Use our AI assistant to create personalized itineraries.
              </CardDescription>
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                <MapPin className="w-4 h-4 mr-2" />
                Plan Your First Trip
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

export default Trips;