import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Star, Users, Wifi, Coffee, Car, Dumbbell, ExternalLink, Map } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const HotelBooking = () => {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [rooms, setRooms] = useState("1");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [showResults, setShowResults] = useState(false);

  const mockHotels = [
    {
      id: 1,
      name: "The Taj Mahal Palace",
      location: "Colaba, Mumbai",
      rating: 4.8,
      reviews: 2456,
      image: "/placeholder.svg",
      price: 15500,
      originalPrice: 18000,
      discount: 14,
      amenities: ["wifi", "pool", "gym", "spa", "parking"],
      description: "Luxury heritage hotel with stunning views"
    },
    {
      id: 2,
      name: "The Oberoi Mumbai",
      location: "Nariman Point, Mumbai",
      rating: 4.7,
      reviews: 1823,
      image: "/placeholder.svg",
      price: 12800,
      originalPrice: 14500,
      discount: 12,
      amenities: ["wifi", "pool", "gym", "restaurant"],
      description: "Contemporary luxury with panoramic city views"
    },
    {
      id: 3,
      name: "ITC Grand Central",
      location: "Parel, Mumbai",
      rating: 4.6,
      reviews: 3421,
      image: "/placeholder.svg",
      price: 9500,
      originalPrice: 11000,
      discount: 14,
      amenities: ["wifi", "pool", "gym", "restaurant", "parking"],
      description: "Business hotel with modern amenities"
    }
  ];

  const handleSearch = () => {
    setShowResults(true);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "pool":
        return <div className="w-4 h-4 text-xs">🏊</div>;
      case "gym":
        return <Dumbbell className="w-4 h-4" />;
      case "spa":
        return <div className="w-4 h-4 text-xs">🧘</div>;
      case "parking":
        return <Car className="w-4 h-4" />;
      case "restaurant":
        return <Coffee className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <Input
              id="location"
              placeholder="Mumbai, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "PPP") : <span>Check-in</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "PPP") : <span>Check-out</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Rooms</Label>
          <Select value={rooms} onValueChange={setRooms}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Room{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Adults</Label>
          <Select value={adults} onValueChange={setAdults}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Adult{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Children</Label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Child' : 'Children'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-primary to-primary-glow">
        Search Hotels
      </Button>

      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Hotels</h3>
            <Button variant="outline" size="sm">
              <Map className="w-4 h-4 mr-2" />
              Show on Map
            </Button>
          </div>

          <div className="grid gap-6">
            {mockHotels.map((hotel) => (
              <Card key={hotel.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card/50 backdrop-blur overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-64 h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-muted-foreground text-center">
                        <div className="text-sm">Hotel Image</div>
                        <div className="text-xs">240x192</div>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-lg">{hotel.name}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {hotel.location}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{hotel.description}</p>
                          </div>
                          
                          <div className="text-right">
                            {hotel.discount > 0 && (
                              <div className="text-sm text-muted-foreground line-through">
                                ₹{hotel.originalPrice.toLocaleString()}
                              </div>
                            )}
                            <div className="font-bold text-2xl">₹{hotel.price.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">per night</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current text-accent" />
                              <span className="font-medium">{hotel.rating}</span>
                              <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
                            </div>
                            
                            {hotel.discount > 0 && (
                              <Badge className="bg-accent text-accent-foreground">
                                {hotel.discount}% OFF
                              </Badge>
                            )}
                          </div>

                          <Button className="bg-gradient-to-r from-primary to-primary-glow">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Book Now
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          {hotel.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary">
                              {getAmenityIcon(amenity)}
                            </div>
                          ))}
                        </div>
                      </div>
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

export default HotelBooking;