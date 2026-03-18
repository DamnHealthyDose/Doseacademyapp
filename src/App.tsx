import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index.tsx";
import SparkPage from "./pages/SparkPage.tsx";
import SparkComplete from "./pages/SparkComplete.tsx";
import BadgesPage from "./pages/BadgesPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import SlickChatWidget from "./components/SlickChatWidget.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/spark" element={<SparkPage />} />
            <Route path="/spark/complete" element={<SparkComplete />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <SlickChatWidget />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
