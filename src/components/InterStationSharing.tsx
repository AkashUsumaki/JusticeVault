import React, { useState } from 'react';
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
  Download
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
      expiresAt: new Date(Date.now() + 3600000 * 24 * 6).toISOString(),
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
      expiresAt: new Date(Date.now() + 3600000 * 24 * 12).toISOString(),
      status: 'ACTIVE',
      permissions: ['VIEW_EVIDENCE', 'DOWNLOAD_SECTION_65B', 'VIEW_AI_REPORTS'],
      purpose: 'Pre-trial discovery bundle preparation for City Sessions Court.',
    }
  ]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [targetStation, setTargetStation] = useState('Cyber Crime Wing, Chennai');
  const [targetOfficer, setTargetOfficer] = useState('Inspector M. Rajesh (CY-08)');
  const [sharePurpose, setSharePurpose] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [allowDownload, setAllowDownload] = useState(true);

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
      `Authorized time-limited case access to ${targetOfficer} (${targetStation}) for ${expiryDays} days`
    );
    setIsShareModalOpen(false);
    setSharePurpose('');
  };

  const handleRevokeShare = (shareId: string, recipient: string) => {
    setActiveShares(activeShares.map((s) => s.id === shareId ? { ...s, status: 'REVOKED' } : s));
    onLogBlockchainEvent('INTER_STATION_SHARE', `REVOKED case access immediately for ${recipient}`);
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
                Manual Officer-Controlled Access Delegation, Public Prosecutor Discovery & Instant Revocation
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
          <h3 className="font-bold text-white">Cryptographic Access Token Enforced</h3>
          <p className="text-zinc-400 leading-relaxed">
            All shared links are signed with asymmetric keys, logged to Hyperledger Fabric, and automatically expire after the authorized timeframe. Access can be permanently revoked in real-time with one click.
          </p>
        </div>
      </div>

      {/* Active Shares Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Active Case Access Authorizations ({activeShares.length}):
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeShares.map((share) => {
            const isRevoked = share.status === 'REVOKED';
            return (
              <div
                key={share.id}
                className={`p-5 rounded-lg border transition space-y-4 shadow-sm ${
                  isRevoked
                    ? 'bg-zinc-950/60 border-zinc-800 opacity-60'
                    : 'bg-[#0a0c0f] border-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-zinc-900 text-blue-400 border border-zinc-800">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{share.targetOfficerBadge}</h4>
                      <p className="text-[11px] text-blue-400 font-mono mt-0.5">{share.targetStationCode}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isRevoked
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {share.status}
                  </span>
                </div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                  <p className="leading-relaxed">
                    <strong className="text-zinc-400">Purpose: </strong>
                    {share.purpose}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 pt-1">
                    {share.permissions.map((p, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono border border-zinc-800">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Expires: {share.expiresAt.split('T')[0]}</span>
                  </div>

                  {!isRevoked && (
                    <button
                      onClick={() => handleRevokeShare(share.id, share.targetOfficerBadge)}
                      className="px-3 py-1 text-xs rounded bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/40 font-medium transition"
                    >
                      Instant Revoke
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Authorize Secure Inter-Station Sharing</h2>
                <p className="text-xs text-zinc-400 font-mono">Case: {caseItem.firNumber}</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateShare} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Target Police Station / Agency</label>
                <input
                  type="text"
                  required
                  value={targetStation}
                  onChange={(e) => setTargetStation(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Target Officer Badge / Public Prosecutor</label>
                <input
                  type="text"
                  required
                  value={targetOfficer}
                  onChange={(e) => setTargetOfficer(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Investigation Purpose / Cross-Jurisdiction Justification</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify reason for sharing (e.g. Cross-matching suspect phone numbers in cyber fraud)..."
                  value={sharePurpose}
                  onChange={(e) => setSharePurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Validity Window</label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={1}>24 Hours</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-zinc-950 border-zinc-800"
                    />
                    <span>Allow Sec 65B PDF Download</span>
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
                  className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  Grant Signed Token Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
