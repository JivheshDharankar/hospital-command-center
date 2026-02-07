import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WalkthroughProvider } from "@/contexts/WalkthroughContext";
import { WalkthroughOverlay } from "@/components/walkthrough/WalkthroughOverlay";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AmbulanceCenter from "./pages/AmbulanceCenter";
import TransferCenter from "./pages/TransferCenter";
import AnalyticsPage from "./pages/AnalyticsPage";
import PatientTracking from "./pages/PatientTracking";
import PatientStatus from "./pages/PatientStatus";
import ResourcesPage from "./pages/ResourcesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        <AuthProvider>
          <WalkthroughProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <WalkthroughOverlay />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/ambulance" element={
                    <ProtectedRoute requireAdmin>
                      <AmbulanceCenter />
                    </ProtectedRoute>
                  } />
                  <Route path="/transfers" element={
                    <ProtectedRoute requireAdmin>
                      <TransferCenter />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/patients" element={
                    <ProtectedRoute>
                      <PatientTracking />
                    </ProtectedRoute>
                  } />
                  <Route path="/resources" element={
                    <ProtectedRoute requireAdmin>
                      <ResourcesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient-status/:journeyId" element={<PatientStatus />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WalkthroughProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;