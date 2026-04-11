import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isStrictSuperAdmin } from '@/lib/roleUtils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, FileText } from 'lucide-react';

const DataTable = ({ title, data, columns, loading, canExport }) => {
    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>;
    if (!data.length) return <div className="p-10 text-center text-neutral-500">No data available.</div>;

    const exportCSV = () => exportToCSV(data, title.toLowerCase().replace(' ', '_'));
    const exportPDF = () => exportToPDF(title, columns, data, title.toLowerCase().replace(' ', '_'));

    return (
        <div className="space-y-4">
            {canExport && (
              <div className="flex justify-end gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={exportCSV} className="border-neutral-700 hover:bg-neutral-800">
                      <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportPDF} className="border-neutral-700 hover:bg-neutral-800">
                      <FileText className="w-4 h-4 mr-2" /> PDF
                  </Button>
              </div>
            )}
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left text-neutral-400">
                    <thead className="bg-neutral-900 text-neutral-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-3">{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 bg-neutral-900/50">
                        {data.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-neutral-800/50">
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} className="px-6 py-3">
                                        {row[col.dataKey] || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminDataManagement = () => {
  const { user } = useAuth();
  const canExport = isStrictSuperAdmin(user?.role);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const { data: dData } = await supabase.from('donors').select('*');
        const { data: rData } = await supabase.from('blood_requests').select('*');
        const { data: sData } = await supabase.from('race_stations').select('*');
        
        setDonors(dData || []);
        setRequests(rData || []);
        setStations(sData || []);
        setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Master Data Management</h2>
        <p className="text-neutral-400">View and export system-wide records.</p>
      </div>

      <Tabs defaultValue="donors" className="w-full">
        <TabsList className="bg-neutral-900 border border-neutral-800">
          <TabsTrigger value="donors">Donors ({donors.length})</TabsTrigger>
          <TabsTrigger value="requests">Blood Requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="stations">Race Stations ({stations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="donors" className="mt-4">
            <DataTable
                title="Registered Donors"
                data={donors}
                loading={loading}
                canExport={canExport}
                columns={[
                    { header: 'Name', dataKey: 'full_name' },
                    { header: 'Blood Group', dataKey: 'blood_group' },
                    { header: 'City', dataKey: 'city' },
                    { header: 'Phone', dataKey: 'phone' },
                    { header: 'Last Donation', dataKey: 'last_donation_date' }
                ]}
            />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
            <DataTable
                title="Blood Requests"
                data={requests}
                loading={loading}
                canExport={canExport}
                columns={[
                    { header: 'Patient', dataKey: 'patient_name' },
                    { header: 'Blood Group', dataKey: 'blood_group' },
                    { header: 'Urgency', dataKey: 'urgency_level' },
                    { header: 'Hospital', dataKey: 'hospital' },
                    { header: 'Status', dataKey: 'status' }
                ]}
            />
        </TabsContent>
        
        <TabsContent value="stations" className="mt-4">
            <DataTable
                title="Race Stations"
                data={stations}
                loading={loading}
                canExport={canExport}
                columns={[
                    { header: 'Station Name', dataKey: 'station_name' },
                    { header: 'Location', dataKey: 'location' },
                    { header: 'Organizer', dataKey: 'organizer_name' },
                    { header: 'Contact', dataKey: 'contact_number' },
                    { header: 'Status', dataKey: 'status' }
                ]}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDataManagement;