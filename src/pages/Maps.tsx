import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Map, Navigation, Wifi, WifiOff } from "lucide-react";

const Maps = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header title="Offline Maps" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Offline Maps</h1>
              <p className="text-muted-foreground">Download maps for offline navigation</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <WifiOff className="w-4 h-4" />
              <span>Works offline</span>
            </div>
          </div>

          {/* Download Maps Section */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Maps</span>
              </CardTitle>
              <CardDescription>
                Download map regions for offline access during your travels
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Map className="w-8 h-8 text-white" />
              </div>
              <p className="text-muted-foreground mb-6">
                Select a destination to download offline maps
              </p>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600">
                <Download className="w-4 h-4 mr-2" />
                Browse Available Maps
              </Button>
            </CardContent>
          </Card>

          {/* Navigation Section */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Navigation</span>
              </CardTitle>
              <CardDescription>
                Use turn-by-turn navigation even without internet
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Navigation className="w-8 h-8 text-white" />
              </div>
              <p className="text-muted-foreground mb-6">
                Start navigation to your destination
              </p>
              <Button variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Start Navigation
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Maps;