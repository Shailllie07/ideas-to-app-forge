import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Clock, Star, ExternalLink, Filter, ArrowUpDown, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAirportSearch, Airport } from "@/hooks/useAirportSearch";

const FlightBooking = () => {
  const [fromAirport, setFromAirport] = useState<Airport | null>(null);
  const [toAirport, setToAirport] = useState<Airport | null>(null);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [flightClass, setFlightClass] = useState("economy");
  const [showResults, setShowResults] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { searchAirports } = useAirportSearch();
  const [fromResults, setFromResults] = useState<Airport[]>([]);
  const [toResults, setToResults] = useState<Airport[]>([]);

  useEffect(() => {
    if (fromSearch.length >= 2) {
      setFromResults(searchAirports(fromSearch));
    } else {
      setFromResults([]);
    }
  }, [fromSearch]);

  useEffect(() => {
    if (toSearch.length >= 2) {
      setToResults(searchAirports(toSearch));
    } else {
      setToResults([]);
    }
  }, [toSearch]);

  const handleSearch = async () => {
    if (!fromAirport || !toAirport || !departDate) {
      toast({
        title: "Missing Information",
        description: "Please select airports and travel date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase.functions.invoke('flight-search', {
        body: {
          fromCity: fromAirport.code,
          toCity: toAirport.code,
          departDate: format(departDate, 'yyyy-MM-dd'),
          passengers,
          flightClass,
        },
      });

      if (error) {
        console.error('Flight search error:', error);
        toast({
          title: "Search Failed",
          description: "Unable to search for flights. Please try again.",
          variant: "destructive",
        });
        setFlights([]);
      } else {
        console.log('Flight search results:', data);
        setFlights(data.flights || []);
        
        if (!data.flights || data.flights.length === 0) {
          toast({
            title: "No Flights Found",
            description: "Try different cities or dates",
          });
        }
      }
    } catch (error) {
      console.error('Flight search error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const swapCities = () => {
    const tempAirport = fromAirport;
    const tempSearch = fromSearch;
    setFromAirport(toAirport);
    setFromSearch(toSearch);
    setToAirport(tempAirport);
    setToSearch(tempSearch);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={fromOpen}
                className="w-full justify-between"
              >
                {fromAirport ? (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {fromAirport.code} - {fromAirport.city}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Select airport...
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search airports..." 
                  value={fromSearch}
                  onValueChange={setFromSearch}
                />
                <CommandList>
                  <CommandEmpty>No airports found.</CommandEmpty>
                  <CommandGroup>
                    {fromResults.map((airport) => (
                      <CommandItem
                        key={airport.code}
                        value={airport.code}
                        onSelect={() => {
                          setFromAirport(airport);
                          setFromSearch(airport.city);
                          setFromOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            fromAirport?.code === airport.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{airport.code} - {airport.city}</span>
                          <span className="text-xs text-muted-foreground">{airport.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
          <Label>To</Label>
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={toOpen}
                className="w-full justify-between"
              >
                {toAirport ? (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {toAirport.code} - {toAirport.city}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Select airport...
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search airports..." 
                  value={toSearch}
                  onValueChange={setToSearch}
                />
                <CommandList>
                  <CommandEmpty>No airports found.</CommandEmpty>
                  <CommandGroup>
                    {toResults.map((airport) => (
                      <CommandItem
                        key={airport.code}
                        value={airport.code}
                        onSelect={() => {
                          setToAirport(airport);
                          setToSearch(airport.city);
                          setToOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            toAirport?.code === airport.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{airport.code} - {airport.city}</span>
                          <span className="text-xs text-muted-foreground">{airport.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Departure</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departDate ? format(departDate, "PPP") : <span>Pick date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departDate}
                onSelect={setDepartDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Passengers & Class</Label>
          <div className="flex gap-2">
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={flightClass} onValueChange={setFlightClass}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-primary to-primary-glow" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Searching Flights...
          </>
        ) : (
          'Search Flights'
        )}
      </Button>

      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {loading ? 'Searching...' : `Available Flights (${flights.length})`}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No flights found. Try different search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {flights.map((flight) => (
                <Card key={flight.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {flight.logo ? (
                          <img src={flight.logo} alt={flight.airline} className="w-12 h-12 object-contain rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs">
                            {flight.airline.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{flight.airline}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="w-3 h-3 fill-current text-accent" />
                            {flight.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="font-bold text-lg">{flight.departure.time}</div>
                          <div className="text-sm text-muted-foreground">{flight.departure.city}</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {flight.duration}
                          </div>
                          <div className="text-xs">{flight.stops}</div>
                        </div>

                        <div className="text-center">
                          <div className="font-bold text-lg">{flight.arrival.time}</div>
                          <div className="text-sm text-muted-foreground">{flight.arrival.city}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-2xl">₹{flight.price.toLocaleString()}</div>
                        <Button 
                          className="mt-2 bg-gradient-to-r from-primary to-primary-glow"
                          onClick={() => flight.bookingUrl && window.open(flight.bookingUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightBooking;