import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Reflection from "./pages/Reflection";
import AdminDashboard from "./pages/AdminDashboard";
import UsageDashboard from "./pages/UsageDashboard";
import UserDetail from "./pages/UserDetail";
import ApexChat from "./pages/ApexChat";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import PurchaseTerms from "./pages/PurchaseTerms";
import Login from "./pages/Login";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/chat/:roleSlug?" component={Chat} />
      <Route path="/conversation/:id" component={Chat} />
      <Route path="/history" component={History} />
      {/* <Route path="/reflection" component={Reflection} /> — hidden for now */}
      <Route path="/apex" component={ApexChat} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/usage" component={UsageDashboard} />
      <Route path="/admin/user/:userId" component={UserDetail} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/support" component={Support} />
      <Route path="/purchase-terms" component={PurchaseTerms} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'oklch(0.12 0.04 260)',
                border: '1px solid oklch(0.25 0.04 260)',
                color: 'oklch(0.95 0.02 90)',
              },
            }}
          />
          <Router />
          <PWAInstallPrompt />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
