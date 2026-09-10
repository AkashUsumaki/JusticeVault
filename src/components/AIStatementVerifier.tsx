import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  Languages, 
  Scale, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Clock, 
  User, 
  ChevronRight,
  ExternalLink,
  Download,
  Share2,
  RefreshCw,
  Layers,
  BookOpen,
  Volume2
} from 'lucide-react';
import { 
  FIRDetails, 
  EvidenceItem, 
  LanguageCode, 
  OfficerUser, 
  StatementVerificationReport, 
  StatementClaim 
} from '../types';
import { verifyStatementAI, transcribeAudioAI } from '../services/api';
import { translations } from '../translations/i18n';

interface AIStatementVerifierProps {
  caseItem: FIRDetails;
  evidenceList: EvidenceItem[];
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onLogBlockchainEvent: (action: any, details: string, evidenceId?: string, evidenceHash?: string) => void;
}

export const AIStatementVerifier: React.FC<AIStatementVerifierProps> = ({
  caseItem,
  evidenceList,
  currentOfficer,
  currentLang,
  onLogBlockchainEvent,
}) => {
  const t = translations[currentLang];

  const [statementText, setStatementText] = useState('');
  const [speakerName, setSpeakerName] = useState('Dinesh Kumar (Prime Suspect)');
  const [speakerRole, setSpeakerRole] = useState<'SUSPECT' | 'WITNESS' | 'COMPLAINANT' | 'VICTIM'>('SUSPECT');
  const [inputLang, setInputLang] = useState<LanguageCode>(currentLang);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Verification report state
  const [report, setReport] = useState<StatementVerificationReport | null>(null);

  // Preset statements for instant demonstration
  const presets = [
    {
      title: 'Suspect Dinesh Alibi (English) - Contradicted by CDR & CCTV',
      lang: 'en' as LanguageCode,
      speaker: 'Dinesh Kumar (Prime Suspect)',
      role: 'SUSPECT' as const,
      text: `On the morning of August 8th between 10:00 AM and 1:00 PM, I was completely at my residence in Tambaram taking rest. I never visited Kodambakkam nor did I operate any Yamaha FZ motorcycle with registration TN-09-CB-4491. I have never received any Rs. 4,50,000 cash transfer from Suresh nor do I know the phone number +91 98401 22910.`
    },
    {
      title: 'Suspect Alibi in Tamil (தமிழ்) - Cross-examine Alibi',
      lang: 'ta' as LanguageCode,
      speaker: 'தினேஷ் குமார் (சந்தேக நபர்)',
      role: 'SUSPECT' as const,
      text: `நான் சம்பவம் நடந்த அன்று காலை பத்து மணி முதல் மதியம் ஒரு மணி வரை தாம்பரத்தில் உள்ள என் அம்மா வீட்டில் இருந்தேன். நான் எந்த பைக்கும் ஓட்டவில்லை. கோடம்பாக்கம் ஏடிஎம் பக்கத்தில் நான் போகவே இல்லை. எனக்கு இந்த நான்கு லட்ச ரூபாய் பணப்பரிவர்த்தனை பற்றி எதுவும் தெரியாது.`
    },
    {
      title: 'Witness Statement in Malayalam (മലയാളം) - Financial Mule Network',
      lang: 'ml' as LanguageCode,
      speaker: 'വിഷ്ണു നായർ (സാക്ഷി)',
      role: 'WITNESS' as const,
      text: `ഓഗസ്റ്റ് 8 ന് ഉച്ചയ്ക്ക് 12 മണിക്ക് കോടമ്പാക്കത്ത് വെച്ച് ദിനേശ് എന്ന വ്യക്തി ഒരു കറുത്ത ബൈക്കിൽ വന്ന് കവറിൽ പണം നൽകുന്നത് ഞാൻ കണ്ടിരുന്നു. ആ ബൈക്കിന്റെ നമ്പർ TN-09 എന്ന രീതിയിൽ ആയിരുന്നു.`
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setStatementText(preset.text);
    setInputLang(preset.lang);
    setSpeakerName(preset.speaker);
    setSpeakerRole(preset.role);
  };

  // Real Web Speech API voice capture or fallback
  const handleToggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isRecordingAudio) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecordingAudio(false);
      setSpeechFeedback(null);
      return;
    }

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = inputLang === 'ta' ? 'ta-IN' : inputLang === 'ml' ? 'ml-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsRecordingAudio(true);
          setSpeechFeedback('Listening to microphone... Speak clearly');
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript + ' ';
          }
          setStatementText((prev) => (transcript.trim() ? transcript.trim() : prev));
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          setIsRecordingAudio(false);
          setSpeechFeedback('Microphone permission needed. Simulating speech transcript...');
          setTimeout(handleFallbackTranscribe, 500);
        };

        recognition.onend = () => {
          setIsRecordingAudio(false);
          setSpeechFeedback(null);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        handleFallbackTranscribe();
      }
    } else {
      handleFallbackTranscribe();
    }
  };

  const handleFallbackTranscribe = async () => {
    setIsRecordingAudio(true);
    setSpeechFeedback('Transcribing audio model...');
    try {
      const res = await transcribeAudioAI({ language: inputLang });
      setStatementText(res.transcript);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecordingAudio(false);
      setSpeechFeedback(null);
    }
  };

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statementText.trim()) return;

    setIsVerifying(true);
    setVerifyStep(1);

    const stepInterval = setInterval(() => {
      setVerifyStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const result = await verifyStatementAI({
        statementText,
        speakerName,
        speakerRole,
        language: inputLang,
        caseId: caseItem.caseId,
        evidenceList,
      });

      clearInterval(stepInterval);
      setReport(result);
      onLogBlockchainEvent(
        'AI_STATEMENT_VERIFIED',
        `AI Cross-examination completed on ${speakerName}: Consistency Score ${result.overallConsistencyScore}%, Contradictions: ${result.contradictedCount}`,
        undefined
      );
    } catch (err) {
      console.error(err);
      clearInterval(stepInterval);
    } finally {
      setIsVerifying(false);
      setVerifyStep(0);
    }
  };

  const getStatusBadge = (status: StatementClaim['status']) => {
    switch (status) {
      case 'CONSISTENT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Consistent
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Contradicted
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Unverified
          </span>
        );
      case 'REQUIRES_OFFICER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Requires Field Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.aiStatementVerifier}</h1>
              <p className="text-xs text-zinc-400">
                Automated Claim-by-Claim Forensic Cross-Examination against Case Evidence Vault
              </p>
            </div>
          </div>
        </div>

        {/* Case Badge */}
        <div className="text-xs px-3 py-1.5 rounded bg-[#0a0c0f] border border-zinc-800 text-zinc-300 flex items-center gap-2">
          <span className="text-zinc-500">Case FIR:</span>
          <span className="font-mono text-blue-400 font-bold">{caseItem.firNumber}</span>
        </div>
      </div>

      {/* Preset Fast Selectors */}
      <div className="p-4 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
          Quick-Load Forensic Test Statements:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-3 rounded bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/40 text-left transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {p.lang.toUpperCase()}
                </span>
                <span className="text-[10px] text-zinc-500">{p.role}</span>
              </div>
              <p className="text-xs font-medium text-zinc-300 group-hover:text-white mt-1.5 line-clamp-1">
                {p.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Statement Input Form */}
      <form onSubmit={handleRunVerification} className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Speaker Full Name / Alias</label>
            <input
              type="text"
              required
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white font-medium focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Speaker Legal Role</label>
            <select
              value={speakerRole}
              onChange={(e) => setSpeakerRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="SUSPECT">Suspect / Accused</option>
              <option value="WITNESS">Eyewitness</option>
              <option value="COMPLAINANT">Complainant / Informant</option>
              <option value="VICTIM">Victim</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Statement Language</label>
            <div className="flex gap-1.5">
              {(['en', 'ta', 'ml'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setInputLang(l)}
                  className={`flex-1 py-2 rounded text-xs font-semibold border transition ${
                    inputLang === l
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'ta' ? 'தமிழ்' : 'മലയാളം'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Record or Paste Recorded Statement (Section 180 BNSS 2023 / CrPC 161)
            </label>

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition ${
                isRecordingAudio
                  ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {isRecordingAudio ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-purple-400" />}
              <span>{isRecordingAudio ? 'Stop Dictation' : 'Live Mic Dictation'}</span>
            </button>
          </div>

          {speechFeedback && (
            <div className="mb-2 px-3 py-1.5 rounded bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
              <span>{speechFeedback}</span>
            </div>
          )}

          <textarea
            rows={4}
            required
            placeholder="Type or dictate the suspect or witness statement in English, Tamil, or Malayalam..."
            value={statementText}
            onChange={(e) => setStatementText(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-xs text-white leading-relaxed focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Cross-checking against {evidenceList.length} evidence items in Case Vault</span>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !statementText.trim()}
            className="px-5 py-2.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(147,51,234,0.35)] transition flex items-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {verifyStep === 1 && 'Extracting factual assertions & alibi timeline...'}
                  {verifyStep === 2 && 'Cross-referencing CDR towers, CCTV & bank ledger...'}
                  {verifyStep === 3 && 'Evaluating contradiction matrix & BSA admissibility...'}
                  {verifyStep === 0 && 'Verifying Statement with Gemini 3.7 Flash...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Statement Verification</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Verification Report Section */}
      {report && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Top Score Banner */}
          <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            <div className="md:col-span-1 text-center md:text-left border-b md:border-b-0 md:border-r border-zinc-800 pb-3 md:pb-0 md:pr-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Consistency Score</span>
              <div className="flex items-baseline justify-center md:justify-start gap-1 mt-1">
                <span className={`text-4xl font-black ${
                  report.overallConsistencyScore >= 70
                    ? 'text-emerald-400'
                    : report.overallConsistencyScore >= 40
                    ? 'text-amber-400'
                    : 'text-rose-500'
                }`}>
                  {report.overallConsistencyScore}%
                </span>
                <span className="text-xs text-zinc-500 font-medium">/ 100</span>
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                {report.overallConsistencyScore < 50 ? 'Severe Contradictions Found' : 'Moderately Consistent'}
              </span>
            </div>

            <div className="md:col-span-3 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Verified Consistent</span>
                <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{report.consistentCount}</span>
              </div>
              <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Direct Contradictions</span>
                <span className="text-xl font-bold text-rose-400 mt-0.5 block">{report.contradictedCount}</span>
              </div>
              <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Requires Field Review</span>
                <span className="text-xl font-bold text-amber-400 mt-0.5 block">{report.unverifiedCount}</span>
              </div>
            </div>

          </div>

          {/* AI Forensic Summary Box */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>AI Judicial Assessment Summary (Bharatiya Sakshya Adhiniyam 2023)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {report.judicialAdmissibilityNotes}
            </p>
          </div>

          {/* Claim-by-Claim Breakdown Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Claim-by-Claim Forensic Cross-Examination ({report.claims.length} Assertions Analyzed):
            </h3>

            {report.claims.map((claim, index) => (
              <div
                key={claim.claimId || index}
                className={`p-4 rounded-lg border text-xs space-y-3 transition ${
                  claim.status === 'CONTRADICTED'
                    ? 'bg-[#0e0708] border-rose-500/40'
                    : claim.status === 'CONSISTENT'
                    ? 'bg-[#070e0a] border-emerald-500/30'
                    : 'bg-[#0a0c0f] border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500">Assertion #{index + 1}</span>
                    <p className="text-sm font-semibold text-white">"{claim.claimText}"</p>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>

                {claim.explanation && (
                  <div className="p-2.5 rounded bg-zinc-950/70 border border-zinc-800/60 text-zinc-300 text-[11px] leading-relaxed">
                    <strong className="text-zinc-200 block mb-0.5">Forensic Findings:</strong>
                    {claim.explanation}
                  </div>
                )}

                {/* Evidence citation link if available */}
                {claim.contradictingEvidenceId && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-rose-400 pt-1 border-t border-rose-950/60">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Contradicted by Vault Item: {claim.contradictingEvidenceId}
                    </span>
                    <span className="text-zinc-500">Confidence: {(claim.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
