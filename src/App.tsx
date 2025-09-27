import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Maps from "./pages/Maps";
import Emergency from "./pages/Emergency";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import QualityAssurancePage from "./pages/QualityAssurance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PWAProvider showInstallPrompt={true} autoInstallPromptDelay={15000}>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/trips" element={
                    <ProtectedRoute>
                      <Trips />
                    </ProtectedRoute>
                  } />
                  <Route path="/maps" element={
                    <ProtectedRoute>
                      <Maps />
                    </ProtectedRoute>
                  } />
                  <Route path="/emergency" element={
                    <ProtectedRoute>
                      <Emergency />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/qa" element={
                    <ProtectedRoute>
                      <QualityAssurancePage />
                    </ProtectedRoute>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </PWAProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
