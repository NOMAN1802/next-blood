import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon,
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Loader2, 
  ChevronRight,
  Eye,
  Save,
  X,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { read, utils } from 'xlsx';
import { db } from '@/lib/db';
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '@/lib/customSupabaseClient';
import { BLOOD_GROUPS } from '@/lib/locations';

// Worker setup for PDF.js (Client-side only)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// --- Utility Functions ---
const normalizeBloodGroup = (raw) => {
    if (!raw) return null;
    let clean = String(raw).trim().replace(/\s/g, '').replace(/ve$/i, '').replace(/VE$/i, '');
    const mapping = {
        'এ+': 'A+', 'এ-': 'A-', 'বি+': 'B+', 'বি-': 'B-', 'ও+': 'O+', 'ও-': 'O-',
        'এবি+': 'AB+', 'এবি-': 'AB-', 'পজেটিভ': '+', 'নেগেটিভ': '-'
    };
    if (mapping[clean]) return mapping[clean];
    let normalized = clean.toUpperCase();
    const validGroups = BLOOD_GROUPS;
    return validGroups.includes(normalized) ? normalized : null;
};

const validatePhone = (phone) => {
    if (!phone) return false;
    // Basic flexible phone validation (allows +, -, spaces)
    const clean = phone.replace(/[^0-9+]/g, '');
    return clean.length >= 10 && clean.length <= 15;
};

