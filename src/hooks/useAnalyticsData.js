import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseAdmin } from '@/lib/customSupabaseClient';

// Hook for dashboard visualization
export const useAnalyticsData = () => {
  const [data, setData] = useState({
    donors: [],
    centers: [],
    districtStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: donorsData, error: donorsError } = await supabase
        .from('donors')
        .select('id, city, country, blood_group, available');
      
      if (donorsError) throw donorsError;

      const { data: centersData, error: centersError } = await supabase
        .from('logistics_centers')
        .select('*');
        
      const safeCenters = centersError ? [] : centersData;

      const stats = {};
      (donorsData || []).forEach(d => {
        const district = d.city || 'Unknown';
        if (!stats[district]) {
          stats[district] = { count: 0, available: 0, bloodGroups: {} };
        }
        stats[district].count += 1;
        if (d.available) stats[district].available += 1;
        
        const bg = d.blood_group || 'Unknown';
        stats[district].bloodGroups[bg] = (stats[district].bloodGroups[bg] || 0) + 1;
      });

      setData({
        donors: donorsData || [],
        centers: safeCenters || [],
        districtStats: stats
      });

    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Helper to get date based on period
const getStartDateForPeriod = (period) => {
  const date = new Date();
  
  switch (period) {
    case 'daily':
      date.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      date.setDate(date.getDate() - 7);
      break;
    case 'monthly':
      date.setDate(date.getDate() - 30);
      break;
    case 'yearly':
      date.setDate(date.getDate() - 365);
      break;
    default:
      date.setHours(0, 0, 0, 0);
  }
  
  return date.toISOString();
};

export const getVisitorStatsByPeriod = async (period = 'daily') => {
  const startDate = getStartDateForPeriod(period);

  // 1. Get Total Visits Count
  const { count: totalVisits, error: countError } = await supabaseAdmin
    .from('site_visits')
    .select('*', { count: 'exact', head: true })
    .gte('visited_at', startDate);

  if (countError) throw countError;

  // 2. Get Unique Visitors
  const { data: visitorsData, error: visitorsError } = await supabaseAdmin
    .from('site_visits')
    .select('visitor_id')
    .gte('visited_at', startDate);

  if (visitorsError) throw visitorsError;

  const uniqueVisitorsCount = new Set(visitorsData?.map(v => v.visitor_id)).size;
  const avgVisits = uniqueVisitorsCount > 0
    ? (totalVisits / uniqueVisitorsCount).toFixed(1)
    : 0;

  return {
    total_visits: totalVisits || 0,
    unique_visitors: uniqueVisitorsCount || 0,
    avg_visits_per_visitor: avgVisits
  };
};

export const getRecentVisits = async (limit = 50, period = 'daily') => {
  const startDate = getStartDateForPeriod(period);

  const { data, error } = await supabaseAdmin
    .from('site_visits')
    .select('id, visited_at, page_path, visitor_id, device_type, country')
    .gte('visited_at', startDate)
    .order('visited_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// Kept for backward compatibility with other components
export const getVisitorCounts = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const date7 = new Date(); date7.setDate(date7.getDate() - 7);
        const date30 = new Date(); date30.setDate(date30.getDate() - 30);

        const { count: todayCount } = await supabaseAdmin.from('site_visits').select('id', { count: 'exact', head: true }).eq('visit_date', today);
        const { count: weekCount } = await supabaseAdmin.from('site_visits').select('id', { count: 'exact', head: true }).gte('visited_at', date7.toISOString());
        const { count: monthCount } = await supabaseAdmin.from('site_visits').select('id', { count: 'exact', head: true }).gte('visited_at', date30.toISOString());

        return {
            today: todayCount || 0,
            week: weekCount || 0,
            month: monthCount || 0
        };
    } catch (error) {
        console.error("Failed to fetch visitor counts", error);
        return { today: 0, week: 0, month: 0 };
    }
}