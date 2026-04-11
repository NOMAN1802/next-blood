import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

const LoginHistory = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await db.loginHistory.getAll();
        setLogs(data || []);
      } catch (error) {
        console.error("Failed to load login history", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load login history."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('log_history_title')}</h2>
        <p className="text-neutral-400">{t('log_history_subtitle')}</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950/50 text-neutral-300 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">{t('role')}</th>
                <th className="px-6 py-4">{t('ip_address')}</th>
                <th className="px-6 py-4">{t('device')}</th>
                <th className="px-6 py-4">{t('location')}</th>
                <th className="px-6 py-4">{t('login_time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                 <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                       <div className="flex justify-center items-center gap-2">
                          <Loader2 className="animate-spin w-5 h-5" /> Loading History...
                       </div>
                    </td>
                 </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">{log.user_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{log.ip}</td>
                    <td className="px-6 py-4 flex items-center gap-2 max-w-[200px] truncate" title={log.device}>
                      <Smartphone size={14} className="shrink-0" /> <span className="truncate">{log.device}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          <MapPin size={14} /> {log.location || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-neutral-500">
                    No login history records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoginHistory;