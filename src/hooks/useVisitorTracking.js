import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabaseAdmin } from '@/lib/customSupabaseClient';

export const useVisitorTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // 1. Get or create visitor_id
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('visitor_id', visitorId);
        }

        // 2. Client-side deduplication — skip if same path visited within 15 min
        const now = Date.now();
        const lastVisitKey = `last_visit_${location.pathname}`;
        const lastVisitTime = parseInt(localStorage.getItem(lastVisitKey) || '0', 10);
        if (now - lastVisitTime < 15 * 60 * 1000) return;

        // 3. Insert directly into site_visits
        const { error } = await supabaseAdmin.from('site_visits').insert({
          visitor_id: visitorId,
          page_path: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          visited_at: new Date().toISOString(),
        });

        if (!error) {
          localStorage.setItem(lastVisitKey, now.toString());
        } else {
          console.warn('Visit tracking insert error:', error.message);
        }
      } catch (err) {
        // Silent failure — never disrupt the user
        console.warn('Tracking failed silently:', err);
      }
    };

    const timeoutId = setTimeout(trackVisit, 1000);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};
