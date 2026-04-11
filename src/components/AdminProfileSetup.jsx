import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminProfileSetup = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || '');
  const [success, setSuccess] = useState(false);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
    try {
      // Use Edge Function to safely create the admin profile
      const { data, error } = await supabase.functions.invoke('create-admin-profile', {
        body: {
          user_id: user.id,
          role: user.role || 'admin',
          full_name: fullName,
          email: user.email
        }
      });

      if (error) throw error;
      
      if (!data.success) {
         throw new Error(data.error || 'Failed to create profile');
      }

      setSuccess(true);
      toast({
        title: "Profile Created",
        description: "Your admin profile has been successfully linked.",
      });

      // Refresh the auth context to pull in the new profile data
      await refreshProfile();
      
      // reload page after short delay to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('Profile creation error:', err);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: err.message || "Could not create admin profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md w-full bg-emerald-950/30 border-emerald-900/50">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Profile Created!</h2>
          <p className="text-emerald-400">Redirecting you to the dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full bg-neutral-900 border-red-900/50 shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
             <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-xl text-white">Complete Setup</CardTitle>
        </div>
        <p className="text-neutral-400 text-sm">
          Your account is authenticated but lacks a linked admin profile. Please complete your profile to access the dashboard.
        </p>
      </CardHeader>
      
      <form onSubmit={handleCreateProfile}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Full Name</label>
            <Input 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="bg-neutral-950 border-neutral-800 focus:border-red-500 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Email (Read-only)</label>
            <Input 
              value={user?.email || ''}
              disabled
              className="bg-neutral-950/50 border-neutral-800 text-neutral-500 cursor-not-allowed"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold"
            disabled={loading || !fullName.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Profile...
              </>
            ) : (
              "Create Admin Profile"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminProfileSetup;