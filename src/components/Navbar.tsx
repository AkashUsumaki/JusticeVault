import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  User, 
  Clock, 
  Globe, 
  LogOut, 
  Smartphone, 
  KeyRound, 
  AlertTriangle,
  ChevronDown,
  Building,
  CheckCircle2,
  RefreshCw,
  Activity,
  Menu,
  X,
  Scale
} from 'lucide-react';
import { LanguageCode, OfficerUser } from '../types';
import { translations } from '../translations/i18n';

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
  const t = translations[currentLang];
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
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'LEVEL_2_SENSITIVE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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
    <header className="sticky top-0 z-40 h-16 bg-[#08090b]/95 backdrop-blur-md border-b border-zinc-800/50 px-3 sm:px-6 select-none">
      <div className="h-full flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        
        {/* Left: Mobile Drawer Button & Active Case Badge */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shrink-0 active:scale-95 transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* Court Brand on mobile */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center text-white">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-white tracking-tight hidden xs:inline">JusticeVault</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-zinc-500 text-[10px] sm:text-xs font-medium tracking-wide hidden sm:inline">ACTIVE CASE:</span>
            <span className="bg-zinc-900 px-2 sm:px-2.5 py-1 rounded border border-zinc-800 text-zinc-100 font-mono text-[10px] sm:text-xs tracking-wider truncate max-w-[140px] sm:max-w-none">
              FIR-2026-CHN-00892
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs border-l border-zinc-800/60 pl-4">
            <span className="text-zinc-500 text-[11px]">System Status:</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Hyperledger Node Live
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

          {/* Tamper Alert Indicator */}
          {tamperAlertCount > 0 && (
            <button
              onClick={onViewTamperAlerts}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse hover:bg-red-500/20 transition"
              title="Tamper incidents detected!"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">{tamperAlertCount} Tamper</span>
            </button>
          )}

          {/* Mobile Field Capture Mode Toggle */}
          <button
            onClick={onToggleFieldMode}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded text-xs font-medium border transition ${
              isFieldMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{isFieldMode ? 'Exit Field Mode' : 'Field Mode'}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
            <Globe className="w-3.5 h-3.5 text-zinc-500 ml-1 mr-0.5 hidden xs:block" />
            {(['en', 'ta', 'ml'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium rounded transition ${
                  currentLang === lang
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'മല'}
              </button>
            ))}
          </div>

          {/* Inactivity Session Timer */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-zinc-200">{formatTime(secondsRemaining)}</span>
            <button
              onClick={() => setSecondsRemaining(900)}
              title={t.extendSession}
              className="text-zinc-500 hover:text-zinc-300 ml-0.5 p-0.5 transition"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Officer Profile & Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsOfficerMenuOpen(!isOfficerMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
            >
              <div className="relative">
                <img
                  src={currentOfficer.avatarUrl}
                  alt={currentOfficer.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-emerald-500"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#08090b]" />
              </div>
              <div className="text-left hidden md:block leading-tight">
                <div className="text-xs font-semibold text-white flex items-center gap-1">
                  <span>{currentOfficer.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" title="KYC Face Authenticated" />
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[130px]">
                  {currentOfficer.stationCode} • {currentOfficer.badgeNumber}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {/* Dropdown Menu */}
            {isOfficerMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="pb-3 border-b border-zinc-800/80">
                  <p className="text-[11px] text-zinc-500 font-medium">Logged in Officer</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{currentOfficer.name}</p>
                  <p className="text-xs text-blue-400 font-medium">{getRoleLabel(currentOfficer.role)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">
                      {currentOfficer.policeStation}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${getClearanceBadgeClass(currentOfficer.clearanceLevel)}`}>
                      {currentOfficer.clearanceLevel.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="py-2.5 space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">KYC Status:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> Face Enrolled (UIDAI)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">KMS Vault ID:</span>
                    <span className="font-mono text-[10px] text-zinc-400">...{currentOfficer.faceEmbeddingId.slice(-8)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                  <button
                    onClick={() => {
                      setIsOfficerMenuOpen(false);
                      onSwitchOfficerClick();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 transition font-medium"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.switchOfficer}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOfficerMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition font-medium"
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
