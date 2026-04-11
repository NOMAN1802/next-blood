
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useDonorProfile = (donorId) => {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!donorId) {
        setDonor(null);
        return;
    }

    const fetchDonor = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('donors')
          .select('*')
          .eq('id', donorId)
          .maybeSingle();

        if (error) throw error;
        setDonor(data);
      } catch (err) {
        console.error('Error fetching donor profile:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonor();
  }, [donorId]);

  return { donor, loading, error };
};
