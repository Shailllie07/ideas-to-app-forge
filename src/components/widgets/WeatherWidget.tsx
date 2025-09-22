import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  MapPin,
  Thermometer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  location: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
  windSpeed: number;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData>({
    location: "Your Location",
    temperature: 24,
    condition: "sunny",
    humidity: 65,
    windSpeed: 12
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading weather data
    const timer = setTimeout(() => {
      setWeather({
        location: "San Francisco, CA",
        temperature: 22,
        condition: "cloudy",
        humidity: 68,
        windSpeed: 15
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case "rainy":
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "sunny":
        return "from-yellow-400 to-orange-500";
      case "cloudy":
        return "from-gray-400 to-gray-600";
      case "rainy":
        return "from-blue-400 to-blue-600";
      default:
        return "from-yellow-400 to-orange-500";
    }
  };

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded w-1/2 mb-3"></div>
            <div className="flex items-center justify-between">
              <div className="h-8 bg-blue-200 rounded w-16"></div>
              <div className="h-8 w-8 bg-blue-200 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-0 bg-gradient-to-r transition-all duration-500 hover:shadow-lg",
      `from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900`
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {weather.location}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs bg-white/20 text-blue-800 dark:text-blue-200">
            Now
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {weather.temperature}°C
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 capitalize">
              {weather.condition}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getWeatherIcon(weather.condition)}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-blue-600 dark:text-blue-400">
          <div className="flex items-center space-x-1">
            <Thermometer className="w-3 h-3" />
            <span>Humidity {weather.humidity}%</span>
          </div>
          <div>
            Wind {weather.windSpeed} km/h
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;