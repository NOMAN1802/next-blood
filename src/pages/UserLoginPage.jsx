import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import BloodFlowBackground from '@/components/BloodFlowBackground';
import PhoneAuthForm from '@/components/auth/PhoneAuthForm';
import FoundationLogo from '@/components/FoundationLogo';
import { Mail, Lock, Loader2 } from 'lucide-react';
const UserLoginPage = () => {
  const {
    signIn,
    signInWithGoogle,
    user,
    loading: authLoading
  } = useAuth();
  const {
    t
  } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }
  const handleEmailLogin = async e => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    setLoading(false);
    if (!error) navigate('/dashboard');
  };
  const handleGoogleLogin = async () => {
    const {
      error
    } = await signInWithGoogle();
    if (!error) {
      // Supabase handles the redirect for OAuth
    }
  };
  return <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      {/* Background */}
      <BloodFlowBackground />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10" />

      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.5
    }} className="w-full max-w-5xl grid md:grid-cols-2 bg-neutral-900/80 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-red-900/50 to-black relative">
            <div className="relative z-10">
                <FoundationLogo className="w-32 mb-8" />
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                    Welcome Back,<br />
                    <span className="text-red-500">Life Saver</span>.
                </h2>
                <p className="text-neutral-300 text-lg max-w-sm">
                    Access your dashboard to manage donations, view requests, and track your impact on the community.
                </p>
            </div>
            
            <div className="relative z-10 mt-12">
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-neutral-700 border-2 border-neutral-900" />)}
                    </div>
                    <p>Join 500+ donors today</p>
                </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Right Side: Auth Forms */}
        <div className="p-8 md:p-12 bg-neutral-950/50 backdrop-blur-md">
            <div className="md:hidden mb-8 text-center">
                 <FoundationLogo className="w-24 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-white">Sign In</h2>
            </div>

            <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-neutral-900">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone / OTP</TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email_label')}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Input id="email" type="email" placeholder="name@example.com" className="pl-10 bg-neutral-900 border-neutral-700" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('password_label')}</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-neutral-900 border-neutral-700" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-medium" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Sign In with Email"}
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value="phone">
                    <PhoneAuthForm onSuccess={() => navigate('/dashboard')} />
                </TabsContent>
            </Tabs>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-800" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-neutral-950 px-2 text-neutral-500">Or continue with</span></div>
            </div>

            <Button variant="outline" onClick={handleGoogleLogin} className="w-full border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
            </Button>

            <p className="mt-8 text-center text-sm text-neutral-500">
                Don't have an account?{' '}
                <button onClick={() => navigate('/register')} className="text-red-500 hover:underline font-medium">
                    Register Now
                </button>
            </p>
        </div>
      </motion.div>
    </div>;
};
export default UserLoginPage;