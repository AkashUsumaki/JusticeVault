import React, { useState, useEffect } from 'react';
import {
  Database,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Camera,
  Radio,
  FileCheck,
  MapPin,
  Clock,
  HardDrive,
  Key,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';
import { EvidenceItem, DatabaseStats, FIRDetails } from '../types';

interface SecureDatabaseViewProps {
  selectedCase: FIRDetails | null;
  onEvidenceUpdated?: () => void;
  onSelectEvidence?: (evidence: EvidenceItem) => void;
}

export const SecureDatabaseView: React.FC<SecureDatabaseViewProps> = ({
  selectedCase,
  onEvidenceUpdated,
  onSelectEvidence,
}) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('IMAGE');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFileData, setUploadFileData] = useState<string>('');
  const [uploadMimeType, setUploadMimeType] = useState<string>('image/jpeg');
  const [uploadGpsLat, setUploadGpsLat] = useState<number>(13.0418);
  const [uploadGpsLng, setUploadGpsLng] = useState<number>(80.2342);
  const [uploadAddress, setUploadAddress] = useState<string>('Usman Road, T. Nagar, Chennai');
  const [uploadTags, setUploadTags] = useState<string>('CCTV, Kiosk, Field');
  const [uploadText, setUploadText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tamperLoadingId, setTamperLoadingId] = useState<string | null>(null);

  // Fetch Database Status and Evidence
  const fetchDatabaseData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch('/api/database/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      const caseQuery = selectedCase ? `?caseId=${encodeURIComponent(selectedCase.caseId)}` : '';
      const evRes = await fetch(`/api/evidence${caseQuery}`);
      const evData = await evRes.json();
      if (evData.success && Array.isArray(evData.evidence)) {
        setEvidenceList(evData.evidence);
      }
    } catch (err) {
      console.error('Error fetching database data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, [selectedCase]);

  // Handle File Upload to Base64
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadMimeType(file.type || 'application/octet-stream');
    if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = () => {
      setUploadFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit New Evidence into AES-256 Secure Database
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileData && !uploadText) {
      alert('Please choose a file or enter text content for the evidence item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        caseId: selectedCase?.caseId || 'TN-CHN-2026-004812',
        title: uploadTitle || 'Field Evidence Item',
        category: uploadCategory,
        fileName: uploadFileName || `evidence_${Date.now()}.txt`,
        mimeType: uploadMimeType,
        fileData: uploadFileData || uploadText,
        extractedText: uploadText || uploadTitle,
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
        gpsLocation: {
          latitude: uploadGpsLat,
          longitude: uploadGpsLng,
          addressName: uploadAddress,
        },
        uploadedByOfficerId: selectedCase?.investigatingOfficerId || 'TN-INSP-4081',
        uploadedByOfficerName: selectedCase?.investigatingOfficerName || 'Inspector K. Ramanathan',
      };

      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowUploadModal(false);
        // Reset form
        setUploadTitle('');
        setUploadFileData('');
        setUploadFileName('');
        setUploadText('');
        await fetchDatabaseData();
        if (onEvidenceUpdated) onEvidenceUpdated();
      } else {
        alert(data.error || 'Failed to store evidence');
      }
    } catch (err: any) {
      alert('Error uploading evidence: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Tamper Simulation
  const handleToggleTamper = async (id: string, currentTamperState: boolean) => {
    setTamperLoadingId(id);
    try {
      const res = await fetch(`/api/evidence/${id}/tamper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTampered: !currentTamperState }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDatabaseData();
        if (onEvidenceUpdated) onEvidenceUpdated();
      }
    } catch (err) {
      console.error('Tamper simulation error:', err);
    } finally {
      setTamperLoadingId(null);
    }
  };

  // Filter evidence
  const filteredEvidence = evidenceList.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.extractedText && e.extractedText.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Header & DB Telemetry */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Tamperproof Secure Evidence Vault (Database Active)
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                AES-256-GCM Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zero-knowledge physical evidence database with on-disk cryptographic ciphertext, SHA-256 integrity audits, and BSA 2023 compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDatabaseData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
            title="Refresh Database Cache"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Upload className="w-4 h-4" />
            Store New Evidence
          </button>
        </div>
      </div>

      {/* Real-time DB Diagnostics Ribbon */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-950/70 border-b border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Cipher Algorithm
            </span>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              {stats.cipher}
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Total Evidence Files
            </span>
            <span className="font-mono text-white font-bold text-sm">
              {stats.totalEvidenceStored} Records
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Registered Cases
            </span>
            <span className="font-mono text-blue-400 font-bold text-sm">
              {stats.totalCases} Active
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Encrypted Payload Size
            </span>
            <span className="font-mono text-purple-400 font-bold text-sm">
              {(stats.totalEncryptedBytes / 1024).toFixed(1)} KB Encrypted
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Tamper Integrity Status
            </span>
            <span
              className={`font-mono font-bold text-sm flex items-center gap-1 ${
                stats.tamperedAlertCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {stats.tamperedAlertCount > 0 ? (
                <>
                  <ShieldAlert className="w-4 h-4" /> {stats.tamperedAlertCount} TAMPERED
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> 100% UNCOMPROMISED
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search evidence by title, SHA-256 hash, or extracted text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'IMAGE', 'DIGITAL_RECORD', 'DOCUMENT', 'FORENSIC_REPORT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stored Evidence Items List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {filteredEvidence.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            No evidence records match your search query.
          </div>
        ) : (
          filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              className={`p-4 rounded-xl border transition space-y-3 ${
                ev.isTampered
                  ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
                      ev.category === 'IMAGE'
                        ? 'bg-blue-600'
                        : ev.category === 'DIGITAL_RECORD'
                        ? 'bg-amber-600'
                        : 'bg-purple-600'
                    }`}
                  >
                    {ev.category === 'IMAGE' ? (
                      <Camera className="w-5 h-5" />
                    ) : ev.category === 'DIGITAL_RECORD' ? (
                      <Radio className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {ev.title}
                      {ev.isTampered ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> HASH MISMATCH (TAMPERED)
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED GENESIS HASH
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>ID: {ev.id}</span>
                      <span>•</span>
                      <span>File: {ev.fileName}</span>
                      <span>•</span>
                      <span>Size: {ev.fileSizeBytes} B</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Item Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/evidence/${ev.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File from DB
                  </a>

                  {/* Simulate Tamper Button */}
                  <button
                    onClick={() => handleToggleTamper(ev.id, Boolean(ev.isTampered))}
                    disabled={tamperLoadingId === ev.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      ev.isTampered
                        ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                        : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/30'
                    }`}
                    title="Simulate modifying file ciphertext on disk to test real-time SHA-256 tamper-evident alarms"
                  >
                    {ev.isTampered ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Restore Clean File
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        Simulate Tamper
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cryptographic SHA-256 Verification Bar */}
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>GENESIS REGISTERED SHA-256 HASH:</span>
                  <span className="text-emerald-400">IMMUTABLE BLOCKCHAIN RECORD</span>
                </div>
                <div className="text-slate-200 break-all select-all font-semibold">
                  {ev.sha256Hash}
                </div>
                {ev.isTampered && (
                  <div className="text-rose-400 text-[11px] pt-1 border-t border-slate-800">
                    CURRENT RE-COMPUTED HASH: {ev.currentHash}
                  </div>
                )}
              </div>

              {/* Content & Metadata Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Forensic Extracted Content:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {ev.extractedText || 'No text extracted.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Chain-of-Custody Provenance:
                  </span>
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">
                        {ev.gpsLocation?.addressName || 'Geocoded field site'} (
                        {ev.gpsLocation?.latitude.toFixed(4)}°, {ev.gpsLocation?.longitude.toFixed(4)}°)
                      </span>
                    </div>
                    {ev.gpsLocation?.latitude && ev.gpsLocation?.longitude && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${ev.gpsLocation.latitude}&mlon=${ev.gpsLocation.longitude}#map=17/${ev.gpsLocation.latitude}/${ev.gpsLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 font-medium shrink-0 ml-2"
                        title="Inspect on OpenStreetMap"
                      >
                        <span>OSM</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Uploaded: {ev.uploadTimestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Key className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span>Officer: {ev.uploadedByOfficerName} ({ev.uploadedByOfficerId})</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload New Evidence Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Store Actual Evidence into AES-256 Database
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ATM Kiosk Exterior CCTV Camera #02"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="IMAGE">Image / CCTV Still</option>
                    <option value="VIDEO">Video Footage</option>
                    <option value="AUDIO">Audio Recording</option>
                    <option value="DIGITAL_RECORD">Digital Record (CDR / Tower / UPI)</option>
                    <option value="DOCUMENT">Document / Seizure Mahazar</option>
                    <option value="FORENSIC_REPORT">Forensic Report</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Upload Actual File</label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Extracted Data / Forensic Text Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed forensic descriptions, IMEI numbers, timecodes, or seizure notes..."
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* GPS Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Exact Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={uploadGpsLat}
                    onChange={(e) => setUploadGpsLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Exact Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={uploadGpsLng}
                    onChange={(e) => setUploadGpsLng(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Location Address</label>
                <input
                  type="text"
                  value={uploadAddress}
                  onChange={(e) => setUploadAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow transition"
                >
                  {isSubmitting ? 'Encrypting & Storing in DB...' : 'Encrypt & Store in DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
