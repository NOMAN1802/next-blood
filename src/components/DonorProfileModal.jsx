
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDonorProfile } from '@/hooks/useDonorProfile';
import DonorProfileContent from './DonorProfileContent';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

const DonorProfileModal = ({ donorId, isOpen, onClose }) => {
  const { donor, loading, error } = useDonorProfile(donorId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl bg-neutral-900 text-white border-neutral-800">
        <DialogHeader>
          <DialogTitle>Donor Profile</DialogTitle>
          <DialogDescription>
             Detailed information about this blood donor.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 min-h-[200px]">
           <ErrorBoundary>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                   <div className="flex gap-4">
                      <Skeleton className="w-24 h-24 rounded-2xl bg-neutral-800" />
                      <div className="space-y-2 flex-1 pt-2">
                         <Skeleton className="h-6 w-3/4 bg-neutral-800" />
                         <Skeleton className="h-4 w-1/2 bg-neutral-800" />
                         <Skeleton className="h-4 w-1/3 bg-neutral-800" />
                      </div>
                   </div>
                   <div className="h-32 bg-neutral-800/50 rounded-xl" />
                   <div className="h-32 bg-neutral-800/50 rounded-xl" />
                </div>
              ) : error ? (
                 <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                    <div className="p-3 bg-red-500/10 rounded-full">
                       <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                       <h3 className="font-bold text-white">Profile not available</h3>
                       <p className="text-neutral-400 text-sm">We couldn't load this donor's information.</p>
                    </div>
                 </div>
              ) : !donor ? (
                 <div className="text-center py-10 text-neutral-500">
                    Donor not found.
                 </div>
              ) : (
                 <DonorProfileContent donor={donor} />
              )}
           </ErrorBoundary>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonorProfileModal;
