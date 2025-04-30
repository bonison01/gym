
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Index />
        </TooltipProvider>
      </AppProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
