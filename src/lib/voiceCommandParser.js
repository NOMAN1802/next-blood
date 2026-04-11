
import { districtsOfBangladesh } from '@/lib/locations';

export const parseVoiceCommand = (transcript) => {
  const text = transcript.toLowerCase();
  
  // Clean up punctuation
  const cleanText = text.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

  // Default response
  const result = {
    action: 'unknown',
    params: {},
    original: transcript
  };

  // 1. Reset Commands
  if (cleanText.includes('reset') || cleanText.includes('clear')) {
    return { ...result, action: 'reset' };
  }

  // 2. Filter by District
  if (cleanText.includes('show') || cleanText.includes('filter') || cleanText.includes('go to')) {
    // Check against district list
    const foundDistrict = districtsOfBangladesh.find(district => 
      cleanText.includes(district.toLowerCase())
    );

    if (foundDistrict) {
      return { 
        action: 'filter_district', 
        params: { district: foundDistrict } 
      };
    }
  }

  // 3. Show Logistics
  if (cleanText.includes('logistics') || cleanText.includes('centers') || cleanText.includes('hubs')) {
    return { ...result, action: 'show_logistics' };
  }

  // 4. Show Donors / Top Donors
  if (cleanText.includes('top donors') || cleanText.includes('statistics') || cleanText.includes('charts')) {
    return { ...result, action: 'show_stats' };
  }

  return result;
};
