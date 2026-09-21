import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Boxes, 
  ArrowRight,
  UserCheck,
  Building2,
  AlertCircle,
  Radio,
  Scale
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
  selectedCase?: FIRDetails;
  onNavigateTab: (tab: NavTab) => void;
  onSelectCase: (c: FIRDetails) => void;
}

export const CommandCenterDashboard: React.FC<CommandCenterDashboardProps> = ({
  cases,
  evidenceList,
  blocks,
  currentOfficer,
  currentLang,
  selectedCase,
  onNavigateTab,
  onSelectCase,
}) => {
  const t = translations[currentLang];
  const allTxs = blocks.flatMap((b) => b.transactions);

  // Critical calculations for executive law enforcement command
  const activeCasesCount = cases.filter((c) => c.status === 'UNDER_INVESTIGATION').length;
  const criticalDeadlinesCount = cases.filter((c) => c.daysRemainingForChargesheet <= 45).length;

  return (
    <div className="space-y-6">
      
      {/* Executive Command Center Header */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#061833] via-[#051329] to-[#040e1c] border border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-blue-400" />
              {currentOfficer.policeStation}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
              Station Code: {currentOfficer.stationCode}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CCTNS Live Grid Online
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Command Center</span>
              <span className="text-slate-400 font-normal text-sm">|</span>
              <span className="text-sm font-medium text-slate-300">
                Duty Officer: {currentOfficer.name} ({currentOfficer.badgeNumber})
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time operational overview of active investigation dockets, statutory filing deadlines under Bharatiya Nagarik Suraksha Sanhita (BNSS), and cryptographic chain-of-custody integrity.
            </p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Duty Clearance</div>
            <div className="text-xs font-mono font-bold text-blue-400">{currentOfficer.designation}</div>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-300">BSA 2023 Sec 63 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Active FIR Investigations */}
        <div className="p-4 rounded-xl bg-[#061833]/60 border border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Active FIR Dockets</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{cases.length}</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <strong>{activeCasesCount}</strong> under active investigation
          </p>
        </div>

        {/* Metric 2: Chargesheet Compliance (Statutory Deadlines) */}
        <div className="p-4 rounded-xl bg-[#061833]/60 border border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Chargesheet Deadlines</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {criticalDeadlinesCount} Priority
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Scale className="w-3 h-3 text-amber-400" />
            BNSS 60/90-day statutory window
          </p>
        </div>

        {/* Metric 3: Station Duty Officers */}
        <div className="p-4 rounded-xl bg-[#061833]/60 border border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Authorized Personnel</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">3 Officers</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            MFA & Biometric cleared
          </p>
        </div>

        {/* Metric 4: Blockchain Audit Stream */}
        <div className="p-4 rounded-xl bg-[#061833]/60 border border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Custody Audit Ledger</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-300 font-mono">{allTxs.length} Events</div>
          <p className="text-[11px] text-slate-400 font-mono">
            {blocks.length} Immutable Blocks Committed
          </p>
        </div>

      </div>

      {/* Two Columns: Active Cases & Recent Chain-of-Custody Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Assigned Investigation Dockets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Assigned Investigation Cases (FIRs)</span>
            </h3>
            <button
              onClick={() => onNavigateTab('CASES')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
            >
              <span>View Case Dockets</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {cases.map((c, idx) => {
              const isSelected = selectedCase?.caseId === c.caseId;
              const isUrgent = c.daysRemainingForChargesheet <= 30;

              return (
                <div
                  key={c.caseId || `case-${idx}`}
                  onClick={() => onSelectCase(c)}
                  className={`p-4 rounded-xl bg-[#061833]/40 border cursor-pointer transition space-y-3 shadow-sm group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/40'
                      : 'border-blue-900/40 hover:border-blue-500/50 hover:bg-[#061833]/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs font-mono group-hover:text-blue-400 transition">
                        {c.firNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {c.caseId}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active Case
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-mono flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                        isUrgent
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        <Clock className="w-3 h-3" /> {c.daysRemainingForChargesheet} Days Left (Chargesheet)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {c.briefDescription}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-2.5 border-t border-blue-900/40">
                    <div>
                      <span>Sections: <strong className="text-slate-200 font-mono">{c.offenceSections.join(', ')}</strong></span>
                    </div>
                    <div>
                      <span>Investigating Officer: <strong className="text-slate-200">{c.investigatingOfficerName}</strong></span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Filed: {c.dateOfRegistration}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Hyperledger Fabric Live Audit Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-blue-400" />
              <span>Chain of Custody Events</span>
            </h3>
            <button
              onClick={() => onNavigateTab('BLOCKCHAIN')}
              className="text-xs text-blue-400 hover:text-blue-300 font-mono transition"
            >
              Full Ledger →
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#061833]/40 border border-blue-900/50 space-y-2.5">
            {allTxs.slice(0, 6).map((tx, idx) => {
              const txIdentifier = tx.txId || tx.id || `TX-${tx.blockNumber || 0}-${idx}`;
              const timeDisplay = tx.timestamp?.includes('T')
                ? tx.timestamp.split('T')[1].slice(0, 5)
                : (tx.timestamp || '--:--');
              return (
                <div key={txIdentifier} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-400 font-semibold">{txIdentifier}</span>
                    <span className="text-[10px] text-slate-400">{timeDisplay}</span>
                  </div>
                  <p className="font-medium text-slate-200 line-clamp-1">{tx.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>{tx.officerName}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Signed
                    </span>
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
