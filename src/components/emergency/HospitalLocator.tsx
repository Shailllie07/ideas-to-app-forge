import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Navigation, Clock, Star } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  type: string;
  emergency: boolean;
}

const HospitalLocator = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          fetchNearbyHospitals(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use mock data for demo
          setMockHospitals();
          setLoading(false);
        }
      );
    } else {
      setMockHospitals();
      setLoading(false);
    }
  };

  const fetchNearbyHospitals = async (location: { lat: number; lng: number }) => {
    try {
      // In real implementation, this would call a places API like Google Places or Mapbox
      // For now, using mock data
      setTimeout(() => {
        setMockHospitals();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setMockHospitals();
      setLoading(false);
    }
  };

  const setMockHospitals = () => {
    const mockHospitals: Hospital[] = [
      {
        id: "1",
        name: "City General Hospital",
        address: "123 Medical Center Drive, Downtown",
        phone: "+1-555-0123",
        distance: "0.8 km",
        rating: 4.5,
        type: "General Hospital",
        emergency: true
      },
      {
        id: "2",
        name: "Emergency Care Center",
        address: "456 Health Ave, Medical District",
        phone: "+1-555-0456",
        distance: "1.2 km",
        rating: 4.2,
        type: "Emergency Care",
        emergency: true
      },
      {
        id: "3",
        name: "Metro Medical Clinic",
        address: "789 Wellness Street, Midtown",
        phone: "+1-555-0789",
        distance: "2.1 km",
        rating: 4.0,
        type: "Medical Clinic",
        emergency: false
      },
      {
        id: "4",
        name: "Regional Medical Center",
        address: "321 Hospital Road, North District",
        phone: "+1-555-0321",
        distance: "3.5 km",
        rating: 4.7,
        type: "Medical Center",
        emergency: true
      }
    ];
    setHospitals(mockHospitals);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
              <p>Finding nearby hospitals...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-destructive" />
            Nearby Hospitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{hospital.name}</h3>
                        <p className="text-sm text-muted-foreground">{hospital.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hospital.emergency && (
                          <Badge variant="destructive" className="text-xs">
                            Emergency
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {hospital.distance}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{hospital.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{hospital.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleCall(hospital.phone)}
                        className="flex-1 bg-gradient-to-r from-destructive to-destructive/90"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        onClick={() => handleNavigate(hospital.address)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={getCurrentLocation}
            variant="outline"
            className="w-full mt-4"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Refresh Location
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalLocator;