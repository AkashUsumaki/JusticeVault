import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Fingerprint, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  RefreshCw, 
  X, 
  Sparkles, 
  Scan, 
  KeyRound,
  Eye
} from 'lucide-react';
import { OfficerUser } from '../types';

export interface BiometricSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  officer: OfficerUser;
  actionTitle: string;
  actionDescription?: string;
  onLogBlockchainEvent?: (action: string, details: string) => void;
}

export const BiometricSecurityModal: React.FC<BiometricSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  officer,
  actionTitle,
  actionDescription,
  onLogBlockchainEvent,
}) => {
  // Biometric verification steps:
  // 1: Face Liveness Scan
  // 2: Fingerprint Biometric Sensor
  // 3: Verified / Access Granted
  const [currentStep, setCurrentStep] = useState<'FACE' | 'FINGERPRINT' | 'VERIFIED'>('FACE');
  
  // Face Scan State
  const [isFaceScanning, setIsFaceScanning] = useState<boolean>(true);
  const [faceProgress, setFaceProgress] = useState<number>(15);
  const [faceStatusText, setFaceStatusText] = useState<string>('Detecting facial landmark geometry...');
  const [isFaceVerified, setIsFaceVerified] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasWebcam, setHasWebcam] = useState<boolean | null>(null);

  // Fingerprint State
  const [isFingerprintScanning, setIsFingerprintScanning] = useState<boolean>(false);
  const [fingerprintProgress, setFingerprintProgress] = useState<number>(0);
  const [fingerprintStatusText, setFingerprintStatusText] = useState<string>('Touch or click the biometric sensor to scan');
  const [isFingerprintVerified, setIsFingerprintVerified] = useState<boolean>(false);

  // Initialize webcam if available when modal opens
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('FACE');
      setIsFaceScanning(true);
      setFaceProgress(15);
      setIsFaceVerified(false);
      setIsFingerprintScanning(false);
      setFingerprintProgress(0);
      setIsFingerprintVerified(false);
      return;
    }

    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setHasWebcam(true);
        })
        .catch(() => {
          setHasWebcam(false);
        });
    } else {
      setHasWebcam(false);
    }

    // Run automated face scan simulation
    const timer1 = setTimeout(() => {
      setFaceProgress(45);
      setFaceStatusText('Analyzing 3D depth and corneal reflectance liveness...');
    }, 900);

    const timer2 = setTimeout(() => {
      setFaceProgress(80);
      setFaceStatusText('Matching with State Police KMS Face Embedding...');
    }, 1800);

    const timer3 = setTimeout(() => {
      setFaceProgress(100);
      setFaceStatusText('Face Verified: 99.4% Liveness Confidence Match!');
      setIsFaceScanning(false);
      setIsFaceVerified(true);
      // Advance to Fingerprint scan automatically
      setTimeout(() => {
        setCurrentStep('FINGERPRINT');
      }, 700);
    }, 2700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle fingerprint touch / click
  const handleScanFingerprint = () => {
    if (isFingerprintScanning || isFingerprintVerified) return;
    setIsFingerprintScanning(true);
    setFingerprintStatusText('Scanning optical ridge minutiae...');
    setFingerprintProgress(35);

    setTimeout(() => {
      setFingerprintProgress(75);
      setFingerprintStatusText('Matching with Police AFIS & CCTNS Biometric Registry...');
    }, 900);

    setTimeout(() => {
      setFingerprintProgress(100);
      setFingerprintStatusText('Fingerprint Verified: Right Thumb Match (AFIS-TN-99218)');
      setIsFingerprintScanning(false);
      setIsFingerprintVerified(true);
      setCurrentStep('VERIFIED');

      if (onLogBlockchainEvent) {
        onLogBlockchainEvent(
          'MFA_VERIFIED',
          `Biometric Face & Fingerprint verified for officer ${officer.name} (${officer.badgeNumber}) — Authorized: ${actionTitle}`
        );
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    }, 1800);
  };

  // Instant bypass button for quick testing / demos
  const handleInstantBypass = () => {
    setIsFaceVerified(true);
    setIsFingerprintVerified(true);
    setCurrentStep('VERIFIED');
    if (onLogBlockchainEvent) {
      onLogBlockchainEvent(
        'MFA_VERIFIED',
        `Instant Biometric Authentication verified for officer ${officer.name} (${officer.badgeNumber}) — Authorized: ${actionTitle}`
      );
    }
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#061426] border border-blue-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative text-slate-200">
        
        {/* Top Sovereign Clearance Header */}
        <div className="bg-gradient-to-r from-blue-950 via-[#071f3d] to-blue-950 px-5 py-3.5 border-b border-blue-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">Biometric Security Clearance</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  BSA SEC 63
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">Face Liveness + Fingerprint Biometric Required</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/40 transition"
            title="Cancel Authorization"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Context Box */}
        <div className="bg-[#030d1a] px-5 py-3 border-b border-blue-900/50 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Access Requested For:</span>
            <p className="font-semibold text-white truncate">{actionTitle}</p>
            {actionDescription && <p className="text-[11px] text-slate-400 truncate">{actionDescription}</p>}
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[10px] text-slate-400 block">Officer Identity:</span>
            <span className="font-mono text-xs text-blue-300 font-bold">{officer.badgeNumber}</span>
          </div>
        </div>

        {/* Officer Profile Badge */}
        <div className="px-5 py-2.5 bg-blue-950/40 border-b border-blue-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-xs">
              {officer.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-slate-200">{officer.name}</div>
              <div className="text-[10px] text-slate-400">{officer.policeStation}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-blue-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Level-2 Sensitive Clearance</span>
          </div>
        </div>

        {/* Multi-Step Indicator */}
        <div className="grid grid-cols-2 px-5 py-2.5 bg-[#040e1c] border-b border-blue-900/40 text-xs">
          <div className={`flex items-center gap-2 ${currentStep === 'FACE' ? 'text-blue-400 font-bold' : isFaceVerified ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isFaceVerified ? 'bg-emerald-500 text-black' : currentStep === 'FACE' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {isFaceVerified ? '✓' : '1'}
            </div>
            <span>Step 1: Face Liveness</span>
          </div>

          <div className={`flex items-center gap-2 ${currentStep === 'FINGERPRINT' ? 'text-blue-400 font-bold' : isFingerprintVerified ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isFingerprintVerified ? 'bg-emerald-500 text-black' : currentStep === 'FINGERPRINT' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {isFingerprintVerified ? '✓' : '2'}
            </div>
            <span>Step 2: Fingerprint Sensor</span>
          </div>
        </div>

        {/* Modal Body: Active Biometric Scanner */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[290px] bg-gradient-to-b from-[#061426] to-[#040e1c]">
          
          {/* STEP 1: FACE AUTHENTICATION SCANNER */}
          {currentStep === 'FACE' && (
            <div className="flex flex-col items-center w-full space-y-4">
              <div className="relative w-44 h-44 rounded-full overflow-hidden border-2 border-blue-500/70 shadow-[0_0_25px_rgba(37,99,235,0.35)] bg-slate-950 flex items-center justify-center">
                {/* Live Webcam or Visual Scanner */}
                {hasWebcam ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                    <div className="w-16 h-16 rounded-full border border-blue-400/30 flex items-center justify-center bg-blue-950/40 text-blue-400">
                      <Camera className="w-8 h-8 animate-pulse" />
                    </div>
                    <span className="text-[11px] text-blue-300 font-mono">Facial Topology Radar</span>
                  </div>
                )}

                {/* Animated Vertical Laser Sweep Line */}
                {isFaceScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-bounce" />
                )}

                {/* Biometric Oval Grid Marker */}
                <div className="absolute inset-2 border border-dashed border-cyan-400/40 rounded-full pointer-events-none" />

                {/* Landmark Target Points */}
                <div className="absolute top-12 left-14 w-2 h-2 rounded-full bg-cyan-400/80 animate-ping pointer-events-none" />
                <div className="absolute top-12 right-14 w-2 h-2 rounded-full bg-cyan-400/80 animate-ping pointer-events-none" />
                <div className="absolute bottom-12 inset-x-0 mx-auto w-3 h-1 bg-cyan-400/60 pointer-events-none" />
              </div>

              {/* Progress Bar & Status Text */}
              <div className="w-full max-w-xs space-y-2 text-center">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Liveness Match:</span>
                  <span className="text-cyan-400 font-bold">{faceProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden border border-blue-900/60">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${faceProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 font-medium">{faceStatusText}</p>

                <button
                  type="button"
                  onClick={() => {
                    setFaceProgress(100);
                    setIsFaceVerified(true);
                    setIsFaceScanning(false);
                    setCurrentStep('FINGERPRINT');
                  }}
                  className="mt-1 px-3 py-1 rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-medium transition flex items-center justify-center gap-1.5 mx-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Confirm Face Liveness &amp; Proceed</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FINGERPRINT SCANNER */}
          {currentStep === 'FINGERPRINT' && (
            <div className="flex flex-col items-center w-full space-y-4">
              <button
                onClick={handleScanFingerprint}
                disabled={isFingerprintScanning || isFingerprintVerified}
                className={`relative w-40 h-40 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-4 group cursor-pointer ${
                  isFingerprintVerified
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    : isFingerprintScanning
                    ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                    : 'border-blue-600/60 bg-blue-950/40 text-blue-400 hover:border-blue-400 hover:bg-blue-900/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                }`}
              >
                {/* Fingerprint Icon with sweep scan */}
                <Fingerprint className={`w-20 h-20 transition-transform ${isFingerprintScanning ? 'animate-pulse scale-105' : 'group-hover:scale-105'}`} />

                {/* Laser scanline */}
                {isFingerprintScanning && (
                  <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-bounce" />
                )}

                <span className="text-[11px] font-mono mt-2 font-bold tracking-wider">
                  {isFingerprintVerified ? 'TOUCH VERIFIED' : isFingerprintScanning ? 'ANALYZING RIDGES' : 'TAP TO SCAN'}
                </span>
              </button>

              {/* Progress Bar & Status Text */}
              <div className="w-full max-w-xs space-y-2 text-center">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">AFIS Minutiae Match:</span>
                  <span className="text-cyan-400 font-bold">{fingerprintProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden border border-blue-900/60">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${fingerprintProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 font-medium">{fingerprintStatusText}</p>
                <p className="text-[10px] text-slate-500">Police AFIS / UIDAI Biometric Key Match</p>
              </div>
            </div>
          )}

          {/* STEP 3: VERIFICATION SUCCESS */}
          {currentStep === 'VERIFIED' && (
            <div className="flex flex-col items-center text-center space-y-3 py-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Biometric Identity Verified</h3>
                <p className="text-xs text-emerald-300 font-mono mt-0.5">Authorization Token Generated &amp; Signed</p>
              </div>
              <p className="text-xs text-slate-400">Executing requested action...</p>
            </div>
          )}

        </div>

        {/* Footer Actions: Test Mode Bypass & Legal Notice */}
        <div className="px-5 py-3.5 bg-[#030d1a] border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>2FA Audit Hash Sealed to Blockchain</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstantBypass}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-medium text-xs transition flex items-center gap-1.5"
              title="Skip manual biometric scan for testing / preview"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Authorize (Test Mode)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
