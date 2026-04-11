import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const PhoneAuthForm = ({ onSuccess }) => {
  const { signInWithPhone, verifyPhoneOtp } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithPhone(phone);
    setLoading(false);
    if (!error) setStep('otp');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await verifyPhoneOtp(phone, otp);
    setLoading(false);
    if (!error && data.session) {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone_number')}</Label>
            <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <Input 
                    id="phone"
                    type="tel" 
                    placeholder="+8801XXXXXXXXX" 
                    className="pl-10 bg-neutral-900 border-neutral-700"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
            </div>
            <p className="text-xs text-neutral-500">Include country code (e.g. +880)</p>
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Send One-Time Password
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-10 duration-300">
           <div className="text-center mb-4">
             <div className="w-12 h-12 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
             </div>
             <p className="text-sm text-neutral-300">Code sent to {phone}</p>
             <button 
                type="button" 
                onClick={() => setStep('phone')}
                className="text-xs text-red-400 hover:underline mt-1"
             >
                Change Number
             </button>
           </div>
           
           <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP Code</Label>
            <Input 
                id="otp"
                type="text" 
                placeholder="123456" 
                className="bg-neutral-900 border-neutral-700 text-center text-2xl tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
            />
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Verify & Sign In
          </Button>
        </form>
      )}
    </div>
  );
};

export default PhoneAuthForm;