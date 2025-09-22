import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Map, Shield, MessageCircle, ArrowRight } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    if (!hasSeenOnboarding && !user) {
      navigate("/onboarding");
    }
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Loading size="lg" />
      </div>
    );
  }

  const features = [
    {
      icon: MessageCircle,
      title: "AI Travel Assistant",
      description: "Get personalized trip recommendations and instant travel answers",
    },
    {
      icon: Plane,
      title: "Book Everything",
      description: "Flights, trains, buses, and hotels all in one place",
    },
    {
      icon: Map,
      title: "Offline Maps",
      description: "Navigate anywhere without internet connection",
    },
    {
      icon: Shield,
      title: "Emergency Features",
      description: "SOS button and safety tools for peace of mind",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                JourneyXWave
              </h1>
              <p className="text-xs text-muted-foreground">AI Travel Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-gradient-to-r from-primary to-primary-glow">
                Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-primary-glow">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your AI-Powered{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Travel Companion
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plan, book, and navigate your journeys with intelligent assistance, offline capabilities, 
            and comprehensive safety features—all in one beautiful app.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 h-12 px-8"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/onboarding")}
                className="h-12 px-8"
              >
                Learn More
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const gradients = [
              "from-blue-500 to-purple-600",
              "from-purple-600 to-pink-600", 
              "from-orange-500 to-red-500",
              "from-green-500 to-emerald-600"
            ];
            
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-card/60 backdrop-blur">
                <CardHeader>
                  <div className={`w-12 h-12 bg-gradient-to-r ${gradients[index]} rounded-2xl flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center">
            <Card className="max-w-2xl mx-auto border-0 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Travel Experience?</h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands of travelers who trust JourneyXWave for smarter, safer, and more personalized journeys.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 h-12 px-8"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
