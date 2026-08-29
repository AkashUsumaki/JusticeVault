import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Scan, 
  Sparkles, 
  UserCheck,
  RefreshCw,
  Key,
  Eye
} from 'lucide-react';
import { OfficerUser } from '../types';
import { mockOfficers } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (officer: OfficerUser) => void;
  initialOfficer?: OfficerUser;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialOfficer,
}) => {
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerUser>(initialOfficer || mockOfficers[0]);
  const [password, setPassword] = useState('PoliceSecure@2026');
  
  // Stages: 1 = Password, 2 = Face KYC Liveness, 3 = Mobile OTP MFA, 4 = Verified
  const [authStep, setAuthStep] = useState<1 | 2 | 3 | 4>(1);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [livenessScore, setLivenessScore] = useState<number>(0);
  const [livenessMessage, setLivenessMessage] = useState('Align face within the biometric oval marker');
  
  // OTP State
  const [otpCode, setOtpCode] = useState('749215');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Camera stream ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (initialOfficer) {
      setSelectedOfficer(initialOfficer);
    }
  }, [initialOfficer]);

  // Start webcam if in Step 2
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (authStep === 2) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setHasCameraPermission(true);
        })
        .catch(() => {
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [authStep]);

  if (!isOpen) return null;

  const handleStartFaceScan = () => {
    setIsFaceScanning(true);
    setLivenessMessage('Performing active 3D eye-blink & depth liveness check...');
    setLivenessScore(25);

    setTimeout(() => {
      setLivenessScore(60);
      setLivenessMessage('UIDAI Aadhaar / State Police Biometric API matching...');
    }, 1200);

    setTimeout(() => {
      setLivenessScore(99.4);
      setLivenessMessage('Liveness Confirmed: 99.4% | HashiCorp Vault KMS Embedding Matched!');
      setIsFaceScanning(false);
      
      // Advance to OTP MFA
      setTimeout(() => {
        setAuthStep(3);
        setOtpSent(true);
      }, 1000);
    }, 2400);
  };

  const handleVerifyOtpAndComplete = () => {
    setAuthStep(4);
    setTimeout(() => {
      onLoginSuccess(selectedOfficer);
      onClose();
      setAuthStep(1);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0c0f] border border-zinc-800 rounded-lg shadow-2xl">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#08090b] border-b border-zinc-800/80 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Government Law Enforcement KYC Login</h2>
              <p className="text-xs text-zinc-400">UIDAI / Police Face Liveness & 2FA MFA Verification</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            TLS 1.3 SECURE
          </span>
        </div>

        {/* Step Indicator */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0a0c0f] border-b border-zinc-800/80 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-medium ${authStep >= 1 ? 'text-blue-400' : 'text-zinc-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${authStep >= 1 ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-800'}`}>1</span>
            <span>Credentials</span>
          </div>
          <div className="w-6 sm:w-8 h-px bg-zinc-800" />
          <div className={`flex items-center gap-1.5 font-medium ${authStep >= 2 ? 'text-blue-400' : 'text-zinc-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${authStep >= 2 ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-800'}`}>2</span>
            <span>KYC Face Scan</span>
          </div>
          <div className="w-6 sm:w-8 h-px bg-zinc-800" />
          <div className={`flex items-center gap-1.5 font-medium ${authStep >= 3 ? 'text-blue-400' : 'text-zinc-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${authStep >= 3 ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-800'}`}>3</span>
            <span>Mobile OTP</span>
          </div>
        </div>

        {/* Step 1: Officer Selection & Password */}
        {authStep === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Enrolled Police Officer Account</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {mockOfficers.map((off) => (
                  <button
                    key={off.id}
                    onClick={() => setSelectedOfficer(off)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                      selectedOfficer.id === off.id
                        ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/50'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <img src={off.avatarUrl} alt={off.name} className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{off.name}</p>
                      <p className="text-[11px] text-cyan-400 truncate">{off.designation}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{off.stationCode} • {off.badgeNumber}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Official Encrypted Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400">Password hashed using Argon2id with salt per NIST SP 800-63B standards.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Biometric Status:</span>
              </div>
              <span className="text-emerald-400 font-medium">Supervisor Enrolled in HashiCorp Vault</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setAuthStep(2)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/40 transition flex items-center gap-2"
              >
                <span>Proceed to KYC Face Verification</span>
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: KYC Face Authentication with Liveness */}
        {authStep === 2 && (
          <div className="p-6 space-y-5 text-center">
            <div>
              <h3 className="text-sm font-bold text-white">Government KYC Face Authentication</h3>
              <p className="text-xs text-slate-400 mt-0.5">UIDAI & State Police Biometrics Liveness Engine</p>
            </div>

            {/* Video Viewfinder / Liveness Simulator */}
            <div className="relative mx-auto w-64 h-64 rounded-2xl bg-slate-950 border-2 border-dashed border-cyan-500/50 overflow-hidden flex flex-col items-center justify-center shadow-inner">
              
              {hasCameraPermission ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center p-4 text-center">
                  <img
                    src={selectedOfficer.avatarUrl}
                    alt={selectedOfficer.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500/80 mb-2"
                  />
                  <span className="text-[11px] text-slate-400">Camera Feed / Enrolled Face</span>
                </div>
              )}

              {/* Liveness Target Oval Overlay */}
              <div className={`absolute inset-4 rounded-[50%] border-2 pointer-events-none transition-all ${
                isFaceScanning ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse' : 'border-slate-500/40'
              }`}>
                {isFaceScanning && (
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />
                )}
              </div>

              {/* Liveness score badge */}
              {livenessScore > 0 && (
                <div className="absolute bottom-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                  Liveness: {livenessScore}%
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <p className="font-medium text-cyan-400">{livenessMessage}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Matching Vault KMS Hash: {selectedOfficer.faceEmbeddingId}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAuthStep(1)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStartFaceScan}
                disabled={isFaceScanning}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/40 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isFaceScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Geometry & Liveness...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-3.5 h-3.5" />
                    <span>Run Liveness Scan & Authenticate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Multi-Factor Authentication (MFA OTP) */}
        {authStep === 3 && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">KYC Face Authentication Successful</h3>
              <p className="text-xs text-slate-400 mt-0.5">Final Step: Multi-Factor Authentication (MFA OTP)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Registered Mobile:</span>
                <span className="text-white font-mono">{selectedOfficer.phone}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Clearance Level:</span>
                <span className="text-amber-400 font-semibold">{selectedOfficer.clearanceLevel.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Station Code:</span>
                <span className="text-cyan-400 font-mono">{selectedOfficer.stationCode}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Enter 6-Digit OTP Code</label>
                <span className="text-[11px] text-cyan-400 font-medium cursor-pointer hover:underline">
                  Resend OTP (30s)
                </span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg tracking-[0.5em] text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 text-center">SMS token dispatched via National Police Gateway.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleVerifyOtpAndComplete}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify OTP & Launch Command Center</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success Transition */}
        {authStep === 4 && (
          <div className="p-10 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Officer Identity Confirmed</h3>
              <p className="text-xs text-slate-400 mt-1">Establishing encrypted session & Hyperledger node channel...</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
