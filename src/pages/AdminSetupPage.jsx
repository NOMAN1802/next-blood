import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Lock, User, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const AdminSetupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { createSuperAdmin, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createSuperAdmin(formData.name, formData.email, formData.password);
      // Success is handled in createSuperAdmin (toast + login)
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error.message || "Could not create Super Admin.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Side - Info */}
        <div className="bg-red-950/30 p-8 md:w-5/12 border-r border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Secure Setup</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              You are currently using a temporary demo account. To secure this installation, please create your personal Super Admin account.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-neutral-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Full System Access</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Demo Account Removal</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Secure Password Hashing</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:w-7/12 bg-neutral-900">
           <div className="mb-6">
             <h3 className="text-lg font-semibold text-white">Create Administrator</h3>
             <p className="text-neutral-500 text-xs mt-1">This account will have permanent Super Admin privileges.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-1.5">
               <Label htmlFor="name">Full Name</Label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                 <Input 
                   id="name" 
                   required
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="pl-9 bg-neutral-800 border-neutral-700" 
                   placeholder="John Doe" 
                 />
               </div>
             </div>

             <div className="space-y-1.5">
               <Label htmlFor="email">Email Address</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                 <Input 
                   id="email" 
                   type="email"
                   required
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="pl-9 bg-neutral-800 border-neutral-700" 
                   placeholder="admin@lifeflow.com" 
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label htmlFor="pass">Password</Label>
                 <Input 
                   id="pass" 
                   type="password"
                   required
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   className="bg-neutral-800 border-neutral-700" 
                   placeholder="••••••••" 
                 />
               </div>
               <div className="space-y-1.5">
                 <Label htmlFor="conf-pass">Confirm</Label>
                 <Input 
                   id="conf-pass" 
                   type="password"
                   required
                   value={formData.confirmPassword}
                   onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                   className="bg-neutral-800 border-neutral-700" 
                   placeholder="••••••••" 
                 />
               </div>
             </div>

             <div className="pt-4 flex gap-3">
               <Button 
                 type="button" 
                 variant="ghost" 
                 onClick={() => { logout(); navigate('/admin/login'); }}
                 className="flex-1 text-neutral-500 hover:text-white"
               >
                 Cancel
               </Button>
               <Button 
                 type="submit" 
                 disabled={loading}
                 className="flex-1 bg-white text-black hover:bg-neutral-200"
               >
                 {loading ? 'Creating...' : 'Complete Setup'}
               </Button>
             </div>
           </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetupPage;