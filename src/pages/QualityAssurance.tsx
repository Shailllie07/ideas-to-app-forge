import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import QualityAssurance from "@/components/testing/QualityAssurance";
import { TestTube } from "lucide-react";

const QualityAssurancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-20">
      <Header title="Quality Assurance" />
      
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TestTube className="w-6 h-6 text-secondary" />
              Quality Assurance
            </h1>
            <p className="text-muted-foreground">
              Comprehensive testing, performance analysis, and deployment readiness
            </p>
          </div>

          <QualityAssurance />
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default QualityAssurancePage;