import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { EvidenceCategory, EvidenceItem, FIRDetails, LanguageCode, OfficerUser } from '../types';
import { calculateSHA256, verifyEvidenceIntegrity, exportSection65BCertificate } from '../services/cryptoUtils';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING_CLAMAV' | 'CALCULATING_SHA256' | 'ENCRYPTING_AES' | 'SUCCESS'>('IDLE');
  
  // OCR / Entity Extraction modal state
  const [selectedEvidenceForOcr, setSelectedEvidenceForOcr] = useState<EvidenceItem | null>(null);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  
  // Semantic Search state
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<{ documentId: string; score: number; highlight: string }[] | null>(null);

  // New Evidence Upload Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EvidenceCategory>('DOCUMENT');
  const [newTags, setNewTags] = useState('');
  const [newTextSnippet, setNewTextSnippet] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

  const handleFileUploadSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setScanStatus('CALCULATING_SHA256');

    // 1. Calculate SHA-256
    const rawData = `${newTitle}-${newCategory}-${newTextSnippet}-${Date.now()}`;
    const sha256 = await calculateSHA256(rawData);

    // 2. ClamAV scan simulation
    setTimeout(() => {
      setScanStatus('SCANNING_CLAMAV');
    }, 600);

    // 3. AES-256 Encryption simulation
    setTimeout(() => {
      setScanStatus('ENCRYPTING_AES');
    }, 1300);

    // 4. Complete
    setTimeout(() => {
      setScanStatus('SUCCESS');
      const newEvd: EvidenceItem = {
        id: `EVD-${caseItem.caseId.split('-')[1] || 'TN'}-${Date.now().toString().slice(-6)}`,
        caseId: caseItem.caseId,
        title: newTitle || 'Digital Evidence Item',
        category: newCategory,
        fileName: `${(newTitle || 'evidence').toLowerCase().replace(/\s+/g, '_')}_record.${newCategory === 'DIGITAL_RECORD' ? 'csv' : newCategory === 'IMAGE' ? 'jpg' : 'pdf'}`,
        fileSizeBytes: Math.floor(Math.random() * 5000000) + 1500000,
        mimeType: newCategory === 'DIGITAL_RECORD' ? 'text/csv' : newCategory === 'IMAGE' ? 'image/jpeg' : 'application/pdf',
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
        extractedText: newTextSnippet || 'Digital record registered and cryptographically stamped.',
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        signedUrl: `https://casemind.police.internal/evidence/signed/${sha256.slice(0, 10)}.enc?exp=3600`,
        sourceSystem: 'DIRECT_UPLOAD',
      };

      onAddEvidence(newEvd);
      onLogBlockchainEvent('EVIDENCE_UPLOAD', `Uploaded and SHA-256 stamped: ${newEvd.title}`, newEvd.id, sha256);
      
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setNewTitle('');
      setNewTextSnippet('');
      setNewTags('');
      setScanStatus('IDLE');
    }, 2000);
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

  const handleSimulateTamper = (item: EvidenceItem) => {
    const nextState = !item.isTampered;
    onTamperEvidence(item.id, nextState);
    if (nextState) {
      onLogBlockchainEvent('TAMPER_DETECTED', `CRITICAL SECURITY ALERT: SHA-256 hash mismatch on ${item.title}. File access blocked!`, item.id, item.sha256Hash);
    } else {
      onLogBlockchainEvent('EVIDENCE_MODIFIED', `Integrity restored on ${item.title} from backup`, item.id, item.sha256Hash);
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
    onLogBlockchainEvent('CHAIN_OF_CUSTODY_EXPORT', `Section 65B Electronic Record Certificate generated for ${item.title}`, item.id, item.sha256Hash);
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
            AES-256 Encrypted Object Storage • ClamAV Anti-Malware Protected • 1-Hour Signed URLs
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition"
        >
          <Upload className="w-4 h-4" />
          <span>{t.uploadEvidence}</span>
        </button>
      </div>

      {/* Semantic Search Bar */}
      <form onSubmit={handleSemanticSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="AI Semantic Search (e.g., 'Find all bank statements from August 2026' in EN/தமிழ்/മലയാളം)..."
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

      {/* Category Tabs */}
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

      {/* Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvidence.map((item) => {
          const isTampered = !!item.isTampered;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-lg border transition relative space-y-4 shadow-sm ${
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
                    <span className="text-[11px] text-red-300/80">File access has been restricted. Security incident committed to Hyperledger Fabric.</span>
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide">{item.title}</h3>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{item.fileName} • {(item.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-blue-400 border border-zinc-800 shrink-0">
                  {item.category}
                </span>
              </div>

              {/* SHA-256 Cryptographic Fingerprint Box */}
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Lock className="w-3 h-3 text-blue-400" /> SHA-256 Hash Seal
                  </span>
                  <span className={`font-semibold font-mono text-[10px] ${isTampered ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isTampered ? 'MISMATCH / CORRUPTED' : 'VERIFIED IMMUTABLE'}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-zinc-300 break-all select-all">
                  {isTampered ? `TAMPERED_${item.sha256Hash.slice(9)}` : item.sha256Hash}
                </p>
              </div>

              {/* Text content / Extracted info preview */}
              {item.extractedText && (
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/60 text-xs text-zinc-300">
                  <p className="text-zinc-500 text-[9px] font-semibold uppercase tracking-widest mb-1">Extracted Transcript / Content:</p>
                  <p className="line-clamp-2 text-zinc-300 leading-relaxed text-[11px] font-mono">
                    {item.extractedText}
                  </p>
                </div>
              )}

              {/* Tags & Entities */}
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    #{tag}
                  </span>
                ))}
                {item.entitiesExtracted && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {item.entitiesExtracted.length} Entities Indexed
                  </span>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs">
                
                {/* Security badges */}
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> ClamAV Clean
                  </span>
                  <span>•</span>
                  <span>AES-256</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-1.5">
                  
                  {/* Tamper Test Simulation Button */}
                  <button
                    onClick={() => handleSimulateTamper(item)}
                    title="Simulate modifying file bytes to test automated tamper detection"
                    className={`px-2 py-1 text-[11px] rounded border font-medium transition ${
                      isTampered
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                        : 'bg-zinc-900 text-zinc-400 hover:text-red-400 border-zinc-800'
                    }`}
                  >
                    {isTampered ? 'Restore Clean Hash' : 'Simulate Tamper'}
                  </button>

                  {/* OCR & Entity Extract */}
                  <button
                    onClick={() => handleRunOcrOnItem(item)}
                    className="px-2.5 py-1 text-[11px] rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>OCR / NER</span>
                  </button>

                  {/* Section 65B Certificate PDF */}
                  <button
                    onClick={() => handleExport65B(item)}
                    className="px-2.5 py-1 text-[11px] rounded bg-zinc-900 hover:bg-zinc-800 text-blue-300 border border-zinc-800 flex items-center gap-1 transition"
                  >
                    <FileCheck2 className="w-3 h-3" />
                    <span>Sec 65B PDF</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Upload Evidence Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Upload Digital Evidence to Secure Vault</h2>
                <p className="text-xs text-zinc-400">Automated SHA-256 calculation, ClamAV scan, and AES-256 encryption</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleFileUploadSimulation} className="p-6 space-y-4 text-xs">
              
              {/* Drag & drop box */}
              <div className="p-6 rounded border-2 border-dashed border-zinc-800 bg-zinc-950/60 text-center hover:border-blue-500/50 transition">
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-zinc-200 font-semibold">{t.dragDropText}</p>
                <p className="text-zinc-500 text-[11px] mt-1">PDF, DOCX, CCTV MP4, Audio WAV, Bank CSV, Forensic Reports (Max 100MB)</p>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspect WhatsApp Chat Export / ATM CCTV 12:05 PM"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EvidenceCategory)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DOCUMENT">Document (FIR, Statements)</option>
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
                <label className="block text-zinc-300 font-medium mb-1">Extracted Text Snippet / Metadata (Optional)</label>
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
                      {scanStatus === 'CALCULATING_SHA256' && 'Computing 256-bit Cryptographic Hash...'}
                      {scanStatus === 'SCANNING_CLAMAV' && 'ClamAV & VirusTotal Antivirus Heuristic Scan...'}
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
