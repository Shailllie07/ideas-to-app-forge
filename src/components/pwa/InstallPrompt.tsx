import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone, Zap, Shield, Globe } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface InstallPromptProps {
  onDismiss?: () => void;
  autoShow?: boolean;
}

const InstallPrompt = ({ onDismiss, autoShow = true }: InstallPromptProps) => {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [isInstalling, setIsInstalling] = useState(false);
  const { capabilities, installApp, vibrate } = usePWA();

  if (!isVisible || !capabilities.canInstall || capabilities.isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    vibrate(50); // Haptic feedback
    
    try {
      const success = await installApp();
      if (success) {
        setIsVisible(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const features = [
    {
      icon: <Zap className="w-4 h-4 text-secondary" />,
      title: "Lightning Fast",
      description: "Instant loading and smooth performance"
    },
    {
      icon: <Globe className="w-4 h-4 text-accent" />,
      title: "Works Offline",
      description: "Access your trips and maps without internet"
    },
    {
      icon: <Shield className="w-4 h-4 text-destructive" />,
      title: "Emergency Ready",
      description: "SOS features work even offline"
    },
    {
      icon: <Smartphone className="w-4 h-4 text-primary" />,
      title: "Native Experience",
      description: "App-like experience on your device"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-8 w-8 p-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Install JourneyXWave</CardTitle>
              <CardDescription>Get the best travel experience</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                {feature.icon}
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Fast
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleInstall} 
              disabled={isInstalling}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium"
              size="lg"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleDismiss}
              className="w-full text-muted-foreground"
              size="sm"
            >
              Maybe later
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Installing gives you quick access from your home screen and works offline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;