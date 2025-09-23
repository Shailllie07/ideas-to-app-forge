import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, FileText, Share2, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Trip {
  id: string;
  destination: string;
  dates: {
    start: string;
    end: string;
  };
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  travelers: number;
  image?: string;
  bookings: {
    flights?: number;
    hotels?: number;
    activities?: number;
  };
  itinerary: {
    days: number;
    highlights: string[];
  };
}

const TripTimeline = () => {
  const mockTrips: Trip[] = [
    {
      id: "1",
      destination: "Goa, India",
      dates: { start: "2024-03-15", end: "2024-03-22" },
      status: "upcoming",
      travelers: 4,
      bookings: { flights: 2, hotels: 1, activities: 3 },
      itinerary: { days: 7, highlights: ["Beach relaxation", "Water sports", "Local cuisine"] }
    },
    {
      id: "2",
      destination: "Kerala Backwaters",
      dates: { start: "2024-01-10", end: "2024-01-17" },
      status: "completed",
      travelers: 2,
      bookings: { flights: 1, hotels: 2, activities: 4 },
      itinerary: { days: 7, highlights: ["Houseboat cruise", "Spice plantations", "Ayurvedic spa"] }
    }
  ];

  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-primary text-primary-foreground";
      case "ongoing":
        return "bg-accent text-accent-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Your Travel Journey</h2>
        <p className="text-muted-foreground">Track your past adventures and upcoming trips</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary-glow to-muted"></div>
        
        <div className="space-y-8">
          {mockTrips.map((trip, index) => (
            <div key={trip.id} className="relative flex items-start gap-6">
              {/* Timeline dot */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-background shadow-lg flex items-center justify-center ${
                trip.status === "completed" ? "bg-accent" : 
                trip.status === "upcoming" ? "bg-gradient-to-r from-primary to-primary-glow" :
                "bg-muted"
              }`}>
                <Calendar className={`w-6 h-6 ${
                  trip.status === "completed" ? "text-accent-foreground" : 
                  trip.status === "upcoming" ? "text-primary-foreground" :
                  "text-muted-foreground"
                }`} />
              </div>

              {/* Trip card */}
              <Card className="flex-1 border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{trip.destination}</CardTitle>
                        <Badge className={getStatusColor(trip.status)}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.dates.start)} - {formatDate(trip.dates.end)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {trip.itinerary.days} days
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Trip
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Itinerary
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Export Documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Bookings summary */}
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">Bookings:</div>
                    <div className="flex items-center gap-3">
                      {trip.bookings.flights && (
                        <Badge variant="secondary">{trip.bookings.flights} Flight{trip.bookings.flights > 1 ? 's' : ''}</Badge>
                      )}
                      {trip.bookings.hotels && (
                        <Badge variant="secondary">{trip.bookings.hotels} Hotel{trip.bookings.hotels > 1 ? 's' : ''}</Badge>
                      )}
                      {trip.bookings.activities && (
                        <Badge variant="secondary">{trip.bookings.activities} Activities</Badge>
                      )}
                    </div>
                  </div>

                  {/* Itinerary highlights */}
                  <div>
                    <div className="text-sm font-medium mb-2">Highlights:</div>
                    <div className="flex flex-wrap gap-2">
                      {trip.itinerary.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Itinerary
                    </Button>
                    {trip.status === "upcoming" && (
                      <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow">
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Trip
                      </Button>
                    )}
                    {trip.status === "completed" && (
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Memories
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripTimeline;