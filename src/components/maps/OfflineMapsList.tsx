import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Trash2, Map, HardDrive, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface OfflineMap {
  id: string;
  region_name: string;
  region_bounds: any;
  download_date: string;
  file_size: number;
  map_style: string;
  is_active: boolean;
}

const OfflineMapsList = () => {
  const { user } = useAuth();
  const [maps, setMaps] = useState<OfflineMap[]>([]);
  const [downloadingRegions, setDownloadingRegions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [newRegionName, setNewRegionName] = useState("");
  const [mapStyle, setMapStyle] = useState("streets");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const availableRegions = [
    { name: "Mumbai", bounds: [72.7757, 18.8951, 72.9781, 19.2762] },
    { name: "Delhi", bounds: [76.8388, 28.4041, 77.3462, 28.8833] },
    { name: "Bangalore", bounds: [77.4601, 12.8340, 77.7840, 13.1404] },
    { name: "Goa", bounds: [73.6813, 15.0986, 74.3012, 15.8050] },
    { name: "Kerala", bounds: [74.8520, 8.2972, 77.4168, 12.7800] },
    { name: "Rajasthan", bounds: [69.0290, 23.0395, 78.2690, 30.0668] }
  ];

  useEffect(() => {
    fetchOfflineMaps();
  }, []);

  const fetchOfflineMaps = async () => {
    try {
      const { data, error } = await supabase
        .from('offline_maps')
        .select('*')
        .eq('is_active', true)
        .order('download_date', { ascending: false });

      if (error) throw error;
      setMaps(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch offline maps",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadRegion = async (regionName: string, bounds: number[]) => {
    setDownloadingRegions(prev => new Set(prev).add(regionName));
    
    try {
      // Simulate map download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('offline_maps')
        .insert({
          user_id: user?.id,
          region_name: regionName,
          region_bounds: { bounds },
          file_size: Math.floor(Math.random() * 100000000) + 10000000, // Random file size
          map_style: mapStyle
        });

      if (error) throw error;
      
      toast({
        title: "Download Complete",
        description: `${regionName} map downloaded successfully`,
      });
      
      fetchOfflineMaps();
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download map region",
        variant: "destructive"
      });
    } finally {
      setDownloadingRegions(prev => {
        const newSet = new Set(prev);
        newSet.delete(regionName);
        return newSet;
      });
    }
  };

  const deleteMap = async (mapId: string) => {
    try {
      const { error } = await supabase
        .from('offline_maps')
        .delete()
        .eq('id', mapId);

      if (error) throw error;
      
      toast({
        title: "Map Deleted",
        description: "Offline map removed successfully",
      });
      
      fetchOfflineMaps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete map",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalStorage = () => {
    return maps.reduce((total, map) => total + (map.file_size || 0), 0);
  };

  const filteredRegions = availableRegions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading maps...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Used Storage</span>
              <span>{formatFileSize(getTotalStorage())} / 2 GB</span>
            </div>
            <Progress value={(getTotalStorage() / (2 * 1024 * 1024 * 1024)) * 100} />
            <div className="text-xs text-muted-foreground">
              {maps.length} map{maps.length !== 1 ? 's' : ''} downloaded
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download New Maps */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Maps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Regions</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search for a region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Map Style</Label>
              <Select value={mapStyle} onValueChange={setMapStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streets">Streets</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="outdoors">Outdoors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegions.map((region) => {
              const isDownloading = downloadingRegions.has(region.name);
              const isDownloaded = maps.some(map => map.region_name === region.name);
              
              return (
                <Card key={region.name} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{region.name}</h4>
                        {isDownloaded && (
                          <Badge variant="secondary">Downloaded</Badge>
                        )}
                      </div>
                      
                      <div className="w-full h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <Map className="w-8 h-8 text-muted-foreground" />
                      </div>
                      
                      <Button
                        onClick={() => downloadRegion(region.name, region.bounds)}
                        disabled={isDownloading || isDownloaded}
                        className="w-full"
                        variant={isDownloaded ? "secondary" : "default"}
                      >
                        {isDownloading && <Download className="w-4 h-4 mr-2 animate-pulse" />}
                        {isDownloading ? "Downloading..." : isDownloaded ? "Downloaded" : "Download"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Downloaded Maps */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Downloaded Maps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maps.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <Map className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No offline maps yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download maps for offline navigation and exploration
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {maps.map((map) => (
                <div key={map.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <Map className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{map.region_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(map.file_size || 0)}</span>
                        <span>Downloaded {new Date(map.download_date).toLocaleDateString()}</span>
                        <Badge variant="outline">{map.map_style}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMap(map.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineMapsList;