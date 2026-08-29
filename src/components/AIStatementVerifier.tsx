import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  Mic, 
  MicOff, 
  RefreshCw, 
  ShieldAlert, 
  ArrowRight, 
  Layers, 
  Globe, 
  User, 
  Volume2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { EvidenceItem, FIRDetails, LanguageCode, OfficerUser, StatementClaim, StatementVerificationReport } from '../types';
import { verifyStatementAI, transcribeAudioAI } from '../services/api';
import { translations } from '../translations/i18n';
import { mockStatementReports } from '../data/mockData';

interface AIStatementVerifierProps {
  caseItem: FIRDetails;
  evidenceList: EvidenceItem[];
  currentOfficer: OfficerUser;
  currentLang: LanguageCode;
  onLogBlockchainEvent: (action: any, details: string, evidenceId?: string) => void;
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
  const [report, setReport] = useState<StatementVerificationReport | null>(mockStatementReports[0] || null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // Preset statements for demonstration
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

  const handleTranscribeVoice = async () => {
    setIsRecordingAudio(true);
    setTimeout(async () => {
      try {
        const res = await transcribeAudioAI({ language: inputLang });
        setStatementText(res.transcript);
      } catch (err) {
        console.error(err);
      } finally {
        setIsRecordingAudio(false);
      }
    }, 1500);
  };

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statementText.trim()) return;

    setIsVerifying(true);
    try {
      const result = await verifyStatementAI({
        statementText,
        speakerName,
        speakerRole,
        language: inputLang,
        caseId: caseItem.caseId,
        evidenceList,
      });

      setReport(result);
      onLogBlockchainEvent(
        'AI_STATEMENT_VERIFIED',
        `AI Cross-examination completed on ${speakerName}: Score ${result.overallConsistencyScore}%, Contradictions: ${result.contradictedCount}`,
        undefined
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
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
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Contradicted
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
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
              Record or Paste Recorded Statement (CrPC 161 / BNSS 180 Statement)
            </label>

            {/* Audio Recorder Trigger */}
            <button
              type="button"
              onClick={handleTranscribeVoice}
              disabled={isRecordingAudio}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition ${
                isRecordingAudio
                  ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {isRecordingAudio ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-purple-400" />}
              <span>{isRecordingAudio ? 'Transcribing Voice...' : 'Simulate Voice Recording'}</span>
            </button>
          </div>

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
            className="px-5 py-2 rounded bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(147,51,234,0.35)] transition flex items-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Gemini 3.7 Flash Cross-Examination...</span>
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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Top Score Banner */}
          <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded border text-center shrink-0 ${
                report.overallConsistencyScore >= 70
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : report.overallConsistencyScore >= 40
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <div className="text-2xl font-bold font-mono">{report.overallConsistencyScore}%</div>
                <div className="text-[9px] uppercase font-bold tracking-widest mt-0.5">Consistency</div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">
                  Cross-Examination Report for {report.speakerName}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Analysis completed on {report.analysisTimestamp.split('T')[0]} • {report.claims.length} Testable Claims Extracted
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    ⚠️ {report.contradictedCount} Contradicted
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✅ {report.consistentCount} Consistent
                  </span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    ❓ {report.unverifiedCount} Unverified
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 max-w-sm text-[11px] text-zinc-400">
              <strong className="text-amber-400 block mb-0.5">LEGAL / PROCEDURAL ADVISORY:</strong>
              {report.aiDisclaimer}
            </div>

          </div>

          {/* Claim-by-Claim Cross-Examination Cards */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Factual Claim Breakdown & Evidence Cross-Examinations:
            </h3>

            {report.claims.map((claim) => (
              <div
                key={claim.id}
                className={`p-4 rounded-lg border transition space-y-3 ${
                  claim.status === 'CONTRADICTED'
                    ? 'bg-[#0a0c0f] border-red-500/30'
                    : claim.status === 'CONSISTENT'
                    ? 'bg-[#0a0c0f] border-emerald-500/30'
                    : 'bg-[#0a0c0f] border-zinc-800/60'
                }`}
              >
                {/* Claim Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {claim.category}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Confidence: {claim.confidenceScore}%</span>
                  </div>

                  {getStatusBadge(claim.status)}
                </div>

                {/* Claim Content */}
                <p className="text-xs font-medium text-white leading-relaxed">
                  "{claim.claimText}"
                </p>

                {/* Evidence Matching Summary */}
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 space-y-2">
                  <p className="font-normal text-zinc-200">
                    <strong className="text-purple-400">Forensic Analysis: </strong>
                    {claim.evidenceMatchSummary}
                  </p>

                  {/* Cited Evidence Cards */}
                  {claim.citedEvidence.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">
                        CITED EVIDENCE RECORDS:
                      </span>
                      {claim.citedEvidence.map((ev, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-[#0a0c0f] border border-zinc-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-400 font-mono">{ev.evidenceTitle} ({ev.evidenceId})</span>
                          </div>
                          <p className="text-zinc-400 font-mono text-[10px]">
                            Snippet: "{ev.quoteOrSnippet}"
                          </p>
                          {ev.contradictionReason && (
                            <p className="text-red-400 font-medium">
                              ⚠️ Conflict: {ev.contradictionReason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
