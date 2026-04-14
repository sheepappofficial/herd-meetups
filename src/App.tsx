import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import SwipePage from './pages/SwipePage';
import MatchesPage from './pages/MatchesPage';
import CafePage from './pages/CafePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import BottomNav from './components/BottomNav';

const queryClient = new QueryClient();

const AuthGate = () => {
  const { user, profile, loading, setUser, setLoading, fetchProfile } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchProfile(u.id);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-2xl">🐑</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;
  if (!profile?.onboarding_completed) return <OnboardingPage />;

  const location = useLocation();
  const showNav = ['/', '/matches', '/chats', '/profile'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<SwipePage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chats" element={<CafePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cafes" element={<CafePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AuthGate />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
