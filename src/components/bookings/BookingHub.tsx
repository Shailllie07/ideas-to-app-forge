import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Train, Bus, Hotel } from "lucide-react";
import FlightBooking from "./FlightBooking";
import TrainBooking from "./TrainBooking";
import BusBooking from "./BusBooking";
import HotelBooking from "./HotelBooking";

const BookingHub = () => {
  const [activeTab, setActiveTab] = useState("flights");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Book Your Journey</h2>
        <p className="text-muted-foreground">Search and book flights, trains, buses, and hotels all in one place</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full h-12 bg-card/50 backdrop-blur">
          <TabsTrigger value="flights" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            <Plane className="w-4 h-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="trains" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            <Train className="w-4 h-4" />
            Trains
          </TabsTrigger>
          <TabsTrigger value="buses" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            <Bus className="w-4 h-4" />
            Buses
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            <Hotel className="w-4 h-4" />
            Hotels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="space-y-0">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              <FlightBooking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trains" className="space-y-0">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              <TrainBooking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buses" className="space-y-0">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              <BusBooking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-0">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              <HotelBooking />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingHub;