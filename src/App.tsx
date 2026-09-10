import React, { useState, useEffect } from 'react';
import { 
  mockOfficers, 
  mockCases, 
  mockEvidenceItems, 
  mockBlockchainBlocks 
} from './data/mockData';
import { 
  OfficerUser, 
  LanguageCode, 
  NavTab, 
  FIRDetails, 
  EvidenceItem, 
  BlockchainBlock,
  BlockchainTransaction
} from './types';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CommandCenterDashboard } from './components/CommandCenterDashboard';
import { CaseList } from './components/CaseList';
import { EvidenceManager } from './components/EvidenceManager';
import { AIStatementVerifier } from './components/AIStatementVerifier';
import { FieldEvidenceCapture } from './components/FieldEvidenceCapture';
import { BlockchainAuditTrail } from './components/BlockchainAuditTrail';
import { InterStationSharing } from './components/InterStationSharing';
import { PoliceSystemIntegrations } from './components/PoliceSystemIntegrations';
import { LegalCompliance } from './components/LegalCompliance';
import { AuthModal } from './components/AuthModal';
import { RelationshipGraph } from './components/RelationshipGraph';
import { OSMEvidenceMap } from './components/OSMEvidenceMap';
import { VictimEnquiry } from './components/VictimEnquiry';
import { SecureDatabaseView } from './components/SecureDatabaseView';
import { GovernmentMasthead, GovernmentFooter } from './components/NationalEmblem';
import { 
  LayoutDashboard, 
  FileText, 
  FolderLock, 
  Sparkles, 
  Smartphone, 
  Boxes, 
  Share2, 
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Plus,
  ShieldCheck
} from 'lucide-react';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'alert' | 'info';
  timestamp: string;
}

