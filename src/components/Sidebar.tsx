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
  X,
  Mic,
  MapPin,
  Database,
  Award,
  ShieldCheck
} from 'lucide-react';
import { LanguageCode, OfficerUser, NavTab } from '../types';
import { translations } from '../translations/i18n';
import { NationalEmblem, TricolorStripe } from './NationalEmblem';

export type { NavTab };

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
  const t = translations[currentLang] || translations.en;

  const navItems = [
    {
      id: 'DASHBOARD' as NavTab,
      label: t.navDashboard,
      icon: LayoutDashboard,
      badge: 'ICJS',
      badgeColor: 'bg-blue-950 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'CASES' as NavTab,
      label: t.navCases,
      icon: FileText,
      badge: casesCount.toString(),
      badgeColor: 'bg-blue-950 text-slate-300 border border-blue-800/80',
    },
    {
      id: 'EVIDENCE' as NavTab,
      label: t.navEvidence,
      icon: FolderLock,
      badge: evidenceCount.toString(),
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-600/40',
    },
    {
      id: 'VICTIM_ENQUIRY' as NavTab,
      label: t.navVictimEnquiry,
      icon: Mic,
      badge: 'Bhashini AI',
      badgeColor: 'bg-purple-950/60 text-purple-300 border border-purple-600/30',
    },
    {
      id: 'MAP_LOCATIONS' as NavTab,
      label: t.navMapLocations,
      icon: MapPin,
      badge: 'OSM Leaflet',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40',
    },
    {
      id: 'AI_VERIFIER' as NavTab,
      label: t.navAIVerifier,
      icon: Sparkles,
      badge: contradictionAlertsCount > 0 ? `${contradictionAlertsCount} Flagged` : 'BSA 65B AI',
      badgeColor: contradictionAlertsCount > 0 ? 'bg-red-950/80 text-red-300 border border-red-500/40' : 'bg-blue-950 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'RELATIONSHIPS' as NavTab,
      label: t.navRelations,
      icon: Network,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'BLOCKCHAIN' as NavTab,
      label: t.navBlockchain,
      icon: Boxes,
      badge: 'Hyperledger',
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/40',
    },
    {
      id: 'SHARING' as NavTab,
      label: t.navSharing,
      icon: Share2,
      badge: 'Inter-State',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-700/40',
    },
    {
      id: 'INTEGRATIONS' as NavTab,
      label: t.navIntegrations,
      icon: Cpu,
      badge: 'CCTNS Live',
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-600/40',
    },
    {
      id: 'FIELD_CAPTURE' as NavTab,
      label: t.navMobileField,
      icon: Smartphone,
      badge: 'Sec 65B',
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-600/40',
    },
    {
      id: 'LEGAL' as NavTab,
      label: 'BSA 2023 & Court Suite',
      icon: Scale,
      badge: 'Legal Acts',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-700/40',
    },
  ];

  const handleItemClick = (tab: NavTab) => {
    onTabSelect(tab);
    if (onClose) {
      onClose();
    }
  };

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full bg-[#051429] text-slate-200">
      {/* Brand Header */}
      <div>
        <div className="p-4 sm:p-5 border-b border-blue-900/60 flex items-center justify-between bg-[#040f20]">
          <div className="flex items-center gap-3">
            <NationalEmblem size={32} className="shrink-0" />
            <div>
              <div className="font-bold tracking-tight text-white text-base font-serif flex items-center gap-1.5">
                <span>न्याय-साक्ष्य</span>
                <span className="text-amber-400 text-xs font-sans font-bold">PORTAL</span>
              </div>
              <div className="text-[9px] text-amber-300 font-medium tracking-wider uppercase">
                GOVERNMENT OF INDIA • MHA
              </div>
              <div className="text-[8px] text-slate-400 font-mono tracking-tight">
                CCTNS &amp; ICJS DIGITAL EVIDENCE
              </div>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-blue-950 border border-blue-800 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="py-3 sm:py-3.5">
          <div className="px-5 mb-2 text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center justify-between">
            <span>OFFICIAL MODULES</span>
            <span className="text-[9px] text-slate-400 font-mono font-normal">GIGW 3.0</span>
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`px-5 py-2.5 sm:py-2 flex items-center justify-between cursor-pointer transition text-xs font-medium active:scale-[0.99] ${
                    isActive
                      ? 'bg-blue-900/60 text-amber-300 border-r-4 border-amber-500 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Officer KYC / Sovereign Session Footer */}
      <div className="p-3.5 bg-[#030d1c] border-t border-blue-900/60">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 overflow-hidden bg-blue-950 shrink-0 shadow-sm">
            {currentOfficer?.avatarUrl ? (
              <img src={currentOfficer.avatarUrl} alt={currentOfficer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">
              {currentOfficer?.name || 'Arul Selvam'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono tracking-tight flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>GOVT KYC VERIFIED</span>
            </div>
          </div>
        </div>
        
        <div className="text-[9px] text-slate-400 font-mono flex justify-between pt-1.5 border-t border-blue-950">
          <span className="text-amber-300/90 font-semibold">CCTNS NODE: LIVE</span>
          <span>{currentOfficer?.stationCode || 'TN-CHN-01'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#051429] border-r border-blue-900/60 flex-col justify-between shrink-0 select-none shadow-md">
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
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#051429] border-r border-blue-900 shadow-2xl flex flex-col justify-between select-none transform transition-transform duration-200 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderContent(true)}
      </div>
    </>
  );
};
