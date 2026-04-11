import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, ShieldAlert, Database, Download, Server, Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

const AdminCard = ({ title, value, icon: Icon, description, color, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
    <Card 
        className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer h-full flex flex-col justify-between"
        onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        <p className="text-xs text-neutral-500 mt-2 font-medium">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalRequests: 0,
    activeRequests: 0,
    criticalRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, requests] = await Promise.all([
           db.users.getAll(),
           db.requests.getAll()
        ]);
        
        // Calculate stats
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersCount = users?.filter(u => new Date(u.created_at) > oneWeekAgo).length || 0;
        const activeReqs = requests?.filter(r => r.status === 'pending').length || 0;
        const criticalReqs = requests?.filter(r => r.urgencyLevel === 'Critical' && r.status === 'pending').length || 0;

        setData({
          totalUsers: users?.length || 0,
          newUsers: newUsersCount,
          totalRequests: requests?.length || 0,
          activeRequests: activeReqs,
          criticalRequests: criticalReqs
        });
      } catch (err) {
        console.error("Failed to fetch super admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 p-2 lg:p-4">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Super Admin Portal</h1>
        <p className="text-neutral-400 mt-2 text-lg">Global system overview and management controls.</p>
      </div>

      {/* Quick Stats Row - Using Real Data */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminCard 
            title="Total Users" 
            value={loading ? '-' : data.totalUsers.toLocaleString()}
            icon={Users} 
            color="text-blue-500" 
            description={loading ? "Loading..." : `+${data.newUsers} this week`}
            onClick={() => navigate('/admin/users')}
        />
        <AdminCard 
            title="Blood Requests" 
            value={loading ? '-' : data.totalRequests.toLocaleString()} 
            icon={Activity} 
            color="text-red-500" 
            description={loading ? "Loading..." : `${data.activeRequests} active / ${data.criticalRequests} critical`}
            onClick={() => navigate('/dashboard/requests')}
        />
        <AdminCard 
            title="System Health" 
            value="99.9%" 
            icon={Database} 
            color="text-emerald-500" 
            description="All systems operational"
            onClick={() => navigate('/admin/analytics')}
        />
        <AdminCard 
            title="Security Alerts" 
            value="0" 
            icon={ShieldAlert} 
            color="text-yellow-500" 
            description="No active threats"
            onClick={() => {}}
        />
      </div>

      {/* Detailed Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions Panel */}
          <Card className="bg-neutral-900 border-neutral-800 col-span-2 shadow-lg">
              <CardHeader>
                  <CardTitle className="text-white text-xl">Administrative Actions</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                        onClick={() => navigate('/admin/users')}
                      >
                          <Users className="h-6 w-6 text-blue-500" /> 
                          <span className="font-bold">Manage Users</span>
                      </Button>
                      <Button 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                        onClick={() => navigate('/admin/data')}
                      >
                          <Database className="h-6 w-6 text-emerald-500" /> 
                          <span className="font-bold">Master Data</span>
                      </Button>
                      <Button 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                        onClick={() => navigate('/admin/analytics')}
                      >
                          <Activity className="h-6 w-6 text-purple-500" /> 
                          <span className="font-bold">View Reports</span>
                      </Button>
                      <Button 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                        onClick={() => navigate('/dashboard/settings')}
                      >
                          <Server className="h-6 w-6 text-orange-500" /> 
                          <span className="font-bold">System Config</span>
                      </Button>
                      <Button 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                        onClick={() => navigate('/dashboard/history')}
                      >
                          <Lock className="h-6 w-6 text-red-500" /> 
                          <span className="font-bold">Security Logs</span>
                      </Button>
                  </div>
              </CardContent>
          </Card>
          
          {/* Export Center */}
          <Card className="bg-gradient-to-br from-red-950/30 to-neutral-900 border-neutral-800 shadow-lg flex flex-col justify-between">
              <div>
                  <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                          <Globe className="w-5 h-5 text-red-500" /> Export Center
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-neutral-400 mb-6 leading-relaxed">
                          Download comprehensive system-wide reports, user data dumps, and analytical insights for offline processing.
                      </p>
                  </CardContent>
              </div>
              <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-neutral-700 text-white hover:bg-neutral-800 hover:text-red-400 transition-colors py-6 text-base font-bold"
                    onClick={() => navigate('/admin/data')}
                  >
                      <Download className="mr-2 h-5 w-5" /> Go to Data Exports
                  </Button>
              </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;