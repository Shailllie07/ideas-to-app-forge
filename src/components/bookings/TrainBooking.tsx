import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Clock, Users, ExternalLink, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TrainBooking = () => {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [journeyDate, setJourneyDate] = useState<Date>();
  const [trainClass, setTrainClass] = useState("3AC");
  const [quota, setQuota] = useState("GN");
  const [showResults, setShowResults] = useState(false);
  const [pnrNumber, setPnrNumber] = useState("");

  const mockTrains = [
    {
      id: 1,
      number: "12951",
      name: "Mumbai Rajdhani",
      departure: { time: "16:35", station: "NDLS" },
      arrival: { time: "08:35+1", station: "MMCT" },
      duration: "16h 00m",
      classes: {
        "1AC": { available: 5, price: 4500, status: "Available" },
        "2AC": { available: 12, price: 3200, status: "Available" },
        "3AC": { available: 8, price: 2400, status: "Available" },
        "SL": { available: 0, price: 900, status: "WL 45" }
      }
    },
    {
      id: 2,
      number: "12954",
      name: "AG Kranti Rajdhani",
      departure: { time: "17:55", station: "NDLS" },
      arrival: { time: "09:55+1", station: "MMCT" },
      duration: "16h 00m",
      classes: {
        "1AC": { available: 2, price: 4500, status: "Available" },
        "2AC": { available: 0, price: 3200, status: "WL 8" },
        "3AC": { available: 15, price: 2400, status: "Available" },
        "SL": { available: 0, price: 900, status: "WL 120" }
      }
    }
  ];

  const handleSearch = () => {
    setShowResults(true);
  };

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const getStatusColor = (status: string) => {
    if (status === "Available") return "bg-accent text-accent-foreground";
    if (status.includes("WL")) return "bg-destructive text-destructive-foreground";
    return "bg-muted text-muted-foreground";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Available") return <CheckCircle className="w-3 h-3" />;
    if (status.includes("WL")) return <AlertCircle className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  const handleConfirmTktBooking = (train: any, className: string) => {
    if (!fromStation || !toStation || !journeyDate) {
      alert("Please fill all search criteria first");
      return;
    }

    // Build ConfirmTkt URL with booking parameters
    const confirmTktUrl = new URL("https://www.confirmtkt.com/train-booking");
    
    // Add search parameters
    confirmTktUrl.searchParams.set("from", fromStation);
    confirmTktUrl.searchParams.set("to", toStation);
    confirmTktUrl.searchParams.set("date", format(journeyDate, "dd-MM-yyyy"));
    confirmTktUrl.searchParams.set("trainno", train.number);
    confirmTktUrl.searchParams.set("class", className);
    confirmTktUrl.searchParams.set("quota", quota);
    
    // Open ConfirmTkt in new tab for booking
    window.open(confirmTktUrl.toString(), "_blank", "noopener,noreferrer");
  };

  const handlePNRCheck = () => {
    if (!pnrNumber || pnrNumber.length !== 10) {
      alert("Please enter a valid 10-digit PNR number");
      return;
    }

    // Redirect to ConfirmTkt PNR status page
    const pnrUrl = `https://www.confirmtkt.com/pnr-status/${pnrNumber}`;
    window.open(pnrUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full h-12 bg-card/50 backdrop-blur">
          <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            Search Trains
          </TabsTrigger>
          <TabsTrigger value="pnr" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
            Check PNR Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromStation">From Station</Label>
              <div className="relative">
                <Input
                  id="fromStation"
                  placeholder="New Delhi (NDLS)"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-end justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={swapStations}
                className="p-2 hover:bg-primary/10"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toStation">To Station</Label>
              <div className="relative">
                <Input
                  id="toStation"
                  placeholder="Mumbai Central (MMCT)"
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Journey Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !journeyDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {journeyDate ? format(journeyDate, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={journeyDate}
                    onSelect={setJourneyDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={trainClass} onValueChange={setTrainClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1AC">First AC (1AC)</SelectItem>
                  <SelectItem value="2AC">Second AC (2AC)</SelectItem>
                  <SelectItem value="3AC">Third AC (3AC)</SelectItem>
                  <SelectItem value="SL">Sleeper (SL)</SelectItem>
                  <SelectItem value="CC">Chair Car (CC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quota</Label>
              <Select value={quota} onValueChange={setQuota}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GN">General (GN)</SelectItem>
                  <SelectItem value="TQ">Tatkal (TQ)</SelectItem>
                  <SelectItem value="LD">Ladies (LD)</SelectItem>
                  <SelectItem value="SS">Senior Citizen (SS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-primary to-primary-glow">
            Search Trains
          </Button>

          {showResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Trains</h3>
              
              <div className="grid gap-4">
                {mockTrains.map((train) => (
                  <Card key={train.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">{train.number} - {train.name}</div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{train.departure.time} → {train.arrival.time}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {train.duration}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary">{train.departure.station} → {train.arrival.station}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(train.classes).map(([className, details]) => (
                            <Card key={className} className="border border-border/50">
                              <CardContent className="p-3">
                                <div className="text-center space-y-2">
                                  <div className="font-medium">{className}</div>
                                  <div className="font-bold text-lg">₹{details.price}</div>
                                  <Badge className={getStatusColor(details.status)} variant="secondary">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(details.status)}
                                      {details.status}
                                    </div>
                                  </Badge>
                                   <Button 
                                     size="sm" 
                                     className="w-full" 
                                     disabled={details.available === 0}
                                     variant={details.available > 0 ? "default" : "secondary"}
                                     onClick={() => handleConfirmTktBooking(train, className)}
                                   >
                                     <ExternalLink className="w-3 h-3 mr-1" />
                                     Book on ConfirmTkt
                                   </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pnr" className="space-y-6">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Check PNR Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pnr">PNR Number</Label>
                <Input
                  id="pnr"
                  placeholder="Enter 10-digit PNR number"
                  value={pnrNumber}
                  onChange={(e) => setPnrNumber(e.target.value)}
                  maxLength={10}
                />
              </div>
               <Button 
                 className="w-full bg-gradient-to-r from-primary to-primary-glow"
                 onClick={handlePNRCheck}
               >
                 <ExternalLink className="w-4 h-4 mr-2" />
                 Check Status on ConfirmTkt
               </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainBooking;