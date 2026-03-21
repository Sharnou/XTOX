import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useUpdatePresence } from '@/hooks/useOnlineStatus';

// Page imports
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Electronics from './pages/Electronics';
import RealEstate from './pages/RealEstate';
import Sell from './pages/Sell';
import Search from './pages/Search';
import AdDetail from './pages/AdDetail';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import ContactAdmin from './pages/ContactAdmin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  useUpdatePresence();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="text-3xl font-black text-primary">
            <span className="text-secondary">▲</span> XTOX
          </div>
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Vehicles" element={<Vehicles />} />
      <Route path="/Electronics" element={<Electronics />} />
      <Route path="/RealEstate" element={<RealEstate />} />
      <Route path="/Sell" element={<Sell />} />
      <Route path="/Search" element={<Search />} />
      <Route path="/Ad/:id" element={<AdDetail />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Admin" element={<Admin />} />
      <Route path="/Favorites" element={<Favorites />} />
      <Route path="/Messages" element={<Messages />} />
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/TermsOfService" element={<TermsOfService />} />
      <Route path="/CookiePolicy" element={<CookiePolicy />} />
      <Route path="/ContactAdmin" element={<ContactAdmin />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router basename={import.meta.env.BASE_URL}>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;
