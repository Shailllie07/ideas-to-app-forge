import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SOSButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SOSButton = ({ className, size = "md" }: SOSButtonProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7", 
    lg: "w-9 h-9"
  };

  const handleSOSClick = () => {
    setShowConfirmDialog(true);
  };

  const handleEmergencyConfirm = () => {
    setShowConfirmDialog(false);
    // Navigate to emergency page where the actual SOS logic will be handled
    navigate("/emergency?sos=true");
  };

  return (
    <>
      <Button
        onClick={handleSOSClick}
        className={cn(
          "fixed bottom-20 right-4 z-50 rounded-full shadow-2xl border-2 border-white/20",
          "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
          "transition-all duration-300 hover:scale-110 active:scale-95",
          "animate-pulse hover:animate-none",
          sizeClasses[size],
          className
        )}
        size="icon"
      >
        <ShieldAlert className={cn("animate-pulse", iconSizes[size])} />
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Emergency SOS
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              This will immediately alert your emergency contacts and share your location. 
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEmergencyConfirm}
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Phone className="w-4 h-4 mr-2" />
              Send SOS Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SOSButton;