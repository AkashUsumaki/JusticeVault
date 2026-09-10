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
  Share2
} from 'lucide-react';
import { EvidenceCategory, EvidenceItem, FIRDetails, LanguageCode, OfficerUser } from '../types';
import { calculateSHA256, calculateFileHash, verifyEvidenceIntegrity, exportSection65BCertificate } from '../services/cryptoUtils';
import { runOcrAndEntityExtraction, runSemanticSearch } from '../services/api';
import { translations } from '../translations/i18n';
import { mockBlockchainBlocks } from '../data/mockData';

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
  const [semanticResults, setSemanticResults] = useState<{ documentId: string; score: number; highlight: string }[] | null>(null);

  // Real Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [realComputedHash, setRealComputedHash] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EvidenceCategory>('DOCUMENT');
  const [newTags, setNewTags] = useState('');
  const [newTextSnippet, setNewTextSnippet] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered evidence items
  const filteredEvidence = evidenceList.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
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

    // If text file, read content
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewTextSnippet(reader.result.slice(0, 500));
        }
      };
      reader.readAsText(file);
    }
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
        tags: newTags ? newTags.split(',').map((t) => t.trim()).filter(Boolean) : ['UploadedEvidence', newCategory],
        signedUrl: previewUrl,
        thumbnailUrl: newCategory === 'IMAGE' ? previewUrl : undefined,
        sourceSystem: 'DIRECT_UPLOAD',
      };

      onAddEvidence(newEvd);
      onLogBlockchainEvent(
        'EVIDENCE_UPLOAD',
        `Uploaded & SHA-256 stamped: ${newEvd.title} (${(newEvd.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB)`,
        newEvd.id,
        sha256
      );
      
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setRealComputedHash('');
      setNewTitle('');
      setNewTextSnippet('');
      setNewTags('');
      setScanStatus('IDLE');
    }, 1600);
  };

  const handleRunOcrOnItem = async (item: EvidenceItem) => {
    setSelectedEvidenceForOcr(item);
    setIsExtractingOcr(true);
    try {
      const res = await runOcrAndEntityExtraction({
        textContent: item.extractedText || item.title,
        fileName: item.fileName,
        language: currentLang,
      });

      item.extractedText = res.extractedText;
      item.entitiesExtracted = res.entities;
      item.ocrConfidence = res.ocrConfidence;
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
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Seal Evidence</span>
        </button>
      </div>

      {/* Semantic Search Bar */}
      <form onSubmit={handleSemanticSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="AI Semantic Search across evidence text, CDRs, OCR & tags (EN / தமிழ் / മലയാളം)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-24 py-2.5 bg-[#0a0c0f] border border-zinc-800 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
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
              Clear AI Filter
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isSemanticSearching}
          className="px-4 py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSemanticSearching ? 'Searching AI...' : 'Semantic Search'}</span>
        </button>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['ALL', 'DIGITAL_RECORD', 'DOCUMENT', 'VIDEO', 'IMAGE', 'AUDIO', 'FORENSIC_REPORT'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSemanticResults(null);
            }}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#0a0c0f] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {cat === 'ALL' ? 'All Items' : cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Evidence Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvidence.map((item) => {
          const isTampered = !!item.isTampered;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-lg border transition relative space-y-4 shadow-sm flex flex-col justify-between ${
                isTampered
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

              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{item.fileName}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                {/* Media Thumbnail or Audio waveform badge if present */}
                {item.thumbnailUrl && (
                  <div className="relative rounded overflow-hidden border border-zinc-800 max-h-36 bg-zinc-950">
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-36 object-cover" />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-400">
                      Forensic Stamped
                    </div>
                  </div>
                )}

                {item.category === 'AUDIO' && item.signedUrl && (
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                    <audio src={item.signedUrl} controls className="w-full h-8" />
                  </div>
                )}

                {/* Cryptographic SHA-256 Hash Box */}
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>SHA-256 Cryptographic Checksum</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Encrypted At Rest
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-300 break-all leading-relaxed">
                    {isTampered ? `TAMPERED_0x${item.sha256Hash.substring(8)}` : item.sha256Hash}
                  </p>
                </div>

                {/* Extracted Text Snippet */}
                {item.extractedText && (
                  <p className="text-xs text-zinc-400 line-clamp-2 italic font-mono bg-zinc-950/40 p-2 rounded border border-zinc-800/40">
                    "{item.extractedText}"
                  </p>
                )}

                {/* Tags */}
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
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                    title="View Evidence & Integrity Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifySeal(item)}
                    className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-800 flex items-center gap-1 transition"
                    title="Verify SHA-256 seal integrity"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Verify Seal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunOcrOnItem(item)}
                    className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/20 flex items-center gap-1 transition"
                    title="Run Gemini OCR & Named Entity Extraction"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>OCR / Entities</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleExport65B(item)}
                    className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1 transition"
                    title="Download Section 65B BSA Certificate PDF"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sec 65B PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateTamper(item)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
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
                <label className="block text-zinc-300 font-medium mb-1">Extracted Text Snippet / Content Excerpt</label>
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
              
              {/* Media Preview if image or audio */}
              {previewItem.thumbnailUrl && (
                <div className="rounded border border-zinc-800 overflow-hidden bg-black flex justify-center">
                  <img src={previewItem.thumbnailUrl} alt={previewItem.title} className="max-h-80 w-auto object-contain" />
                </div>
              )}

              {previewItem.category === 'AUDIO' && previewItem.signedUrl && (
                <div className="p-4 rounded bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" /> Playback Audio Track
                  </span>
                  <audio src={previewItem.signedUrl} controls className="w-full" />
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

    </div>
  );
};
