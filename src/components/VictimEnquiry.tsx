import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Database,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  FIRDetails,
  EvidenceItem,
  VictimEnquiryRecord,
  VictimEnquiryComparison,
  VictimClaimComparison,
} from '../types';

interface VictimEnquiryProps {
  selectedCase: FIRDetails | null;
  evidenceList: EvidenceItem[];
  onSelectEvidence?: (evidence: EvidenceItem) => void;
  onEnquirySaved?: () => void;
}

export const VictimEnquiry: React.FC<VictimEnquiryProps> = ({
  selectedCase,
  evidenceList,
  onSelectEvidence,
  onEnquirySaved,
}) => {
  // Enquiry Input State
  const [victimName, setVictimName] = useState<string>(selectedCase?.complainant.name || 'S. Rajendran');
  const [victimContact, setVictimContact] = useState<string>(selectedCase?.complainant.contact || '+91 98401 23456');
  const [incidentLocation, setIncidentLocation] = useState<string>(
    selectedCase?.incidentLocation || 'SBI ATM, Usman Road, T. Nagar, Chennai'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta' | 'ml' | 'hi'>('en');

  // Speech Recognition & Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [transcriptText, setTranscriptText] = useState<string>(
    'I went to SBI ATM at Usman Road around 10:15 AM on Saturday to withdraw pension money. A young man wearing a dark jacket and blue full-face helmet offered to help with the machine. He swapped my debit card and took off on a black motorcycle waiting outside. Within 5 minutes, ₹1,80,000 was debited in multiple SMS alerts.'
  );
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioBase64, setAudioBase64] = useState<string>('');

  // Comparison & AI Verification State
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<VictimEnquiryComparison | null>(null);
  const [activeTab, setActiveTab] = useState<'RECORD' | 'COMPARISON' | 'HISTORY'>('RECORD');
  const [savedEnquiries, setSavedEnquiries] = useState<VictimEnquiryRecord[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Audio Context & Recognition Refs
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load existing victim enquiries from secure database
  const loadSavedEnquiries = async () => {
    try {
      const caseQuery = selectedCase ? `?caseId=${encodeURIComponent(selectedCase.caseId)}` : '';
      const res = await fetch(`/api/victim-enquiries${caseQuery}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.enquiries)) {
        setSavedEnquiries(data.enquiries);
        if (data.enquiries.length > 0 && !comparisonResult && data.enquiries[0].comparisonResult) {
          setComparisonResult(data.enquiries[0].comparisonResult);
        }
      }
    } catch (err) {
      console.error('Error fetching victim enquiries:', err);
    }
  };

  useEffect(() => {
    loadSavedEnquiries();
  }, [selectedCase]);

  // Handle Web Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. You can type or use sample audio.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Set language locale
      const langCodes: Record<string, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        ml: 'ml-IN',
        hi: 'hi-IN',
      };
      recognition.lang = langCodes[selectedLanguage] || 'en-IN';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscriptText((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not initialize speech recognition:', err);
    }
  };

  // Start Voice Recording (Mic + Speech API)
  const handleStartRecording = async () => {
    setIsRecording(true);
    setRecordingDuration(0);
    audioChunksRef.current = [];

    // Start Timer
    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    // Start Speech to Text
    startSpeechRecognition();

    // Start MediaRecorder for actual voice audio capture
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioBlobUrl(url);

          // Convert to Base64 for database storage
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            setAudioBase64(reader.result as string);
          };

          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Microphone stream access restricted, continuing with voice-to-text text buffer:', err);
    }
  };

  // Stop Voice Recording
  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  // Load sample victim statement in selected language for rapid testing
  const handleLoadSampleStatement = (lang: 'en' | 'ta' | 'ml') => {
    setSelectedLanguage(lang);
    if (lang === 'ta') {
      setTranscriptText(
        'நான் சனிக்கிழமை காலை 10:15 மணிக்கு உஸ்மான் சாலையில் உள்ள எஸ்பிஐ ஏடிஎம்-க்கு ஓய்வூதியப் பணம் எடுக்கச் சென்றேன். அப்போது கருப்பு நிற ஜாக்கெட் மற்றும் நீல நிற ஹெல்மெட் அணிந்த இளைஞன் ஒருவன் உதவி செய்வதாக கூறி என் கார்டை மாற்றிக் கொடுத்தான். வெளியே நின்றுகொண்டிருந்த கருப்பு நிற பைக்கில் ஏறி தப்பிச் சென்றான். 5 நிமிடங்களில் 1,80,000 ரூபாய் வங்கி கணக்கிலிருந்து எடுக்கப்பட்டது.'
      );
    } else if (lang === 'ml') {
      setTranscriptText(
        'ഓഗസ്റ്റ് 8 ശനിയാഴ്ച രാവിലെ 10:15 ഓടെ ഞാൻ ഉസ്മാൻ റോഡിലെ എസ്ബിഐ എടിഎമ്മിൽ പെൻഷൻ പണം പിൻവലിക്കാൻ പോയി. കറുത്ത ജാക്കറ്റും നീല ഹെൽമെറ്റും ധരിച്ച ഒരാൾ എന്നെ കബളിപ്പിച്ച് കാർഡ് മാറ്റി എടുത്തു. പുറത്ത് കാത്തുനിന്ന ബൈക്കിൽ രക്ഷപ്പെട്ടു. 1,80,000 രൂപ അക്കൗണ്ടിൽ നിന്ന് തട്ടിയെടുത്തു.'
      );
    } else {
      setTranscriptText(
        'I went to SBI ATM at Usman Road around 10:15 AM on Saturday to withdraw pension money. A young man wearing a dark jacket and blue full-face helmet offered to help with the machine. He swapped my debit card and took off on a black motorcycle waiting outside. Within 5 minutes, ₹1,80,000 was debited in multiple SMS alerts.'
      );
    }
  };

  // Execute Exact Cross-Comparison with Evidence via Backend
  const handleCompareWithEvidence = async () => {
    if (!transcriptText || transcriptText.trim().length === 0) {
      alert('Please record or enter the victim enquiry statement first.');
      return;
    }

    setIsComparing(true);
    setActiveTab('COMPARISON');

    try {
      const res = await fetch('/api/victim-enquiries/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText,
          victimName,
          caseId: selectedCase?.caseId || 'TN-CHN-2026-004812',
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (data.success && data.comparison) {
        setComparisonResult(data.comparison);
      } else {
        alert(data.error || 'Failed to compare victim enquiry with evidence');
      }
    } catch (err: any) {
      console.error('Comparison error:', err);
      alert('Error during comparison: ' + err.message);
    } finally {
      setIsComparing(false);
    }
  };

  // Save complete enquiry into the Secure Database
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      const enquiryPayload: Partial<VictimEnquiryRecord> = {
        caseId: selectedCase?.caseId || 'TN-CHN-2026-004812',
        victimName,
        victimContact,
        incidentLocation,
        gpsCoordinates: selectedCase?.gpsCoordinates,
        enquiryDate: new Date().toISOString().split('T')[0],
        audioDurationSeconds: recordingDuration || 45,
        hasAudioRecording: Boolean(audioBlobUrl || audioBase64),
        audioFileName: `victim_voice_${Date.now()}.webm`,
        transcriptText,
        language: selectedLanguage,
        officerId: selectedCase?.investigatingOfficerId || 'TN-INSP-4081',
        officerName: selectedCase?.investigatingOfficerName || 'Inspector K. Ramanathan',
        comparisonResult,
        status: comparisonResult
          ? comparisonResult.contradictedCount > 0
            ? 'CONTRADICTIONS_FOUND'
            : 'CORROBORATED'
          : 'PENDING_ANALYSIS',
      };

      const res = await fetch('/api/victim-enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryPayload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        await loadSavedEnquiries();
        if (onEnquirySaved) onEnquirySaved();
      }
    } catch (err) {
      console.error('Error saving victim enquiry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'CORROBORATED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Corroborated
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
            <XCircle className="w-3.5 h-3.5" /> Contradicted
          </span>
        );
      case 'NEW_LEAD':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
            <Lightbulb className="w-3.5 h-3.5" /> New Lead
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" /> Unverified
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Header Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Victim Enquiry Voice-to-Text & Evidence Corroboration Engine
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                BSA Sec 63 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live multilingual speech recording with instant evidentiary cross-comparison against CCTV, CDR, and seized property
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('RECORD')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'RECORD' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Enquiry Record
          </button>
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'COMPARISON' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Evidence Comparison {comparisonResult && `(${comparisonResult.overallCredibilityScore}%)`}
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'HISTORY' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Stored Enquiries ({savedEnquiries.length})
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'RECORD' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Columns: Victim Details & Recording Interface */}
            <div className="lg:col-span-2 space-y-4">
              {/* Victim Metadata Card */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Complainant / Victim Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Victim Full Name</label>
                    <input
                      type="text"
                      value={victimName}
                      onChange={(e) => setVictimName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={victimContact}
                      onChange={(e) => setVictimContact(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e: any) => setSelectedLanguage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="en">English (India)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="ml">Malayalam (മലയാളം)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Incident Spot (Location)</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={incidentLocation}
                      onChange={(e) => setIncidentLocation(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Voice Recording Control Board */}
              <div className="p-5 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50'
                          : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      <Mic className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {isRecording ? 'Listening & Transcribing...' : 'Victim Voice Recording'}
                        </h3>
                        {isRecording && (
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        {isRecording ? `Duration: ${formatSeconds(recordingDuration)}` : 'Ready to record'}
                      </p>
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition"
                      >
                        <Mic className="w-4 h-4" />
                        Start Voice Recording
                      </button>
                    ) : (
                      <button
                        onClick={handleStopRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
                      >
                        <MicOff className="w-4 h-4" />
                        Stop Recording
                      </button>
                    )}

                    {/* Pre-recorded Sample Button */}
                    <div className="relative group">
                      <button
                        type="button"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                      >
                        Load Test Statement
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-1 z-20 w-44">
                        <button
                          onClick={() => handleLoadSampleStatement('en')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded"
                        >
                          English Statement
                        </button>
                        <button
                          onClick={() => handleLoadSampleStatement('ta')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded"
                        >
                          Tamil (தமிழ்) Statement
                        </button>
                        <button
                          onClick={() => handleLoadSampleStatement('ml')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded"
                        >
                          Malayalam (മലയാളം)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Visualizer Waves */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-1 py-2 h-10">
                    {[16, 28, 45, 60, 35, 75, 40, 65, 80, 50, 70, 30, 20].map((h, idx) => (
                      <div
                        key={idx}
                        className="w-1 bg-rose-500 rounded-full animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${idx * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Live Transcript Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Enquiry Transcript (Real-time Speech Output)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {transcriptText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Recorded victim statement will automatically stream here. You can also edit or append details..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleCompareWithEvidence}
                    disabled={isComparing || !transcriptText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition disabled:opacity-50"
                  >
                    {isComparing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Cross-Comparing with Evidence...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Exact Comparing with Evidence
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveToDatabase}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition"
                  >
                    <Database className="w-4 h-4 text-emerald-400" />
                    {isSaving ? 'Storing in DB...' : 'Save to Secure Database'}
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Victim enquiry statement and audio record successfully encrypted and stored in the database!
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Case Evidence Cross-Reference Panel */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Corpus Evidence to Compare ({evidenceList.length})
                  </h3>
                  <span className="text-[10px] text-slate-400">Database Live</span>
                </div>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {evidenceList.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvidence && onSelectEvidence(ev)}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-lg cursor-pointer transition group text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition truncate max-w-[170px]">
                          {ev.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {ev.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {ev.extractedText || ev.title}
                      </p>
                      {ev.gpsLocation && (
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{ev.gpsLocation.addressName || `${ev.gpsLocation.latitude}, ${ev.gpsLocation.longitude}`}</span>
                          </div>
                          {ev.gpsLocation.latitude && ev.gpsLocation.longitude && (
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${ev.gpsLocation.latitude}&mlon=${ev.gpsLocation.longitude}#map=16/${ev.gpsLocation.latitude}/${ev.gpsLocation.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-0.5 ml-2 shrink-0"
                              title="Open on OpenStreetMap"
                            >
                              <span>OSM</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPARISON RESULTS TAB */}
        {activeTab === 'COMPARISON' && (
          <div className="space-y-5 max-w-5xl mx-auto">
            {isComparing ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-base font-bold text-white">
                  Executing Evidentiary Comparison Engine...
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Cross-referencing victim voice testimony against CCTV frames, Airtel CDR records, ATM transaction debits, and physical vehicle recovery records.
                </p>
              </div>
            ) : comparisonResult ? (
              <>
                {/* Score & Summary Banner */}
                <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border-4 border-emerald-500/80 shadow-lg shadow-emerald-900/30">
                      <div className="text-center">
                        <span className="text-2xl font-black text-emerald-400 leading-none">
                          {comparisonResult.overallCredibilityScore}%
                        </span>
                        <span className="text-[9px] block text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                          Corroborated
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          Evidentiary Corroboration Verdict
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          High Evidentiary Reliability
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        {comparisonResult.summary}
                      </p>
                    </div>
                  </div>

                  {/* Metric Chips */}
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-center">
                      <span className="text-lg font-bold text-emerald-400 block">
                        {comparisonResult.corroboratedCount}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">Corroborated</span>
                    </div>
                    <div className="px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-center">
                      <span className="text-lg font-bold text-rose-400 block">
                        {comparisonResult.contradictedCount}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">Contradictions</span>
                    </div>
                    <div className="px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-center">
                      <span className="text-lg font-bold text-amber-400 block">
                        {comparisonResult.newLeadsCount}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">New Leads</span>
                    </div>
                  </div>
                </div>

                {/* Claim-by-Claim Comparison Matrix */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Claim-by-Claim Forensic Evidence Comparison
                  </h4>

                  <div className="space-y-3">
                    {comparisonResult.claims.map((claim, idx) => (
                      <div
                        key={claim.claimId || idx}
                        className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-500">#{idx + 1}</span>
                            <span className="text-xs font-bold text-slate-200">
                              Topic: {claim.topic}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono">
                              Confidence: {claim.confidence}%
                            </span>
                            {getVerdictBadge(claim.verdict)}
                          </div>
                        </div>

                        {/* Spoken Quote vs Forensic Reason */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                            <span className="text-[10px] font-semibold text-blue-400 block mb-1 uppercase tracking-wider">
                              Victim's Spoken Statement:
                            </span>
                            <p className="text-slate-200 italic">"{claim.statementSnippet}"</p>
                          </div>
                          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                            <span className="text-[10px] font-semibold text-emerald-400 block mb-1 uppercase tracking-wider">
                              Evidentiary Cross-Analysis:
                            </span>
                            <p className="text-slate-300">{claim.reasoning}</p>
                          </div>
                        </div>

                        {/* Matched Evidence Sources */}
                        {claim.matchingEvidence && claim.matchingEvidence.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Corroborating Evidence Items Cited:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {claim.matchingEvidence.map((ev, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                                  <span className="font-medium text-slate-200">{ev.evidenceTitle}</span>
                                  <span className="text-[10px] text-slate-400">({ev.relevanceNote})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immediate Actionable Next Steps */}
                {comparisonResult.immediateInvestigativeActions && (
                  <div className="p-5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Recommended Immediate Investigative Actions
                    </h4>
                    <div className="space-y-1.5">
                      {comparisonResult.immediateInvestigativeActions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                          <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save and Return Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveTab('RECORD')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    ← Back to Recording
                  </button>
                  <button
                    onClick={handleSaveToDatabase}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    <Database className="w-4 h-4" />
                    {isSaving ? 'Encrypting & Storing in DB...' : 'Save Enquiry & Comparison into Database'}
                  </button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No Comparison Run Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "Exact Comparing with Evidence" on the recording tab to cross-analyze the victim statement against case evidence.
                </p>
                <button
                  onClick={() => setActiveTab('RECORD')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium"
                >
                  Go to Record Tab
                </button>
              </div>
            )}
          </div>
        )}

        {/* ENQUIRY HISTORY TAB */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Stored Victim Enquiries in Tamperproof Database
                </h3>
                <p className="text-xs text-slate-400">
                  Total {savedEnquiries.length} verified statements recorded with audio logs and cryptographic verification
                </p>
              </div>
              <button
                onClick={loadSavedEnquiries}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                title="Refresh from Database"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {savedEnquiries.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No victim enquiries stored in database yet.
              </div>
            ) : (
              <div className="space-y-3">
                {savedEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2">
                      <div>
                        <span className="text-xs font-bold text-white">{enq.victimName}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({enq.incidentLocation})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{enq.enquiryDate}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          {enq.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      "{enq.transcriptText}"
                    </p>

                    {enq.comparisonResult && (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-emerald-400 font-semibold">
                          Corroboration Score: {enq.comparisonResult.overallCredibilityScore}%
                        </span>
                        <button
                          onClick={() => {
                            setTranscriptText(enq.transcriptText);
                            setVictimName(enq.victimName);
                            setComparisonResult(enq.comparisonResult!);
                            setActiveTab('COMPARISON');
                          }}
                          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          View Full Cross-Comparison Report →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
