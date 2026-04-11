
import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, MapPin, Phone, Download, ExternalLink, Truck 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LogisticsCentersList = ({ centers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState(null);

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // Simple CSV export logic
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Location,Phone,Status\n"
      + filteredCenters.map(e => `${e.name},${e.location},${e.contact_info},${e.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "logistics_centers.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search centers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-neutral-900 border-neutral-800 text-sm"
          />
        </div>
        <Button variant="outline" size="icon" onClick={handleExport} className="border-neutral-800 bg-neutral-900">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border border-neutral-800 bg-neutral-900 overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-neutral-950 sticky top-0 z-10">
            <TableRow className="border-neutral-800">
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCenters.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={3} className="text-center text-neutral-500 py-8">
                   No centers found
                 </TableCell>
               </TableRow>
            ) : (
               filteredCenters.map((center) => (
                <TableRow 
                  key={center.id} 
                  className="border-neutral-800 hover:bg-neutral-800/50 cursor-pointer"
                  onClick={() => setSelectedCenter(center)}
                >
                  <TableCell>
                    <div className="font-medium text-sm text-neutral-200">{center.name}</div>
                    <div className="text-xs text-neutral-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" /> {center.location}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={`text-[10px] ${center.status === 'active' ? 'text-green-500 border-green-900 bg-green-950/20' : 'text-yellow-500 border-yellow-900 bg-yellow-950/20'}`}>
                      {center.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3 text-neutral-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedCenter} onOpenChange={() => setSelectedCenter(null)}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-500" />
              {selectedCenter?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
               <span className="text-neutral-400 text-sm">Location:</span>
               <span className="col-span-3 text-sm">{selectedCenter?.location}</span>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <span className="text-neutral-400 text-sm">Contact:</span>
               <span className="col-span-3 text-sm flex items-center gap-2">
                 <Phone className="w-3 h-3" /> {selectedCenter?.contact_info || 'N/A'}
               </span>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <span className="text-neutral-400 text-sm">Status:</span>
               <span className="col-span-3">
                 <Badge variant="outline" className="capitalize">{selectedCenter?.status}</Badge>
               </span>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <span className="text-neutral-400 text-sm">Coordinates:</span>
               <span className="col-span-3 text-xs font-mono text-neutral-500">
                 {selectedCenter?.latitude}, {selectedCenter?.longitude}
               </span>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LogisticsCentersList;
