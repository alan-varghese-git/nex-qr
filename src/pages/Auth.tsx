import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto mt-12 bg-card p-8 rounded-2xl shadow-sm border">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
        <p className="text-muted-foreground mt-2">Manage your dynamic QR codes and analytics.</p>
      </div>

      <div className="flex justify-center mb-6">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            setLoading(true);
            setError('');
            try {
              if (!credentialResponse.credential) throw new Error("No credential received from Google.");
              
              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: credentialResponse.credential,
              });
              
              if (error) throw error;
              navigate('/dashboard');
            } catch (err: any) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            setError('Google Sign-In Failed');
          }}
          useOneTap
          theme="filled_black"
          size="large"
          shape="rectangular"
          text="continue_with"
        />
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t w-full"></div>
        <span className="bg-card px-3 text-sm text-muted-foreground absolute">or</span>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background"
              placeholder="hello@example.com"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </span>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 font-medium text-primary hover:underline"
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
