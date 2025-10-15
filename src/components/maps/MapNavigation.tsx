import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Route, Zap, Car, Clock, X } from 'lucide-react';
import MapTokenManager from './MapTokenManager';

const MapNavigation = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTokenReady, setIsTokenReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    route: string;
  } | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !isTokenReady) return;

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
  }, [isTokenReady]);

  const searchDestination = async () => {
    if (!destination.trim() || !map.current) return;

    try {
      const token = mapboxgl.accessToken;
      
      // Use Mapbox Geocoding API to search for destination
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${token}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to geocode destination');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const coordinates: [number, number] = data.features[0].center;
        const placeName = data.features[0].place_name;
        
        // Remove any existing destination markers
        const markers = document.querySelectorAll('.mapboxgl-marker');
        markers.forEach((marker) => {
          if (marker.querySelector('[style*="background-color: rgb(239, 68, 68)"]')) {
            marker.remove();
          }
        });
        
        // Add new destination marker
        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<div class="font-semibold">${placeName}</div>`))
          .addTo(map.current)
          .togglePopup();

        // Fit map to show both current location and destination
        if (currentLocation) {
          // Get actual driving route from Mapbox Directions API
          const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation[0]},${currentLocation[1]};${coordinates[0]},${coordinates[1]}?geometries=geojson&access_token=${token}`;
          
          const directionsResponse = await fetch(directionsUrl);
          const directionsData = await directionsResponse.json();
          
          if (directionsData.routes && directionsData.routes.length > 0) {
            const route = directionsData.routes[0];
            const routeGeometry = route.geometry;
            
            // Remove any existing route layers
            if (map.current.getLayer('route')) {
              map.current.removeLayer('route');
            }
            if (map.current.getSource('route')) {
              map.current.removeSource('route');
            }
            
            // Add the route to the map
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
              }
            });
            
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 5,
                'line-opacity': 0.75
              }
            });
            
            // Fit bounds to show the entire route
            const bounds = new mapboxgl.LngLatBounds()
              .extend(currentLocation)
              .extend(coordinates);
            
            map.current.fitBounds(bounds, { padding: 100 });
            
            // Use actual route distance and duration from API
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMin = Math.round(route.duration / 60);
            
            setRouteInfo({
              distance: `${distanceKm} km`,
              duration: `${durationMin} min`,
              route: placeName.split(',')[0]
            });
          } else {
            // Fallback to straight-line if directions API fails
            const bounds = new mapboxgl.LngLatBounds()
              .extend(currentLocation)
              .extend(coordinates);
            
            map.current.fitBounds(bounds, { padding: 100 });
            
            // Calculate straight-line distance
            const distance = calculateDistance(
              currentLocation[1], currentLocation[0],
              coordinates[1], coordinates[0]
            );
            
            const duration = Math.round((distance / 40) * 60);
            
            setRouteInfo({
              distance: `${distance.toFixed(1)} km`,
              duration: `${duration} min`,
              route: placeName.split(',')[0]
            });
          }
        } else {
          // Just center on destination if no current location
          map.current.flyTo({ center: coordinates, zoom: 14 });
        }
      } else {
        alert('Destination not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching destination:', error);
      alert('Failed to search for destination. Please try again.');
    }
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
      {!isTokenReady && (
        <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur flex items-center justify-center p-4">
          <MapTokenManager onTokenSet={() => setIsTokenReady(true)} />
        </div>
      )}
      
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