import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Eye, Upload, Calendar, MapPin, Clock, User } from "lucide-react";

interface Document {
  id: string;
  type: "flight" | "hotel" | "train" | "bus" | "visa" | "insurance";
  title: string;
  reference: string;
  date: string;
  status: "confirmed" | "pending" | "cancelled";
  details: string;
}

const TripDocuments = () => {
  const mockDocuments: Document[] = [
    {
      id: "1",
      type: "flight",
      title: "Delhi to Mumbai Flight",
      reference: "6E2345",
      date: "2024-03-15T06:30:00",
      status: "confirmed",
      details: "IndiGo • Terminal 3 • Seat 12A"
    },
    {
      id: "2",
      type: "hotel",
      title: "The Taj Mahal Palace",
      reference: "TAJ123456",
      date: "2024-03-15",
      status: "confirmed",
      details: "Deluxe Room • 3 nights • Check-in 3:00 PM"
    },
    {
      id: "3",
      type: "train",
      title: "Rajdhani Express",
      reference: "12951/S4/28",
      date: "2024-03-18T16:35:00",
      status: "confirmed",
      details: "2AC • Coach A1 • Berth 24"
    }
  ];

  const getDocumentIcon = (type: Document["type"]) => {
    switch (type) {
      case "flight":
        return "✈️";
      case "hotel":
        return "🏨";
      case "train":
        return "🚆";
      case "bus":
        return "🚌";
      case "visa":
        return "📋";
      case "insurance":
        return "🛡️";
      default:
        return "📄";
    }
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-accent text-accent-foreground";
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const isDateTime = dateString.includes("T");
    
    if (isDateTime) {
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: null
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Travel Documents</h2>
          <p className="text-muted-foreground">All your bookings and confirmations in one place</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4">
        {mockDocuments.map((doc) => (
          <Card key={doc.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center text-2xl">
                    {getDocumentIcon(doc.type)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{doc.title}</h3>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {doc.reference}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(doc.date).date}
                        </div>
                        {formatDateTime(doc.date).time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(doc.date).time}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.details}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockDocuments.length === 0 && (
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-2xl">
              📄
            </div>
            <h3 className="font-bold text-lg mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your booking confirmations, tickets, and travel documents will appear here once you start planning trips.
            </p>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripDocuments;