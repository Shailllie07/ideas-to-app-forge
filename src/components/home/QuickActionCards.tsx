import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Map, 
  Calendar, 
  Shield,
  MessageCircle,
  Hotel,
  Train,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  gradient: string;
  badge?: string;
  disabled?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: "ai-planner",
    title: "AI Trip Planner",
    description: "Get personalized travel recommendations",
    icon: MessageCircle,
    path: "/ai-planner",
    gradient: "from-blue-500 to-purple-600",
    badge: "Smart"
  },
  {
    id: "book-flight",
    title: "Book Flights",
    description: "Find and book the best flight deals",
    icon: Plane,
    path: "/bookings/flights",
    gradient: "from-purple-600 to-pink-600",
    badge: "Popular"
  },
  {
    id: "offline-maps",
    title: "Offline Maps",
    description: "Download maps for offline navigation",
    icon: Map,
    path: "/maps",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    id: "emergency",
    title: "Emergency Center",
    description: "Safety tools and SOS features",
    icon: Shield,
    path: "/emergency",
    gradient: "from-red-500 to-orange-500",
    badge: "24/7"
  },
  {
    id: "book-hotel",
    title: "Book Hotels",
    description: "Find accommodations worldwide",
    icon: Hotel,
    path: "/bookings/hotels",
    gradient: "from-indigo-500 to-blue-600"
  },
  {
    id: "book-train",
    title: "Train Tickets",
    description: "Book train journeys with PNR tracking",
    icon: Train,
    path: "/bookings/trains",
    gradient: "from-orange-500 to-red-500"
  }
];

const QuickActionCards = () => {
  const navigate = useNavigate();

  const handleActionClick = (action: QuickAction) => {
    if (!action.disabled) {
      navigate(action.path);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {quickActions.map((action) => {
        const IconComponent = action.icon;
        
        return (
          <Card
            key={action.id}
            className={cn(
              "border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group",
              "bg-card/60 backdrop-blur hover:scale-105",
              action.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handleActionClick(action)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Icon and Badge */}
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-r shadow-lg group-hover:scale-110 transition-transform duration-300",
                  action.gradient
                )}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                {action.badge && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground leading-tight">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Hover indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickActionCards;