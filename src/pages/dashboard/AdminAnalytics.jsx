import React from 'react';
import { BarChart, Activity, Users, MapPin } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-2xl font-bold text-white">System Analytics</h2>
        <p className="text-neutral-400">Performance metrics and growth statistics.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                 <Users className="text-blue-500" /> User Growth
             </h3>
             <div className="h-64 flex items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded">
                 [Chart: Monthly User Signups]
             </div>
        </div>
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                 <Activity className="text-red-500" /> Request Fulfillment
             </h3>
             <div className="h-64 flex items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded">
                 [Chart: Fulfilled vs Pending Requests]
             </div>
        </div>
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl col-span-2">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                 <MapPin className="text-green-500" /> Geographic Distribution
             </h3>
             <div className="h-64 flex items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded">
                 [Map: User & Donor Locations]
             </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;