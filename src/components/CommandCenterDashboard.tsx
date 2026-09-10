import React from 'react';
import { 
  ShieldCheck, 
  FolderLock, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Boxes, 
  Share2, 
  Cpu, 
  Smartphone, 
  ArrowRight,
  TrendingUp,
  UserCheck,
  Lock,
  Activity,
  Zap
} from 'lucide-react';
import { BlockchainBlock, EvidenceItem, FIRDetails, LanguageCode, OfficerUser } from '../types';
import { translations } from '../translations/i18n';
import { NavTab } from './Sidebar';

interface CommandCenterDashboardProps {
  cases: FIRDetails[];
  evidenceList: EvidenceItem[];
  blocks: BlockchainBlock[];
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onNavigateTab: (tab: NavTab) => void;
  onSelectCase: (c: FIRDetails) => void;
}

export const CommandCenterDashboard: React.FC<CommandCenterDashboardProps> = ({
  cases,
  evidenceList,
  blocks,
  currentOfficer,
  currentLang,
  onNavigateTab,
  onSelectCase,
}) => {
  const t = translations[currentLang];
  const allTxs = blocks.flatMap((b) => b.transactions);
  const tamperedItems = evidenceList.filter((e) => e.isTampered);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-[#0a0c0f] via-[#0a0c0f] to-[#0f172a]/40 border border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {currentOfficer.policeStation}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Station Code: {currentOfficer.stationCode}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Welcome, {currentOfficer.name} ({currentOfficer.designation})
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            JusticeVault Digital Investigation & Evidence Intelligence Suite. Fully integrated with CCTNS, eSakshya, and Hyperledger Fabric Private Consortium.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('AI_VERIFIER')}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Statement Verifier</span>
          </button>
          <button
            onClick={() => onNavigateTab('EVIDENCE')}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition flex items-center gap-2"
          >
            <FolderLock className="w-4 h-4" />
            <span>Open Evidence Vault</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Active FIR Cases</span>
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{cases.length}</div>
          <p className="text-[11px] text-zinc-500">
            {cases.filter((c) => c.status === 'UNDER_INVESTIGATION').length} Under Active Probe
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Secured Evidence Items</span>
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{evidenceList.length}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% SHA-256 Hashed
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">AI Contradictions Flagged</span>
            <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">3 Discrepancies</div>
          <p className="text-[11px] text-red-400/90">
            Alibi vs CDR Tower & CCTV Matches
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Blockchain Transactions</span>
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{allTxs.length}</div>
          <p className="text-[11px] text-zinc-500 font-mono">
            {blocks.length} Blocks Committed
          </p>
        </div>

      </div>

      {/* Two Columns: Active Cases & Recent Blockchain Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Cases & Statutory Deadlines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Assigned Investigation Cases (FIRs)
            </h3>
            <button
              onClick={() => onNavigateTab('CASES')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Cases</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {cases.map((c, idx) => (
              <div
                key={c.caseId || `case-${idx}`}
                onClick={() => onSelectCase(c)}
                className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 hover:border-blue-500/40 cursor-pointer transition space-y-3 shadow-sm group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs font-mono group-hover:text-blue-400 transition">{c.firNumber}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {c.caseId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400 font-mono flex items-center gap-1 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Clock className="w-3 h-3" /> {c.daysRemainingForChargesheet} Days Left (Chargesheet)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {c.briefDescription}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/40">
                  <span>Sections: <strong className="text-zinc-300">{c.offenceSections.join(', ')}</strong></span>
                  <span>IO: <strong className="text-zinc-300">{c.investigatingOfficerName}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Hyperledger Fabric Live Audit Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-blue-400" />
              <span>Fabric Audit Ledger</span>
            </h3>
            <button
              onClick={() => onNavigateTab('BLOCKCHAIN')}
              className="text-xs text-blue-400 hover:underline font-mono"
            >
              Explorer
            </button>
          </div>

          <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-2.5">
            {allTxs.slice(0, 5).map((tx, idx) => {
              const txIdentifier = tx.txId || tx.id || `TX-${tx.blockNumber || 0}-${idx}`;
              const timeDisplay = tx.timestamp?.includes('T')
                ? tx.timestamp.split('T')[1].slice(0, 5)
                : (tx.timestamp || '--:--');
              return (
                <div key={txIdentifier} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-400">{txIdentifier}</span>
                    <span className="text-[10px] text-zinc-500">{timeDisplay}</span>
                  </div>
                  <p className="font-semibold text-zinc-200 line-clamp-1">{tx.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{tx.officerName}</span>
                    <span className="text-emerald-400">Ed25519 Signed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
