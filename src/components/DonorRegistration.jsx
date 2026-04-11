import React from 'react';
import SimpleDonorRegistration from '@/components/SimpleDonorRegistration';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

const DonorRegistration = ({ onBack }) => {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <Button variant="ghost" onClick={onBack} className="mb-4 pl-0 hover:pl-2 transition-all text-neutral-400 hover:text-white">
          ← {t('back')}
        </Button>
      </div>
      <SimpleDonorRegistration />
    </div>
  );
};

export default DonorRegistration;