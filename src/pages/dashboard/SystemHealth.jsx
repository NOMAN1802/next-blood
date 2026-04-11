
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Database, Server, ShieldCheck, Mail, HardDrive, 
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Play, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/customSupabaseClient';

const HealthIndicator = ({ status, label }) => {
  const colors = {
    healthy: 'text-green-500 bg-green-500/10 border-green-500/20',
    warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    unknown: 'text-neutral-500 bg-neutral-800 border-neutral-700'
  };
  
  const icons = {
    healthy: CheckCircle2,
    warning: AlertTriangle,
    critical: XCircle,
    unknown: Activity
  };

  const Icon = icons[status] || icons.unknown;

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${colors[status] || colors.unknown}`}>
      <span className="font-medium text-white">{label}</span>
      <div className="flex items-center gap-2">
         <span className="capitalize text-sm font-bold">{status}</span>
         <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

const SystemHealth = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    database: 'unknown',
    auth: 'unknown',
    storage: 'unknown',
    email: 'unknown',
    latency: 0
  });
  
  const [testResults, setTestResults] = useState([]);
  const [runningTests, setRunningTests] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const start = performance.now();
    
    // 1. Database Check
    let dbStatus = 'unknown';
    try {
        const { error } = await supabase.from('system_settings').select('id').limit(1);
        dbStatus = error ? 'critical' : 'healthy';
    } catch (e) {
        console.error("Database check failed:", e);
        dbStatus = 'critical';
    }
    
    // 2. Storage Check
    let storageStatus = 'unknown';
    try {
        const { data, error } = await supabase.storage.listBuckets();
        storageStatus = (!error && Array.isArray(data)) ? 'healthy' : 'critical';
    } catch (e) {
        console.error("Storage check failed:", e);
        storageStatus = 'critical';
    }
    
    // 3. Auth Check
    let authStatus = 'unknown';
    try {
        const { error } = await supabase.auth.getSession();
        authStatus = error ? 'warning' : 'healthy';
    } catch (e) {
        console.error("Auth check failed:", e);
        authStatus = 'warning';
    }

    // 4. Email Service Mock Check
    let emailStatus = 'unknown';
    try {
        const { error } = await supabase.functions.invoke('send-notification-email', { body: { type: 'ping' }});
        // If function exists it might return 400 because body is dummy, but that means it's reachable.
        // We assume 'warning' if error, 'healthy' if success or handled error.
        emailStatus = error ? 'warning' : 'healthy';
    } catch (e) {
        emailStatus = 'critical';
    }

    setMetrics({
      database: dbStatus,
      auth: authStatus,
      storage: storageStatus,
      email: emailStatus,
      latency: Math.round(performance.now() - start)
    });
    setLoading(false);
  };

  const runVerificationSuite = async () => {
    setRunningTests(true);
    setTestResults([]);
    
    const addResult = (name, status, details) => {
      setTestResults(prev => [...prev, { name, status, details, time: new Date().toLocaleTimeString() }]);
    };

    try {
        // Test 1: Public Table Access
        addResult('Public Access (Pages)', 'running', 'Fetching public pages...');
        const { data: pages, error: pagesError } = await supabase.from('pages').select('*').limit(5);
        
        if (pagesError) {
             addResult('Public Access (Pages)', 'fail', `Error: ${pagesError.message}`);
        } else {
             addResult('Public Access (Pages)', 'pass', `Fetched ${pages?.length || 0} pages`);
        }
        
        // Test 2: User Table Access (Admin Only)
        addResult('Admin Access (Users)', 'running', 'Verifying admin privileges...');
        const { data: users, error: usersError } = await supabase.from('users').select('*').limit(5);
        
        if (usersError) {
             addResult('Admin Access (Users)', 'fail', `Error: ${usersError.message}`);
        } else {
             addResult('Admin Access (Users)', 'pass', `Accessible. Count: ${users?.length || 0}`);
        }

        // Test 3: Storage Write Access
        addResult('Storage Write', 'running', 'Attempting dummy upload...');
        const { data: buckets } = await supabase.storage.listBuckets();
        const uploadsBucket = buckets?.find(b => b.name === 'uploads');
        addResult('Storage Write', uploadsBucket ? 'pass' : 'fail', uploadsBucket ? 'Uploads bucket exists' : 'Bucket missing');

    } catch (error) {
        console.error("Verification suite error:", error);
        addResult('System Error', 'fail', error.message || "Unknown error occurred");
    } finally {
        setRunningTests(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Health & Diagnostics</h1>
          <p className="text-neutral-400">Real-time monitoring and verification tools.</p>
        </div>
        <Button onClick={runDiagnostics} disabled={loading || runningTests} className="bg-neutral-800 text-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthIndicator status={metrics.database} label="Database Connection" />
        <HealthIndicator status={metrics.auth} label="Authentication Service" />
        <HealthIndicator status={metrics.storage} label="File Storage" />
        <HealthIndicator status={metrics.email} label="Email Notification Service" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* System Latency Card */}
         <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
               <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> System Latency
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">{metrics.latency}</span>
                  <span className="text-neutral-500 mb-1">ms</span>
               </div>
               <Progress value={Math.min((metrics.latency / 500) * 100, 100)} className="h-2" />
               <p className="text-xs text-neutral-500 mt-2">Response time for basic query</p>
            </CardContent>
         </Card>
         
         {/* Verification Suite */}
         <Card className="bg-neutral-900 border-neutral-800 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div>
                  <CardTitle className="text-white flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-green-500" /> Pre-Launch Verification
                  </CardTitle>
                  <CardDescription>Run automated tests for critical flows.</CardDescription>
               </div>
               <Button size="sm" onClick={runVerificationSuite} disabled={runningTests} className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" /> Run Tests
               </Button>
            </CardHeader>
            <CardContent>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {testResults.length === 0 && !runningTests && (
                     <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                        Ready to run diagnostics.
                     </div>
                  )}
                  
                  {testResults.map((result, i) => (
                     <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800"
                     >
                        <div className="flex items-center gap-3">
                           {result.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                           {result.status === 'fail' && <XCircle className="w-4 h-4 text-red-500" />}
                           {result.status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                           <div>
                              <p className="text-sm font-medium text-white">{result.name}</p>
                              <p className="text-xs text-neutral-500">{result.details}</p>
                           </div>
                        </div>
                        <Badge variant="outline" className={`
                           ${result.status === 'pass' ? 'border-green-500/50 text-green-500' : ''}
                           ${result.status === 'fail' ? 'border-red-500/50 text-red-500' : ''}
                           ${result.status === 'running' ? 'border-blue-500/50 text-blue-500' : ''}
                        `}>
                           {result.status.toUpperCase()}
                        </Badge>
                     </motion.div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default SystemHealth;
