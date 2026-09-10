import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Clock, 
  Globe, 
  LogOut, 
  Smartphone, 
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  Menu,
  X,
  Scale,
  Award
} from 'lucide-react';
import { LanguageCode, OfficerUser } from '../types';
import { translations } from '../translations/i18n';
import { NationalEmblem, TricolorStripe, DigitalIndiaBadge } from './NationalEmblem';

interface NavbarProps {
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSwitchOfficerClick: () => void;
  onLogout: () => void;
  isFieldMode: boolean;
  onToggleFieldMode: () => void;
  tamperAlertCount: number;
  onViewTamperAlerts: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOfficer,
  currentLang,
  onLanguageChange,
  onSwitchOfficerClick,
  onLogout,
  isFieldMode,
  onToggleFieldMode,
  tamperAlertCount,
  onViewTamperAlerts,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const t = translations[currentLang] || translations.en;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [isOfficerMenuOpen, setIsOfficerMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) return 900;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getClearanceBadgeClass = (clearance: string) => {
    switch (clearance) {
      case 'LEVEL_3_CONFIDENTIAL':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'LEVEL_2_SENSITIVE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'INVESTIGATION_OFFICER':
        return 'Investigating Officer (IO)';
      case 'STATION_SUPERVISOR':
        return 'Station Supervisor (SHO)';
      case 'PUBLIC_PROSECUTOR':
        return 'Public Prosecutor';
      case 'DEPARTMENT_ADMIN':
        return 'State Police Admin';
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#061833]/98 backdrop-blur-md border-b border-blue-900/60 select-none shadow-lg">
      <TricolorStripe height={3} />
      <div className="h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        
        {/* Left: Mobile Drawer Button & Official Identification */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded bg-blue-950/80 border border-blue-800/60 text-slate-300 hover:text-white shrink-0 active:scale-95 transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* National Emblem & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <NationalEmblem size={28} className="shrink-0" />
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-xs sm:text-sm text-white tracking-tight font-serif">
                  न्याय-साक्ष्य
                </span>
                <span className="text-[10px] sm:text-xs text-amber-400 font-bold tracking-wider">
                  JusticeVault
                </span>
              </div>
              <div className="text-[8px] sm:text-[9px] text-slate-300 font-medium tracking-tight truncate max-w-[160px] sm:max-w-none">
                भारत सरकार • Ministry of Home Affairs • ICJS
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-blue-900/60">
            <DigitalIndiaBadge />
          </div>

          {/* Active Docket Badge */}
          <div className="hidden sm:flex items-center gap-1.5 min-w-0 pl-2">
            <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase">DOCKET:</span>
            <span className="bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-700/60 text-amber-200 font-mono text-[11px] tracking-wider truncate">
              FIR-2026-CHN-00892
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Tamper Alert Indicator */}
          {tamperAlertCount > 0 && (
            <button
              onClick={onViewTamperAlerts}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded bg-red-950/80 text-red-300 border border-red-500/50 animate-pulse hover:bg-red-900/60 transition shadow-sm"
              title="Tamper incidents detected!"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span className="hidden xs:inline">{tamperAlertCount} Tamper Alerts</span>
            </button>
          )}

          {/* Mobile Field Capture Mode Toggle */}
          <button
            onClick={onToggleFieldMode}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded text-xs font-medium border transition ${
              isFieldMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/40 shadow-sm'
                : 'bg-blue-950/60 border-blue-800/60 text-slate-300 hover:bg-blue-900/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="hidden md:inline">{isFieldMode ? 'Exit Field Mode' : 'Field Mode'}</span>
          </button>

          {/* Language Switcher with Hindi, English, Tamil, Malayalam */}
          <div className="flex items-center bg-blue-950/80 border border-blue-800/70 rounded p-0.5">
            <Globe className="w-3.5 h-3.5 text-amber-400 ml-1 mr-0.5 hidden xs:block" />
            {(['en', 'hi', 'ta', 'ml'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium rounded transition ${
                  currentLang === lang
                    ? 'bg-blue-700 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : lang === 'ta' ? 'தமிழ்' : 'മല'}
              </button>
            ))}
          </div>

          {/* NIC Secure Session Inactivity Timer */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/70 text-slate-300 text-xs shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-amber-200 font-semibold">{formatTime(secondsRemaining)}</span>
            <button
              onClick={() => setSecondsRemaining(900)}
              title={t.extendSession}
              className="text-slate-400 hover:text-white ml-0.5 p-0.5 transition"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Officer Profile & Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsOfficerMenuOpen(!isOfficerMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded bg-blue-950/80 hover:bg-blue-900/70 border border-blue-800/70 transition shadow-sm"
            >
              <div className="relative">
                <img
                  src={currentOfficer.avatarUrl}
                  alt={currentOfficer.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-amber-400"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#061833]" />
              </div>
              <div className="text-left hidden md:block leading-tight">
                <div className="text-xs font-semibold text-white flex items-center gap-1">
                  <span>{currentOfficer.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" title="Govt. KYC Face Authenticated" />
                </div>
                <div className="text-[10px] text-amber-300 font-mono truncate max-w-[130px]">
                  {currentOfficer.stationCode} • {currentOfficer.badgeNumber}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isOfficerMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-[#071933] border border-blue-800 rounded-lg shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="pb-3 border-b border-blue-900/80">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Authorized Officer</p>
                    <span className="text-[9px] text-emerald-400 font-mono font-semibold">UIDAI VERIFIED</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-0.5">{currentOfficer.name}</p>
                  <p className="text-xs text-blue-300 font-medium">{getRoleLabel(currentOfficer.role)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-slate-200 border border-blue-800 font-mono">
                      {currentOfficer.policeStation}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${getClearanceBadgeClass(currentOfficer.clearanceLevel)}`}>
                      {currentOfficer.clearanceLevel.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="py-2.5 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">KYC Status:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> Face Enrolled (Govt KYC)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">NIC Vault Key:</span>
                    <span className="font-mono text-[10px] text-slate-400">...{currentOfficer.faceEmbeddingId.slice(-8)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Security Clearance:</span>
                    <span className="font-mono text-[10px] text-amber-400">BNSS / BSA Certified</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-900/80 space-y-1.5">
                  <button
                    onClick={() => {
                      setIsOfficerMenuOpen(false);
                      onSwitchOfficerClick();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded bg-blue-900/40 text-blue-200 hover:bg-blue-900/70 border border-blue-700/40 transition font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.switchOfficer}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOfficerMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded bg-red-950/40 text-red-300 hover:bg-red-900/40 border border-red-700/40 transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
