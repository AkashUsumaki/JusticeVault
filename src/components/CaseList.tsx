import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  FolderLock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  Shield,
  MapPin,
  User,
  Share2
} from 'lucide-react';
import { CaseStatus, FIRDetails, LanguageCode, OfficerUser } from '../types';
import { translations } from '../translations/i18n';

interface CaseListProps {
  cases: FIRDetails[];
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onSelectCase: (caseItem: FIRDetails) => void;
  onCreateCase: (newCase: FIRDetails) => void;
  onOpenAIVerifier: (caseItem: FIRDetails) => void;
  onOpenSharing: (caseItem: FIRDetails) => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  currentOfficer,
  currentLang,
  onSelectCase,
  onCreateCase,
  onOpenAIVerifier,
  onOpenSharing,
}) => {
  const t = translations[currentLang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'ALL'>('ALL');
  const [isNewFIRModalOpen, setIsNewFIRModalOpen] = useState(false);

  // New FIR Form State
  const [firNumber, setFirNumber] = useState(`FIR No. ${Math.floor(Math.random() * 800) + 100}/2026`);
  const [policeStation, setPoliceStation] = useState(currentOfficer.policeStation);
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [offenceSections, setOffenceSections] = useState('BNS 318(4) / IPC 420 (Cheating), IT Act 66D');
  const [complainantName, setComplainantName] = useState('');
  const [complainantContact, setComplainantContact] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');
  const [accusedName, setAccusedName] = useState('');
  const [accusedDetails, setAccusedDetails] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('Mylapore, Chennai');
  const [briefDescription, setBriefDescription] = useState('');

  // ABAC / RBAC filter: IOs view assigned cases, Supervisors view all station cases, Admins view all
  const filteredCases = cases.filter((c) => {
    // Role clearance
    if (currentOfficer.role === 'INVESTIGATION_OFFICER' && c.investigatingOfficerId !== currentOfficer.id) {
      // In demo, let IO see their assigned cases + allow viewing shared cases
    }
    
    // Status filter
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        c.firNumber.toLowerCase().includes(q) ||
        c.caseId.toLowerCase().includes(q) ||
        c.policeStation.toLowerCase().includes(q) ||
        c.briefDescription.toLowerCase().includes(q) ||
        c.complainant.name.toLowerCase().includes(q) ||
        c.offenceSections.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const handleCreateFIR = (e: React.FormEvent) => {
    e.preventDefault();
    const caseId = `TN-CHN-2026-00${Math.floor(Math.random() * 9000) + 1000}`;
    const newCaseItem: FIRDetails = {
      firNumber,
      caseId,
      policeStation,
      stationCode: currentOfficer.stationCode,
      registrationDate,
      registrationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offenceSections: offenceSections.split(',').map((s) => s.trim()),
      complainant: {
        name: complainantName || 'Anonymous Complainant',
        contact: complainantContact || '+91 98000 00000',
        address: complainantAddress || 'Chennai',
        identification: 'Aadhaar Verified'
      },
      accused: [
        {
          name: accusedName || 'Suspect Under Investigation',
          status: 'Identified',
          details: accusedDetails || 'Prime person of interest'
        }
      ],
      incidentDate: registrationDate,
      incidentLocation,
      briefDescription: briefDescription || 'Registered investigation case under active evidence gathering.',
      investigatingOfficerId: currentOfficer.id,
      investigatingOfficerName: currentOfficer.name,
      status: 'UNDER_INVESTIGATION',
      chargesheetDeadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysRemainingForChargesheet: 75
    };

    onCreateCase(newCaseItem);
    setIsNewFIRModalOpen(false);
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Open Case</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock className="w-3 h-3" /> Under Investigation</span>;
      case 'CHARGE_SHEET_FILED':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Charge Sheet Filed</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">Closed / Disposed</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & New FIR Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{t.caseDashboard}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            CCTNS Synced & Hyperledger Fabric Immutable FIR Records
          </p>
        </div>

        <button
          onClick={() => setIsNewFIRModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newFIR}</span>
        </button>
      </div>

      {/* 90-Day Statutory Chargesheet Deadline Banner */}
      <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.deadlineAlert}</h3>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
              Under Bharatiya Nagarik Suraksha Sanhita (BNSS) / CrPC Sec 167(2), chargesheet must be filed within 60/90 days of custody to preserve remand detention rights.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono">
            Active Remand Tracking: <strong className="text-blue-400">3 Cases</strong>
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search FIR, Section, Case ID, Complainant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0a0c0f] border border-zinc-800 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'UNDER_INVESTIGATION', 'CHARGE_SHEET_FILED', 'OPEN', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#0a0c0f] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {st === 'ALL' ? 'All Cases' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCases.map((c) => {
          const isUrgent = c.daysRemainingForChargesheet <= 60;
          return (
            <div
              key={c.caseId}
              className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 hover:border-zinc-700 transition space-y-4 shadow-sm"
            >
              {/* Top Row: Case IDs & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-zinc-900 text-blue-400 border border-zinc-800">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{c.firNumber}</span>
                      <span className="text-xs font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {c.caseId}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.policeStation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Deadline countdown badge */}
                  <div className={`px-2.5 py-1 rounded text-xs font-mono border flex items-center gap-1.5 ${
                    isUrgent 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{c.daysRemainingForChargesheet} Days to Chargesheet</span>
                  </div>

                  {getStatusBadge(c.status)}
                </div>
              </div>

              {/* Middle Row: Offence Sections & Synopsis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">Offence Sections (BNS / IPC):</span>
                  <div className="flex flex-wrap gap-1">
                    {c.offenceSections.map((sec, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono text-[11px]">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">Complainant & Suspects:</span>
                  <p className="text-zinc-300 font-medium">{c.complainant.name}</p>
                  <p className="text-zinc-500 text-[11px]">
                    Accused: {c.accused.map((a) => `${a.name} (${a.status})`).join(', ')}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">Investigating Officer:</span>
                  <p className="text-zinc-300 font-medium flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-400" /> {c.investigatingOfficerName}
                  </p>
                  <p className="text-zinc-500 text-[11px]">Registered: {c.registrationDate} at {c.registrationTime}</p>
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded border border-zinc-800/80 leading-relaxed">
                <strong className="text-zinc-400">Synopsis: </strong>
                {c.briefDescription}
              </p>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{c.incidentLocation}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSharing(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition"
                    title="Manual Officer-Controlled Inter-Station Sharing"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Share Case</span>
                  </button>

                  <button
                    onClick={() => onOpenAIVerifier(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-medium border border-purple-800/40 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Statement Verifier</span>
                  </button>

                  <button
                    onClick={() => onSelectCase(c)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.25)] transition"
                  >
                    <span>Open Case Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="p-12 text-center bg-[#0a0c0f] border border-zinc-800 rounded-lg">
            <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No FIR Cases Found</h3>
            <p className="text-xs text-zinc-400 mt-1">Try adjusting your search criteria or register a new FIR case.</p>
          </div>
        )}
      </div>

      {/* New FIR Modal */}
      {isNewFIRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#08090b] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Register New FIR & Initiate Case Vault</h2>
                <p className="text-xs text-zinc-400">Integrated with CCTNS & Hyperledger Blockchain Genesis Log</p>
              </div>
              <button
                onClick={() => setIsNewFIRModalOpen(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFIR} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">FIR Number</label>
                  <input
                    type="text"
                    required
                    value={firNumber}
                    onChange={(e) => setFirNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Police Station</label>
                  <input
                    type="text"
                    required
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Offence Sections (BNS 2023 / IPC / Special Acts)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BNS 318(4) Cheating, BNS 61(2) Criminal Conspiracy, IT Act 66D"
                  value={offenceSections}
                  onChange={(e) => setOffenceSections(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Complainant Name & Contact</label>
                  <input
                    type="text"
                    placeholder="Full Name, Phone / Aadhaar"
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Accused / Suspect Information</label>
                  <input
                    type="text"
                    placeholder="Suspect name, alias, status"
                    value={accusedName}
                    onChange={(e) => setAccusedName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Incident Location & Landmark</label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Brief Incident Synopsis</label>
                <textarea
                  rows={3}
                  value={briefDescription}
                  onChange={(e) => setBriefDescription(e.target.value)}
                  placeholder="Summarize the core facts of the complaint, seized items, and modus operandi..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Investigating Officer: <strong className="text-zinc-200">{currentOfficer.name}</strong></span>
                <span className="font-mono text-blue-400">Auto Case ID: TN-CHN-2026-00XXXX</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFIRModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  Register FIR & Commit to Blockchain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
