import React, { useState } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Send, 
  Lock, 
  Globe,
  Database,
  Search,
  Layers
} from 'lucide-react';
import { FIRDetails, LanguageCode, OfficerUser } from '../types';
import { translations } from '../translations/i18n';

interface PoliceSystemIntegrationsProps {
  caseItem: FIRDetails;
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onLogBlockchainEvent: (action: any, details: string) => void;
}

export const PoliceSystemIntegrations: React.FC<PoliceSystemIntegrationsProps> = ({
  caseItem,
  currentOfficer,
  currentLang,
  onLogBlockchainEvent,
}) => {
  const t = translations[currentLang];
  const [isSyncingCCTNS, setIsSyncingCCTNS] = useState(false);
  const [cctnsStatus, setCctnsStatus] = useState<'SYNCED' | 'SYNCING'>('SYNCED');

  const [isSyncingESakshya, setIsSyncingESakshya] = useState(false);
  const [eSakshyaStatus, setESakshyaStatus] = useState<'VERIFIED' | 'SYNCING'>('VERIFIED');

  const [isDispatching1930, setIsDispatching1930] = useState(false);
  const [muleFreezeStatus, setMuleFreezeStatus] = useState<'READY' | 'DISPATCHED'>('READY');

  const handleSyncCCTNS = () => {
    setIsSyncingCCTNS(true);
    setTimeout(() => {
      setIsSyncingCCTNS(false);
      setCctnsStatus('SYNCED');
      onLogBlockchainEvent('CCTNS_SYNC', `Synchronized FIR ${caseItem.firNumber} with National CCTNS Central Database`);
    }, 1200);
  };

  const handleSyncESakshya = () => {
    setIsSyncingESakshya(true);
    setTimeout(() => {
      setIsSyncingESakshya(false);
      setESakshyaStatus('VERIFIED');
      onLogBlockchainEvent('ESAKSHYA_VERIFY', `eSakshya cryptographic SID packet validated for case ${caseItem.caseId}`);
    }, 1200);
  };

  const handleDispatch1930 = () => {
    setIsDispatching1930(true);
    setTimeout(() => {
      setIsDispatching1930(false);
      setMuleFreezeStatus('DISPATCHED');
      onLogBlockchainEvent('I4C_MULE_FREEZE', 'Dispatched urgent mule bank account freeze order to I4C / 1930 NCRP Portal');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.policeIntegrations}</h1>
              <p className="text-xs text-zinc-400">
                Direct REST & gRPC Gateways to CCTNS, eSakshya Evidence Vault & 1930 Cyber Helpline
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. CCTNS Card */}
        <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">CCTNS National Sync</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Crime and Criminal Tracking Network & Systems gateway. Automatically synchronizes FIRs, previous criminal antecedents, and interstate alerts.
            </p>

            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">State Node:</span>
                <span className="text-zinc-300">SCRB Tamil Nadu</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">FIR Sync Ref:</span>
                <span className="text-blue-400">{caseItem.firNumber}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncCCTNS}
            disabled={isSyncingCCTNS}
            className="w-full py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSyncingCCTNS ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isSyncingCCTNS ? 'Syncing with CCTNS...' : 'Sync FIR with CCTNS'}</span>
          </button>
        </div>

        {/* 2. eSakshya Card */}
        <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">eSakshya Evidence Portal</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              National Digital Evidence Repository. Handles cryptographic SID packet ingestion and Section 65B compliance verification.
            </p>

            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">SID Packet Hash:</span>
                <span className="text-blue-400 truncate max-w-[120px]">e94b...4812</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Cryptographic Seal:</span>
                <span className="text-emerald-400">BSA 2023 Compliant</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncESakshya}
            disabled={isSyncingESakshya}
            className="w-full py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSyncingESakshya ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isSyncingESakshya ? 'Validating SID Packet...' : 'Verify eSakshya Evidence'}</span>
          </button>
        </div>

        {/* 3. 1930 Cyber Helpline Card */}
        <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">1930 Cyber Fraud / I4C</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                NCRP
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              National Cyber Crime Reporting Portal. Direct conduit to freeze suspicious mule bank accounts and UPI IDs across 40+ Indian banks in real-time.
            </p>

            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Target Mule Acc:</span>
                <span className="text-amber-400">ICICI-MULE-8839</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Freeze Status:</span>
                <span className={muleFreezeStatus === 'DISPATCHED' ? 'text-emerald-400' : 'text-zinc-400'}>
                  {muleFreezeStatus === 'DISPATCHED' ? 'FREEZE ORDER DISPATCHED' : 'PENDING ACTION'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDispatch1930}
            disabled={isDispatching1930 || muleFreezeStatus === 'DISPATCHED'}
            className="w-full py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDispatching1930 ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{muleFreezeStatus === 'DISPATCHED' ? 'Mule Account Frozen' : 'Dispatch 1930 Freeze Order'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
