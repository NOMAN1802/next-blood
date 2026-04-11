
import React, { useState } from 'react';
import { 
  Activity, Map, Database, RotateCcw, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import BangladeshMap from '@/components/analytics/BangladeshMap';
import DonorDistributionChart from '@/components/analytics/DonorDistributionChart';
import LogisticsCentersList from '@/components/analytics/LogisticsCentersList';
import VoiceFilterButton from '@/components/analytics/VoiceFilterButton';
import { Loader2 } from 'lucide-react';

const Analytics = () => {
  const { data, loading, error, refetch } = useAnalyticsData();
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list' for mobile
  
  const handleVoiceCommand = (command) => {
    switch (command.action) {
      case 'filter_district':
        if (command.params.district) {
          setSelectedDistrict(command.params.district);
        }
        break;
      case 'reset':
        setSelectedDistrict(null);
        break;
      case 'show_logistics':
        // Scroll to logistics list (if we had refs, simple state change for now)
        break;
      case 'show_stats':
        // Focus stats
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setSelectedDistrict(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
           <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
           <p className="text-neutral-400">Loading Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-2xl font-bold mb-2">Failed to load data</h2>
        <p className="mb-4">{error}</p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-6 space-y-6">
      
      {/* Top Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
         <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
               <Activity className="text-red-500" /> 
               Analytics Command Center
            </h1>
            <p className="text-neutral-400 text-sm">
               Real-time geospatial donor tracking & logistics monitoring
            </p>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
            <VoiceFilterButton onCommand={handleVoiceCommand} />
            
            {selectedDistrict && (
              <Button 
                variant="secondary" 
                onClick={handleReset}
                className="bg-neutral-800 text-white hover:bg-neutral-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset {selectedDistrict}
              </Button>
            )}
         </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[800px]">
        
        {/* Left/Main Column: MAP (Takes 8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full space-y-4">
           {/* Mobile View Toggle */}
           <div className="lg:hidden flex gap-2 mb-2">
              <Button 
                 variant={viewMode === 'map' ? 'default' : 'outline'} 
                 onClick={() => setViewMode('map')}
                 className="flex-1"
              >
                 <Map className="w-4 h-4 mr-2" /> Map View
              </Button>
              <Button 
                 variant={viewMode === 'list' ? 'default' : 'outline'} 
                 onClick={() => setViewMode('list')}
                 className="flex-1"
              >
                 <Database className="w-4 h-4 mr-2" /> Data View
              </Button>
           </div>

           {/* The Map */}
           <div className={`flex-1 relative transition-all duration-300 ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
              <BangladeshMap 
                 data={data.donors} 
                 districtStats={data.districtStats}
                 selectedDistrict={selectedDistrict}
                 centers={data.centers}
              />
           </div>
           
           {/* Map Footer Stats (Optional quick glance) */}
           <div className="grid grid-cols-3 gap-4 lg:hidden">
              <div className="bg-neutral-900 p-3 rounded border border-neutral-800 text-center">
                 <div className="text-2xl font-bold text-white">{data.donors.length}</div>
                 <div className="text-[10px] text-neutral-500 uppercase">Total Donors</div>
              </div>
              <div className="bg-neutral-900 p-3 rounded border border-neutral-800 text-center">
                 <div className="text-2xl font-bold text-green-500">{data.centers.length}</div>
                 <div className="text-[10px] text-neutral-500 uppercase">Logistics Centers</div>
              </div>
               <div className="bg-neutral-900 p-3 rounded border border-neutral-800 text-center">
                 <div className="text-2xl font-bold text-blue-500">{Object.keys(data.districtStats).length}</div>
                 <div className="text-[10px] text-neutral-500 uppercase">Districts Active</div>
              </div>
           </div>
        </div>

        {/* Right Sidebar: Charts & Lists (Takes 4 cols) */}
        <div className={`lg:col-span-4 space-y-6 overflow-y-auto pr-1 custom-scrollbar ${viewMode === 'map' ? 'hidden lg:block' : 'block'}`}>
           
           {/* Chart Section */}
           <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <LayoutDashboard className="w-4 h-4" /> Regional Distribution
              </h3>
              <DonorDistributionChart 
                 data={data.districtStats} 
                 onDistrictSelect={setSelectedDistrict} 
              />
           </div>

           {/* Logistics List Section */}
           <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <Database className="w-4 h-4" /> Logistics Hubs
              </h3>
              <LogisticsCentersList centers={data.centers} />
           </div>

           {/* System Status Card */}
           <div className="bg-green-950/20 border border-green-900/30 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                 <div className="w-2 h-2 mt-2 rounded-full bg-green-500 animate-pulse" />
                 <div>
                    <h4 className="text-sm font-bold text-green-400">System Nominal</h4>
                    <p className="text-xs text-green-500/80 mt-1">
                       All data streams connected. Real-time updates active. Voice recognition ready.
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
