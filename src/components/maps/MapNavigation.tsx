import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Route, Zap, Car, Clock, X } from 'lucide-react';

// Set Mapbox token - in production this would come from environment
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN3cHNmdmYweGRpMmpwazZuZjF3dGdjIn0.example'; // You'll need to replace with actual token

const MapNavigation = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    route: string;
  } | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.2090, 28.6139], // Delhi coordinates
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    map.current.addControl(geolocateControl, 'top-right');

    // Get current location
    geolocateControl.on('geolocate', (e) => {
      const { longitude, latitude } = e.coords;
      setCurrentLocation([longitude, latitude]);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  const searchDestination = async () => {
    if (!destination.trim()) return;

    try {
      // Mock geocoding - in real app, use Mapbox Geocoding API
      const mockCoordinates: [number, number] = [77.2300, 28.6500]; // Mock destination
      
      // Add destination marker
      if (map.current) {
        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat(mockCoordinates)
          .addTo(map.current);

        // Fit map to show both current location and destination
        if (currentLocation) {
          const bounds = new mapboxgl.LngLatBounds()
            .extend(currentLocation)
            .extend(mockCoordinates);
          
          map.current.fitBounds(bounds, { padding: 50 });
          
          // Simulate route calculation
          setRouteInfo({
            distance: "12.5 km",
            duration: "25 min",
            route: "Fastest route via Ring Road"
          });
        }
      }
    } catch (error) {
      console.error('Error searching destination:', error);
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    // In real app, this would start turn-by-turn navigation
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setRouteInfo(null);
    // Clear route from map
    if (map.current && map.current.getLayer('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
  };

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search destination..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && searchDestination()}
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Button onClick={searchDestination} className="bg-gradient-to-r from-primary to-primary-glow">
                <Route className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Info Card */}
      {routeInfo && !isNavigating && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Route Found</h3>
                  <Button variant="ghost" size="sm" onClick={stopNavigation}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    <span className="font-medium">{routeInfo.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">{routeInfo.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {routeInfo.route}
                  </Badge>
                </div>
                
                <Button 
                  onClick={startNavigation} 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Navigation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Controls */}
      {isNavigating && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-semibold">Navigating</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={stopNavigation}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">Turn left in 200m</div>
                  <div className="text-sm text-muted-foreground">onto MG Road</div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span>8.5 km remaining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>15 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapNavigation;