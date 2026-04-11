import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import BloodFlowBackground from '@/components/BloodFlowBackground';
import FoundationLogo from '@/components/FoundationLogo';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  if (!authLoading && user) {
     return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        // Toast is already handled in signIn context method
        return;
      }

      if (data?.user) {
        toast({
          title: "Welcome back! 👋",
          description: "Login successful.",
        });
        
        // Redirect logic - go to dashboard or previous attempted page
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error) {
       console.error("Unexpected login error:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-neutral-950 overflow-hidden">
      {/* Dynamic Background */}
      <BloodFlowBackground />
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[2px] z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-neutral-800 relative z-10"
      >
        <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-xs font-medium uppercase tracking-wider group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>
            <FoundationLogo className="h-6 w-auto" />
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10 mb-4 border border-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Member Login</h2>
          <p className="text-neutral-400 text-sm">Access the dashboard to manage content and donors</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-300 text-xs uppercase font-semibold tracking-wider">
              Email Address
            </Label>
            <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-600 h-11 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                  placeholder="name@example.com"
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password"  className="text-neutral-300 text-xs uppercase font-semibold tracking-wider">
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-600 h-11 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-sm uppercase tracking-wide transition-all duration-300 shadow-lg shadow-red-900/20 rounded-lg mt-2"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Signing In...
                </span>
            ) : "Sign In"}
          </Button>
          
          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
               Protected area. Unauthorized access is prohibited.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;