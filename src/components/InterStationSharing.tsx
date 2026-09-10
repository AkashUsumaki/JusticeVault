import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Unlock, 
  FileCheck2, 
  UserCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Eye,
  Download,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { FIRDetails, InterStationShareRequest, LanguageCode, OfficerUser } from '../types';
import { translations } from '../translations/i18n';

interface InterStationSharingProps {
  caseItem: FIRDetails;
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onLogBlockchainEvent: (action: any, details: string) => void;
}

export const InterStationSharing: React.FC<InterStationSharingProps> = ({
  caseItem,
  currentOfficer,
  currentLang,
  onLogBlockchainEvent,
}) => {
  const t = translations[currentLang];
  
  const [activeShares, setActiveShares] = useState<InterStationShareRequest[]>([
    {
      id: 'SHR-2026-0091',
      caseId: caseItem.caseId,
      sourceStationCode: currentOfficer.stationCode,
      targetStationCode: 'KL-KTM-01',
      targetOfficerBadge: 'KL-POL-5510 (Inspector George Mathew)',
      authorizedByOfficerId: currentOfficer.id,
      authorizedTimestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24 * 6 + 14200000).toISOString(),
      status: 'ACTIVE',
      permissions: ['VIEW_EVIDENCE', 'VIEW_AI_REPORTS'],
      purpose: 'Corroboration of suspect interstate movements across Kottayam and Chennai.',
    },
    {
      id: 'SHR-2026-0042',
      caseId: caseItem.caseId,
      sourceStationCode: currentOfficer.stationCode,
      targetStationCode: 'TN-PROSECUTOR-01',
      targetOfficerBadge: 'ADV-TN-9902 (Public Prosecutor Anandhi)',
      authorizedByOfficerId: currentOfficer.id,
      authorizedTimestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24 * 11 + 22400000).toISOString(),
      status: 'ACTIVE',
      permissions: ['VIEW_EVIDENCE', 'DOWNLOAD_SECTION_65B', 'VIEW_AI_REPORTS'],
      purpose: 'Pre-trial discovery bundle preparation for City Sessions Court.',
    }
  ]);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [targetStation, setTargetStation] = useState('Cyber Crime Wing, Chennai');
  const [targetOfficer, setTargetOfficer] = useState('Inspector M. Rajesh (CY-08)');
  const [sharePurpose, setSharePurpose] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [allowDownload, setAllowDownload] = useState(true);

  // Recipient Portal Preview Modal
  const [previewingShare, setPreviewingShare] = useState<InterStationShareRequest | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real ticking timer for countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - currentTime;
    if (diff <= 0) return 'EXPIRED';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const handleCreateShare = (e: React.FormEvent) => {
    e.preventDefault();
    const newShare: InterStationShareRequest = {
      id: `SHR-2026-00${Math.floor(Math.random() * 90) + 10}`,
      caseId: caseItem.caseId,
      sourceStationCode: currentOfficer.stationCode,
      targetStationCode: targetStation,
      targetOfficerBadge: targetOfficer,
      authorizedByOfficerId: currentOfficer.id,
      authorizedTimestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiryDays * 24 * 3600 * 1000).toISOString(),
      status: 'ACTIVE',
      permissions: allowDownload 
        ? ['VIEW_EVIDENCE', 'DOWNLOAD_SECTION_65B', 'VIEW_AI_REPORTS']
        : ['VIEW_EVIDENCE', 'VIEW_AI_REPORTS'],
      purpose: sharePurpose || 'Inter-agency cross-jurisdiction investigation corroboration.',
    };

    setActiveShares([newShare, ...activeShares]);
    onLogBlockchainEvent(
      'INTER_STATION_SHARE',
      `Authorized time-limited case access token (${newShare.id}) to ${targetOfficer} (${targetStation}) for ${expiryDays} days`
    );
    setIsShareModalOpen(false);
    setSharePurpose('');
  };

  const handleRevokeShare = (shareId: string, recipient: string) => {
    setActiveShares(activeShares.map((s) => s.id === shareId ? { ...s, status: 'REVOKED' } : s));
    onLogBlockchainEvent('INTER_STATION_SHARE', `REVOKED case access token (${shareId}) immediately for ${recipient}`);
  };

  const handleCopyLink = (share: InterStationShareRequest) => {
    const link = `https://justicevault.police.gov.in/portal/discovery?token=JWT_${share.id}_SIGN_ED25519`;
    navigator.clipboard.writeText(link);
    setCopiedId(share.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.interStationSharing}</h1>
              <p className="text-xs text-zinc-400">
                Time-Limited Discovery Tokens • Public Prosecutor Bundles • Instant Cryptographic Revocation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition"
        >
          <Plus className="w-4 h-4" />
          <span>Authorize Station Share</span>
        </button>
      </div>

      {/* Security Governance Notice */}
      <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-white">Consortium Token-Gated Governance</h3>
          <p className="text-zinc-400 leading-relaxed">
            All shared links are signed with Ed25519 private keys, logged to Hyperledger Fabric, and enforced with strict role-based access control. Public Prosecutors and recipient stations access watermarked read-only discovery bundles that automatically expire.
          </p>
        </div>
      </div>

      {/* Active Shares List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Authorized Inter-Station Tokens:</h2>

        {activeShares.map((share) => {
          const isRevoked = share.status === 'REVOKED';
          const countdownText = formatCountdown(share.expiresAt);
          const isExpired = countdownText === 'EXPIRED';

          return (
            <div
              key={share.id}
              className={`p-5 rounded-lg border text-xs space-y-3 transition ${
                isRevoked
                  ? 'bg-[#08090a] border-zinc-900 opacity-60'
                  : 'bg-[#0a0c0f] border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-blue-400 font-semibold">{share.id}</span>
                    <h3 className="text-sm font-bold text-white">{share.targetOfficerBadge}</h3>
                    <p className="text-[11px] text-zinc-400">{share.targetStationCode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Live Countdown Badge */}
                  <div className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border ${
                    isRevoked
                      ? 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      : isExpired
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isRevoked ? 'REVOKED' : isExpired ? 'EXPIRED' : `Expires in: ${countdownText}`}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isRevoked
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {share.status}
                  </span>
                </div>
              </div>

              {/* Purpose */}
              <p className="text-zinc-300 leading-relaxed text-xs">
                <strong className="text-zinc-400">Jurisdictional Purpose:</strong> {share.purpose}
              </p>

              {/* Permissions & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {share.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800"
                    >
                      {perm.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(share)}
                    disabled={isRevoked}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 flex items-center gap-1 transition disabled:opacity-40"
                    title="Copy JWT Access Token URL"
                  >
                    {copiedId === share.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === share.id ? 'Copied' : 'Copy Access Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewingShare(share)}
                    disabled={isRevoked}
                    className="px-2.5 py-1 rounded bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-xs font-medium border border-blue-500/20 flex items-center gap-1 transition disabled:opacity-40"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Recipient Preview</span>
                  </button>

                  {!isRevoked && (
                    <button
                      type="button"
                      onClick={() => handleRevokeShare(share.id, share.targetOfficerBadge)}
                      className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition"
                    >
                      Revoke Token
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Authorize New Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Authorize Inter-Agency Case Access</h2>
                <p className="text-xs text-zinc-400 font-mono">Case: {caseItem.firNumber}</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateShare} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Target Police Station / Agency</label>
                <select
                  value={targetStation}
                  onChange={(e) => setTargetStation(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Cyber Crime Wing, Chennai">Cyber Crime Wing, Chennai (CCW-TN)</option>
                  <option value="Ernakulam Central PS, Kochi">Ernakulam Central PS, Kochi (KL-ERN-01)</option>
                  <option value="Central Bureau of Investigation (CBI-SCB)">Central Bureau of Investigation (CBI-SCB)</option>
                  <option value="Madras High Court Public Prosecutor">Madras High Court Public Prosecutor Office</option>
                  <option value="State Forensic Science Laboratory (FSL Chennai)">State Forensic Science Laboratory (FSL Chennai)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Recipient Officer Name & Badge Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector M. Rajesh (CY-08)"
                  value={targetOfficer}
                  onChange={(e) => setTargetOfficer(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Investigation Purpose (For Judicial Log)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State the official investigation rationale or court summons reference..."
                  value={sharePurpose}
                  onChange={(e) => setSharePurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Auto-Expiry Window</label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={1}>24 Hours (Urgent Interrogation)</option>
                    <option value={3}>3 Days (FSL Preliminary)</option>
                    <option value={7}>7 Days (Interstate Corroboration)</option>
                    <option value={14}>14 Days (Judicial Trial Discovery)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2 text-zinc-300">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-zinc-950 border-zinc-800"
                    />
                    <span>Allow Section 65B Export</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition"
                >
                  Sign & Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipient Read-Only Discovery Portal Modal */}
      {previewingShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#080a0e] border border-blue-500/40 rounded-lg shadow-2xl overflow-hidden relative">
            
            {/* Watermark Diagonal Overlay for Law Enforcement Confidentiality */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none text-4xl font-black font-mono rotate-[-25deg] text-white">
              CONFIDENTIAL • {previewingShare.targetOfficerBadge} • {previewingShare.id}
            </div>

            <div className="px-6 py-4 bg-blue-950/40 border-b border-blue-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                  Simulated Discovery Portal (External View)
                </span>
                <h2 className="text-sm font-bold text-white">{caseItem.firNumber} — {caseItem.title}</h2>
              </div>
              <button onClick={() => setPreviewingShare(null)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-zinc-400">
                  <span>Authorized Recipient:</span>
                  <span className="text-white font-semibold">{previewingShare.targetOfficerBadge}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Issuing Originator:</span>
                  <span className="text-blue-300">{currentOfficer.name} ({currentOfficer.badgeNumber})</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Session Expiry:</span>
                  <span className="text-amber-400 font-bold">{formatCountdown(previewingShare.expiresAt)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-300 mb-2">Available Case Digital Records (Read-Only Watermarked):</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Certified FIR & Incident Summary</p>
                      <p className="text-[10px] text-zinc-400">Registered at {caseItem.policeStation}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">BSA CERTIFIED</span>
                  </div>

                  <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Suspect Call Detail Records & CDR Towers</p>
                      <p className="text-[10px] text-zinc-400">Forensic Tower Triangulation Data</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">VIEW ONLY</span>
                  </div>

                  <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Section 65B Electronic Admissibility Certificate</p>
                      <p className="text-[10px] text-zinc-400">Signed with Ed25519 Cryptographic Fingerprint</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">DOWNLOADABLE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#08090b] border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setPreviewingShare(null)}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Close Portal Simulator
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
