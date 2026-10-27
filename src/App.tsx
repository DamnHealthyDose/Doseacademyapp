import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import AgeVerification from "./pages/AgeVerification.tsx";
import SignupAgeCheck from "./pages/SignupAgeCheck.tsx";
import ParentConsent from "./pages/ParentConsent.tsx";
import ParentDashboard from "./pages/ParentDashboard.tsx";
import SparkPage from "./pages/SparkPage.tsx";
import SparkComplete from "./pages/SparkComplete.tsx";
import BadgesPage from "./pages/BadgesPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import NameEditView from "./components/settings/NameEditView.tsx";
import { SettingsIndexRoute, SettingsCategoryRoute } from "./components/settings/SettingsRoutes.tsx";
import WaveSetup from "./pages/WaveSetup.tsx";
import WaveSession from "./pages/WaveSession.tsx";
import WaveBreak from "./pages/WaveBreak.tsx";
import WaveComplete from "./pages/WaveComplete.tsx";
import RsdEntry from "./pages/RsdEntry.tsx";
import RsdFlow from "./pages/RsdFlow.tsx";
import RsdBreathe from "./pages/RsdBreathe.tsx";
import RsdComplete from "./pages/RsdComplete.tsx";
import SquadHome from "./pages/SquadHome.tsx";
import SquadSetup from "./pages/SquadSetup.tsx";
import SquadSession from "./pages/SquadSession.tsx";
import SquadCheckin from "./pages/SquadCheckin.tsx";
import SquadComplete from "./pages/SquadComplete.tsx";
import SquadInvite from "./pages/SquadInvite.tsx";
import IgnitePage from "./pages/IgnitePage.tsx";
import TeacherDashboard from "./pages/TeacherDashboard.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";
import SlickChatWidget from "./components/SlickChatWidget.tsx";
import AppShell from "./components/AppShell.tsx";
import CookieConsent from "./components/CookieConsent.tsx";

const queryClient = new QueryClient();

// Drives all framer-motion animations from the resolved reduce-motion setting.
const MotionSettings = ({ children }: { children: ReactNode }) => {
  const { reduceMotion } = useSettings();
  // Mirrors the setting to a class so CSS animations/transitions can honor it too.
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);
  return <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>{children}</MotionConfig>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <MotionSettings>
              <AppProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route element={<AppShell />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/spark" element={<SparkPage />} />
                      <Route path="/spark/complete" element={<SparkComplete />} />
                      <Route path="/wave/setup" element={<WaveSetup />} />
                      <Route path="/wave/complete" element={<WaveComplete />} />
                      <Route path="/rsd" element={<RsdEntry />} />
                      <Route path="/rsd/complete" element={<RsdComplete />} />
                      <Route path="/squad" element={<SquadHome />} />
                      <Route path="/squad/setup" element={<SquadSetup />} />
                      <Route path="/squad/complete" element={<SquadComplete />} />
                      <Route path="/badges" element={<BadgesPage />} />
                      <Route path="/ignite" element={<IgnitePage />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                    </Route>
                    {/* Full-page settings view: outside AppShell (no main sidebar). */}
                    <Route path="/settings" element={<SettingsPage />}>
                      <Route index element={<SettingsIndexRoute />} />
                      <Route path="account/name" element={<NameEditView />} />
                      <Route path=":category" element={<SettingsCategoryRoute />} />
                    </Route>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/age-verify" element={<AgeVerification />} />
                    <Route path="/signup-age-check" element={<SignupAgeCheck />} />
                    <Route path="/parent-consent/:token" element={<ParentConsent />} />
                    <Route path="/parent-dashboard/:token" element={<ParentDashboard />} />
                    <Route path="/wave/session" element={<WaveSession />} />
                    <Route path="/wave/break" element={<WaveBreak />} />
                    <Route path="/rsd/flow" element={<RsdFlow />} />
                    <Route path="/rsd/breathe" element={<RsdBreathe />} />
                    <Route path="/squad/session" element={<SquadSession />} />
                    <Route path="/squad/checkin" element={<SquadCheckin />} />
                    <Route path="/squad/invite/:code" element={<SquadInvite />} />
                    <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <SlickChatWidget />
                  <CookieConsent />
                </BrowserRouter>
              </AppProvider>
            </MotionSettings>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
