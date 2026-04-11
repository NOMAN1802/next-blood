import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        // Toast is already handled in signIn
        return;
      }

      if (data?.user) {
        // Fetch user role to determine redirection
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role;

        toast({
          title: "Access Granted 🔓",
          description: `Welcome back.`,
        });

        if (role === 'super_admin' || role === 'admin') {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
      }
    } catch (error) {
       console.error("Unexpected login error:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-neutral-800 relative z-10"
      >
        <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-xs font-medium uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
            <div className="flex items-center gap-2">
                <img 
                   src="https://horizons-cdn.hostinger.com/69fc4f7a-00ec-4d23-98f7-c4a90744a2cc/4d4ad041005e283ac95de579b39c14c3.jpg" 
                   alt="Innovix Next Blood" 
                   className="h-8 w-auto object-contain" 
                />
            </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-700 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-neutral-400 text-sm">Secure access for Innovix Next Blood administrators</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-300 text-xs uppercase font-semibold tracking-wider">
              Email Address
            </Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-white/20 h-11 focus:border-red-500/50 focus:ring-red-500/20"
                  placeholder="admin@example.com"
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-300 text-xs uppercase font-semibold tracking-wider">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-white/20 h-11 focus:border-red-500/50 focus:ring-red-500/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-6 text-sm uppercase tracking-wide transition-all duration-300 shadow-lg shadow-red-900/20"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Authenticating...
                </span>
            ) : "Login to Dashboard"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;