import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  Wind, 
  AlertTriangle,
  Thermometer,
  Droplets,
  Eye,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pushNotificationService } from '@/utils/PushNotificationService';
import { locationService } from '@/utils/LocationService';
import { cn } from '@/lib/utils';

interface WeatherAlert {
  id: string;
  type: 'severe_weather' | 'temperature' | 'precipitation' | 'wind' | 'visibility';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedAreas: string[];
  instructions?: string[];
}

interface WeatherData {
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitationChance: number;
  }>;
  alerts: WeatherAlert[];
  lastUpdated: string;
}

const WeatherAlertSystem = () => {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

  useEffect(() => {
    initializeWeatherService();
    setupLocationTracking();
  }, []);

  const initializeWeatherService = async () => {
    try {
      await fetchWeatherData();
      setupWeatherAlerts();
    } catch (error) {
      console.error('Error initializing weather service:', error);
    }
  };

  const setupLocationTracking = async () => {
    try {
      const permission = await locationService.requestPermission();
      if (permission) {
        // Update weather when location changes significantly
        await locationService.startLocationTracking({
          minInterval: 300000 // 5 minutes
        });
      }
    } catch (error) {
      console.error('Error setting up location tracking:', error);
    }
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Get current location
      const location = await locationService.getCurrentPosition();
      
      // Mock weather data - in production, use a weather API like OpenWeatherMap
      const mockWeatherData: WeatherData = {
        location: 'San Francisco, CA',
        coordinates: {
          lat: location.latitude,
          lng: location.longitude
        },
        current: {
          temperature: 22,
          feelsLike: 24,
          humidity: 68,
          windSpeed: 15,
          windDirection: 'NW',
          visibility: 10,
          uvIndex: 6,
          condition: 'Partly Cloudy',
          icon: 'partly-cloudy'
        },
        forecast: [
          {
            date: new Date().toISOString().split('T')[0],
            high: 24,
            low: 18,
            condition: 'Partly Cloudy',
            icon: 'partly-cloudy',
            precipitationChance: 20
          },
          {
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            high: 26,
            low: 19,
            condition: 'Sunny',
            icon: 'sunny',
            precipitationChance: 5
          },
          {
            date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            high: 21,
            low: 16,
            condition: 'Rain',
            icon: 'rain',
            precipitationChance: 85
          }
        ],
        alerts: [
          {
            id: '1',
            type: 'precipitation',
            severity: 'moderate',
            title: 'Heavy Rain Expected',
            description: 'Heavy rainfall expected tomorrow afternoon with potential for localized flooding.',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            endTime: new Date(Date.now() + 108000000).toISOString(),
            affectedAreas: ['San Francisco', 'Bay Area'],
            instructions: [
              'Avoid driving in flooded areas',
              'Carry an umbrella or rain gear',
              'Check for travel delays'
            ]
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      setWeatherData(mockWeatherData);
      setLastLocationUpdate(new Date());
      
      // Process any active alerts
      processWeatherAlerts(mockWeatherData.alerts);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: "Weather Update Failed",
        description: "Could not fetch current weather data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupWeatherAlerts = () => {
    // Set up periodic weather checks
    const checkInterval = setInterval(() => {
      if (alertsEnabled) {
        checkForWeatherUpdates();
      }
    }, 600000); // Check every 10 minutes

    return () => clearInterval(checkInterval);
  };

  const checkForWeatherUpdates = async () => {
    try {
      // In production, this would check for new weather alerts
      console.log('Checking for weather updates...');
    } catch (error) {
      console.error('Error checking weather updates:', error);
    }
  };

  const processWeatherAlerts = async (alerts: WeatherAlert[]) => {
    if (!alertsEnabled) return;

    for (const alert of alerts) {
      // Send push notification for high severity alerts
      if (alert.severity === 'high' || alert.severity === 'extreme') {
        try {
          await pushNotificationService.sendLocalNotification({
            title: `Weather Alert: ${alert.title}`,
            body: alert.description,
            tag: `weather-${alert.id}`,
            data: { alertId: alert.id, type: 'weather' },
            priority: alert.severity === 'extreme' ? 'high' : 'normal'
          });
        } catch (error) {
          console.error('Error sending weather notification:', error);
        }
      }

      // Show toast for immediate alerts
      if (new Date(alert.startTime) <= new Date()) {
        toast({
          title: alert.title,
          description: alert.description,
          variant: alert.severity === 'extreme' ? 'destructive' : 'default'
        });
      }
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'partly-cloudy':
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rain':
      case 'showers':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-blue-300" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'extreme':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'extreme':
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">Loading weather data...</span>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Cloud className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Weather Unavailable</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Could not load weather information
          </p>
          <Button onClick={fetchWeatherData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Current Weather
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeatherData}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">{weatherData.location}</h3>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatTime(weatherData.lastUpdated)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{weatherData.current.temperature}°C</div>
              <div className="text-sm text-muted-foreground">
                Feels like {weatherData.current.feelsLike}°C
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            {getWeatherIcon(weatherData.current.condition)}
            <span className="font-medium">{weatherData.current.condition}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>{weatherData.current.humidity}% Humidity</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <span>{weatherData.current.windSpeed} km/h {weatherData.current.windDirection}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <span>{weatherData.current.visibility} km Visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-orange-500" />
              <span>UV Index {weatherData.current.uvIndex}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Weather Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weatherData.alerts.map((alert) => (
              <Alert key={alert.id} className={cn("border-l-4", getSeverityColor(alert.severity))}>
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant={alert.severity === 'extreme' ? 'destructive' : 'secondary'}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </div>
                    <AlertDescription className="mb-3">
                      {alert.description}
                    </AlertDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.startTime)} - {formatTime(alert.endTime)}
                      </span>
                      <span>Areas: {alert.affectedAreas.join(', ')}</span>
                    </div>
                    {alert.instructions && (
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm">Recommendations:</h5>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {alert.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>3-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weatherData.forecast.map((day, index) => (
              <div key={day.date} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">
                    {index === 0 ? 'Today' : formatDate(day.date)}
                  </span>
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">{day.high}°</span>
                    <span className="text-muted-foreground">{day.low}°</span>
                  </div>
                  <p className="text-sm">{day.condition}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Droplets className="w-3 h-3" />
                    <span>{day.precipitationChance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherAlertSystem;