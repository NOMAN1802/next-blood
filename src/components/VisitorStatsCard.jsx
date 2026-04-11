
import React, { useEffect, useState } from 'react';
import { Users, Calendar, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getVisitorCounts } from '@/hooks/useAnalyticsData';

const VisitorStatsCard = () => {
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getVisitorCounts();
        if (data) setStats(data);
        else setError(true);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (error) {
    return (
      <Card className="bg-neutral-900 border-neutral-800 shadow-lg">
        <CardContent className="p-4 flex items-center gap-2 text-neutral-400 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>Stats unavailable</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-lg overflow-hidden">
      <CardHeader className="bg-neutral-950/50 pb-3 border-b border-neutral-800">
        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-500" />
          Visitor Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="text-xs text-neutral-500 mb-1 flex justify-center items-center gap-1">
             <Users className="w-3 h-3" /> Today
          </div>
          {loading ? (
             <Skeleton className="h-6 w-12 mx-auto bg-neutral-800" />
          ) : (
             <div className="text-lg font-bold text-white">{stats.today}</div>
          )}
        </div>
        
        <div className="text-center p-2 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="text-xs text-neutral-500 mb-1 flex justify-center items-center gap-1">
             <TrendingUp className="w-3 h-3" /> Week
          </div>
          {loading ? (
             <Skeleton className="h-6 w-12 mx-auto bg-neutral-800" />
          ) : (
             <div className="text-lg font-bold text-white">{stats.week}</div>
          )}
        </div>

        <div className="text-center p-2 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="text-xs text-neutral-500 mb-1 flex justify-center items-center gap-1">
             <Calendar className="w-3 h-3" /> Month
          </div>
          {loading ? (
             <Skeleton className="h-6 w-12 mx-auto bg-neutral-800" />
          ) : (
             <div className="text-lg font-bold text-white">{stats.month}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorStatsCard;
