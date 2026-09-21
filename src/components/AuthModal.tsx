import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Lock, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Scan, 
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldAlert,
  Building2,
  Check
} from 'lucide-react';
import { OfficerUser } from '../types';
import { mockOfficers } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (officer: OfficerUser) => void;
  initialOfficer?: OfficerUser;
  isMandatoryGateway?: boolean;
}

// Strictly authorized Department Credentials
const AUTHORIZED_CREDENTIALS: Record<string, { password: string; officerIndex: number; title: string }> = {
  'POL-IO-0001': {
    password: 'Akash@123',
    officerIndex: 0,
    title: 'Inspector Akash R. (Cyber Crime Investigation Division)',
  },
  'POL-IO-2148': {
    password: 'Bharath@123',
    officerIndex: 1,
    title: 'Sub-Inspector Bharath K. (Crime Branch Investigation Wing)',
  },
  'POL-IO-1025': {
    password: 'Dhinesh@123',
    officerIndex: 2,
    title: 'Inspector Dhinesh M. (Digital Evidence Vault Custodian)',
  },
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialOfficer,
  isMandatoryGateway = false,
}) => {
  // Officer selected upon successful credential verification
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerUser>(initialOfficer || mockOfficers[0]);
  
  // Credentials input - explicitly empty from the beginning as mandated
  const [policeIdOrUsername, setPoliceIdOrUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  
  // Stages: 1 = Manual ID & Password, 2 = Face Biometrics, 3 = Fingerprint Biometrics, 4 = Verification Complete
  const [authStep, setAuthStep] = useState<1 | 2 | 3 | 4>(1);

  // Face Scan State
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [livenessScore, setLivenessScore] = useState<number>(0);
  const [livenessMessage, setLivenessMessage] = useState('Position face within biometric oval marker for 3D liveness scan');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Fingerprint State
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false);
  const [fingerprintProgress, setFingerprintProgress] = useState<number>(0);
  const [fingerprintStatusText, setFingerprintStatusText] = useState('Touch the AFIS optical biometric sensor or click Scan');
  const [isFingerprintVerified, setIsFingerprintVerified] = useState(false);

  // Start webcam if in Step 2
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (authStep === 2) {
      setIsFaceVerified(false);
      setLivenessScore(0);
      setLivenessMessage('Position face within biometric oval marker for 3D liveness scan');
      
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
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [authStep]);

  if (!isOpen) return null;

  // Step 1: Validate Manual Username/Police ID and Password
  const handleCredentialsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const idKey = policeIdOrUsername.trim().toUpperCase();
    const enteredPassword = password.trim();

    if (!idKey) {
      setCredentialError('Please enter your Police ID / Username.');
      return;
    }

    if (!enteredPassword) {
      setCredentialError('Please enter your Department password.');
      return;
    }

    const authRecord = AUTHORIZED_CREDENTIALS[idKey];

    // Check if ID is in authorized police list
    if (!authRecord) {
      setCredentialError('Access Denied: Invalid Police ID or Username.');
      return;
    }

    // Check if Password strictly matches
    if (authRecord.password !== enteredPassword) {
      setCredentialError('Access Denied: Incorrect Password for this Police ID.');
      return;
    }

    // Credentials passed! Match officer profile and proceed to Step 2
    const targetOfficer = mockOfficers[authRecord.officerIndex] || mockOfficers[0];
    setSelectedOfficer(targetOfficer);
    setCredentialError(null);
    setAuthStep(2); // Move strictly to Face Biometrics
  };

  // Step 2: Face Authentication Scan
  const handleStartFaceScan = () => {
    if (isFaceScanning || isFaceVerified) return;
    setIsFaceScanning(true);
    setLivenessMessage('Performing active 3D eye-blink & depth liveness check...');
    setLivenessScore(28);

    setTimeout(() => {
      setLivenessScore(68);
      setLivenessMessage('UIDAI Aadhaar / State Police Biometric Face matching...');
    }, 1100);

    setTimeout(() => {
      setLivenessScore(99.6);
      setLivenessMessage(`Face Verified: 99.6% Match! KMS Vector ${selectedOfficer.faceEmbeddingId} Confirmed.`);
      setIsFaceScanning(false);
      setIsFaceVerified(true);

      // Advance to Step 3: Fingerprint Authentication
      setTimeout(() => {
        setAuthStep(3);
        setFingerprintStatusText('Place authorized finger on optical scanner sensor pad');
      }, 1000);
    }, 2200);
  };

  // Step 3: Fingerprint Authentication Scan
  const handleStartFingerprintScan = () => {
    if (isFingerprintScanning || isFingerprintVerified) return;
    setIsFingerprintScanning(true);
    setFingerprintProgress(20);
    setFingerprintStatusText('Reading capacitive epidermal ridge patterns...');

    setTimeout(() => {
      setFingerprintProgress(55);
      setFingerprintStatusText('Matching minutiae points against National AFIS Database...');
    }, 800);

    setTimeout(() => {
      setFingerprintProgress(90);
      setFingerprintStatusText('Cryptographic signature verified: 128 minutiae bifurcation points matched.');
    }, 1600);

    setTimeout(() => {
      setFingerprintProgress(100);
      setFingerprintStatusText('AFIS Fingerprint Authenticated & Cryptographically Signed!');
      setIsFingerprintScanning(false);
      setIsFingerprintVerified(true);

      // Advance to Step 4: Access Granted
      setTimeout(() => {
        handleCompleteLogin();
      }, 900);
    }, 2300);
  };

  const handleCompleteLogin = () => {
    setAuthStep(4);
    setTimeout(() => {
      onLoginSuccess(selectedOfficer);
      if (onClose) onClose();
      // Reset state for subsequent logout
      setAuthStep(1);
      setPoliceIdOrUsername('');
      setPassword('');
      setIsFaceVerified(false);
      setIsFingerprintVerified(false);
      setFingerprintProgress(0);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden my-4">
        
        {/* Official Header */}
        <div className="px-5 py-4 bg-[#061833] border-b border-blue-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  Police Department Access Gateway
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  CCTNS / BSA 2023
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Factor Authentication: Credentials → Face Liveness → AFIS Fingerprint
              </p>
            </div>
          </div>

          {!isMandatoryGateway && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-medium ${authStep === 1 ? 'text-blue-400 font-bold' : authStep > 1 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${authStep > 1 ? 'bg-emerald-600 text-white' : authStep === 1 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              {authStep > 1 ? '✓' : '1'}
            </span>
            <span>ID & Password</span>
          </div>
          <span className="text-slate-700 text-xs font-mono">━━</span>
          <div className={`flex items-center gap-1.5 font-medium ${authStep === 2 ? 'text-blue-400 font-bold' : authStep > 2 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${authStep > 2 ? 'bg-emerald-600 text-white' : authStep === 2 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              {authStep > 2 ? '✓' : '2'}
            </span>
            <span>Face Biometrics</span>
          </div>
          <span className="text-slate-700 text-xs font-mono">━━</span>
          <div className={`flex items-center gap-1.5 font-medium ${authStep === 3 ? 'text-blue-400 font-bold' : authStep > 3 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${authStep > 3 ? 'bg-emerald-600 text-white' : authStep === 3 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              {authStep > 3 ? '✓' : '3'}
            </span>
            <span>Fingerprint</span>
          </div>
          <span className="text-slate-700 text-xs font-mono">━━</span>
          <div className={`flex items-center gap-1.5 font-medium ${authStep === 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${authStep === 4 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              4
            </span>
            <span>Access</span>
          </div>
        </div>

        {/* Step 1: Manual Username/Police ID and Password Entry */}
        {authStep === 1 && (
          <form onSubmit={handleCredentialsSubmit} className="p-6 space-y-4">
            
            {/* Confidential Police Login Advisory */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/60 text-xs flex items-center gap-2.5 text-slate-300">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-[11px] leading-relaxed">
                Official Law Enforcement Authentication Gateway. Enter your authorized Police ID and Department Password to initiate multi-factor biometric verification.
              </span>
            </div>

            {/* Username / Police ID Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Officer Police ID / Username</span>
                <span className="text-[10px] text-slate-400 font-mono">Format: POL-IO-XXXX</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={policeIdOrUsername}
                  onChange={(e) => {
                    setPoliceIdOrUsername(e.target.value);
                    setCredentialError(null);
                  }}
                  placeholder="Enter Police ID (e.g. POL-IO-0001)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  autoFocus
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Department Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setCredentialError(null);
                  }}
                  placeholder="Enter assigned password"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {credentialError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{credentialError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Next Verification:</span>
              </div>
              <span className="text-blue-400 font-medium font-mono text-[11px]">Face Liveness & AFIS Fingerprint</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Verify Credentials & Proceed to Face Authentication</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Face Authentication with Liveness */}
        {authStep === 2 && (
          <div className="p-6 space-y-5 text-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-2">
                <Camera className="w-3.5 h-3.5" />
                Step 2 of 3: Biometric Face Authentication
              </div>
              <h3 className="text-base font-bold text-white">Government KYC Face Authentication</h3>
              <p className="text-xs text-slate-300 mt-1">
                Officer: <strong className="text-white">{selectedOfficer.name}</strong> • Police ID: <span className="font-mono text-blue-400">{selectedOfficer.id}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {selectedOfficer.designation} • {selectedOfficer.policeStation}
              </p>
            </div>

            {/* Video Viewfinder / Liveness Simulator */}
            <div className="relative mx-auto w-64 h-64 rounded-2xl bg-slate-950 border-2 border-dashed border-blue-500/50 overflow-hidden flex flex-col items-center justify-center shadow-inner">
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
                    className="w-28 h-28 rounded-full object-cover border-2 border-blue-500/80 mb-2 shadow-lg"
                  />
                  <span className="text-[11px] text-slate-300 font-semibold">{selectedOfficer.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Enrolled KYC Face Vector</span>
                </div>
              )}

              {/* Liveness Target Oval Overlay */}
              <div className={`absolute inset-4 rounded-[50%] border-2 pointer-events-none transition-all ${
                isFaceScanning ? 'border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.6)] animate-pulse' : isFaceVerified ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)]' : 'border-slate-500/40'
              }`}>
                {isFaceScanning && (
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce" />
                )}
              </div>

              {/* Liveness score badge */}
              {livenessScore > 0 && (
                <div className="absolute bottom-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-blue-500/40 text-[10px] font-mono text-blue-300">
                  Liveness: {livenessScore}%
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <p className="font-medium text-blue-400">{livenessMessage}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Matching Vault KMS Vector: {selectedOfficer.faceEmbeddingId}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAuthStep(1)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ← Back to Credentials
              </button>
              <button
                type="button"
                onClick={handleStartFaceScan}
                disabled={isFaceScanning || isFaceVerified}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/40 transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isFaceScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Geometry & Liveness...</span>
                  </>
                ) : isFaceVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Face Verified (Proceeding...)</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-3.5 h-3.5" />
                    <span>Initiate Face Biometric Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Fingerprint Authentication */}
        {authStep === 3 && (
          <div className="p-6 space-y-5 text-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
                <Fingerprint className="w-3.5 h-3.5" />
                Step 3 of 3: Biometric Fingerprint Authentication
              </div>
              <h3 className="text-base font-bold text-white">AFIS Biometric Fingerprint Scanner</h3>
              <p className="text-xs text-slate-300 mt-1">
                Officer: <strong className="text-white">{selectedOfficer.name}</strong> • Police ID: <span className="font-mono text-emerald-400">{selectedOfficer.id}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {selectedOfficer.designation} • {selectedOfficer.policeStation}
              </p>
            </div>

            {/* Fingerprint Sensor Pad */}
            <div 
              onClick={handleStartFingerprintScan}
              className={`relative mx-auto w-48 h-48 rounded-2xl bg-slate-950 border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-4 group ${
                isFingerprintVerified
                  ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-emerald-950/20'
                  : isFingerprintScanning
                  ? 'border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)] bg-blue-950/20 animate-pulse'
                  : 'border-slate-700 hover:border-emerald-500/70 hover:bg-slate-800/40'
              }`}
            >
              <div className="relative">
                <Fingerprint 
                  className={`w-24 h-24 transition-all duration-300 ${
                    isFingerprintVerified 
                      ? 'text-emerald-400 scale-105' 
                      : isFingerprintScanning 
                      ? 'text-blue-400 animate-pulse' 
                      : 'text-slate-500 group-hover:text-emerald-400'
                  }`} 
                />

                {/* Laser scan line overlay */}
                {isFingerprintScanning && (
                  <div 
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] transition-all"
                    style={{ top: `${fingerprintProgress}%` }}
                  />
                )}
              </div>

              <span className="text-[11px] font-mono mt-3 text-slate-300">
                {isFingerprintVerified 
                  ? '✓ 128 MINUTIAE MATCHED' 
                  : isFingerprintScanning 
                  ? `SCANNING ${fingerprintProgress}%` 
                  : 'TAP SENSOR TO SCAN'}
              </span>

              {/* Progress bar */}
              {fingerprintProgress > 0 && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isFingerprintVerified ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${fingerprintProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <p className="font-medium text-emerald-400">{fingerprintStatusText}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                AFIS Master Ridge Hash: {`0xAFIS_${selectedOfficer.id.replace(/-/g, '_')}_SECURE`}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAuthStep(2)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ← Back to Face Scan
              </button>
              <button
                type="button"
                onClick={handleStartFingerprintScan}
                disabled={isFingerprintScanning || isFingerprintVerified}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isFingerprintScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Epidermal Ridge Vectors...</span>
                  </>
                ) : isFingerprintVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Fingerprint Verified (Entering...)</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Scan Fingerprint Sensor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Verification Complete & Access Granted */}
        {authStep === 4 && (
          <div className="p-10 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Officer Identity Confirmed & Verified</h3>
              <p className="text-xs text-slate-300 mt-1">
                Access Granted: <span className="text-white font-semibold">{selectedOfficer.name}</span> ({selectedOfficer.designation}).
              </p>
              <p className="text-[11px] text-emerald-400 font-mono mt-1">
                3-Factor Authentication (Credentials + Face Liveness + AFIS Fingerprint) Successfully Cleared.
              </p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">
                Redirecting to JusticeVault Police Network & Evidence Management Portal...
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
