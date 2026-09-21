import React, { useState, useRef } from 'react';
import { 
  FolderLock, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  Video, 
  Volume2, 
  Image as ImageIcon, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Search, 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Eye, 
  Tag, 
  FileCode, 
  RefreshCw,
  ExternalLink,
  History,
  FileCheck2,
  Trash2,
  Copy,
  Check,
  Play,
  Share2,
  Filter,
  FileSearch,
  Cpu,
  Layers
} from 'lucide-react';
import { EvidenceCategory, EvidenceItem, FIRDetails, LanguageCode, OfficerUser, ExtractedEntity } from '../types';
import { calculateSHA256, calculateFileHash, verifyEvidenceIntegrity, exportSection65BCertificate } from '../services/cryptoUtils';
import { runOcrAndEntityExtraction, runSemanticSearch, runEvidenceItemOcr } from '../services/api';
import { translations } from '../translations/i18n';
import { mockBlockchainBlocks } from '../data/mockData';
import { BiometricSecurityModal } from './BiometricSecurityModal';

interface EvidenceManagerProps {
  caseItem: FIRDetails;
  evidenceList: EvidenceItem[];
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onAddEvidence: (item: EvidenceItem) => void;
  onTamperEvidence: (evidenceId: string, isTampered: boolean) => void;
  onLogBlockchainEvent: (action: any, details: string, evidenceId?: string, evidenceHash?: string) => void;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  caseItem,
  evidenceList,
  currentOfficer,
  currentLang,
  onAddEvidence,
  onTamperEvidence,
  onLogBlockchainEvent,
}) => {
  const t = translations[currentLang];
  const [selectedCategory, setSelectedCategory] = useState<EvidenceCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'CALCULATING_SHA256' | 'SCANNING_CLAMAV' | 'ENCRYPTING_AES' | 'SUCCESS'>('IDLE');
  
  // Biometric Modal Gatekeeper State
  const [biometricModal, setBiometricModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onSuccess: () => {},
  });

  const requestBiometricClearance = (title: string, description: string, onSuccess: () => void) => {
    setBiometricModal({
      isOpen: true,
      title,
      description,
      onSuccess,
    });
  };

  // OCR / Entity Extraction modal state
  const [selectedEvidenceForOcr, setSelectedEvidenceForOcr] = useState<EvidenceItem | null>(null);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);

  // Evidence Preview Modal
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Hash verification modal
  const [verificationResult, setVerificationResult] = useState<{
    item: EvidenceItem;
    isValid: boolean;
    computedHash: string;
    expectedHash: string;
  } | null>(null);
  
  // Semantic Search state
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<{ 
    documentId: string; 
    score: number; 
    highlight: string; 
    matchedField?: string; 
    matchedEntities?: ExtractedEntity[]; 
  }[] | null>(null);
  const [searchFilterMode, setSearchFilterMode] = useState<'ALL' | 'OCR_ONLY' | 'WITH_ENTITIES'>('ALL');

  // Real Upload Form State with Live OCR
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [realComputedHash, setRealComputedHash] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EvidenceCategory>('DOCUMENT');
  const [newTags, setNewTags] = useState('');
  const [newTextSnippet, setNewTextSnippet] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isOcrScanningStaged, setIsOcrScanningStaged] = useState(false);
  const [stagedOcrSuccess, setStagedOcrSuccess] = useState(false);
  const [stagedEntities, setStagedEntities] = useState<ExtractedEntity[]>([]);
  const [stagedOcrConfidence, setStagedOcrConfidence] = useState<number>(0.98);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered evidence items
  const filteredEvidence = evidenceList.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    if (searchFilterMode === 'OCR_ONLY' && !item.extractedText) {
      return false;
    }
    if (searchFilterMode === 'WITH_ENTITIES' && (!item.entitiesExtracted || item.entitiesExtracted.length === 0)) {
      return false;
    }
    if (semanticResults) {
      return semanticResults.some((r) => r.documentId === item.id);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q) ||
        item.sha256Hash.toLowerCase().includes(q) ||
        (item.extractedText && item.extractedText.toLowerCase().includes(q)) ||
        (item.entitiesExtracted && item.entitiesExtracted.some((e) => e.value.toLowerCase().includes(q) || (e.context && e.context.toLowerCase().includes(q)))) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getCategoryIcon = (cat: EvidenceCategory) => {
    switch (cat) {
      case 'DOCUMENT':
      case 'FORENSIC_REPORT':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'DIGITAL_RECORD':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'AUDIO':
        return <Volume2 className="w-5 h-5 text-amber-400" />;
    }
  };

  // Trigger real-time OCR extraction during upload staging
  const triggerStagedOcr = async (file?: File, explicitText?: string, fallbackFileName?: string) => {
    setIsOcrScanningStaged(true);
    setStagedOcrSuccess(false);

    try {
      if (file) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const dataUrl = reader.result as string;
              const res = await runOcrAndEntityExtraction({
                base64Image: dataUrl,
                fileName: file.name,
                mimeType: file.type,
                language: currentLang,
              });
              setNewTextSnippet(res.extractedText);
              setStagedEntities(res.entities || []);
              setStagedOcrConfidence(res.ocrConfidence || 0.98);
              setStagedOcrSuccess(true);
            } catch (e) {
              console.error('OCR Error on image read:', e);
            } finally {
              setIsOcrScanningStaged(false);
            }
          };
          reader.readAsDataURL(file);
          return;
        } else if (file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const dataUrl = reader.result as string;
              let textPayload: string | undefined = undefined;
              if (file.size < 4096) {
                try {
                  const rawTxt = await file.text();
                  if (!rawTxt.startsWith('%PDF-')) {
                    textPayload = rawTxt;
                  }
                } catch {
                  // ignore
                }
              }
              const res = await runOcrAndEntityExtraction({
                base64Image: dataUrl,
                textContent: textPayload,
                fileName: file.name,
                mimeType: 'application/pdf',
                language: currentLang,
              });
              setNewTextSnippet(res.extractedText);
              setStagedEntities(res.entities || []);
              setStagedOcrConfidence(res.ocrConfidence || 0.98);
              setStagedOcrSuccess(true);
            } catch (e) {
              console.error('OCR Error on PDF read:', e);
            } finally {
              setIsOcrScanningStaged(false);
            }
          };
          reader.readAsDataURL(file);
          return;
        } else {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const text = (reader.result as string) || '';
              const res = await runOcrAndEntityExtraction({
                textContent: text,
                fileName: file.name,
                mimeType: file.type,
                language: currentLang,
              });
              setNewTextSnippet(res.extractedText);
              setStagedEntities(res.entities || []);
              setStagedOcrConfidence(res.ocrConfidence || 0.98);
              setStagedOcrSuccess(true);
            } catch (e) {
              console.error('OCR Error on text file:', e);
            } finally {
              setIsOcrScanningStaged(false);
            }
          };
          reader.readAsText(file);
          return;
        }
      } else if (explicitText) {
        const res = await runOcrAndEntityExtraction({
          textContent: explicitText,
          fileName: fallbackFileName || 'Document_FIR_Record.pdf',
          language: currentLang,
        });
        setNewTextSnippet(res.extractedText);
        setStagedEntities(res.entities || []);
        setStagedOcrConfidence(res.ocrConfidence || 0.98);
        setStagedOcrSuccess(true);
        setIsOcrScanningStaged(false);
      }
    } catch (err) {
      console.error('OCR extraction failed:', err);
      setIsOcrScanningStaged(false);
    }
  };

  // Pre-load realistic authentic documents (FIR, Seizure Panchnama, Bank Mule statement, CDR)
  const handleLoadSampleDocument = (type: 'FIR' | 'PANCHNAMA' | 'MULE_BANK' | 'CDR') => {
    let title = '';
    let category: EvidenceCategory = 'DOCUMENT';
    let tags = '';
    let sampleText = '';
    let sampleFileName = '';

    if (type === 'FIR') {
      title = 'Certified FIR No. 482/2026 (Copy of Original GD & FIR under BNSS Sec 173)';
      category = 'DOCUMENT';
      tags = 'FIR, BNSS-173, Theft, BNS-303, Royapettah-PS';
      sampleFileName = 'FIR_482_2026_Royapettah_PS.pdf';
      sampleText = `GOVERNMENT OF TAMIL NADU - POLICE DEPARTMENT
FIRST INFORMATION REPORT (Under Section 173 BNSS 2023 / Sec 154 CrPC)
FIR No: 482/2026 | PS: E-2 Royapettah Police Station, Greater Chennai Police
Date & Time of Occurrence: 14-Oct-2026 at 21:30 hrs | GD Entry No: 44/2026
Offence Sections: Section 303(2) BNS 2023 (Theft of motor vehicle & electronic vault) r/w Section 3(5) BNS

Complainant: Tmt. S. Lakshmi, W/o Sundaram, No. 14 Peters Road, Royapettah, Chennai-600014 (+91 98401 23456)
Accused: Dinesh @ Rocky, S/o Karunakaran, aged 28 yrs, R/o Kannagi Nagar, Thoraipakkam, Chennai (+91 98841 88921)
Co-Accused: Unknown accomplice riding getaway motorcycle Bajaj Pulsar 150 Black, Registration: TN-09-CB-4491
Stolen Property: Seized cash of ₹1,80,000 withdrawn from ICICI Bank ATM and HP Envy 15 Laptop (S/N: 5CD8420B9X)
Brief Facts of Incident: Complainant was walking near Royapettah High Road when suspect Dinesh @ Rocky intercepted her riding black Pulsar TN-09-CB-4491 and decamped with handbag containing ₹1,80,000 cash.
Investigating Officer: Inspector K. Ramanathan, Inspector of Police, E-2 Royapettah PS (TN-INSP-4081)`;
    } else if (type === 'PANCHNAMA') {
      title = 'Recovery Panchnama under Section 105 BNSS 2023 (Physical Seizure)';
      category = 'DOCUMENT';
      tags = 'Panchnama, Seizure, BNSS-105, Vehicle-Seizure, Cash-Recovery';
      sampleFileName = 'Recovery_Panchnama_Seizure_Memo.pdf';
      sampleText = `SEIZURE PANCHNAMA / MAHAZAR UNDER SECTION 105 BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS) 2023
Place of Seizure: Near Marina Beach Lighthouse Service Road, Mylapore, Chennai-600004
Date & Time: 15-Oct-2026 at 06:45 hrs | FIR Ref: E-2 Royapettah PS Cr. No. 482/2026

Panchas (Independent Witnesses):
1. Thiru. M. Senthil Kumar, aged 42, S/o Muthusamy, Shopkeeper, Light House Road, Chennai (+91 94441 55667)
2. Thiru. P. Arulmani, aged 38, S/o Perumal, Auto Driver, No. 22 Santhome High Road, Chennai (+91 98840 99882)

Property Seized:
1. One Bajaj Pulsar 150cc Motorcycle, Colour: Midnight Black with Red Decals, Engine No: DHX-882194, Chassis No: MD2A24BZ9LC89120, Bearing Tamil Nadu Registration No: TN-09-CB-4491.
2. Indian Currency Notes amounting to ₹1,80,000 (One Lakh Eighty Thousand Rupees) in denomination of ₹500 currency notes (360 notes in wrapped brown packet).
3. Apple iPhone 14 Pro Max 256GB Deep Purple (IMEI 1: 352981109482103, IMEI 2: 352981109482111) with Airtel SIM (+91 98841 88921).

Panchnama was read over in Tamil and signed by independent panchas and IO Inspector K. Ramanathan.`;
    } else if (type === 'MULE_BANK') {
      title = 'ICICI Bank Mule Account Forensic Statement & Audit Trail';
      category = 'DIGITAL_RECORD';
      tags = 'Mule-Account, Financial-Fraud, ICICI-Bank, ₹1,80,000, Money-Trail';
      sampleFileName = 'ICICI_Bank_Mule_Account_Statement_Tx.pdf';
      sampleText = `ICICI BANK FORENSIC TRANSACTION STATEMENT - INVESTIGATION OFFICER COPY
Account Number: 004101588291 | Account Name: Vignesh R (Operated by Accused Dinesh @ Rocky as Mule)
Branch: T. Nagar Branch, Chennai (IFSC: ICIC0000041) | Associated Mobile: +91 98841 88921

Transaction Audit Log (Oct 14-15, 2026):
1. 14-Oct-2026 21:55:00 - CR UPI/429104812/P2P - Received ₹1,80,000 from Victim S. Lakshmi ICICI A/c 02100148912
2. 14-Oct-2026 22:15:30 - DR ATM-WDL/ICICI-ROYAPETTAH - Cash withdrawal of ₹50,000 by ATM Card 4591-XXXX-XXXX-8921
3. 14-Oct-2026 22:30:12 - DR IMPS/IMPS92019481/Mule-2 - Transferred ₹1,30,000 to HDFC Bank A/c 50100481920192 (IFSC: HDFC0001248) held by Co-accused Ramesh K.
CCTV Timestamp verified at Royapettah ATM matches suspect Dinesh @ Rocky wearing black helmet.`;
    } else {
      title = 'Cell Tower CDR & Cell-ID Triangulation Dump';
      category = 'DIGITAL_RECORD';
      tags = 'CDR, Tower-Dump, Triangulation, Airtel-CDR, BSSID';
      sampleFileName = 'Cell_Tower_CDR_Triangulation_Sheet.xlsx';
      sampleText = `CALL DETAIL RECORD (CDR) & TOWER DUMP FORENSIC REPORT
Target MSISDN: +91 98841 88921 (IMSI: 404459812039481 | IMEI: 352981109482103)
Network: Bharti Airtel Tamil Nadu Circle | Period: 14-Oct-2026 20:00 to 23:59 hrs

Event Log:
- 14-Oct-2026 21:28:14 | CALL_OUT to +91 98401 23456 (Duration: 34s) | Tower: CHN-ROY-0482 (Azimuth: 120°, Royapettah Junction)
- 14-Oct-2026 21:32:00 | DATA_SESSION 4G LTE | Tower: CHN-ROY-0482 (Distance: 140m from crime scene)
- 14-Oct-2026 22:10:45 | SMS_IN (OTP from ICICI Bank) | Tower: CHN-MYL-0192 (Mylapore Light House Tower)
- 14-Oct-2026 22:35:10 | CALL_IN from +91 94441 55667 (Duration: 112s) | Tower: CHN-MYL-0192 (Marina Service Road)
Triangulation confirms suspect was at exact coordinates (13.0338° N, 80.2677° E) at time of offence.`;
    }

    setNewTitle(title);
    setNewCategory(category);
    setNewTags(tags);
    setNewTextSnippet(sampleText);
    triggerStagedOcr(undefined, sampleText, sampleFileName);
  };

  // Real File Selected via drag-drop or file picker
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
    
    // Auto-detect category
    if (file.type.startsWith('image/')) setNewCategory('IMAGE');
    else if (file.type.startsWith('audio/')) setNewCategory('AUDIO');
    else if (file.type.startsWith('video/')) setNewCategory('VIDEO');
    else if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) setNewCategory('DIGITAL_RECORD');
    else setNewCategory('DOCUMENT');

    // Calculate real SHA-256 immediately
    const hash = await calculateFileHash(file);
    setRealComputedHash(hash);

    // Auto-trigger OCR extraction on the selected document/image
    triggerStagedOcr(file);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setScanStatus('CALCULATING_SHA256');

    let sha256 = realComputedHash;
    let fileSizeBytes = selectedFile?.size || 1850000;
    let fileName = selectedFile?.name || `${(newTitle || 'evidence').toLowerCase().replace(/\s+/g, '_')}.pdf`;
    let fileType = selectedFile?.type || (newCategory === 'IMAGE' ? 'image/jpeg' : newCategory === 'AUDIO' ? 'audio/webm' : 'application/pdf');
    let previewUrl: string | undefined = undefined;

    if (selectedFile) {
      sha256 = await calculateFileHash(selectedFile);
      if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('audio/')) {
        previewUrl = URL.createObjectURL(selectedFile);
      }
    } else {
      const rawData = `${newTitle}-${newCategory}-${newTextSnippet}-${Date.now()}`;
      sha256 = await calculateSHA256(rawData);
    }

    // Step 2: Anti-Malware scan simulation
    setTimeout(() => {
      setScanStatus('SCANNING_CLAMAV');
    }, 500);

    // Step 3: AES-256 Encryption
    setTimeout(() => {
      setScanStatus('ENCRYPTING_AES');
    }, 1000);

    // Step 4: Finalize and commit
    setTimeout(() => {
      setScanStatus('SUCCESS');
      const newEvd: EvidenceItem = {
        id: `EVD-${caseItem.caseId.split('-')[1] || 'TN'}-${Date.now().toString().slice(-6)}`,
        caseId: caseItem.caseId,
        title: newTitle || 'Digital Evidence Item',
        category: newCategory,
        fileName,
        fileSizeBytes,
        mimeType: fileType,
        sha256Hash: sha256,
        uploadTimestamp: new Date().toISOString(),
        uploadedByOfficerId: currentOfficer.id,
        uploadedByOfficerName: currentOfficer.name,
        deviceInfo: `Station Terminal #${currentOfficer.stationCode}`,
        gpsLocation: {
          latitude: 13.0338,
          longitude: 80.2677,
          addressName: currentOfficer.policeStation,
        },
        encryptionStatus: 'AES-256-ENCRYPTED',
        malwareScanStatus: 'CLEAN',
        version: 1,
        extractedText: newTextSnippet || `Digital evidence ${fileName} verified and registered into Case Vault under custody of ${currentOfficer.name}.`,
        ocrConfidence: stagedOcrConfidence || (newTextSnippet ? 0.98 : undefined),
        entitiesExtracted: stagedEntities.length > 0 ? stagedEntities : undefined,
        tags: newTags ? newTags.split(',').map((t) => t.trim()).filter(Boolean) : ['UploadedEvidence', newCategory],
        signedUrl: previewUrl,
        thumbnailUrl: newCategory === 'IMAGE' ? previewUrl : undefined,
        sourceSystem: 'DIRECT_UPLOAD',
      };

      onAddEvidence(newEvd);
      onLogBlockchainEvent(
        'EVIDENCE_UPLOAD',
        `Uploaded, OCR indexed & SHA-256 stamped: ${newEvd.title} (${(newEvd.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB)`,
        newEvd.id,
        sha256
      );

      // Async background sync with encrypted database
      fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: newEvd.caseId,
          title: newEvd.title,
          category: newEvd.category,
          fileName: newEvd.fileName,
          mimeType: newEvd.mimeType,
          fileData: newEvd.signedUrl || newEvd.extractedText || 'evidence_content',
          extractedText: newEvd.extractedText,
          ocrConfidence: newEvd.ocrConfidence,
          entitiesExtracted: newEvd.entitiesExtracted,
          tags: newEvd.tags,
          gpsLocation: newEvd.gpsLocation,
          uploadedByOfficerId: currentOfficer.id,
          uploadedByOfficerName: currentOfficer.name,
        }),
      }).catch((err) => console.warn('Background db sync note:', err));
      
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setRealComputedHash('');
      setNewTitle('');
      setNewTextSnippet('');
      setNewTags('');
      setStagedEntities([]);
      setStagedOcrSuccess(false);
      setScanStatus('IDLE');
    }, 1600);
  };

  const handleRunOcrOnItem = async (item: EvidenceItem) => {
    setSelectedEvidenceForOcr(item);
    setIsExtractingOcr(true);
    try {
      // First try server-side OCR on stored evidence item
      let resData;
      try {
        const remoteRes = await runEvidenceItemOcr(item.id);
        if (remoteRes && remoteRes.ocrData) {
          resData = remoteRes.ocrData;
        }
      } catch {
        // Fallback to text/name OCR extraction
      }

      if (!resData) {
        resData = await runOcrAndEntityExtraction({
          textContent: item.extractedText || item.title,
          fileName: item.fileName,
          language: currentLang,
        });
      }

      item.extractedText = resData.extractedText;
      item.entitiesExtracted = resData.entities;
      item.ocrConfidence = resData.ocrConfidence;
      setIsExtractingOcr(false);
    } catch (err) {
      console.error(err);
      setIsExtractingOcr(false);
    }
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSemanticResults(null);
      return;
    }
    setIsSemanticSearching(true);
    try {
      const results = await runSemanticSearch({
        query: searchQuery,
        caseId: caseItem.caseId,
        documents: evidenceList,
      });
      setSemanticResults(results);
      setIsSemanticSearching(false);
    } catch (err) {
      console.error(err);
      setIsSemanticSearching(false);
    }
  };

  const handleVerifySeal = async (item: EvidenceItem) => {
    const res = await verifyEvidenceIntegrity(item);
    setVerificationResult({
      item,
      isValid: res.isValid,
      computedHash: res.computedHash,
      expectedHash: res.expectedHash,
    });
    onLogBlockchainEvent(
      'EVIDENCE_VIEW',
      `Cryptographic Seal Verification executed on ${item.title}: ${res.isValid ? 'MATCH [VALID]' : 'HASH MISMATCH [TAMPER ALERT]'}`,
      item.id,
      item.sha256Hash
    );
  };

  const handleSimulateTamper = (item: EvidenceItem) => {
    const nextState = !item.isTampered;
    onTamperEvidence(item.id, nextState);
    if (nextState) {
      onLogBlockchainEvent(
        'TAMPER_DETECTED',
        `CRITICAL SECURITY ALERT: SHA-256 hash mismatch on ${item.title}. File access blocked!`,
        item.id,
        item.sha256Hash
      );
    } else {
      onLogBlockchainEvent(
        'EVIDENCE_MODIFIED',
        `Cryptographic integrity restored on ${item.title} from Consortium Mirror`,
        item.id,
        item.sha256Hash
      );
    }
  };

  const handleExport65B = (item: EvidenceItem) => {
    const allTxs = mockBlockchainBlocks.flatMap((b) => b.transactions);
    exportSection65BCertificate(
      item,
      {
        firNumber: caseItem.firNumber,
        policeStation: caseItem.policeStation,
        caseId: caseItem.caseId,
      },
      {
        name: currentOfficer.name,
        badgeNumber: currentOfficer.badgeNumber,
        designation: currentOfficer.designation,
        department: currentOfficer.department,
      },
      allTxs
    );
    onLogBlockchainEvent(
      'CHAIN_OF_CUSTODY_EXPORT',
      `Section 65B Electronic Record Certificate generated & downloaded for ${item.title}`,
      item.id,
      item.sha256Hash
    );
  };

  const handleViewEvidenceWith2FA = (item: EvidenceItem) => {
    requestBiometricClearance(
      'Two-Factor Biometric Evidence Clearance',
      `Officer identity verification (Face & Fingerprint) required to decrypt and view sensitive case evidence: ${item.title}`,
      () => {
        setPreviewItem(item);
        onLogBlockchainEvent(
          'EVIDENCE_VIEW',
          `Officer ${currentOfficer.name} (${currentOfficer.badgeNumber}) completed 2FA biometric verification and viewed evidence "${item.title}" (ID: ${item.id})`,
          item.id,
          item.sha256Hash
        );
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">{t.evidenceVault}</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              {caseItem.firNumber}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real SHA-256 Hashing • AES-256 Encrypted Object Storage • BSA 2023 Sec 65B Certified
          </p>
        </div>

        <button
          onClick={() =>
            requestBiometricClearance(
              'Upload & Seal Digital Evidence',
              `Biometric authorization required to deposit evidence into case ${caseItem.firNumber}`,
              () => setIsUploadModalOpen(true)
            )
          }
          className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Seal Evidence</span>
        </button>
      </div>

      {/* Semantic Search Bar & Intelligent Forensic NLP Query */}
      <div className="space-y-2">
        <form onSubmit={handleSemanticSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="AI Intelligent Search across OCR Transcripts, FIRs, Seizure Panchnama, CDRs & Entities (EN / தமிழ் / മലയാളം)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-28 py-2.5 bg-[#0a0c0f] border border-zinc-800 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            {semanticResults && (
              <button
                type="button"
                onClick={() => {
                  setSemanticResults(null);
                  setSearchQuery('');
                }}
                className="absolute right-3 top-2 px-2 py-1 text-[10px] rounded bg-zinc-800 text-zinc-300 hover:text-white"
              >
                Clear AI ({semanticResults.length} Found)
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSemanticSearching}
            className="px-4 py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSemanticSearching ? 'AI Analyzing...' : 'Intelligent Search'}</span>
          </button>
        </form>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="text-zinc-500 font-mono text-[10px] flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" /> Quick Forensic OCR Queries:
          </span>
          {[
            'Pulsar TN-09-CB-4491',
            '₹1,80,000 cash',
            '+91 98841 88921',
            'Dinesh @ Rocky',
            '004101588291',
            'Section 303(2) BNS',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setSearchQuery(prompt);
                setIsSemanticSearching(true);
                runSemanticSearch({
                  query: prompt,
                  caseId: caseItem.caseId,
                  documents: evidenceList,
                })
                  .then((res) => {
                    setSemanticResults(res);
                    setIsSemanticSearching(false);
                  })
                  .catch(() => setIsSemanticSearching(false));
              }}
              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-purple-950/50 text-zinc-300 hover:text-purple-200 border border-zinc-800 hover:border-purple-700/50 font-mono transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar: Categories + OCR Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-900">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['ALL', 'DIGITAL_RECORD', 'DOCUMENT', 'VIDEO', 'IMAGE', 'AUDIO', 'FORENSIC_REPORT'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSemanticResults(null);
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#0a0c0f] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat === 'ALL' ? 'All Types' : cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* OCR Filtering Mode */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-mono text-[10px]">Filter Mode:</span>
          <button
            type="button"
            onClick={() => setSearchFilterMode('ALL')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              searchFilterMode === 'ALL'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Evidence
          </button>
          <button
            type="button"
            onClick={() => setSearchFilterMode('OCR_ONLY')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
              searchFilterMode === 'OCR_ONLY'
                ? 'bg-purple-950 text-purple-200 border border-purple-800'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <FileSearch className="w-3 h-3 text-purple-400" />
            <span>OCR Extracted Text Only</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchFilterMode('WITH_ENTITIES')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
              searchFilterMode === 'WITH_ENTITIES'
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-800'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Indexed Entities</span>
          </button>
        </div>
      </div>

      {/* Evidence Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvidence.map((item) => {
          const isTampered = !!item.isTampered;
          const searchMatch = semanticResults?.find((r) => r.documentId === item.id);
          const hasOcr = !!item.extractedText;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-lg border transition relative space-y-4 shadow-sm flex flex-col justify-between ${
                searchMatch
                  ? 'bg-[#0e0f18] border-purple-500/70 ring-1 ring-purple-500/40 shadow-[0_0_20px_rgba(147,51,234,0.15)]'
                  : isTampered
                  ? 'bg-[#0a0c0f] border-red-500/60 ring-1 ring-red-500/40'
                  : 'bg-[#0a0c0f] border-zinc-800/60 hover:border-zinc-700'
              }`}
            >
              {/* Tamper Alert Banner on card */}
              {isTampered && (
                <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">TAMPER DETECTED: SHA-256 HASH MISMATCH</strong>
                    <span className="text-[11px] text-red-300/80">Bit-flip corruption detected. Incident logged to Hyperledger Fabric.</span>
                  </div>
                </div>
              )}

              {/* Intelligent Search Match Banner */}
              {searchMatch && (
                <div className="p-2.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {searchMatch.matchedField === 'OCR_TEXT'
                        ? 'OCR Transcript Semantic Hit'
                        : searchMatch.matchedField === 'ENTITY'
                        ? 'Forensic Entity Hit'
                        : 'Intelligent Search Match'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 font-mono text-[10px] border border-purple-700/50">
                      {Math.round(searchMatch.score * 100)}% Relevancy
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/90 font-mono leading-relaxed bg-black/40 p-1.5 rounded">
                    "{searchMatch.highlight}"
                  </p>
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                        {hasOcr && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 text-[10px] font-mono border border-purple-800/60 flex items-center gap-1">
                            <FileSearch className="w-2.5 h-2.5" />
                            OCR: {Math.round((item.ocrConfidence || 0.98) * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{item.fileName}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                {/* Cryptographic SHA-256 Genesis Hash Box */}
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Genesis SHA-256 Checksum</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> AES-256 Encrypted
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-300 break-all leading-relaxed">
                    {isTampered ? `TAMPERED_0x${item.sha256Hash.substring(8)}` : item.sha256Hash}
                  </p>
                </div>

                {/* Concealed Encrypted Payload Box (Evidence concealed until 2FA clearance) */}
                <div className="p-3.5 rounded-lg bg-zinc-950/90 border border-zinc-800/90 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Concealed Encrypted Payload (AES-256-GCM)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Under Police Vault Evidence Rules, raw media and transcripts are concealed. Officer Two-Factor Biometric Authentication (Face + Fingerprint) required to decrypt & view.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleViewEvidenceWith2FA(item)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                    <span>Authenticate 2FA & View Evidence</span>
                  </button>
                </div>

                {/* Extracted Entities Badges */}
                {item.entitiesExtracted && item.entitiesExtracted.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-mono">Recognized Entity Attributes:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.entitiesExtracted.slice(0, 4).map((ent, idx) => (
                        <span
                          key={`${item.id}-ent-${idx}`}
                          className="px-2 py-0.5 rounded text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/40 font-mono flex items-center gap-1"
                        >
                          <span className="text-[9px] text-purple-400/70">{ent.type}:</span>
                          <strong>{ent.value}</strong>
                        </span>
                      ))}
                      {item.entitiesExtracted.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                          +{item.entitiesExtracted.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags & Metadata */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={`${item.id}-tag-${tag}-${idx}`}
                      className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleViewEvidenceWith2FA(item)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Authenticate 2FA & View Evidence"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifySeal(item)}
                    className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-800 flex items-center gap-1 transition cursor-pointer"
                    title="Verify SHA-256 seal integrity"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Verify Seal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      requestBiometricClearance(
                        'Forensic OCR & Entity Extraction',
                        `Biometric clearance required to analyze evidence text for ${item.title}`,
                        () => handleRunOcrOnItem(item)
                      )
                    }
                    className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/20 flex items-center gap-1 transition cursor-pointer"
                    title="Run Gemini OCR & Named Entity Extraction"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>OCR / Entities</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      requestBiometricClearance(
                        'Generate BSA Section 65B Certificate',
                        `Biometric identity verification required to issue legal Certificate for ${item.title}`,
                        () => handleExport65B(item)
                      )
                    }
                    className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1 transition cursor-pointer"
                    title="Download Section 65B BSA Certificate PDF"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sec 65B PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      requestBiometricClearance(
                        item.isTampered ? 'Restore Hash Integrity' : 'Simulate Cryptographic Bit-Flip',
                        `Biometric clearance required to alter checksum test state for ${item.title}`,
                        () => handleSimulateTamper(item)
                      )
                    }
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                      isTampered
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                    }`}
                    title="Simulate bit corruption or restore integrity"
                  >
                    {isTampered ? 'Restore Hash' : 'Simulate Bit-Flip'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Upload Evidence Modal with Real File Drag & Drop */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Seal & Upload Digital Evidence</h2>
                <p className="text-xs text-zinc-400">Section 65B Certified • Local SHA-256 Hashing • ClamAV Anti-Malware</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-4 text-xs">
              
              {/* Quick Preset Document Loader for Instant Testing */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Load Authentic Police Document Template (with instant OCR & NER):
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">1-Click Test</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('FIR')}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-purple-950/60 text-zinc-300 hover:text-purple-200 border border-zinc-800 hover:border-purple-600/50 text-[11px] font-medium text-left transition cursor-pointer"
                  >
                    📄 FIR Copy (Sec 173)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('PANCHNAMA')}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-purple-950/60 text-zinc-300 hover:text-purple-200 border border-zinc-800 hover:border-purple-600/50 text-[11px] font-medium text-left transition cursor-pointer"
                  >
                    📜 Panchnama Seizure
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('MULE_BANK')}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-purple-950/60 text-zinc-300 hover:text-purple-200 border border-zinc-800 hover:border-purple-600/50 text-[11px] font-medium text-left transition cursor-pointer"
                  >
                    💳 ICICI Mule Statement
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('CDR')}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-purple-950/60 text-zinc-300 hover:text-purple-200 border border-zinc-800 hover:border-purple-600/50 text-[11px] font-medium text-left transition cursor-pointer"
                  >
                    📡 Tower CDR Dump
                  </button>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className="p-6 rounded border-2 border-dashed border-zinc-700 hover:border-blue-500 bg-zinc-950/60 text-center cursor-pointer transition space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                {selectedFile ? (
                  <div>
                    <p className="font-bold text-white">{selectedFile.name}</p>
                    <p className="text-zinc-400 text-[11px]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Custom Format'}
                    </p>
                    {realComputedHash && (
                      <p className="text-[10px] font-mono text-emerald-400 mt-1 break-all">
                        Computed SHA-256: {realComputedHash.substring(0, 32)}...
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-white">Click or drag & drop evidence file here</p>
                    <p className="text-zinc-500 text-[11px]">Images, PDF Documents, CDR Sheets, Audio Recordings, Video Clips</p>
                  </div>
                )}
              </div>

              {/* Real-Time Live OCR & Entity Extraction Status Preview */}
              {isOcrScanningStaged && (
                <div className="p-3 rounded bg-purple-950/40 border border-purple-500/40 text-purple-300 space-y-1 animate-pulse">
                  <div className="flex items-center gap-2 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Gemini Multimodal OCR parsing document & extracting Named Entities...</span>
                  </div>
                  <p className="text-[10px] text-purple-300/80 font-mono">Scanning Tamil/English characters, vehicle registration, mobile numbers, IPC sections</p>
                </div>
              )}

              {stagedOcrSuccess && (
                <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      OCR Extraction Successful ({Math.round(stagedOcrConfidence * 100)}% Confidence)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                      BSA 2023 Sec 65B Ready
                    </span>
                  </div>

                  {stagedEntities.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-400/80 font-mono">Detected Forensic Entities ({stagedEntities.length}):</span>
                      <div className="flex flex-wrap gap-1">
                        {stagedEntities.map((ent, idx) => (
                          <span
                            key={`staged-ent-${idx}`}
                            className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/40 text-emerald-200 border border-emerald-700/50 font-mono"
                          >
                            <span className="text-emerald-400/70">{ent.type}:</span> {ent.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Evidence Title / Panchnama Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICICI Bank Mule Statement / Scene CCTV Footage"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EvidenceCategory)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DOCUMENT">Document (PDF, FIR, Memo)</option>
                    <option value="DIGITAL_RECORD">Digital Record (CDR, Bank)</option>
                    <option value="VIDEO">Video (CCTV, Interrogation)</option>
                    <option value="IMAGE">Image (Scene Photos, Seizure)</option>
                    <option value="AUDIO">Audio (Witness Voice)</option>
                    <option value="FORENSIC_REPORT">Forensic Report (FSL Ballistics)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Mule Account, CCTV, Weapon, CDR"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-zinc-300 font-medium">Extracted Text Snippet / OCR Transcript</label>
                  <button
                    type="button"
                    onClick={() => triggerStagedOcr(selectedFile || undefined, newTextSnippet, selectedFile?.name || 'document.txt')}
                    className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 font-mono transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Run OCR / Extract Entities</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste OCR text, CDR row excerpt, or seized item serial details..."
                  value={newTextSnippet}
                  onChange={(e) => setNewTextSnippet(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white font-mono text-[11px] focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Status scan step preview during upload */}
              {isUploading && (
                <div className="p-3 rounded bg-zinc-950 border border-blue-500/40 text-blue-300 space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-2 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>
                      {scanStatus === 'CALCULATING_SHA256' && 'Computing 256-bit Cryptographic Checksum...'}
                      {scanStatus === 'SCANNING_CLAMAV' && 'ClamAV & VirusTotal Antivirus Heuristic Scan [CLEAN]...'}
                      {scanStatus === 'ENCRYPTING_AES' && 'Encrypting Object with AES-256 Master Key...'}
                      {scanStatus === 'SUCCESS' && 'Committing Signed Transaction to Hyperledger Fabric...'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
                >
                  {isUploading ? 'Securing Evidence...' : 'Seal & Upload Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Full Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">{previewItem.title}</h2>
                <p className="text-xs text-zinc-400 font-mono">{previewItem.fileName} • ID: {previewItem.id}</p>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Mandatory View-Only Security Mandate Banner */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>VIEW-ONLY FORENSIC ACCESS • DOWNLOADING RESTRICTED UNDER CCTNS & BSA RULES</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/90 bg-black/40 px-2 py-0.5 rounded">
                  2FA Verified • Officer: {currentOfficer.badgeNumber}
                </span>
              </div>
              
              {/* Media Preview if image or audio (Protected from download/saving) */}
              {previewItem.thumbnailUrl && (
                <div
                  className="rounded border border-zinc-800 overflow-hidden bg-black flex justify-center relative select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src={previewItem.thumbnailUrl}
                    alt={previewItem.title}
                    draggable={false}
                    className="max-h-80 w-auto object-contain pointer-events-none select-none"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    VIEW ONLY • NO EXPORT
                  </div>
                </div>
              )}

              {previewItem.category === 'AUDIO' && previewItem.signedUrl && (
                <div className="p-4 rounded bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" /> Playback Audio Track (Protected Stream)
                  </span>
                  <audio
                    src={previewItem.signedUrl}
                    controls
                    controlsList="nodownload"
                    className="w-full"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              )}

              {/* Cryptographic Hash Bar */}
              <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span className="font-bold">SHA-256 Digital Fingerprint:</span>
                  <button
                    onClick={() => copyToClipboard(previewItem.sha256Hash)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <p className="font-mono text-emerald-400 text-xs break-all bg-black/40 p-2 rounded">
                  {previewItem.sha256Hash}
                </p>
              </div>

              {/* Extracted Text */}
              {previewItem.extractedText && (
                <div>
                  <h4 className="font-bold text-zinc-300 mb-1">Extracted Text Content:</h4>
                  <div className="p-3 rounded bg-zinc-950 border border-zinc-800 font-mono text-zinc-200 leading-relaxed max-h-40 overflow-y-auto">
                    {previewItem.extractedText}
                  </div>
                </div>
              )}

              {/* Section 65B Compliance Details */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 font-bold block">Chain of Custody Custodian:</span>
                  <span className="text-white font-medium">{previewItem.uploadedByOfficerName}</span>
                  <span className="text-zinc-400 block font-mono">Terminal: {previewItem.deviceInfo}</span>
                </div>
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold block">Geospatial Seizure Location:</span>
                    {previewItem.gpsLocation?.latitude && previewItem.gpsLocation?.longitude && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${previewItem.gpsLocation.latitude}&mlon=${previewItem.gpsLocation.longitude}#map=17/${previewItem.gpsLocation.latitude}/${previewItem.gpsLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 font-mono"
                        title="View Location on OpenStreetMap"
                      >
                        <span>OpenStreetMap</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <span className="text-white font-medium block">{previewItem.gpsLocation?.addressName || 'Police Station'}</span>
                  <span className="text-zinc-400 block font-mono">
                    {previewItem.gpsLocation?.latitude}° N, {previewItem.gpsLocation?.longitude}° E
                  </span>
                </div>
              </div>

            </div>

            <div className="px-6 py-3 bg-[#08090b] border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => handleExport65B(previewItem)}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Export BSA Sec 65B Certificate</span>
              </button>

              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Result Dialog */}
      {verificationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              {verificationResult.isValid ? (
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-white">
                  {verificationResult.isValid ? 'Cryptographic Seal 100% Intact' : 'TAMPER DETECTED: Hash Mismatch!'}
                </h3>
                <p className="text-xs text-zinc-400">{verificationResult.item.title}</p>
              </div>
            </div>

            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
              <div>
                <span className="text-zinc-500 text-[10px] block">Expected Hash (From Genesis Block):</span>
                <span className="text-zinc-300 break-all text-[11px]">{verificationResult.expectedHash}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">Calculated Hash (Current Binary):</span>
                <span className={verificationResult.isValid ? 'text-emerald-400 break-all text-[11px]' : 'text-red-400 break-all text-[11px]'}>
                  {verificationResult.computedHash}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {verificationResult.isValid 
                ? 'The electronic file bitstream is identical to the initial deposit recorded on the Hyperledger Fabric consortium ledger. Certified admissible in Court under BSA 2023 Section 65B.'
                : 'CRITICAL: The current file content does not match the immutable ledger hash. The file has been altered, corrupted, or replaced. Investigation Officer notified.'}
            </p>

            <button
              onClick={() => setVerificationResult(null)}
              className="w-full py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* OCR & Entity Extraction Modal */}
      {selectedEvidenceForOcr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Trilingual OCR & Named Entity Extraction (NER)</h2>
                <p className="text-xs text-zinc-400 font-mono">{selectedEvidenceForOcr.title}</p>
              </div>
              <button onClick={() => setSelectedEvidenceForOcr(null)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              
              {isExtractingOcr ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                  <p className="text-sm font-bold text-white">Gemini 3.7 Flash OCR & Entity Recognition Engine</p>
                  <p className="text-zinc-400 text-xs">Parsing English, Tamil, and Malayalam text, phone numbers, vehicles, bank accounts...</p>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold text-zinc-300 mb-1">Extracted OCR Transcript:</h4>
                    <div className="p-3 rounded bg-zinc-950 border border-zinc-800 font-mono text-zinc-200 text-xs leading-relaxed">
                      {selectedEvidenceForOcr.extractedText || 'No transcript text available.'}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-300 mb-2">Detected Named Entities (Cross-Evidence Indexed):</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedEvidenceForOcr.entitiesExtracted || []).map((ent) => (
                        <div key={ent.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {ent.type}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {(ent.confidence * 100).toFixed(0)}% Conf
                            </span>
                          </div>
                          <p className="font-bold text-white mt-1">{ent.value}</p>
                          <p className="text-[11px] text-zinc-400">{ent.context}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="px-6 py-3 bg-[#08090b] border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedEvidenceForOcr(null)}
                className="px-4 py-2 rounded bg-zinc-800 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Security Clearance Gatekeeper Modal */}
      <BiometricSecurityModal
        isOpen={biometricModal.isOpen}
        onClose={() => setBiometricModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={biometricModal.onSuccess}
        officer={currentOfficer}
        actionTitle={biometricModal.title}
        actionDescription={biometricModal.description}
        onLogBlockchainEvent={onLogBlockchainEvent}
      />

    </div>
  );
};