export const App: React.FC = () => {
  // Application Global State with LocalStorage Persistence
  const [currentOfficer, setCurrentOfficer] = useState<OfficerUser>(() => {
    const saved = localStorage.getItem('jv_officer');
    return saved ? JSON.parse(saved) : mockOfficers[0];
  });

  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [currentTab, setCurrentTab] = useState<NavTab>('DASHBOARD');
  const [fontSizeScale, setFontSizeScale] = useState<'small' | 'normal' | 'large'>('normal');
  
  // Data State with Persistence
  const [cases, setCases] = useState<FIRDetails[]>(() => {
    const saved = localStorage.getItem('jv_cases');
    return saved ? JSON.parse(saved) : mockCases;
  });

  const [selectedCase, setSelectedCase] = useState<FIRDetails>(() => {
    const saved = localStorage.getItem('jv_selected_case');
    return saved ? JSON.parse(saved) : mockCases[0];
  });

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(() => {
    const saved = localStorage.getItem('jv_evidence');
    return saved ? JSON.parse(saved) : mockEvidenceItems;
  });

  const [blocks, setBlocks] = useState<BlockchainBlock[]>(() => {
    const saved = localStorage.getItem('jv_blocks');
    return saved ? JSON.parse(saved) : mockBlockchainBlocks;
  });

  // Real-time Event Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals & Modes
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFieldMode, setIsFieldMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [evidenceSubTab, setEvidenceSubTab] = useState<'DATABASE' | 'CATALOG'>('DATABASE');

  // Sync to database backend on mount
  const syncWithDatabaseBackend = async () => {
    try {
      const [casesRes, evRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/evidence')
      ]);
      const casesData = await casesRes.json();
      const evData = await evRes.json();

      if (casesData.success && Array.isArray(casesData.cases) && casesData.cases.length > 0) {
        setCases(casesData.cases);
      }
      if (evData.success && Array.isArray(evData.evidence) && evData.evidence.length > 0) {
        setEvidenceList(evData.evidence);
      }
    } catch (err) {
      console.warn('Backend database sync fallback to local storage:', err);
    }
  };

  useEffect(() => {
    syncWithDatabaseBackend();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('jv_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('jv_selected_case', JSON.stringify(selectedCase));
  }, [selectedCase]);

  useEffect(() => {
    localStorage.setItem('jv_evidence', JSON.stringify(evidenceList));
  }, [evidenceList]);

  useEffect(() => {
    localStorage.setItem('jv_blocks', JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    localStorage.setItem('jv_officer', JSON.stringify(currentOfficer));
  }, [currentOfficer]);

  // Toast Helper
  const pushToast = (title: string, message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  // Tamper alert count
  const tamperAlertCount = evidenceList.filter((e) => e.isTampered).length;

  // Add new FIR Case
  const handleCreateCase = (newCase: FIRDetails) => {
    setCases([newCase, ...cases]);
    setSelectedCase(newCase);
    handleLogBlockchainEvent(
      'FIR_GENESIS_COMMIT',
      `Registered new FIR ${newCase.firNumber} at ${newCase.policeStation}`,
      undefined
    );
    pushToast('FIR Registered', `Case ${newCase.firNumber} sealed on Hyperledger Fabric`, 'success');
  };

  // Add new Evidence
  const handleAddEvidence = (item: EvidenceItem) => {
    setEvidenceList([item, ...evidenceList]);
    pushToast(
      'Evidence Stamped',
      `${item.title} SHA-256 hashed & anchored to chain`,
      'success'
    );
  };

  // Tamper Evidence state toggle (for simulation test)
  const handleTamperEvidence = (evidenceId: string, isTampered: boolean) => {
    setEvidenceList((prev) =>
      prev.map((item) => (item.id === evidenceId ? { ...item, isTampered } : item))
    );
    if (isTampered) {
      pushToast(
        'Tamper Warning',
        `Cryptographic mismatch detected on evidence ${evidenceId}`,
        'alert'
      );
    }
  };

  // Log Blockchain Transaction to local Hyperledger Fabric simulation
  const handleLogBlockchainEvent = (
    action: any,
    details: string,
    evidenceId?: string,
    evidenceHash?: string
  ) => {
    const txId = `TX-${Date.now().toString(16).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`;
    const newTx: BlockchainTransaction = {
      id: txId,
      txId,
      timestamp: new Date().toISOString(),
      action,
      officerId: currentOfficer.id,
      officerName: currentOfficer.name,
      officerBadge: currentOfficer.badgeNumber,
      stationCode: currentOfficer.stationCode,
      evidenceId,
      evidenceHash,
      details,
      signature: `SIG_ED25519_${Date.now().toString(16).toUpperCase()}_0x88921a4f001`,
    };

    setBlocks((prev) => {
      const latestBlock = { ...prev[0] };
      latestBlock.transactions = [newTx, ...latestBlock.transactions];
      return [latestBlock, ...prev.slice(1)];
    });
  };

  return (
    <div className={`min-h-screen bg-[#040e1c] text-slate-200 flex flex-col font-sans selection:bg-amber-600 selection:text-white relative ${
      fontSizeScale === 'large' ? 'text-base' : fontSizeScale === 'small' ? 'text-xs' : 'text-sm'
    }`}>
      
      {/* Official Government of India GIGW Masthead Strip */}
      <GovernmentMasthead onFontSizeChange={setFontSizeScale} />

      {/* Top Law Enforcement Portal Header */}
      <Navbar
        currentOfficer={currentOfficer}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onSwitchOfficerClick={() => setIsAuthModalOpen(true)}
        onLogout={() => setIsAuthModalOpen(true)}
        isFieldMode={isFieldMode}
        onToggleFieldMode={() => {
          setIsFieldMode(!isFieldMode);
          setCurrentTab(isFieldMode ? 'DASHBOARD' : 'FIELD_CAPTURE');
        }}
        tamperAlertCount={tamperAlertCount}
        onViewTamperAlerts={() => setCurrentTab('EVIDENCE')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Government Consortium Sub-header Status & Case Selector Bar */}
      <div className="bg-[#061833] border-b border-blue-900/60 px-4 sm:px-6 py-2 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          
          {/* Active Docket Case Selector */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              सक्रिय प्राथमिकी / ACTIVE FIR:
            </span>
            <select
              value={selectedCase.caseId}
              onChange={(e) => {
                const target = cases.find((c) => c.caseId === e.target.value);
                if (target) setSelectedCase(target);
              }}
              className="bg-blue-950 border border-blue-700/80 rounded px-2.5 py-1 text-xs text-amber-200 font-semibold focus:border-amber-400 focus:outline-none max-w-[260px] truncate shadow-sm"
            >
              {cases.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.firNumber} — {c.title || c.briefDescription.slice(0, 24)}
                </option>
              ))}
            </select>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-200 border border-blue-700/60 whitespace-nowrap shrink-0">
              {selectedCase.policeStation}
            </span>
          </div>

          {/* Real-time National Police Consortium Node Ticker */}
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">peer0.mha.gov.in (National Police Grid)</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-bold">Ledger #{blocks.length}</span>
            </div>

            <span className="hidden md:inline px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/50 text-[10px] font-mono text-emerald-300 font-bold">
              BSA 2023 / SEC 65B CERTIFIED
            </span>
          </div>

        </div>
      </div>

      {/* Main Application Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabSelect={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
            if (tab === 'FIELD_CAPTURE') {
              setIsFieldMode(true);
            } else {
              setIsFieldMode(false);
            }
          }}
          currentLang={currentLang}
          casesCount={cases.length}
          evidenceCount={evidenceList.length}
          contradictionAlertsCount={tamperAlertCount}
          currentOfficer={currentOfficer}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto pb-20 md:pb-8">
          
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'DASHBOARD' && (
            <CommandCenterDashboard
              cases={cases}
              onSelectCase={(c) => {
                setSelectedCase(c);
                setCurrentTab('EVIDENCE');
              }}
              evidenceList={evidenceList}
              blocks={blocks}
              currentOfficer={currentOfficer}
              currentLang={currentLang}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* TAB 2: CASES */}
          {currentTab === 'CASES' && (
            <CaseList
              cases={cases}
              currentOfficer={currentOfficer}
              currentLang={currentLang}
              onSelectCase={(c) => {
                setSelectedCase(c);
                setCurrentTab('EVIDENCE');
              }}
              onCreateCase={handleCreateCase}
              onOpenAIVerifier={(c) => {
                setSelectedCase(c);
                setCurrentTab('AI_VERIFIER');
              }}
              onOpenSharing={(c) => {
                setSelectedCase(c);
                setCurrentTab('SHARING');
              }}
            />
          )}

          {/* TAB 3: EVIDENCE VAULT & SECURE DATABASE */}
          {currentTab === 'EVIDENCE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400 pl-2">Evidence View:</span>
                  <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs">
                    <button
                      onClick={() => setEvidenceSubTab('DATABASE')}
                      className={`px-3 py-1.5 rounded-md font-medium transition ${
                        evidenceSubTab === 'DATABASE'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      AES-256 Secure Database Vault
                    </button>
                    <button
                      onClick={() => setEvidenceSubTab('CATALOG')}
                      className={`px-3 py-1.5 rounded-md font-medium transition ${
                        evidenceSubTab === 'CATALOG'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Chain of Custody Workspace
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('VICTIM_ENQUIRY')}
                    className="text-xs px-3 py-1.5 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>Victim Voice Enquiry</span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('MAP_LOCATIONS')}
                    className="text-xs px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>OpenStreetMap Radar</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </button>
                </div>
              </div>

              {evidenceSubTab === 'DATABASE' ? (
                <SecureDatabaseView
                  selectedCase={selectedCase}
                  onEvidenceUpdated={syncWithDatabaseBackend}
                  onSelectEvidence={(ev) => {
                    setEvidenceSubTab('CATALOG');
                  }}
                />
              ) : (
                <EvidenceManager
                  evidenceList={evidenceList}
                  caseItem={selectedCase}
                  currentOfficer={currentOfficer}
                  currentLang={currentLang}
                  onAddEvidence={handleAddEvidence}
                  onTamperToggle={handleTamperEvidence}
                  onLogBlockchainEvent={handleLogBlockchainEvent}
                />
              )}
            </div>
          )}

          {/* TAB: VICTIM ENQUIRY VOICE-TO-TEXT & EXACT EVIDENCE COMPARING */}
          {currentTab === 'VICTIM_ENQUIRY' && (
            <VictimEnquiry
              selectedCase={selectedCase}
              evidenceList={evidenceList}
              onSelectEvidence={(ev) => {
                setCurrentTab('EVIDENCE');
                setEvidenceSubTab('DATABASE');
              }}
              onEnquirySaved={syncWithDatabaseBackend}
            />
          )}

          {/* TAB: GEOSPATIAL OPENSTREETMAP LEAFLET EVIDENCE RADAR */}
          {currentTab === 'MAP_LOCATIONS' && (
            <div className="h-[calc(100vh-140px)] min-h-[550px]">
              <OSMEvidenceMap
                selectedCase={selectedCase}
                evidenceList={evidenceList}
                onSelectEvidence={(ev) => {
                  setCurrentTab('EVIDENCE');
                  setEvidenceSubTab('DATABASE');
                }}
              />
            </div>
          )}

          {/* TAB 4: AI WITNESS STATEMENT VERIFIER */}
          {currentTab === 'AI_VERIFIER' && (
            <AIStatementVerifier
              caseItem={selectedCase}
              evidenceList={evidenceList.filter((e) => e.caseId === selectedCase.caseId)}
              currentOfficer={currentOfficer}
              currentLang={currentLang}
              onLogBlockchainEvent={handleLogBlockchainEvent}
            />
          )}

          {/* TAB 5: MOBILE FIELD CAPTURE (BSA SEC 65B WATERMARKING) */}
          {currentTab === 'FIELD_CAPTURE' && (
            <FieldEvidenceCapture
              caseItem={selectedCase}
              currentOfficer={currentOfficer}
              currentLang={currentLang}
              onAddEvidence={(item) => {
                handleAddEvidence(item);
                setCurrentTab('EVIDENCE');
              }}
              onLogBlockchainEvent={handleLogBlockchainEvent}
            />
          )}

          {/* TAB 6: BLOCKCHAIN AUDIT TRAIL */}
          {currentTab === 'BLOCKCHAIN' && (
            <BlockchainAuditTrail
              blocks={blocks}
              caseItem={selectedCase}
              evidenceList={evidenceList.filter((e) => e.caseId === selectedCase.caseId)}
              currentOfficer={currentOfficer}
              currentLang={currentLang}
              onMineBlock={() => {
                const newBlockNum = blocks.length + 1;
                const newHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}b881`;
                const newBlock: BlockchainBlock = {
                  blockNumber: newBlockNum,
                  blockHash: newHash,
                  currentHash: newHash,
                  previousHash: blocks[0].blockHash || blocks[0].currentHash || '0x000',
                  merkleRoot: `0x${Math.random().toString(16).slice(2, 12)}f1929481`,
                  timestamp: new Date().toISOString(),
                  transactionsCount: 0,
                  channelId: 'police-consortium-chn',
                  organization: 'Tamil Nadu Police Consortium Node',
                  transactions: [],
                };
                setBlocks([newBlock, ...blocks]);
                pushToast('Block Sealed', `Consortium Height increased to #${newBlockNum}`, 'success');
              }}
            />
          )}

          {/* TAB 7: RELATIONSHIP GRAPH & CRIME TIMELINE */}
          {currentTab === 'RELATIONSHIPS' && (
            <RelationshipGraph
              caseItem={selectedCase}
              currentLang={currentLang}
              evidenceList={evidenceList.filter((e) => e.caseId === selectedCase.caseId)}
            />
          )}

          {/* TAB 8: INTER-STATION SHARING */}
          {currentTab === 'SHARING' && (
            <InterStationSharing
              caseItem={selectedCase}
              currentOfficer={currentOfficer}
              currentLang={currentLang}
              onLogBlockchainEvent={handleLogBlockchainEvent}
            />
          )}

          {/* TAB 9: POLICE SYSTEMS INTEGRATION (CCTNS / eSakshya / 1930) */}
          {currentTab === 'INTEGRATIONS' && (
            <PoliceSystemIntegrations
              caseItem={selectedCase}
              currentOfficer={currentOfficer}
              currentLang={currentLang}
              onLogBlockchainEvent={handleLogBlockchainEvent}
            />
          )}

          {/* TAB 10: LEGAL COMPLIANCE AUDIT (BSA 2023 / BNSS / BNS) */}
          {currentTab === 'LEGAL' && (
            <LegalCompliance
              currentLang={currentLang}
              caseItem={selectedCase}
              evidenceList={evidenceList.filter((e) => e.caseId === selectedCase.caseId)}
            />
          )}

        </main>
      </div>

      {/* Floating Real-Time Toast Notifications */}
      <div className="fixed bottom-16 md:bottom-10 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-lg border shadow-xl backdrop-blur-md text-xs pointer-events-auto flex items-start gap-2.5 animate-in slide-in-from-bottom-5 duration-300 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                : t.type === 'alert'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
                : 'bg-zinc-950/90 border-blue-500/50 text-blue-100'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : t.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold tracking-tight">{t.title}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{t.timestamp}</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">{t.message}</p>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-zinc-400 hover:text-white shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#08090b]/95 backdrop-blur-lg border-t border-zinc-800/80 z-40 flex items-center justify-around px-2">
        <button
          onClick={() => {
            setCurrentTab('DASHBOARD');
            setIsFieldMode(false);
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded transition ${
            currentTab === 'DASHBOARD' ? 'text-blue-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('CASES');
            setIsFieldMode(false);
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded transition ${
            currentTab === 'CASES' ? 'text-blue-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Cases</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('EVIDENCE');
            setIsFieldMode(false);
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded transition ${
            currentTab === 'EVIDENCE' ? 'text-blue-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Vault</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('AI_VERIFIER');
            setIsFieldMode(false);
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded transition ${
            currentTab === 'AI_VERIFIER' ? 'text-purple-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">AI Check</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('FIELD_CAPTURE');
            setIsFieldMode(true);
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded transition ${
            currentTab === 'FIELD_CAPTURE' ? 'text-amber-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Field</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded text-zinc-500 hover:text-zinc-300 transition"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </div>

      {/* Official Government of India Portal Footer */}
      <GovernmentFooter />

      {/* KYC Face Auth & Officer Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(officer) => {
          setCurrentOfficer(officer);
          setIsAuthModalOpen(false);
          handleLogBlockchainEvent(
            'OFFICER_AUTH_LOGIN',
            `Officer ${officer.name} (${officer.badgeNumber}) authenticated via KYC Face Liveness & MFA OTP`
          );
          pushToast('Officer Authenticated', `${officer.name} (${officer.badgeNumber})`, 'success');
        }}
        initialOfficer={currentOfficer}
      />

    </div>
  );
};

export default App;