// --- Sub-Components ---

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { id: 1, label: "Upload" },
        { id: 2, label: "Review" },
        { id: 3, label: "Verify" },
        { id: 4, label: "Save" }
    ];

    return (
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center gap-2">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                                ${currentStep >= step.id 
                                    ? 'bg-red-600 border-red-600 text-white' 
                                    : 'bg-transparent border-neutral-700 text-neutral-500'}
                            `}>
                                {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                            </div>
                            <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-neutral-500'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-12 h-0.5 ${currentStep > step.id ? 'bg-red-600' : 'bg-neutral-800'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const DonorCardModal = ({ donor, open, onClose, onSave }) => {
    const [formData, setFormData] = useState(donor || {});
    
    useEffect(() => { setFormData(donor || {}); }, [donor]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    if (!open || !donor) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Donor Profile</DialogTitle>
                    <DialogDescription>Review and edit donor details before importing.</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Photo / Source Preview */}
                    <div className="space-y-4">
                         <div className="aspect-square bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-center overflow-hidden relative">
                            {formData.sourceUrl ? (
                                <img src={formData.sourceUrl} alt="Source" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center text-neutral-500">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <span className="text-xs">No Source Image</span>
                                </div>
                            )}
                         </div>
                         <div className="text-xs text-neutral-500 text-center">
                            Source: {formData.source || 'Manual Entry'}
                         </div>
                    </div>

                    {/* Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-neutral-400">Full Name</label>
                            <Input name="fullName" value={formData.fullName || ''} onChange={handleChange} className="bg-neutral-950 border-neutral-800" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-neutral-400">Blood Group</label>
                                <Input name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="bg-neutral-950 border-neutral-800" placeholder="e.g. A+" />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400">Phone</label>
                                <Input name="phone" value={formData.phone || ''} onChange={handleChange} className="bg-neutral-950 border-neutral-800" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400">Email</label>
                            <Input name="email" value={formData.email || ''} onChange={handleChange} className="bg-neutral-950 border-neutral-800" />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400">Address / City</label>
                            <Input name="city" value={formData.city || ''} onChange={handleChange} className="bg-neutral-950 border-neutral-800" />
                        </div>
                        <div>
                             <label className="text-xs text-neutral-400">Notes / Medical History</label>
                             <Input name="notes" value={formData.notes || ''} onChange={handleChange} className="bg-neutral-950 border-neutral-800" placeholder="Optional" />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="text-neutral-400 hover:text-white">Cancel</Button>
                    <Button onClick={() => onSave(formData)} className="bg-red-600 hover:bg-red-700">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DonorUpload = () => {
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    // --- State ---
    const [step, setStep] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progressText, setProgressText] = useState('');
    
    // Data State
    const [parsedData, setParsedData] = useState([]);
    const [selectedDonor, setSelectedDonor] = useState(null); // For edit modal
    const [verificationChecks, setVerificationChecks] = useState({
        identity: false,
        bloodType: false,
        consent: false,
        accuracy: false
    });

    // --- Handlers ---

    const handleFile = async (files) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        
        // Allowed types
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-excel', // xls
            'text/csv',
            'application/pdf',
            'image/jpeg',
            'image/png'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx')) {
            toast({ variant: "destructive", title: "Invalid File", description: "Supported formats: Excel, CSV, PDF, JPG, PNG" });
            return;
        }

        setLoading(true);
        setProgressText('Uploading & Analyzing...');

        try {
            // 1. If Image/PDF, upload to storage first to get a URL for reference
            let sourceUrl = null;
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                 const upload = await db.uploads.uploadFile(file, 'donor-docs');
                 sourceUrl = upload.file_url;
            }

            // 2. Parse Logic
            let extractedData = [];

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
                 extractedData = await parseExcel(file);
            } else {
                 // For Images/PDFs: Create a "Draft" record to be filled manually
                 // since we don't have backend OCR.
                 extractedData = [{
                    id: 'temp_' + Date.now(),
                    fullName: '',
                    bloodGroup: '',
                    phone: '',
                    city: '',
                    source: file.name,
                    sourceUrl: sourceUrl,
                    status: 'Draft',
                    isManualEntry: true
                 }];
                 toast({ title: "File Uploaded", description: "Please manually transcribe the donor details from the preview." });
            }

            setParsedData(extractedData);
            setStep(2); // Move to review
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Processing Failed", description: error.message });
        } finally {
            setLoading(false);
            setProgressText('');
        }
    };

    const parseExcel = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = utils.sheet_to_json(sheet, { defval: "" });

                    const mapped = jsonData.map((row, idx) => {
                        // Fuzzy key matching
                        const keys = Object.keys(row);
                        const findKey = (str) => keys.find(k => k.toLowerCase().includes(str));
                        
                        const fullName = row[findKey('name')] || '';
                        const bgRaw = row[findKey('blood')] || row[findKey('group')] || '';
                        const phone = row[findKey('phone')] || row[findKey('mobile')] || '';
                        const city = row[findKey('address')] || row[findKey('city')] || row[findKey('location')] || '';

                        const normalizedBg = normalizeBloodGroup(bgRaw);
                        const isValidPhone = validatePhone(String(phone));

                        let status = 'Valid';
                        let issues = [];
                        if (!fullName) { status = 'Error'; issues.push('Missing Name'); }
                        if (!normalizedBg) { status = 'Error'; issues.push('Invalid Blood Group'); }
                        if (!isValidPhone) { status = status === 'Error' ? 'Error' : 'Warning'; issues.push('Invalid Phone'); }

                        return {
                            id: `row_${idx}`,
                            fullName,
                            bloodGroup: normalizedBg || bgRaw,
                            phone,
                            city,
                            source: 'Excel Import',
                            status,
                            issues,
                            isVerified: status === 'Valid'
                        };
                    });
                    resolve(mapped);
                } catch (err) { reject(err); }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const handleDonorUpdate = (updatedDonor) => {
        setParsedData(prev => prev.map(d => d.id === updatedDonor.id ? { ...updatedDonor, status: 'Valid', issues: [], isVerified: true } : d));
        setSelectedDonor(null);
        toast({ title: "Updated", description: "Donor record updated." });
    };

    const handleDelete = (id) => {
        setParsedData(prev => prev.filter(d => d.id !== id));
    };

    const handleVerifyAll = () => {
        if (Object.values(verificationChecks).every(Boolean)) {
             // Only save Valid records
             const validRecords = parsedData.filter(d => d.status === 'Valid' || d.isVerified);
             if (validRecords.length === 0) {
                 toast({ variant: "destructive", title: "No Valid Records", description: "Please correct errors before saving." });
                 return;
             }
             saveToDatabase(validRecords);
        } else {
             toast({ variant: "destructive", title: "Verification Incomplete", description: "Please check all verification boxes." });
        }
    };

    const saveToDatabase = async (records) => {
        setLoading(true);
        try {
            // Get current user ID to satisfy RLS policy (user_id = auth.uid())
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error("You must be logged in to import donors.");
            }

            const recordsWithUser = records.map(r => ({
                // Map camelCase local state to snake_case DB columns
                full_name: r.fullName,
                blood_group: r.bloodGroup,
                phone: r.phone,
                city: r.city,
                email: r.email,
                notes: r.notes,
                source: r.source,
                profile_picture_url: r.sourceUrl, // Map sourceUrl to profile_picture_url
                
                user_id: user.id,
                country: r.country || 'Bangladesh',
                available: true,
                status: 'approved'
            }));

            await db.donors.createBulk(recordsWithUser);
            setStep(4); // Success step
        } catch (error) {
            console.error("Import Error:", error);
            toast({ variant: "destructive", title: "Save Failed", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic ---

    const renderUploadStep = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div 
                className={`
                    border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all
                    ${isDragging ? 'border-red-500 bg-red-500/10' : 'border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900'}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFile(e.target.files)} accept=".xlsx,.csv,.pdf,.jpg,.jpeg,.png" />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
                        <UploadCloud className="w-8 h-8 text-neutral-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Drop files here or click to upload</h3>
                        <p className="text-neutral-500 max-w-sm mx-auto">
                            Supports Excel lists for bulk import, or Photos/PDFs for manual transcription and digitization.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
                    <FileSpreadsheet className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <span className="text-sm text-neutral-400">Excel / CSV</span>
                </div>
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
                    <ImageIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <span className="text-sm text-neutral-400">Photos (JPG/PNG)</span>
                </div>
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
                    <FileText className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <span className="text-sm text-neutral-400">PDF Documents</span>
                </div>
            </div>
        </motion.div>
    );

    const renderPreviewStep = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Parsed Data Review</h3>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setStep(1); setParsedData([]); }}>Discard</Button>
                    <Button onClick={() => setStep(3)} disabled={parsedData.length === 0} className="bg-red-600 hover:bg-red-700">
                        Proceed to Verify <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-400">
                        <thead className="bg-neutral-950 text-neutral-500 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Blood Group</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {parsedData.map((donor) => (
                                <tr key={donor.id} className="hover:bg-neutral-800/50">
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
                                            ${donor.status === 'Valid' ? 'bg-green-500/10 text-green-500' : 
                                              donor.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-500' : 
                                              'bg-red-500/10 text-red-500'}
                                        `}>
                                            {donor.status === 'Valid' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                            {donor.status}
                                        </span>
                                        {donor.issues && donor.issues.length > 0 && (
                                            <div className="text-[10px] text-red-400 mt-1">{donor.issues.join(', ')}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{donor.fullName || <span className="text-neutral-600 italic">Empty</span>}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold bg-neutral-800 px-2 py-1 rounded">{donor.bloodGroup || '?'}</span>
                                    </td>
                                    <td className="px-6 py-4">{donor.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        {donor.sourceUrl ? (
                                            <a href={donor.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                                <Eye className="w-3 h-3" /> View Source
                                            </a>
                                        ) : (
                                            <span>{donor.source}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button size="sm" variant="ghost" onClick={() => setSelectedDonor(donor)}>
                                            <Edit2 className="w-4 h-4 text-neutral-400 hover:text-white" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(donor.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Show Manual Entry hint for Images */}
            {parsedData.some(d => d.isManualEntry) && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-full text-blue-500 mt-1">
                        <Edit2 className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Action Required: Manual Transcription</h4>
                        <p className="text-neutral-400 text-sm mt-1">
                            Some uploaded files (Images/PDFs) require manual data entry. Click the Edit (pencil) icon next to the draft rows to view the document and fill in donor details.
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );

    const renderVerifyStep = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">Final Verification</h3>
                <p className="text-neutral-400 mt-2">
                    You are about to import <strong className="text-white">{parsedData.filter(d => d.status === 'Valid').length}</strong> valid donor records to the live database.
                </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h4 className="font-bold text-white mb-2">Admin Checklist</h4>
                
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors border border-transparent hover:border-neutral-700">
                    <input type="checkbox" checked={verificationChecks.identity} onChange={e => setVerificationChecks({...verificationChecks, identity: e.target.checked})} className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-red-600 focus:ring-red-500" />
                    <span className="text-neutral-300 text-sm">I have verified the identity information where possible.</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors border border-transparent hover:border-neutral-700">
                    <input type="checkbox" checked={verificationChecks.bloodType} onChange={e => setVerificationChecks({...verificationChecks, bloodType: e.target.checked})} className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-red-600 focus:ring-red-500" />
                    <span className="text-neutral-300 text-sm">I verify that blood group data matches the source documents.</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors border border-transparent hover:border-neutral-700">
                    <input type="checkbox" checked={verificationChecks.consent} onChange={e => setVerificationChecks({...verificationChecks, consent: e.target.checked})} className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-red-600 focus:ring-red-500" />
                    <span className="text-neutral-300 text-sm">I confirm these donors have consented to data storage.</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors border border-transparent hover:border-neutral-700">
                    <input type="checkbox" checked={verificationChecks.accuracy} onChange={e => setVerificationChecks({...verificationChecks, accuracy: e.target.checked})} className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-red-600 focus:ring-red-500" />
                    <span className="text-neutral-300 text-sm">I accept responsibility for the accuracy of this data import.</span>
                </label>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back to Review</Button>
                <Button onClick={handleVerifyAll} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" /> Confirm & Save to Database
                </Button>
            </div>
        </motion.div>
    );

    const renderSuccessStep = () => (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Import Successful!</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                Donor records have been successfully verified and saved to the secure Supabase database. They are now available in the Donor Management dashboard.
            </p>
            <div className="flex justify-center gap-4">
                <Button onClick={() => window.location.reload()} variant="outline">Import More</Button>
                <Button onClick={() => window.location.href='/dashboard/donors'} className="bg-red-600 hover:bg-red-700">View Donors</Button>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 pt-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Data Import Center</h1>
                <p className="text-neutral-400">Securely upload and digitize donor records.</p>
            </div>

            <StepIndicator currentStep={step} />

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
                            <h3 className="text-white font-medium text-lg">{progressText}</h3>
                        </motion.div>
                    ) : (
                        <>
                            {step === 1 && renderUploadStep()}
                            {step === 2 && renderPreviewStep()}
                            {step === 3 && renderVerifyStep()}
                            {step === 4 && renderSuccessStep()}
                        </>
                    )}
                </AnimatePresence>
            </div>

            <DonorCardModal 
                open={!!selectedDonor} 
                donor={selectedDonor} 
                onClose={() => setSelectedDonor(null)}
                onSave={handleDonorUpdate}
            />
        </div>
    );
};

export default DonorUpload;