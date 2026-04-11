import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Activity, AlertCircle, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AdminProfileSetup from '@/components/AdminProfileSetup';

const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden h-full flex flex-col justify-between hover:border-neutral-700 transition-colors"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10 w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 ${color.replace('text-', 'text-')}`}>
          <Icon size={22} className={color.split(' ')[0]} />
        </div>
        <span className="text-neutral-400 text-sm font-medium">{title}</span>
      </div>
      
      <div className="flex items-end gap-3 mb-1">
        <h3 className="text-4xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 mt-2">
           <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            <ArrowUpRight size={12} className="mr-1" /> {trend}
          </span>
        </div>
      )}
      {subtitle && (
          <p className="text-xs text-neutral-500 mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    donors: 0,
    requests: 0,
    users: 0,
    pendingRequests: 0,
    recentDonors: 0,
    recentRequests: 0,
    recentUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [donors, requests, users, logs] = await Promise.all([
          db.donors.getAll(),
          db.requests.getAll(),
          db.users.getAll(),
          db.history.getAll()
        ]);

        // Mock trend calculation
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentDonorsCount = donors?.filter(d => new Date(d.created_at) > oneWeekAgo).length || 0;
        const recentRequestsCount = requests?.filter(r => new Date(r.created_at) > oneWeekAgo).length || 0;
        const recentUsersCount = users?.filter(u => new Date(u.created_at) > oneWeekAgo).length || 0;

        setStats({
          donors: donors?.length || 0,
          requests: requests?.length || 0,
          users: users?.length || 0,
          pendingRequests: requests?.filter(r => r.status === 'pending')?.length || 0,
          recentDonors: recentDonorsCount,
          recentRequests: recentRequestsCount,
          recentUsers: recentUsersCount
        });

        setRecentActivity(logs?.slice(0, 5) || []);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h2>
        <p className="text-neutral-400">Welcome to the administration control center.</p>
      </div>
      
      {/* Missing Profile Action Area */}
      {user?.isProfileMissing && (
        <div className="mb-8 flex justify-center">
           <AdminProfileSetup />
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Donors" 
          value={loading ? '-' : stats.donors} 
          icon={Heart} 
          trend={stats.recentDonors > 0 ? `+${stats.recentDonors} this week` : null}
          color="text-red-500" 
        />
        <StatCard 
          title="Blood Requests" 
          value={loading ? '-' : stats.requests} 
          icon={Activity} 
          trend={stats.recentRequests > 0 ? `+${stats.recentRequests} new` : null}
          color="text-blue-500" 
        />
        <StatCard 
          title="Active Users" 
          value={loading ? '-' : stats.users} 
          icon={Users} 
          trend={stats.recentUsers > 0 ? `+${stats.recentUsers} joined` : null}
          color="text-purple-500" 
        />
        <StatCard 
          title="Pending Actions" 
          value={loading ? '-' : stats.pendingRequests} 
          icon={AlertCircle} 
          subtitle="Requires immediate attention"
          color="text-yellow-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-full">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-neutral-400" /> Recent System Activity
          </h3>
          <div className="space-y-0 relative">
             {/* Timeline Line */}
             <div className="absolute left-[19px] top-2 bottom-4 w-px bg-neutral-800 z-0" />
             
            {loading ? (
                <div className="p-4 text-center text-neutral-500">Loading activity...</div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((log, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0 relative z-10 group">
                  <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-neutral-700 transition-colors">
                     <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-white font-medium mb-0.5">
                       <span className="text-blue-400">{log.user_name || log.userName || 'System User'}</span> {log.action?.replace(/_/g, ' ') || 'performed an action'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                       <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                       <span>•</span>
                       <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                       {log.location && <span>• {log.location}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-sm italic pl-4">No recent activity logs found.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="flex flex-col gap-6">
           <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
               <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                     onClick={() => navigate('/dashboard/users')}
                     className="p-5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 rounded-xl text-left transition-all group"
                  >
                     <Users className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                     <div className="font-bold text-white mb-1">Manage Users</div>
                     <div className="text-xs text-neutral-500">Add or remove system access</div>
                  </button>
                  
                  <button 
                     onClick={() => navigate('/dashboard/donors')}
                     className="p-5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 rounded-xl text-left transition-all group"
                  >
                     <Heart className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                     <div className="font-bold text-white mb-1">Review Donors</div>
                     <div className="text-xs text-neutral-500">Verify new donor registrations</div>
                  </button>
                  
                  <button 
                     onClick={() => navigate('/dashboard/requests')}
                     className="p-5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 rounded-xl text-left transition-all group"
                  >
                     <Activity className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                     <div className="font-bold text-white mb-1">Blood Requests</div>
                     <div className="text-xs text-neutral-500">Process urgent needs</div>
                  </button>
                  
                  <button 
                     onClick={() => navigate('/dashboard/system-health')}
                     className="p-5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 rounded-xl text-left transition-all group"
                  >
                     <ShieldCheck className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                     <div className="font-bold text-white mb-1">System Health</div>
                     <div className="text-xs text-neutral-500">Check service status</div>
                  </button>
               </div>
           </div>
           
           {/* System Status Mini Card */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-bold text-white">System Status</h4>
                     <p className="text-xs text-neutral-500">Last check: Just now</p>
                  </div>
              </div>
              <div className="text-right">
                 <div className="text-xl font-bold text-green-500">Operational</div>
                 <div className="text-xs text-neutral-500">Database & API Online</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;