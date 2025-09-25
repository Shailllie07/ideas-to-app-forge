import { useState } from "react";
import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Heart } from "lucide-react";
import UserProfile from "@/components/profile/UserProfile";
import EmergencyContactsManager from "@/components/profile/EmergencyContactsManager";
import MedicalProfile from "@/components/profile/MedicalProfile";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header title="Profile" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your account and safety preferences</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full h-12 bg-card/50 backdrop-blur">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="emergency" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                Emergency Contacts
              </TabsTrigger>
              <TabsTrigger value="medical" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
                <Heart className="w-4 h-4 mr-2" />
                Medical Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-0">
              <UserProfile />
            </TabsContent>

            <TabsContent value="emergency" className="space-y-0">
              <EmergencyContactsManager />
            </TabsContent>

            <TabsContent value="medical" className="space-y-0">
              <MedicalProfile />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Profile;