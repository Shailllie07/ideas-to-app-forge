import { useState } from "react";
import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, MapPin, FileText, Plane } from "lucide-react";
import BookingHub from "@/components/bookings/BookingHub";
import TripTimeline from "@/components/trips/TripTimeline";
import TripDocuments from "@/components/trips/TripDocuments";

const Trips = () => {
  const [activeTab, setActiveTab] = useState("overview");

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

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full h-12 bg-card/50 backdrop-blur">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Trip Timeline
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <Plane className="w-4 h-4 mr-2" />
                Book Travel
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-0">
              <TripTimeline />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-0">
              <BookingHub />
            </TabsContent>

            <TabsContent value="documents" className="space-y-0">
              <TripDocuments />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Trips;