import { Wifi, WifiOff, CloudOff, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';

const OfflineIndicator = () => {
  const { capabilities } = usePWA();

  if (!capabilities.isOffline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <Badge 
        variant="secondary" 
        className="bg-muted/95 text-muted-foreground border shadow-lg animate-in slide-in-from-top-2 duration-300"
      >
        <WifiOff className="w-3 h-3 mr-1.5" />
        You're offline
      </Badge>
    </div>
  );
};

export default OfflineIndicator;