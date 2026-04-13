import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import sheepLogo from '@/assets/sheep-logo.png';
import { toast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: 'Account created!', description: 'Check your email to verify.' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <img src={sheepLogo} alt="Sheep" className="w-28 h-28" />
          <h1 className="text-3xl font-bold text-foreground">Sheep</h1>
          <p className="text-muted-foreground text-sm text-center">
            Find your herd 🐑
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-2xl bg-card border-border px-4"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-2xl bg-card border-border px-4"
            required
            minLength={6}
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 rounded-2xl text-base font-semibold"
          >
            {loading ? '...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-muted-foreground"
        >
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span className="text-primary font-medium">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
