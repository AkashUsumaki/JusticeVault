import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Mic, 
  MicOff, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  Save,
  Clock,
  Compass
} from 'lucide-react';
import { EvidenceItem, FIRDetails, LanguageCode, OfficerUser } from '../types';
import { calculateSHA256 } from '../services/cryptoUtils';
import { translations } from '../translations/i18n';

interface FieldEvidenceCaptureProps {
  caseItem: FIRDetails;
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onAddEvidence: (item: EvidenceItem) => void;
  onLogBlockchainEvent: (action: any, details: string, evidenceId?: string, evidenceHash?: string) => void;
}

export const FieldEvidenceCapture: React.FC<FieldEvidenceCaptureProps> = ({
  caseItem,
  currentOfficer,
  currentLang,
  onAddEvidence,
  onLogBlockchainEvent,
}) => {
  const t = translations[currentLang];

  const [activeMode, setActiveMode] = useState<'PHOTO' | 'AUDIO' | 'QR_TAG'>('PHOTO');
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // GPS coordinates state
  const [gpsData, setGpsData] = useState({
    latitude: 13.0338,
    longitude: 80.2677,
    altitude: '14.2 m',
    heading: '042° NE',
    address: `${caseItem.policeStation}, Chennai, Tamil Nadu`,
  });

  // Photo capture state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState('Crime Scene Physical Seizure');

  // Audio capture state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasWitnessConsent, setHasWitnessConsent] = useState(true);
  const [witnessName, setWitnessName] = useState('Witness Kumaravel');

  // QR Bag state
  const [qrBagCode, setQrBagCode] = useState('TN-POL-BAG-984210');
  const [seizedItemName, setSeizedItemName] = useState('Yamaha Key & Helmet');

  // Camera video stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeMode === 'PHOTO') {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraActive(true);
        })
        .catch(() => {
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeMode]);

  // Audio timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleCapturePhoto = async () => {
    // Generate snapshot or placeholder
    const timestamp = new Date().toISOString();
    const sha256 = await calculateSHA256(`PHOTO-${photoTitle}-${gpsData.latitude}-${timestamp}`);

    const newEvd: EvidenceItem = {
      id: `EVD-FIELD-${Date.now().toString().slice(-6)}`,
      caseId: caseItem.caseId,
      title: photoTitle,
      category: 'IMAGE',
      fileName: `scene_photo_${Date.now()}.jpg`,
      fileSizeBytes: 2450000,
      mimeType: 'image/jpeg',
      sha256Hash: sha256,
      uploadTimestamp: timestamp,
      uploadedByOfficerId: currentOfficer.id,
      uploadedByOfficerName: currentOfficer.name,
      deviceInfo: `Mobile Field Kit (${currentOfficer.badgeNumber})`,
      gpsLocation: {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        addressName: gpsData.address,
      },
      encryptionStatus: 'AES-256-ENCRYPTED',
      malwareScanStatus: 'CLEAN',
      version: 1,
      extractedText: `Field scene captured at ${gpsData.address} [Lat: ${gpsData.latitude}, Lng: ${gpsData.longitude}].`,
      tags: ['FieldCapture', 'CrimeScene', 'GPSWatermarked'],
      signedUrl: `https://casemind.police.internal/evidence/signed/field_${sha256.slice(0, 8)}.jpg`,
      sourceSystem: 'MOBILE_APP',
    };

    onAddEvidence(newEvd);
    onLogBlockchainEvent('EVIDENCE_UPLOAD', `Mobile Field Photo captured with GPS watermark: ${photoTitle}`, newEvd.id, sha256);
    setCapturedPhoto('CAPTURED');
    setTimeout(() => setCapturedPhoto(null), 2500);
  };

  const handleSaveAudioStatement = async () => {
    setIsRecording(false);
    const timestamp = new Date().toISOString();
    const sha256 = await calculateSHA256(`AUDIO-${witnessName}-${gpsData.latitude}-${timestamp}`);

    const newEvd: EvidenceItem = {
      id: `EVD-AUDIO-${Date.now().toString().slice(-6)}`,
      caseId: caseItem.caseId,
      title: `Field Statement: ${witnessName}`,
      category: 'AUDIO',
      fileName: `field_audio_${Date.now()}.wav`,
      fileSizeBytes: 1800000,
      mimeType: 'audio/wav',
      sha256Hash: sha256,
      uploadTimestamp: timestamp,
      uploadedByOfficerId: currentOfficer.id,
      uploadedByOfficerName: currentOfficer.name,
      deviceInfo: `Mobile Field Mic (${currentOfficer.badgeNumber})`,
      gpsLocation: {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        addressName: gpsData.address,
      },
      encryptionStatus: 'AES-256-ENCRYPTED',
      malwareScanStatus: 'CLEAN',
      version: 1,
      extractedText: `Oral statement recorded in field from ${witnessName} with explicit consent checkbox signed.`,
      tags: ['AudioStatement', 'FieldInterview', 'CrPC161'],
      signedUrl: `https://casemind.police.internal/evidence/signed/audio_${sha256.slice(0, 8)}.wav`,
      sourceSystem: 'MOBILE_APP',
    };

    onAddEvidence(newEvd);
    onLogBlockchainEvent('EVIDENCE_UPLOAD', `Recorded Field Audio Statement: ${witnessName}`, newEvd.id, sha256);
  };

  const handleSealQRBag = async () => {
    const timestamp = new Date().toISOString();
    const sha256 = await calculateSHA256(`QRBAG-${qrBagCode}-${seizedItemName}-${timestamp}`);

    const newEvd: EvidenceItem = {
      id: `EVD-BAG-${Date.now().toString().slice(-6)}`,
      caseId: caseItem.caseId,
      title: `Sealed Evidence Bag: ${seizedItemName} (${qrBagCode})`,
      category: 'FORENSIC_REPORT',
      fileName: `qr_seizure_${qrBagCode}.json`,
      fileSizeBytes: 42000,
      mimeType: 'application/json',
      sha256Hash: sha256,
      uploadTimestamp: timestamp,
      uploadedByOfficerId: currentOfficer.id,
      uploadedByOfficerName: currentOfficer.name,
      deviceInfo: `QR Barcode Scanner (${currentOfficer.badgeNumber})`,
      gpsLocation: {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        addressName: gpsData.address,
      },
      encryptionStatus: 'AES-256-ENCRYPTED',
      malwareScanStatus: 'CLEAN',
      version: 1,
      extractedText: `Tamper-evident barcode bag ${qrBagCode} containing '${seizedItemName}' sealed with Panchnama memo.`,
      tags: ['EvidenceBag', 'PhysicalSeizure', 'QRTagged'],
      signedUrl: `https://casemind.police.internal/evidence/signed/bag_${qrBagCode}.json`,
      sourceSystem: 'MOBILE_APP',
    };

    onAddEvidence(newEvd);
    onLogBlockchainEvent('EVIDENCE_UPLOAD', `Sealed Tamper-Evident QR Evidence Bag ${qrBagCode}`, newEvd.id, sha256);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.fieldEvidenceCapture}</h1>
              <p className="text-xs text-zinc-400">
                Live GPS Geospatial Watermarking • Audio Consent Recorder • QR Seizure Tagger
              </p>
            </div>
          </div>
        </div>

        {/* Online / Offline Sync Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online Synced' : 'Offline Mode (Local Cache)'}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-[#0a0c0f] border border-zinc-800/60 rounded-lg p-1.5 gap-2">
        <button
          onClick={() => setActiveMode('PHOTO')}
          className={`flex-1 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeMode === 'PHOTO'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>GPS Scene Camera</span>
        </button>

        <button
          onClick={() => setActiveMode('AUDIO')}
          className={`flex-1 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeMode === 'AUDIO'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Audio Consent Recorder</span>
        </button>

        <button
          onClick={() => setActiveMode('QR_TAG')}
          className={`flex-1 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeMode === 'QR_TAG'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Evidence Bag</span>
        </button>
      </div>

      {/* 1. Photo Mode */}
      {activeMode === 'PHOTO' && (
        <div className="p-6 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4">
          
          <div className="relative rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden aspect-video flex items-center justify-center shadow-inner">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Camera Viewfinder Active</p>
                <p className="text-xs text-zinc-400">Positioning sensor and acquiring GPS lock...</p>
              </div>
            )}

            {/* GPS Watermark HUD Overlay */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-blue-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>{gpsData.latitude.toFixed(4)}° N, {gpsData.longitude.toFixed(4)}° E</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Alt: {gpsData.altitude}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Compass className="w-3 h-3 text-blue-400" /> {gpsData.heading}</span>
              </div>
            </div>

            {/* Timestamp bottom watermark */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-zinc-950/90 border border-zinc-800 text-[10px] font-mono text-zinc-300">
              {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC • {currentOfficer.badgeNumber}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Evidence Photo Description</label>
              <input
                type="text"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition"
              >
                <Camera className="w-4 h-4" />
                <span>Capture & Cryptographically Seal</span>
              </button>
            </div>
          </div>

          {capturedPhoto && (
            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4" />
              <span>Evidence Photo stamped with SHA-256 hash and added to Case Vault!</span>
            </div>
          )}

        </div>
      )}

      {/* 2. Audio Consent Mode */}
      {activeMode === 'AUDIO' && (
        <div className="p-6 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-5">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 transition ${
              isRecording
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            }`}>
              {isRecording ? <Mic className="w-8 h-8 animate-bounce" /> : <Mic className="w-8 h-8" />}
            </div>
            
            <h3 className="text-base font-bold text-white">
              {isRecording ? `Recording... (${recordingSeconds}s)` : 'Witness Oral Statement Recorder'}
            </h3>
            <p className="text-xs text-zinc-400">
              Compliant with Section 180 Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)
            </p>
          </div>

          <div className="p-4 rounded bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Witness / Deponent Name</label>
              <input
                type="text"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300 pt-1">
              <input
                type="checkbox"
                checked={hasWitnessConsent}
                onChange={(e) => setHasWitnessConsent(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-zinc-900 border-zinc-800 mt-0.5"
              />
              <span className="text-[11px] leading-relaxed">
                I hereby certify that the deponent has given voluntary consent for audio-video recording of this statement in the presence of Investigating Officer.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                disabled={!hasWitnessConsent}
                className="px-6 py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(147,51,234,0.35)] transition flex items-center gap-2 disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                <span>Start Audio Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAudioStatement}
                className="px-6 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)] transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Stop & Seal Audio Evidence</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. QR Bag Tagging Mode */}
      {activeMode === 'QR_TAG' && (
        <div className="p-6 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Physical Evidence Tamper-Evident Bag Tagging</h3>
              <p className="text-xs text-zinc-400">Generate and bind physical QR evidence bags to blockchain</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">QR Bag Serial Barcode</label>
              <input
                type="text"
                value={qrBagCode}
                onChange={(e) => setQrBagCode(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Seized Physical Article Description</label>
              <input
                type="text"
                value={seizedItemName}
                onChange={(e) => setSeizedItemName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Station Panchnama Memo:</span>
            <span className="text-blue-400 font-bold">MEMO-2026-0811-01</span>
          </div>

          <button
            type="button"
            onClick={handleSealQRBag}
            className="w-full py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,119,6,0.35)] transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Generate Digital Chain-of-Custody Barcode Seal</span>
          </button>
        </div>
      )}

    </div>
  );
};
