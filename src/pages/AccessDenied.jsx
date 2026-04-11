import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
      <p className="text-neutral-400 max-w-md mb-8">
        You do not have the necessary permissions to view this page. If you believe this is an error, please contact your system administrator.
      </p>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="border-neutral-800 text-white hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Button 
          onClick={() => navigate('/')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;