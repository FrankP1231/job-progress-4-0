
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import Layout from "./components/layout/Layout";
import LoginPage from "./components/auth/LoginPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./components/dashboard/DashboardPage";
import ProjectsPage from "./components/projects/ProjectsPage";
import JobForm from "./components/jobs/JobForm";
import JobDetail from "./components/jobs/JobDetail";
import PhaseForm from "./components/jobs/PhaseForm";
import PhaseDetail from "./components/jobs/PhaseDetail";
import { initSampleData } from "./lib/supabaseUtils";

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Initialize sample data for development purposes
  useEffect(() => {
    initSampleData().catch(error => {
      console.error('Failed to initialize sample data:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/jobs" element={<DashboardPage />} />
                <Route path="/jobs/new" element={<JobForm />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/jobs/:jobId/phases/new" element={<PhaseForm />} />
                <Route path="/jobs/:jobId/phases/:phaseId" element={<PhaseDetail />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
