import { useAuthContext } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import SOSButton from "@/components/emergency/SOSButton";
import ChatInterface from "@/components/chat/ChatInterface";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import QuickActionCards from "@/components/home/QuickActionCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back! ✈️
            </h1>
            <p className="text-muted-foreground">
              Ready for your next adventure? Let's plan something amazing together.
            </p>
          </div>

          {/* Weather Widget */}
          <WeatherWidget />

          {/* Main Content Tabs */}
          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur">
              <TabsTrigger value="chat" className="font-medium">
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="actions" className="font-medium">
                Quick Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>Your AI Travel Assistant</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </CardTitle>
                  <CardDescription>
                    Ask me anything about travel planning, bookings, or destinations
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[500px]">
                    <ChatInterface />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>
                    Access your most-used travel tools instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuickActionCards />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>
                Your latest trips and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity yet.</p>
                <p className="text-sm mt-1">Start planning your first trip to see updates here!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SOSButton />
      <BottomNav />
    </div>
  );
};

export default Dashboard;