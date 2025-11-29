import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import CareerPage from "./pages/CareerPage";
import HealthPage from "./pages/HealthPage";
import FinancePage from "./pages/FinancePage";
import NutritionPage from "./pages/NutritionPage";
import LifestylePage from "./pages/LifestylePage";
import NeuraNotes from "./pages/NeuraNotes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="neura-desk-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/lifestyle" element={<LifestylePage />} />
            <Route path="/neuranotes" element={<NeuraNotes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
