import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, FileText, Share2, Edit, MoreVertical, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTrips } from "@/hooks/useTrips";
import { Skeleton } from "@/components/ui/skeleton";

const TripTimeline = () => {
  const { trips, loading, createTrip } = useTrips();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "planning":
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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "planning":
        return "Planning";
      case "confirmed":
        return "Upcoming";
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Your Travel Journey</h2>
          <p className="text-muted-foreground">Track your past adventures and upcoming trips</p>
        </div>
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-6">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Your Travel Journey</h2>
          <p className="text-muted-foreground">Track your past adventures and upcoming trips</p>
        </div>
        
        <Card className="border-2 border-dashed border-muted-foreground/25 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
              <Plus className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">No trips yet</h3>
              <p className="text-muted-foreground max-w-md">
                Start planning your next adventure! Create your first trip to begin your travel journey.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="w-4 h-4 mr-2" />
              Plan Your First Trip
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {trips.map((trip, index) => (
            <div key={trip.id} className="relative flex items-start gap-6">
              {/* Timeline dot */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-background shadow-lg flex items-center justify-center ${
                trip.status === "completed" ? "bg-accent" : 
                trip.status === "confirmed" || trip.status === "planning" ? "bg-gradient-to-r from-primary to-primary-glow" :
                "bg-muted"
              }`}>
                <Calendar className={`w-6 h-6 ${
                  trip.status === "completed" ? "text-accent-foreground" : 
                  trip.status === "confirmed" || trip.status === "planning" ? "text-primary-foreground" :
                  "text-muted-foreground"
                }`} />
              </div>

              {/* Trip card */}
              <Card className="flex-1 border-0 shadow-lg bg-card/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{trip.title || trip.destination}</CardTitle>
                        <Badge className={getStatusColor(trip.status)}>
                          {getStatusDisplay(trip.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {calculateDays(trip.start_date, trip.end_date)} days
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
                  {/* Trip details */}
                  {trip.budget && (
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">Budget:</div>
                      <Badge variant="secondary">₹{trip.budget.toLocaleString()}</Badge>
                    </div>
                  )}

                  {/* Notes */}
                  {trip.notes && (
                    <div>
                      <div className="text-sm font-medium mb-2">Notes:</div>
                      <p className="text-sm text-muted-foreground">{trip.notes}</p>
                    </div>
                  )}

                  {/* AI Generated Itinerary highlights */}
                  {trip.ai_generated_itinerary && (
                    <div>
                      <div className="text-sm font-medium mb-2">AI Itinerary:</div>
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {JSON.stringify(trip.ai_generated_itinerary).length > 100 
                          ? "AI-powered itinerary available" 
                          : JSON.stringify(trip.ai_generated_itinerary)
                        }
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {(trip.status === "planning" || trip.status === "confirmed") && (
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