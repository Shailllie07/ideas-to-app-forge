import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, HardDrive, Database, Images, MapPin } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { offlineStorage } from '@/utils/OfflineStorage';

interface StorageInfo {
  quota: number;
  usage: number;
  percentage: number;
}

interface OfflineStorageInfo {
  totalItems: number;
  totalSize: number;
  itemsByType: Record<string, number>;
}

const StorageManager = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [offlineInfo, setOfflineInfo] = useState<OfflineStorageInfo | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const { getStorageEstimate, requestPersistentStorage } = usePWA();

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const estimate = await getStorageEstimate();
      if (estimate) {
        setStorageInfo(estimate);
      }

      const offline = await offlineStorage.getStorageInfo();
      setOfflineInfo(offline);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleClearOfflineData = async () => {
    setIsClearing(true);
    try {
      await offlineStorage.clear();
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRequestPersistentStorage = async () => {
    try {
      const granted = await requestPersistentStorage();
      if (granted) {
        console.log('Persistent storage granted');
      }
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStorageColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-accent';
    if (percentage < 80) return 'bg-secondary';
    return 'bg-destructive';
  };

  const typeIcons: Record<string, React.ReactNode> = {
    trip: <MapPin className="w-4 h-4" />,
    booking: <Database className="w-4 h-4" />,
    array: <Images className="w-4 h-4" />,
    generic: <HardDrive className="w-4 h-4" />
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Manage your offline data and storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Storage</span>
                <span>{formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}</span>
              </div>
              <Progress 
                value={storageInfo.percentage} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{storageInfo.percentage.toFixed(1)}% used</span>
                <span>{formatBytes(storageInfo.quota - storageInfo.usage)} available</span>
              </div>
            </div>
          )}

          {offlineInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offline Data</span>
                <Badge variant="outline">
                  {offlineInfo.totalItems} items
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(offlineInfo.itemsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    {typeIcons[type] || typeIcons.generic}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{type}</p>
                      <p className="text-xs text-muted-foreground">{count} items</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Total offline size: {formatBytes(offlineInfo.totalSize)}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestPersistentStorage}
              className="flex-1"
            >
              Request Persistent Storage
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearOfflineData}
              disabled={isClearing}
              className="flex-1"
            >
              {isClearing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-2" />
                  Clear Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageManager;