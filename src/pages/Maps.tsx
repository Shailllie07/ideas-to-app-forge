import { useState } from "react";
import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Download, Navigation } from "lucide-react";
import OfflineMapsList from "@/components/maps/OfflineMapsList";
import MapNavigation from "@/components/maps/MapNavigation";
import MapboxConfig from "@/components/maps/MapboxConfig";

const Maps = () => {
  const [activeTab, setActiveTab] = useState("navigation");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <MapboxConfig />
      <Header title="Maps & Navigation" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maps & Navigation</h1>
            <p className="text-muted-foreground">Navigate offline and download maps for your travels</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full h-12 bg-card/50 backdrop-blur">
              <TabsTrigger value="navigation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <Navigation className="w-4 h-4 mr-2" />
                Navigation
              </TabsTrigger>
              <TabsTrigger value="offline-maps" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <Download className="w-4 h-4 mr-2" />
                Offline Maps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="navigation" className="space-y-0">
              <div className="h-[600px] rounded-lg overflow-hidden border border-border/50 shadow-lg">
                <MapNavigation />
              </div>
            </TabsContent>

            <TabsContent value="offline-maps" className="space-y-0">
              <OfflineMapsList />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Maps;