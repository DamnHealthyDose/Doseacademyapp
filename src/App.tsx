import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";
import SlickChatWidget from "./components/SlickChatWidget.tsx";
import CookieConsent from "./components/CookieConsent.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/age-verify" element={<AgeVerification />} />
                <Route path="/signup-age-check" element={<SignupAgeCheck />} />
                <Route path="/parent-consent/:token" element={<ParentConsent />} />
                <Route path="/parent-dashboard/:token" element={<ParentDashboard />} />
              <Route path="/spark" element={<SparkPage />} />
              <Route path="/spark/complete" element={<SparkComplete />} />
              <Route path="/wave/setup" element={<WaveSetup />} />
              <Route path="/wave/session" element={<WaveSession />} />
              <Route path="/wave/break" element={<WaveBreak />} />
              <Route path="/wave/complete" element={<WaveComplete />} />
              <Route path="/rsd" element={<RsdEntry />} />
              <Route path="/rsd/flow" element={<RsdFlow />} />
              <Route path="/rsd/breathe" element={<RsdBreathe />} />
              <Route path="/rsd/complete" element={<RsdComplete />} />
              <Route path="/squad" element={<SquadHome />} />
              <Route path="/squad/setup" element={<SquadSetup />} />
              <Route path="/squad/session" element={<SquadSession />} />
              <Route path="/squad/checkin" element={<SquadCheckin />} />
              <Route path="/squad/complete" element={<SquadComplete />} />
              <Route path="/squad/invite/:code" element={<SquadInvite />} />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              <SlickChatWidget />
              <CookieConsent />
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
