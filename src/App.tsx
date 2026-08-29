import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FolderLock, 
  Sparkles, 
  Smartphone, 
  Menu,
  Network,
  Boxes,
  Share2,
  Cpu
} from 'lucide-react';
import { 
  FIRDetails, 
  EvidenceItem, 
  BlockchainBlock, 
  OfficerUser, 
  LanguageCode 
} from './types';
import { 
  mockOfficers, 
  mockCases, 
  mockEvidenceItems, 
  mockBlockchainBlocks 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { CommandCenterDashboard } from './components/CommandCenterDashboard';
import { CaseList } from './components/CaseList';
import { EvidenceManager } from './components/EvidenceManager';
import { AIStatementVerifier } from './components/AIStatementVerifier';
import { RelationshipGraph } from './components/RelationshipGraph';
import { BlockchainAuditTrail } from './components/BlockchainAuditTrail';
import { InterStationSharing } from './components/InterStationSharing';
import { PoliceSystemIntegrations } from './components/PoliceSystemIntegrations';
import { FieldEvidenceCapture } from './components/FieldEvidenceCapture';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  // Application Global State
  const [currentOfficer, setCurrentOfficer] = useState<OfficerUser>(mockOfficers[0]);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [currentTab, setCurrentTab] = useState<NavTab>('DASHBOARD');
  
  // Data State
  const [cases, setCases] = useState<FIRDetails[]>(mockCases);
  const [selectedCase, setSelectedCase] = useState<FIRDetails>(mockCases[0]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(mockEvidenceItems);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(mockBlockchainBlocks);

  // Modals & Modes
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFieldMode, setIsFieldMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  };

  // Add new Evidence
  const handleAddEvidence = (item: EvidenceItem) => {
    setEvidenceList([item, ...evidenceList]);
  };

  // Tamper Evidence state toggle (for simulation test)
  const handleTamperEvidence = (evidenceId: string, isTampered: boolean) => {
    setEvidenceList((prev) =>
      prev.map((item) => (item.id === evidenceId ? { ...item, isTampered } : item))
    );
  };

  // Log Blockchain Transaction to local Hyperledger Fabric simulation
  const handleLogBlockchainEvent = (
    action: any,
    details: string,
    evidenceId?: string,
    evidenceHash?: string
  ) => {
    const txId = `TX-${Date.now().toString(16).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`;
    const newTx = {
      id: txId,
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
    <div className="min-h-screen bg-[#050608] text-zinc-300 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Top Law Enforcement Header */}
      <Navbar
        currentOfficer={currentOfficer}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onSwitchOfficerClick={() => setIsAuthModalOpen(true)}
        onLogout={() => setIsAuthModalOpen(true)}
        isFieldMode={isFieldMode}
        onToggleFieldMode={() => {
          setIsFieldMode(!isFieldMode);
          if (!isFieldMode) {
            setCurrentTab('FIELD_CAPTURE');
          } else {
            setCurrentTab('DASHBOARD');
          }
        }}
        tamperAlertCount={tamperAlertCount}
        onViewTamperAlerts={() => setCurrentTab('EVIDENCE')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar (Desktop + Mobile Slide-over Drawer) */}
        <Sidebar
          currentTab={currentTab}
          onTabSelect={(tab) => {
            setCurrentTab(tab);
            if (tab === 'FIELD_CAPTURE') {
              setIsFieldMode(true);
            } else {
              setIsFieldMode(false);
            }
          }}
          currentLang={currentLang}
          casesCount={cases.length}
          evidenceCount={evidenceList.length}
          contradictionAlertsCount={3}
          currentOfficer={currentOfficer}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 pb-20 md:pb-8 bg-[#050608]">
          <div className="max-w-7xl mx-auto">
            
            {/* Dashboard View */}
            {currentTab === 'DASHBOARD' && (
              <CommandCenterDashboard
                cases={cases}
                evidenceList={evidenceList}
                blocks={blocks}
                currentOfficer={currentOfficer}
                currentLang={currentLang}
                onNavigateTab={setCurrentTab}
                onSelectCase={(c) => {
                  setSelectedCase(c);
                  setCurrentTab('EVIDENCE');
                }}
              />
            )}

            {/* Cases View */}
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

            {/* Evidence Vault View */}
            {currentTab === 'EVIDENCE' && (
              <EvidenceManager
                caseItem={selectedCase}
                evidenceList={evidenceList.filter((e) => e.caseId === selectedCase.caseId)}
                currentOfficer={currentOfficer}
                currentLang={currentLang}
                onAddEvidence={handleAddEvidence}
                onTamperEvidence={handleTamperEvidence}
                onLogBlockchainEvent={handleLogBlockchainEvent}
              />
            )}

            {/* AI Statement Verifier View */}
            {currentTab === 'AI_VERIFIER' && (
              <AIStatementVerifier
                caseItem={selectedCase}
                evidenceList={evidenceList.filter((e) => e.caseId === selectedCase.caseId)}
                currentOfficer={currentOfficer}
                currentLang={currentLang}
                onLogBlockchainEvent={handleLogBlockchainEvent}
              />
            )}

            {/* Entity Network & Timeline View */}
            {currentTab === 'RELATIONSHIPS' && (
              <RelationshipGraph
                caseItem={selectedCase}
                currentLang={currentLang}
              />
            )}

            {/* Blockchain Audit & Chain of Custody Explorer View */}
            {currentTab === 'BLOCKCHAIN' && (
              <BlockchainAuditTrail
                blocks={blocks}
                caseItem={selectedCase}
                evidenceList={evidenceList}
                currentOfficer={currentOfficer}
                currentLang={currentLang}
              />
            )}

            {/* Inter-Station Sharing View */}
            {currentTab === 'SHARING' && (
              <InterStationSharing
                caseItem={selectedCase}
                currentOfficer={currentOfficer}
                currentLang={currentLang}
                onLogBlockchainEvent={handleLogBlockchainEvent}
              />
            )}

            {/* Police Integrations (CCTNS / eSakshya / 1930) View */}
            {currentTab === 'INTEGRATIONS' && (
              <PoliceSystemIntegrations
                caseItem={selectedCase}
                currentOfficer={currentOfficer}
                currentLang={currentLang}
                onLogBlockchainEvent={handleLogBlockchainEvent}
              />
            )}

            {/* Mobile Field Evidence Capture View */}
            {currentTab === 'FIELD_CAPTURE' && (
              <FieldEvidenceCapture
                caseItem={selectedCase}
                currentOfficer={currentOfficer}
                currentLang={currentLang}
                onAddEvidence={handleAddEvidence}
                onLogBlockchainEvent={handleLogBlockchainEvent}
              />
            )}

          </div>
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar (Thumb Reachable) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090b]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around">
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
          <span className="text-[10px] mt-0.5">Overview</span>
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

      {/* Immersive Stealth Footer (Desktop only) */}
      <footer className="hidden md:flex h-8 bg-[#0a0c0f] border-t border-zinc-800/50 px-6 items-center justify-between text-[9px] text-zinc-600 uppercase tracking-widest select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            CONSORTIUM NETWORK SECURE
          </span>
          <span className="hidden sm:inline">TLS 1.3 / AES-GCM-256</span>
        </div>
        <div className="flex items-center gap-4">
          <span>BSA 2023 / SEC 65B COMPLIANT</span>
          <span className="font-mono text-zinc-500">FABRIC V2.5.4</span>
        </div>
      </footer>

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
        }}
        initialOfficer={currentOfficer}
      />

    </div>
  );
};

export default App;
