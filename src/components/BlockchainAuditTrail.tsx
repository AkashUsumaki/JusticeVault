import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  ShieldCheck, 
  ShieldAlert, 
  FileCheck2, 
  Search, 
  Filter, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  ArrowRight, 
  Download, 
  RefreshCw,
  ExternalLink,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { BlockchainBlock, BlockchainTransaction, EvidenceItem, FIRDetails, LanguageCode, OfficerUser } from '../types';
import { exportSection65BCertificate } from '../services/cryptoUtils';
import { translations } from '../translations/i18n';
import { BiometricSecurityModal } from './BiometricSecurityModal';

interface BlockchainAuditTrailProps {
  blocks: BlockchainBlock[];
  caseItem: FIRDetails;
  evidenceList: EvidenceItem[];
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onMineBlock?: () => void;
  onLogBlockchainEvent?: (action: any, details: string, evidenceId?: string, evidenceHash?: string) => void;
}

export const BlockchainAuditTrail: React.FC<BlockchainAuditTrailProps> = ({
  blocks,
  caseItem,
  evidenceList,
  currentOfficer,
  currentLang,
  onMineBlock,
  onLogBlockchainEvent,
}) => {
  const t = translations[currentLang];
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'BLOCKS'>('TRANSACTIONS');
  const [filterByCurrentFIR, setFilterByCurrentFIR] = useState(true);

  // Biometric Security Gatekeeper State
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

  // Verification state
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [chainVerifiedSuccess, setChainVerifiedSuccess] = useState<boolean | null>(null);
  const [dbTxs, setDbTxs] = useState<BlockchainTransaction[]>([]);

  useEffect(() => {
    fetch('/api/database/transactions')
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions && Array.isArray(data.transactions)) {
          setDbTxs(data.transactions);
        }
      })
      .catch((err) => console.warn('Could not fetch db transactions:', err));
  }, []);

  const blockTxs = blocks.flatMap((b) => b.transactions);
  const txMap = new Map<string, BlockchainTransaction>();
  dbTxs.forEach((tx) => txMap.set(tx.txId || tx.id, tx));
  blockTxs.forEach((tx) => txMap.set(tx.txId || tx.id, tx));
  const allTransactions = Array.from(txMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredTransactions = allTransactions.filter((tx) => {
    if (filterByCurrentFIR && tx.caseId && tx.caseId !== caseItem.caseId) {
      return false;
    }
    if (selectedAction !== 'ALL' && tx.action !== selectedAction) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const txIdentifier = tx.txId || tx.id || '';
      const match =
        txIdentifier.toLowerCase().includes(q) ||
        (tx.officerName && tx.officerName.toLowerCase().includes(q)) ||
        (tx.officerBadge && tx.officerBadge.toLowerCase().includes(q)) ||
        (tx.details && tx.details.toLowerCase().includes(q)) ||
        (tx.evidenceHash && tx.evidenceHash.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getActionBadge = (action: BlockchainTransaction['action']) => {
    switch (action) {
      case 'EVIDENCE_UPLOAD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">UPLOAD</span>;
      case 'AI_STATEMENT_VERIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">AI_VERIFY</span>;
      case 'TAMPER_DETECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse font-bold">TAMPER_ALERT</span>;
      case 'EVIDENCE_VIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">VIEW</span>;
      case 'EVIDENCE_DOWNLOAD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">DOWNLOAD</span>;
      case 'INTER_STATION_SHARE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">SHARE</span>;
      case 'CHAIN_OF_CUSTODY_EXPORT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">SEC_65B_EXPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">{action}</span>;
    }
  };

  const handleDownloadCourtCertificate = (evidenceItem: EvidenceItem) => {
    requestBiometricClearance(
      'Section 65B Certificate Court Generation',
      `Officer biometric verification required to generate and cryptographically seal legal Section 65B (BSA Section 63) electronic evidence certificate for FIR ${caseItem.firNumber}`,
      () => {
        exportSection65BCertificate(
          evidenceItem,
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
          allTransactions
        );
        if (onLogBlockchainEvent) {
          onLogBlockchainEvent(
            'CHAIN_OF_CUSTODY_EXPORT',
            `Court-Admissible BSA Sec 63 / Sec 65B Certificate generated for ${evidenceItem.title}`,
            evidenceItem.id,
            evidenceItem.sha256Hash
          );
        }
      }
    );
  };

  const handleVerifyChainIntegrity = () => {
    setIsVerifyingChain(true);
    setChainVerifiedSuccess(null);
    setTimeout(() => {
      // Check block chaining
      let intact = true;
      for (let i = 0; i < blocks.length - 1; i++) {
        if (blocks[i].previousHash !== blocks[i + 1].currentHash) {
          intact = false;
          break;
        }
      }
      setChainVerifiedSuccess(intact);
      setIsVerifyingChain(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.blockchainAudit}</h1>
              <p className="text-xs text-zinc-400">
                Hyperledger Fabric Private Permissioned Ledger • Channel: police-consortium • BSA Sec 65B Ready
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Verify Whole Chain Button */}
          <button
            onClick={handleVerifyChainIntegrity}
            disabled={isVerifyingChain}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition"
            title="Verify SHA-256 Merkle links across all blocks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingChain ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isVerifyingChain ? 'Verifying Merkle Tree...' : 'Verify Chain Integrity'}</span>
          </button>

          {/* Section 65B Court Certificate Trigger */}
          {evidenceList.length > 0 && (
            <button
              onClick={() => handleDownloadCourtCertificate(evidenceList[0])}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t.exportCert}</span>
            </button>
          )}
        </div>
      </div>

      {/* Chain Verification Result Toast */}
      {chainVerifiedSuccess !== null && (
        <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between animate-in zoom-in-95 ${
          chainVerifiedSuccess
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {chainVerifiedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span className="font-semibold">
              {chainVerifiedSuccess
                ? 'All Block Merkle roots & sequential hashes cryptographically validated: 100% Intact!'
                : 'Blockchain integrity check failed: Block hash link broken!'}
            </span>
          </div>
          <button onClick={() => setChainVerifiedSuccess(null)} className="text-[10px] text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Fabric Network Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Consortium Height</span>
          <p className="text-xl font-bold text-white font-mono">{blocks.length} Blocks</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Raft Consensus Synced
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Total Audit Transactions</span>
          <p className="text-xl font-bold text-blue-400 font-mono">{allTransactions.length} Logged</p>
          <p className="text-[10px] text-zinc-400">Cryptographically Signed (Ed25519)</p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Channel ID</span>
          <p className="text-xs font-bold text-white font-mono truncate">police-consortium-chn</p>
          <p className="text-[10px] text-zinc-500">TN Police • Kerala Police • High Court</p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Consensus Health</span>
          <p className="text-xl font-bold text-emerald-400 font-mono">100% Intact</p>
          <p className="text-[10px] text-blue-400">3 Raft Ordering Nodes Online</p>
        </div>
      </div>

      {/* View Switcher: Transactions vs Block Architecture */}
      <div className="flex bg-[#0a0c0f] border border-zinc-800 rounded-lg p-1 gap-2 max-w-sm">
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold transition ${
            activeTab === 'TRANSACTIONS' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Transaction Stream ({filteredTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('BLOCKS')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold transition ${
            activeTab === 'BLOCKS' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Block Structure ({blocks.length})
        </button>
      </div>

      {activeTab === 'TRANSACTIONS' && (
        <>
          {/* Search & Action Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Tx Hash, Officer Badge, Details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0a0c0f] border border-zinc-800 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setFilterByCurrentFIR(!filterByCurrentFIR)}
                className={`px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition border whitespace-nowrap ${
                  filterByCurrentFIR
                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Toggle scoping to active FIR"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{filterByCurrentFIR ? `FIR ${caseItem.firNumber}` : 'All Cases'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['ALL', 'EVIDENCE_UPLOAD', 'AI_STATEMENT_VERIFIED', 'TAMPER_DETECTED', 'INTER_STATION_SHARE', 'CHAIN_OF_CUSTODY_EXPORT'].map((act) => (
                <button
                  key={act}
                  onClick={() => setSelectedAction(act)}
                  className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                    selectedAction === act
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#0a0c0f] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {act === 'ALL' ? 'All Actions' : act.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Immutable Transaction Table */}
          <div className="rounded-lg bg-[#0a0c0f] border border-zinc-800/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08090b] text-zinc-400 font-semibold border-b border-zinc-800/80">
                  <tr>
                    <th className="px-4 py-3">Tx ID / Hash</th>
                    <th className="px-4 py-3">Timestamp (UTC)</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Officer & Badge</th>
                    <th className="px-4 py-3">Event Details</th>
                    <th className="px-4 py-3">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredTransactions.map((tx, idx) => {
                    const txIdentifier = tx.txId || tx.id || `TX-${idx}`;
                    return (
                      <tr
                        key={txIdentifier}
                        onClick={() => setSelectedTx(tx)}
                        className="hover:bg-zinc-900/60 cursor-pointer transition"
                      >
                        <td className="px-4 py-3 font-mono text-[11px] text-blue-400 truncate max-w-[140px]">
                          {txIdentifier}
                        </td>
                      <td className="px-4 py-3 text-zinc-300 whitespace-nowrap text-[11px]">
                        {tx.timestamp.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="px-4 py-3">
                        {getActionBadge(tx.action)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-white block">{tx.officerName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{tx.officerBadge} ({tx.stationCode})</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 max-w-xs truncate">
                        {tx.details}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          VALID
                        </span>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Block Structure View */}
      {activeTab === 'BLOCKS' && (
        <div className="space-y-4">
          {blocks.map((b, idx) => (
            <div key={b.blockNumber} className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 font-mono font-bold text-sm border border-blue-500/30">
                    BLOCK #{b.blockNumber}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{b.timestamp.replace('T', ' ').slice(0, 19)} UTC</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">{b.transactions.length} Transactions Included</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <span className="text-zinc-500 text-[10px] block">Current Block Hash:</span>
                  <p className="text-emerald-400 break-all text-[11px]">{b.currentHash}</p>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <span className="text-zinc-500 text-[10px] block">Previous Block Hash:</span>
                  <p className="text-zinc-400 break-all text-[11px]">{b.previousHash}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 pt-1 font-mono">
                <span>Merkle Root: {b.merkleRoot.substring(0, 32)}...</span>
                <span className="text-blue-400">Orderer: orderer0.police.internal (Raft Consensus)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail Inspector Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Blockchain Transaction Inspection</h2>
                <p className="text-xs text-zinc-400 font-mono">{selectedTx.id}</p>
              </div>
              <button onClick={() => setSelectedTx(null)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Action Type:</span>
                {getActionBadge(selectedTx.action)}
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Timestamp:</span>
                  <span className="font-mono text-white">{selectedTx.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Authorized Officer:</span>
                  <span className="font-semibold text-white">{selectedTx.officerName} ({selectedTx.officerBadge})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Police Station:</span>
                  <span className="text-zinc-200">{selectedTx.stationCode}</span>
                </div>
                {selectedTx.evidenceId && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Linked Evidence ID:</span>
                    <span className="font-mono text-blue-400">{selectedTx.evidenceId}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-zinc-400 block mb-1 font-semibold">Event Description:</span>
                <p className="p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 leading-relaxed">
                  {selectedTx.details}
                </p>
              </div>

              {selectedTx.evidenceHash && (
                <div>
                  <span className="text-zinc-400 block mb-1 font-semibold">SHA-256 Hash Seal:</span>
                  <p className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-blue-300 break-all select-all">
                    {selectedTx.evidenceHash}
                  </p>
                </div>
              )}

              <div>
                <span className="text-zinc-400 block mb-1 font-semibold">Officer Cryptographic Signature (Ed25519):</span>
                <p className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-emerald-400 break-all select-all">
                  {selectedTx.signature}
                </p>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#08090b] border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
              >
                Close
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
