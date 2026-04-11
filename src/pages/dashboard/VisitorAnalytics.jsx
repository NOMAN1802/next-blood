
import React, { useEffect, useState } from 'react';
import { 
  Users, Calendar, Clock, RotateCw, Globe, Smartphone, Monitor, AlertCircle, BarChart3, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getVisitorStatsByPeriod, getRecentVisits } from '@/hooks/useAnalyticsData';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const VisitorAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState('daily');
  const [stats, setStats] = useState({ 
    total_visits: 0, 
    unique_visitors: 0, 
    avg_visits_per_visitor: 0 
  });
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const periods = [
    { id: 'daily', label: 'Daily (Today)' },
    { id: 'weekly', label: 'Weekly (7d)' },
    { id: 'monthly', label: 'Monthly (30d)' },
    { id: 'yearly', label: 'Yearly (365d)' }
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, visitsData] = await Promise.all([
        getVisitorStatsByPeriod(timePeriod),
        getRecentVisits(50, timePeriod)
      ]);
      setStats(statsData);
      setRecentVisits(visitsData || []);
    } catch (err) {
      console.error("Dashboard analytics error:", err);
      setError("Failed to load visitor data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timePeriod]);

  const getDeviceIcon = (type) => {
    if (type === 'mobile') return <Smartphone className="w-4 h-4 text-blue-400" />;
    return <Monitor className="w-4 h-4 text-purple-400" />;
  };

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="bg-neutral-900 border-neutral-800 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-20 bg-neutral-800" />
              <Skeleton className="h-3 w-32 bg-neutral-800" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-white">{value}</div>
              <p className="text-xs text-neutral-500 mt-1">{subtext}</p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-red-500" /> Visitor Analytics
          </h2>
          <p className="text-neutral-400 text-sm">Traffic insights and real-time visitor tracking.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setTimePeriod(period.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  timePeriod === period.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={loadData} 
            variant="outline" 
            size="icon"
            className="border-neutral-800 bg-neutral-900 hover:bg-neutral-800 ml-2"
            title="Refresh Data"
          >
             <RotateCw className={`w-4 h-4 text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <Button onClick={loadData} variant="outline" className="border-red-500/20 hover:bg-red-500/10 text-red-400">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Visits" 
              value={stats.total_visits} 
              subtext={`Page views in selected period`}
              icon={BarChart3}
              colorClass="text-blue-500"
              delay={0}
            />
            <StatCard 
              title="Unique Visitors" 
              value={stats.unique_visitors} 
              subtext="Distinct users detected"
              icon={Users}
              colorClass="text-green-500"
              delay={0.1}
            />
            <StatCard 
              title="Avg. Visits / User" 
              value={stats.avg_visits_per_visitor} 
              subtext="Engagement frequency"
              icon={RotateCw}
              colorClass="text-orange-500"
              delay={0.2}
            />
          </div>

          {/* Recent Visits Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
              <CardHeader className="border-b border-neutral-800/50 pb-4">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                       <Clock className="w-4 h-4 text-neutral-400" /> 
                       Recent Activity
                     </CardTitle>
                     <CardDescription className="text-neutral-500">
                       Latest visits for {periods.find(p => p.id === timePeriod)?.label}
                     </CardDescription>
                   </div>
                   <div className="text-xs text-neutral-500 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                     Showing last 50
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                 {loading ? (
                    <div className="p-4 space-y-3">
                       {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-neutral-800" />)}
                    </div>
                 ) : (
                    <div className="overflow-x-auto">
                      <Table>
                         <TableHeader className="bg-neutral-950/50">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                               <TableHead className="text-neutral-400 w-[150px]">Time</TableHead>
                               <TableHead className="text-neutral-400">Page Path</TableHead>
                               <TableHead className="text-neutral-400">Location</TableHead>
                               <TableHead className="text-neutral-400 w-[100px]">Device</TableHead>
                               <TableHead className="text-neutral-400 text-right">Visitor ID</TableHead>
                            </TableRow>
                         </TableHeader>
                         <TableBody>
                            {recentVisits.length === 0 ? (
                               <TableRow>
                                  <TableCell colSpan={5} className="text-center py-12 text-neutral-500">
                                     <div className="flex flex-col items-center gap-2">
                                       <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                                          <Clock className="w-5 h-5 text-neutral-600" />
                                       </div>
                                       <p>No visits recorded in this period.</p>
                                     </div>
                                  </TableCell>
                               </TableRow>
                            ) : (
                               recentVisits.map((visit) => (
                                  <TableRow key={visit.id} className="border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                                     <TableCell className="text-neutral-300 font-mono text-xs">
                                        <div className="flex flex-col">
                                          <span className="font-medium text-white">
                                            {visit.visited_at ? format(new Date(visit.visited_at), 'HH:mm') : '--:--'}
                                          </span>
                                          <span className="text-neutral-500 text-[10px]">
                                            {visit.visited_at ? format(new Date(visit.visited_at), 'MMM d, yyyy') : ''}
                                          </span>
                                        </div>
                                     </TableCell>
                                     <TableCell className="text-blue-400 font-medium text-sm truncate max-w-[200px]">
                                        <div className="flex items-center gap-2">
                                          <ArrowRight className="w-3 h-3 opacity-50" />
                                          {visit.page_path}
                                        </div>
                                     </TableCell>
                                     <TableCell className="text-neutral-400 text-xs">
                                        {visit.country || 'Unknown'}
                                     </TableCell>
                                     <TableCell className="text-neutral-400">
                                        <div className="flex items-center gap-2 bg-neutral-950 w-fit px-2 py-1 rounded border border-neutral-800">
                                           {getDeviceIcon(visit.device_type)}
                                           <span className="text-xs capitalize">{visit.device_type || 'Desktop'}</span>
                                        </div>
                                     </TableCell>
                                     <TableCell className="text-neutral-500 text-xs font-mono text-right">
                                        {visit.visitor_id ? visit.visitor_id.substring(0, 8) : 'anon'}
                                     </TableCell>
                                  </TableRow>
                               ))
                            )}
                         </TableBody>
                      </Table>
                    </div>
                 )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default VisitorAnalytics;
