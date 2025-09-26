import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Key, AlertTriangle } from 'lucide-react';

interface MapTokenManagerProps {
  onTokenSet?: () => void;
}

const MapTokenManager = ({ onTokenSet }: MapTokenManagerProps) => {
  const [token, setToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeMapboxToken();
  }, []);

  const initializeMapboxToken = async () => {
    try {
      // Try to get token from Supabase secrets via edge function
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (data?.token) {
        mapboxgl.accessToken = data.token;
        setIsTokenValid(true);
        onTokenSet?.();
      } else {
        // Fallback to manual token entry
        setShowTokenInput(true);
      }
    } catch (error) {
      console.log('Edge function not available, using manual token entry');
      setShowTokenInput(true);
    } finally {
      setLoading(false);
    }
  };

  const validateAndSetToken = (tokenToValidate: string) => {
    // Basic Mapbox token validation (starts with pk.)
    if (tokenToValidate.startsWith('pk.') && tokenToValidate.length > 20) {
      mapboxgl.accessToken = tokenToValidate;
      setIsTokenValid(true);
      setShowTokenInput(false);
      onTokenSet?.();
      return true;
    }
    return false;
  };

  const handleTokenSubmit = () => {
    if (!validateAndSetToken(token)) {
      alert('Invalid Mapbox token. Please check your token and try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isTokenValid) {
    return null; // Token is set, don't show anything
  }

  if (showTokenInput) {
    return (
      <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                Mapbox Token Required
              </h3>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                To use maps, you need a Mapbox public token. Get one free at{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Enter your Mapbox Public Token</Label>
              <div className="flex gap-2">
                <Input
                  id="mapbox-token"
                  type="password"
                  placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleTokenSubmit} disabled={!token.trim()}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Set Token
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>For production:</strong> Add MAPBOX_PUBLIC_TOKEN to your Supabase Edge Function secrets for automatic token management.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default MapTokenManager;