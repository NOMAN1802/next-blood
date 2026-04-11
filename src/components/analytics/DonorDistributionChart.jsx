
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, Users, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded shadow-xl text-xs">
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="text-red-400">Donors: {payload[0].value}</p>
        <p className="text-neutral-400">Share: {payload[0].payload.percentage}%</p>
      </div>
    );
  }
  return null;
};

const DonorDistributionChart = ({ data, onDistrictSelect }) => {
  // Process data for chart
  const sortedData = Object.entries(data).map(([district, stats]) => ({
    name: district,
    donors: stats.count,
    available: stats.available
  }))
  .sort((a, b) => b.donors - a.donors)
  .slice(0, 10); // Top 10

  const totalDonors = sortedData.reduce((acc, curr) => acc + curr.donors, 0);
  
  const chartData = sortedData.map(item => ({
    ...item,
    percentage: totalDonors > 0 ? ((item.donors / totalDonors) * 100).toFixed(1) : 0
  }));

  // Statistics
  const topDistrict = chartData[0] || { name: 'N/A', donors: 0 };
  const avgDonors = chartData.length > 0 ? Math.round(totalDonors / chartData.length) : 0;

  return (
    <div className="space-y-4">
      {/* Mini Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
            <Users className="w-3 h-3" /> Highest Density
          </div>
          <div className="text-lg font-bold text-white truncate">{topDistrict.name}</div>
          <div className="text-xs text-red-500">{topDistrict.donors} donors</div>
        </div>
        <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
           <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
            <Activity className="w-3 h-3" /> Avg. per District
          </div>
          <div className="text-lg font-bold text-white">{avgDonors}</div>
        </div>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-200">
             Top 10 Districts
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#666" 
                tick={{ fontSize: 10, fill: '#999' }} 
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#333', opacity: 0.2 }} />
              <Bar 
                dataKey="donors" 
                radius={[0, 4, 4, 0]}
                onClick={(data) => onDistrictSelect && onDistrictSelect(data.name)}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                     key={`cell-${index}`} 
                     fill={`url(#colorGradient-${index})`} 
                  />
                ))}
              </Bar>
              <defs>
                {chartData.map((entry, index) => (
                   <linearGradient key={`colorGradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={1}/>
                   </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorDistributionChart;
