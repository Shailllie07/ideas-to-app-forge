import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Shield } from "lucide-react";
import EmergencyCenter from "@/components/emergency/EmergencyCenter";

const Emergency = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header title="Emergency Center" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-destructive" />
              Emergency Center
            </h1>
            <p className="text-muted-foreground">Your safety toolkit for emergency situations</p>
          </div>

          <EmergencyCenter />
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Emergency;