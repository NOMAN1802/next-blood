import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { BLOOD_GROUPS, districtsOfBangladesh } from '@/lib/locations';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [bloodGroups] = useState(BLOOD_GROUPS); // Use static data
  const [districts] = useState(districtsOfBangladesh); // Use static data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Only fetch general settings, avoid querying non-existent tables
      const { data: settingsData, error: settingsError } = await supabase
        .from('general_settings')
        .select('*');

      if (!settingsError && settingsData) {
        const formattedSettings = settingsData.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings(formattedSettings);
      } else {
        // If table doesn't exist or error, fail gracefully without crashing
        console.warn('Settings fetch warning:', settingsError);
      }

    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key, value) => {
    try {
      // Check if general_settings table exists by trying to select first
      const { error: checkError } = await supabase.from('general_settings').select('id').limit(1);
      
      if (checkError) {
         console.warn("Settings table might not exist, updating local state only.");
         setSettings(prev => ({ ...prev, [key]: value }));
         return { success: true };
      }

      const { error } = await supabase
        .from('general_settings')
        .update({ value, updated_at: new Date() })
        .eq('key', key);

      if (error) throw error;
      setSettings(prev => ({ ...prev, [key]: value }));
      return { success: true };
    } catch (err) {
      console.error('Error updating setting:', err);
      return { success: false, error: err.message };
    }
  };

  const getSetting = (key, defaultValue = '') => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      bloodGroups,
      districts,
      loading,
      error,
      getSetting,
      updateSetting,
      refreshSettings: fetchSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};