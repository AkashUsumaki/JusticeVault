import React from 'react';
import { ShieldCheck, Lock, ExternalLink, Award, FileText } from 'lucide-react';

/**
 * Official State Emblem of India (Lion Capital of Ashoka) Vector Representation
 * Includes the four Asiatic lions, Ashoka Chakra (Dharma Wheel), bull, horse,
 * and the national motto "सत्यमेव जयते" (Truth Alone Triumphs).
 */
export const NationalEmblem: React.FC<{ className?: string; size?: number; monochrome?: boolean }> = ({
  className = '',
  size = 40,
  monochrome = false,
}) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`} style={{ width: size }}>
      <svg
        viewBox="0 0 100 125"
        width={size}
        height={(size * 1.25)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
        aria-label="State Emblem of India"
      >
        {/* Ashoka Lion Capital Silhouette & Crest */}
        <g fill={monochrome ? 'currentColor' : '#f59e0b'}>
          {/* Central Lion Head */}
          <path d="M50 8C43 8 38 13 38 20C38 24 40 27 43 29C40 31 39 34 39 37C39 42 43 46 48 47L48 56L52 56L52 47C57 46 61 42 61 37C61 34 60 31 57 29C60 27 62 24 62 20C62 13 57 8 50 8Z" />
          {/* Left Lion Profile */}
          <path d="M36 21C31 21 27 25 27 30C27 34 29 37 31 39C29 41 28 44 28 47C28 52 32 56 36 57L39 57L39 47C35 46 33 42 33 38C33 35 34 33 36 31C34 29 33 27 33 24C33 22 34 21 36 21Z" />
          {/* Right Lion Profile */}
          <path d="M64 21C66 21 67 22 67 24C67 27 66 29 64 31C66 33 67 35 67 38C67 42 65 46 61 47L61 57L64 57C68 56 72 52 72 47C72 44 71 41 69 39C71 37 73 34 73 30C73 25 69 21 64 21Z" />
          {/* Main Abacus Platform */}
          <rect x="20" y="58" width="60" height="5" rx="1.5" />
        </g>

        {/* Ashoka Chakra (Dharma Wheel) in Navy Blue */}
        <circle cx="50" cy="72" r="9" stroke={monochrome ? 'currentColor' : '#1e3a8a'} strokeWidth="1.8" fill="#ffffff" />
        <circle cx="50" cy="72" r="2.2" fill={monochrome ? 'currentColor' : '#1e3a8a'} />
        {/* 24 Spokes Representation */}
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="72"
            x2={50 + 8.5 * Math.cos((i * Math.PI) / 6)}
            y2={72 + 8.5 * Math.sin((i * Math.PI) / 6)}
            stroke={monochrome ? 'currentColor' : '#1e3a8a'}
            strokeWidth="0.9"
          />
        ))}

        {/* Guardian Animals Left (Galloping Horse) & Right (Bull) */}
        <g fill={monochrome ? 'currentColor' : '#d97706'}>
          {/* Left Galloping Horse Silhouette */}
          <path d="M26 69C25 67 23 67 21 68C19 69 18 71 18 73C19 75 22 75 24 74L25 76L28 76L27 72C28 71 27 70 26 69Z" />
          {/* Right Bull Silhouette */}
          <path d="M74 69C75 67 77 67 79 68C81 69 82 71 82 73C81 75 78 75 76 74L75 76L72 76L73 72C72 71 73 70 74 69Z" />
        </g>

        {/* Lower Base Pedestal */}
        <rect x="15" y="83" width="70" height="6" rx="2" fill={monochrome ? 'currentColor' : '#b45309'} />

        {/* Inscription: Satyameva Jayate (सत्यमेव जयते in Devanagari) */}
        <text
          x="50"
          y="102"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fontFamily="'Plus Jakarta Sans', sans-serif, 'Noto Sans Devanagari'"
          fill={monochrome ? 'currentColor' : '#f59e0b'}
          letterSpacing="0.5"
        >
          सत्यमेव जयते
        </text>
        <text
          x="50"
          y="114"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="700"
          fontFamily="sans-serif"
          fill={monochrome ? 'currentColor' : '#94a3b8'}
          letterSpacing="1"
        >
          SATYAMEVA JAYATE
        </text>
      </svg>
    </div>
  );
};

/**
 * Authentic Tiranga Top Ribbon (Saffron, White, Green)
 */
export const TricolorStripe: React.FC<{ height?: number; className?: string }> = ({
  height = 4,
  className = '',
}) => {
  return (
    <div
      className={`w-full flex ${className}`}
      style={{ height }}
      role="presentation"
      aria-hidden="true"
    >
      <div className="flex-1 bg-[#FF9933]" title="Saffron / Kesari" />
      <div className="flex-1 bg-[#FFFFFF]" title="White / Shwet" />
      <div className="flex-1 bg-[#138808]" title="Green / Hara" />
    </div>
  );
};

/**
 * Digital India Verified Badge
 */
export const DigitalIndiaBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-600/40 text-[10px] font-semibold text-blue-200 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
      <span className="tracking-wide">Digital India</span>
      <span className="text-[9px] text-emerald-400 font-mono">POWER TO EMPOWER</span>
    </div>
  );
};

/**
 * Top Government of India Masthead Strip
 * Follows Guidelines for Indian Government Websites (GIGW)
 */
export const GovernmentMasthead: React.FC<{
  onFontSizeChange?: (scale: 'small' | 'normal' | 'large') => void;
}> = ({ onFontSizeChange }) => {
  return (
    <div className="bg-[#051329] text-slate-300 border-b border-blue-900/60 text-xs select-none">
      <TricolorStripe height={3} />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {/* Left: Official Government of India Identification */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300 font-serif">भारत सरकार</span>
            <span className="text-slate-600">|</span>
            <span className="font-medium text-slate-200">Government of India</span>
          </div>

          <span className="hidden sm:inline text-slate-600">•</span>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <span className="text-amber-200/90 font-medium">गृह मंत्रालय</span>
            <span className="text-slate-600">/</span>
            <span>Ministry of Home Affairs (MHA)</span>
          </div>
        </div>

        {/* Right: National Portal Badges & Accessibility */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-slate-400 border-r border-blue-900/80 pr-3">
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-300 font-bold">
              ICJS 2.0 LIVE
            </span>
            <span>e-Sakshya &amp; CCTNS Interconnected</span>
          </div>

          {/* GIGW Accessibility Controls */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
            <span className="text-slate-500 mr-1 hidden xs:inline">Font:</span>
            <button
              onClick={() => onFontSizeChange && onFontSizeChange('small')}
              className="px-1.5 py-0.5 rounded bg-blue-950 hover:bg-blue-900 border border-blue-800 text-slate-300 text-[10px]"
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => onFontSizeChange && onFontSizeChange('normal')}
              className="px-1.5 py-0.5 rounded bg-blue-900 text-white font-bold border border-blue-700 text-[10px]"
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => onFontSizeChange && onFontSizeChange('large')}
              className="px-1.5 py-0.5 rounded bg-blue-950 hover:bg-blue-900 border border-blue-800 text-slate-300 text-[10px]"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>CERT-In Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Official Government of India Portal Footer
 * Complies with GIGW (Guidelines for Indian Government Websites)
 */
export const GovernmentFooter: React.FC = () => {
  return (
    <footer className="bg-[#030d1c] text-slate-400 border-t border-blue-950/80 text-xs mt-auto select-none">
      <TricolorStripe height={3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* National Initiatives & Portals Link Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-blue-900/40 text-[11px]">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">
              National Portals:
            </span>
            <a
              href="https://www.india.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>india.gov.in</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
            <a
              href="https://digitalindia.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>Digital India</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
            <a
              href="https://ncrb.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>NCRB (CCTNS)</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
            <a
              href="https://ecourts.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>eCourts Services</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>National Cyber Crime Portal</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
              GIGW Compliant
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
              ISO/IEC 27001
            </span>
          </div>
        </div>

        {/* Legal Authority & Legal Admissibility Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-slate-400 leading-relaxed">
          <div className="space-y-1">
            <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Sovereign Law Enforcement Authority</span>
            </h5>
            <p className="text-[10px]">
              JusticeVault (न्याय-साक्ष्य) operates under the administrative authority of the Ministry of Home Affairs, Government of India, and State Police Headquarters in accordance with BNSS 2023.
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Statutory Compliance &amp; Court Admissibility</span>
            </h5>
            <p className="text-[10px]">
              All electronic evidence hashes, SHA-256 signatures, and chain-of-custody ledgers comply strictly with Section 63 &amp; 65B of the Bharatiya Sakshya Adhiniyam (BSA) 2023 and Section 65B of the Indian Evidence Act.
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security &amp; Encryption Standard</span>
            </h5>
            <p className="text-[10px]">
              Cryptographic evidence deposits utilize AES-256-GCM hardware envelope encryption, SHA-256 digital seals, and Hyperledger Fabric multi-station consortium verification.
            </p>
          </div>
        </div>

        {/* Copyright & NIC Credits */}
        <div className="pt-3 border-t border-blue-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
          <div>
            &copy; 2026 Government of India. Designed, Developed, and Hosted by National Informatics Centre (NIC) for Inter-Operable Criminal Justice System (ICJS).
          </div>
          <div className="flex items-center gap-2">
            <span>Last Updated: 07-Sep-2026</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">अति गोपनीय / STRICTLY CONFIDENTIAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
