import React from 'react';
import {
  LayoutDashboard,
  FolderLock,
  Sparkles,
  Network,
  Boxes,
  Share2,
  Cpu,
  Smartphone,
  Scale,
  FileText,
  CheckCircle2,
  X
} from 'lucide-react';
import { LanguageCode, OfficerUser } from '../types';
import { translations } from '../translations/i18n';

export type NavTab = 
  | 'DASHBOARD'
  | 'CASES'
  | 'EVIDENCE'
  | 'AI_VERIFIER'
  | 'RELATIONSHIPS'
  | 'BLOCKCHAIN'
  | 'SHARING'
  | 'INTEGRATIONS'
  | 'FIELD_CAPTURE';

interface SidebarProps {
  currentTab: NavTab;
  onTabSelect: (tab: NavTab) => void;
  currentLang: LanguageCode;
  casesCount: number;
  evidenceCount: number;
  contradictionAlertsCount: number;
  currentOfficer?: OfficerUser;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabSelect,
  currentLang,
  casesCount,
  evidenceCount,
  contradictionAlertsCount,
  currentOfficer,
  isOpen = false,
  onClose,
}) => {
  const t = translations[currentLang];

  const navItems = [
    {
      id: 'DASHBOARD' as NavTab,
      label: t.navDashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'CASES' as NavTab,
      label: t.navCases,
      icon: FileText,
      badge: casesCount.toString(),
      badgeColor: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
    },
    {
      id: 'EVIDENCE' as NavTab,
      label: t.navEvidence,
      icon: FolderLock,
      badge: evidenceCount.toString(),
      badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    {
      id: 'AI_VERIFIER' as NavTab,
      label: t.navAIVerifier,
      icon: Sparkles,
      badge: contradictionAlertsCount > 0 ? `${contradictionAlertsCount} Flagged` : 'AI Engine',
      badgeColor: contradictionAlertsCount > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    {
      id: 'RELATIONSHIPS' as NavTab,
      label: t.navRelations,
      icon: Network,
      badge: null,
    },
    {
      id: 'BLOCKCHAIN' as NavTab,
      label: t.navBlockchain,
      icon: Boxes,
      badge: 'Fabric',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'SHARING' as NavTab,
      label: t.navSharing,
      icon: Share2,
      badge: null,
    },
    {
      id: 'INTEGRATIONS' as NavTab,
      label: t.navIntegrations,
      icon: Cpu,
      badge: 'CCTNS',
      badgeColor: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    },
    {
      id: 'FIELD_CAPTURE' as NavTab,
      label: t.navMobileField,
      icon: Smartphone,
      badge: 'GPS',
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
  ];

  const handleItemClick = (id: NavTab) => {
    onTabSelect(id);
    if (onClose) {
      onClose();
    }
  };

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="p-4 sm:p-5 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold tracking-tighter text-white text-base">JusticeVault</div>
              <div className="text-[9px] text-zinc-500 font-mono tracking-wider">EVIDENCE & COURT SUITE</div>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="py-3 sm:py-4">
          <div className="px-5 mb-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            Investigation Modules
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`px-5 py-3 sm:py-2.5 flex items-center justify-between cursor-pointer transition text-xs font-medium active:scale-[0.99] ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Officer KYC / Session Footer */}
      <div className="p-4 bg-[#0a0c0f] border-t border-zinc-800/50">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-9 h-9 rounded-full border-2 border-emerald-500 overflow-hidden bg-zinc-800 shrink-0">
            {currentOfficer?.avatarUrl ? (
              <img src={currentOfficer.avatarUrl} alt={currentOfficer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">
              {currentOfficer?.name || 'Arul Selvam'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono tracking-tighter flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              KYC VERIFIED
            </div>
          </div>
        </div>
        
        <div className="text-[9px] text-zinc-600 font-mono flex justify-between pt-1 border-t border-zinc-800/40">
          <span>IP: 10.12.94.1</span>
          <span>STATION: {currentOfficer?.stationCode || 'TN-CHN-01'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#08090b] border-r border-zinc-800/50 flex-col justify-between shrink-0 select-none">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#08090b] border-r border-zinc-800 shadow-2xl flex flex-col justify-between select-none transform transition-transform duration-200 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderContent(true)}
      </div>
    </>
  );
};
