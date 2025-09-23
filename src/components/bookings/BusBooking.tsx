import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Clock, Star, Wifi, Snowflake, Coffee, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BusBooking = () => {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [travelDate, setTravelDate] = useState<Date>();
  const [showResults, setShowResults] = useState(false);

  const mockBuses = [
    {
      id: 1,
      operator: "RedBus Super Luxury",
      type: "Volvo A/C Sleeper",
      departure: { time: "22:30", location: "Anand Vihar" },
      arrival: { time: "07:15+1", location: "Dadar" },
      duration: "8h 45m",
      price: 1850,
      rating: 4.3,
      amenities: ["wifi", "ac", "blanket", "water"],
      seatsAvailable: 12
    },
    {
      id: 2,
      operator: "Sharma Travels",
      type: "Semi-Sleeper A/C",
      departure: { time: "23:15", location: "Kashmere Gate" },
      arrival: { time: "08:30+1", location: "Borivali" },
      duration: "9h 15m",
      price: 1450,
      rating: 4.0,
      amenities: ["ac", "water"],
      seatsAvailable: 8
    },
    {
      id: 3,
      operator: "Purple Travels",
      type: "Volvo Multi-Axle",
      departure: { time: "21:45", location: "Majnu Ka Tila" },
      arrival: { time: "06:30+1", location: "Thane" },
      duration: "8h 45m",
      price: 2100,
      rating: 4.5,
      amenities: ["wifi", "ac", "blanket", "water", "charging"],
      seatsAvailable: 5
    }
  ];

  const handleSearch = () => {
    setShowResults(true);
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "ac":
        return <Snowflake className="w-4 h-4" />;
      case "blanket":
        return <div className="w-4 h-4 text-xs">🛏️</div>;
      case "water":
        return <div className="w-4 h-4 text-xs">💧</div>;
      case "charging":
        return <div className="w-4 h-4 text-xs">🔌</div>;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromCity">From</Label>
          <div className="relative">
            <Input
              id="fromCity"
              placeholder="Delhi"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-end justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={swapCities}
            className="p-2 hover:bg-primary/10"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toCity">To</Label>
          <div className="relative">
            <Input
              id="toCity"
              placeholder="Mumbai"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Travel Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !travelDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {travelDate ? format(travelDate, "PPP") : <span>Pick date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={travelDate}
                onSelect={setTravelDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-primary to-primary-glow">
        Search Buses
      </Button>

      {showResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Buses</h3>

          <div className="grid gap-4">
            {mockBuses.map((bus) => (
              <Card key={bus.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-lg">{bus.operator}</div>
                        <div className="text-sm text-muted-foreground">{bus.type}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-current text-accent" />
                          <span className="text-sm">{bus.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-2xl">₹{bus.price}</div>
                        <div className="text-sm text-accent">
                          {bus.seatsAvailable} seats left
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="font-bold text-lg">{bus.departure.time}</div>
                        <div className="text-sm text-muted-foreground">{bus.departure.location}</div>
                      </div>

                      <div className="text-center flex-1 mx-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {bus.duration}
                        </div>
                        <div className="w-full h-px bg-border mt-2"></div>
                      </div>

                      <div className="text-center">
                        <div className="font-bold text-lg">{bus.arrival.time}</div>
                        <div className="text-sm text-muted-foreground">{bus.arrival.location}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {bus.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary">
                            {getAmenityIcon(amenity)}
                          </div>
                        ))}
                      </div>

                      <Button className="bg-gradient-to-r from-primary to-primary-glow">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Select Seats
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusBooking;