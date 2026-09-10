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
  Layers,
  Terminal,
  ExternalLink
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

  // Live Gateway Terminal Logs
  const [gatewayLogs, setGatewayLogs] = useState<string[]>([
    `[${new Date().toISOString().slice(11, 19)}] [CCTNS-GATEWAY] SCRB Tamil Nadu connected over TLS 1.3 mutual auth.`,
    `[${new Date().toISOString().slice(11, 19)}] [ESAKSHYA-DAEMON] eSakshya SID hardware security module (HSM) online.`,
    `[${new Date().toISOString().slice(11, 19)}] [I4C-NCRP] 1930 National Cybercrime Reporting Portal webhook listener active.`,
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toISOString().slice(11, 19);
    setGatewayLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleSyncCCTNS = () => {
    setIsSyncingCCTNS(true);
    addLog(`[CCTNS-GATEWAY] Initiating bi-directional sync for FIR ${caseItem.firNumber}...`);
    setTimeout(() => {
      addLog(`[CCTNS-GATEWAY] Payload dispatched: 14 sections, 3 accused antecedents verified.`);
      setIsSyncingCCTNS(false);
      setCctnsStatus('SYNCED');
      onLogBlockchainEvent('CCTNS_SYNC', `Synchronized FIR ${caseItem.firNumber} with National CCTNS Central Database`);
    }, 1200);
  };

  const handleSyncESakshya = () => {
    setIsSyncingESakshya(true);
    addLog(`[ESAKSHYA-DAEMON] Querying NIC eSakshya Cloud for SID validation packet...`);
    setTimeout(() => {
      addLog(`[ESAKSHYA-DAEMON] Cryptographic SID 512-bit signature verified by Central FSL root.`);
      setIsSyncingESakshya(false);
      setESakshyaStatus('VERIFIED');
      onLogBlockchainEvent('ESAKSHYA_VERIFY', `eSakshya cryptographic SID packet validated for case ${caseItem.caseId}`);
    }, 1200);
  };

  const handleDispatch1930 = () => {
    setIsDispatching1930(true);
    addLog(`[I4C-NCRP] Compiling emergency freeze requisition for ICICI Mule A/c 0019284819...`);
    setTimeout(() => {
      addLog(`[I4C-NCRP] FREEZE DISPATCHED: RBI Lien marked on A/c 0019284819. Acknowledgement: ACK-1930-88192.`);
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
                Direct Real-Time REST & gRPC Gateways to CCTNS, eSakshya Evidence Vault & 1930 Cyber Helpline
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
                ONLINE
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
            className="w-full py-2.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCCTNS ? 'animate-spin' : ''}`} />
            <span>{isSyncingCCTNS ? 'Syncing with CCTNS...' : 'Trigger Real-time CCTNS Sync'}</span>
          </button>
        </div>

        {/* 2. eSakshya Card */}
        <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">eSakshya Compliance</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              MHA eSakshya digital repository for crime scene video recording and evidence validation under Section 105 of BNSS 2023.
            </p>

            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Validation Protocol:</span>
                <span className="text-zinc-300">SID PKI Token</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Legal Mandate:</span>
                <span className="text-blue-400">BNSS Sec 105 Mandatory</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncESakshya}
            disabled={isSyncingESakshya}
            className="w-full py-2.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isSyncingESakshya ? 'animate-spin' : ''}`} />
            <span>{isSyncingESakshya ? 'Validating SID Hash...' : 'Verify eSakshya Integrity'}</span>
          </button>
        </div>

        {/* 3. 1930 Cyber Helpline & Mule Freeze Card */}
        <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">1930 NCRP / I4C Portal</h3>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                muleFreezeStatus === 'DISPATCHED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {muleFreezeStatus === 'DISPATCHED' ? 'FROZEN' : 'READY'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              National Cyber Crime Reporting Portal (I4C). Direct API connectivity to Indian banks to place immediate debit freezes on mule bank accounts.
            </p>

            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Mule Account:</span>
                <span className="text-zinc-300">ICICI ...4819</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Defrauded Sum:</span>
                <span className="text-purple-400">₹4,50,000</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDispatch1930}
            disabled={isDispatching1930}
            className="w-full py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isDispatching1930 ? 'Dispatching Freeze...' : 'Dispatch Instant Bank Freeze'}</span>
          </button>
        </div>

      </div>

      {/* Live Gateway Terminal Logs */}
      <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Real-time Inter-Agency Gateway Event Stream</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Channel: TLS 1.3 mutual-auth</span>
        </div>

        <div className="p-3 rounded bg-zinc-950 border border-zinc-900 font-mono text-[11px] text-emerald-400/90 space-y-1 max-h-40 overflow-y-auto leading-relaxed">
          {gatewayLogs.map((log, index) => (
            <div key={index} className="truncate">
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
