import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Plane, 
  MapPin, 
  Shield, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react";

const onboardingSteps = [
  {
    icon: MessageCircle,
    title: "AI Travel Assistant",
    description: "Plan your perfect trip with our intelligent AI that understands your preferences and creates personalized itineraries.",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: Plane,
    title: "Book Everything in One Place",
    description: "Search and book flights, trains, buses, and hotels all from one convenient platform with real-time price comparisons.",
    gradient: "from-purple-600 to-pink-600"
  },
  {
    icon: MapPin,
    title: "Offline Maps & Navigation",
    description: "Download maps for any destination and navigate even without internet connection. Never get lost again.",
    gradient: "from-pink-600 to-orange-500"
  },
  {
    icon: Shield,
    title: "Safety & Emergency Features",
    description: "One-tap SOS button, nearest hospital locator, and automatic location sharing for your peace of mind.",
    gradient: "from-orange-500 to-red-500"
  }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/auth");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            JourneyXWave
          </span>
        </div>
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      {/* Progress */}
      <div className="px-6 mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/80 backdrop-blur">
          <CardContent className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className={`mx-auto w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed">
              {step.description}
            </p>

            {/* Features highlight for first step */}
            {currentStep === 0 && (
              <div className="flex items-center justify-center space-x-1 text-sm text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Powered by advanced AI</span>
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
          >
            <span>{currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;