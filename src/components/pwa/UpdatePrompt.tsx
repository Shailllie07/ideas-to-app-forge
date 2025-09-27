import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface UpdatePromptProps {
  onDismiss?: () => void;
}

const UpdatePrompt = ({ onDismiss }: UpdatePromptProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateAvailable, updateApp, vibrate } = usePWA();

  if (!updateAvailable) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    vibrate([50, 50, 50]); // Haptic feedback pattern
    
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg animate-in slide-in-from-right-4 duration-300">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Update Available</CardTitle>
              <CardDescription className="text-sm">New features and improvements</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <div className="text-sm text-muted-foreground">
            A new version of JourneyXWave is ready with enhanced performance and new features.
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Update Now
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              size="sm"
              className="px-3"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePrompt;