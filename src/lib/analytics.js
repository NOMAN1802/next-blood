import { utils, write } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { db } from './db'; // Use centralized db

// Simple hashing for privacy preservation
const hashIdentifier = async (text) => {
  if (!text) return 'anonymous';
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const trackEvent = async (eventType, data, source) => {
  try {
    const identifier = data.email || data.phone || data.identifier || 'anonymous';
    const userHash = await hashIdentifier(identifier);
    
    // Save to centralized database
    const entry = await db.analytics.track({
      eventType,
      source: source || 'direct',
      location: data.city || data.location || 'Unknown',
      bloodGroup: data.bloodGroup || 'N/A',
      userHash,
      metadata: {
        urgency: data.urgencyLevel || null,
        hospital: data.hospital || null,
        country: data.country || null
      }
    });
    
    return entry;
  } catch (error) {
    console.error("Analytics Error:", error);
  }
};

export const getAnalyticsData = async () => {
  return await db.analytics.getAll();
};

export const exportAnalyticsCSV = (data) => {
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Analytics");
  const wbout = write(wb, { bookType: 'csv', type: 'array' });
  const blob = new Blob([wbout], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

export const exportAnalyticsPDF = (data) => {
  const doc = new jsPDF();
  doc.text("NextBlood Analytics Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  
  const tableData = data.map(row => [
    new Date(row.timestamp).toLocaleDateString(),
    row.eventType,
    row.source,
    row.bloodGroup,
    row.location
  ]);

  doc.autoTable({
    head: [['Date', 'Event Type', 'Source', 'Blood Group', 'Location']],
    body: tableData,
    startY: 30,
  });

  doc.save(`analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
};