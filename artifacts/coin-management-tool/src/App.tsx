import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import Screenshots from './pages/Screenshots';
import Admin from './pages/Admin';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      <Route path="/setup">
        <ProtectedRoute><Setup /></ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/timeline">
        <ProtectedRoute><Timeline /></ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute><Analytics /></ProtectedRoute>
      </Route>
      <Route path="/screenshots">
        <ProtectedRoute><Screenshots /></ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <AdminRoute><Admin /></AdminRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
          <SonnerToaster theme="dark" position="bottom-right" className="!bg-card !border-white/10 !text-foreground" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
