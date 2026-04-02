import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeView from "@/views/HomeView";
import WorkoutsView from "@/views/WorkoutsView";
import NutritionView from "@/views/NutritionView";
import PremiumAIView from "@/views/PremiumAIView";
import ProfileView from "@/views/ProfileView";
import OnboardingWizard from "@/components/OnboardingWizard";
import { UserProvider, useUser } from "@/contexts/UserContext";

type Tab = "home" | "workouts" | "nutrition" | "premium" | "profile";

const AppContent = () => {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [hideNav, setHideNav] = useState(false);

  if (!profile.onboarded) {
    return <OnboardingWizard />;
  }

  const renderView = () => {
    switch (activeTab) {
      case "workouts":
        return <WorkoutsView onPlayingChange={setHideNav} />;
      case "home":
        return <HomeView />;
      case "nutrition":
        return <NutritionView onCameraChange={setHideNav} />;
      case "premium":
        return <PremiumAIView />;
      case "profile":
        return <ProfileView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderView()}
      {!hideNav && <BottomNav active={activeTab} onChange={setActiveTab} />}
    </div>
  );
};

const Index = () => (
  <UserProvider>
    <AppContent />
  </UserProvider>
);

export default Index;
