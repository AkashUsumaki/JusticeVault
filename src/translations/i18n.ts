import { LanguageCode } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  badgeId: string;
  policeStation: string;
  role: string;
  clearance: string;
  sessionTimeout: string;
  extendSession: string;
  logout: string;
  switchOfficer: string;
  
  // Navigation
  navDashboard: string;
  navCases: string;
  navEvidence: string;
  navVictimEnquiry: string;
  navMapLocations: string;
  navAIVerifier: string;
  navRelations: string;
  navBlockchain: string;
  navSharing: string;
  navIntegrations: string;
  navMobileField: string;
  
  // Auth
  loginTitle: string;
  loginSubtitle: string;
  kycFaceAuth: string;
  faceLivenessCheck: string;
  faceVerified: string;
  faceScanning: string;
  mfaOtp: string;
  sendOtp: string;
  verifyAndLogin: string;
  supervisorApproved: string;
  
  // Cases
  caseDashboard: string;
  newFIR: string;
  firNumber: string;
  caseId: string;
  offenceSections: string[];
  statusOpen: string;
  statusInvestigation: string;
  statusChargesheet: string;
  statusClosed: string;
  deadlineAlert: string;
  daysRemaining: string;
  evidenceCount: string;
  complainant: string;
  accused: string;
  incidentDesc: string;
  
  // Evidence
  evidenceVault: string;
  uploadEvidence: string;
  dragDropText: string;
  sha256Verification: string;
  malwareClean: string;
  encryptedAES: string;
  signedUrlNotice: string;
  verifyIntegrity: string;
  tamperTest: string;
  tamperDetectedAlert: string;
  versionHistory: string;
  
  // AI Verifier
  aiStatementAnalysis: string;
  aiSubtitle: string;
  inputStatement: string;
  recordAudio: string;
  analyzeClaims: string;
  consistent: string;
  contradicted: string;
  unverified: string;
  requiresReview: string;
  confidenceScore: string;
  citedSources: string;
  aiDisclaimer: string;
  
  // Blockchain
  blockchainTitle: string;
  hyperledgerInfo: string;
  blockExplorer: string;
  immutableLedger: string;
  generate65BCertificate: string;
  verifyChainOfCustody: string;
  txHash: string;
  
  // Sharing
  manualShareTitle: string;
  selectStation: string;
  selectOfficer: string;
  shareDuration: string;
  viewOnly: string;
  downloadAllowed: string;
  revokeShare: string;
  
  // Field
  fieldCaptureTitle: string;
  gpsWatermark: string;
  audioConsentGranted: string;
  qrEvidenceTag: string;
  offlineQueue: string;
  syncNow: string;
  
  // Integrations
  cctnsTitle: string;
  eSakshyaTitle: string;
  cyber1930Title: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "न्याय-साक्ष्य (JusticeVault)",
    appSubtitle: "Government of India • Ministry of Home Affairs • Digital Evidence & Criminal Intelligence Platform",
    badgeId: "Badge ID",
    policeStation: "Police Station",
    role: "Officer Role",
    clearance: "Clearance Level",
    sessionTimeout: "Session Timeout",
    extendSession: "Extend Session",
    logout: "Secure Logout",
    switchOfficer: "Switch Officer Role",
    
    navDashboard: "Command Center",
    navCases: "FIR & Cases",
    navEvidence: "Evidence Vault (DB)",
    navVictimEnquiry: "Victim Voice Enquiry",
    navMapLocations: "OpenStreetMap Radar",
    navAIVerifier: "AI Statement Verifier",
    navRelations: "Entity & Timeline Graph",
    navBlockchain: "Blockchain & Chain of Custody",
    navSharing: "Inter-Station Sharing",
    navIntegrations: "Police Integrations",
    navMobileField: "Field Capture (Mobile)",
    
    loginTitle: "Law Enforcement Portal Login",
    loginSubtitle: "Mandatory UIDAI/State Police KYC Face Authentication & 2FA MFA",
    kycFaceAuth: "Govt-Approved KYC Face Authentication",
    faceLivenessCheck: "Perform Active Liveness Detection",
    faceVerified: "Face Geometry & Liveness Verified",
    faceScanning: "Aligning Face Geometry & Calculating Embeddings...",
    mfaOtp: "Mobile OTP Verification",
    sendOtp: "Send OTP to Registered Mobile",
    verifyAndLogin: "Verify Credentials & Authorize",
    supervisorApproved: "Supervisor Enrolled & Approved (Vault KMS Encrypted)",
    
    caseDashboard: "Case Investigation Dashboard",
    newFIR: "Register New FIR Case",
    firNumber: "FIR Number",
    caseId: "System Case ID",
    offenceSections: ["BNS/IPC Offence Sections"],
    statusOpen: "Open Case",
    statusInvestigation: "Under Active Investigation",
    statusChargesheet: "Charge Sheet Filed",
    statusClosed: "Closed / Court Disposed",
    deadlineAlert: "Statutory 90-Day Chargesheet Deadline Tracker",
    daysRemaining: "Days Remaining",
    evidenceCount: "Evidence Items",
    complainant: "Complainant Details",
    accused: "Accused / Suspects",
    incidentDesc: "Incident Synopsis",
    
    evidenceVault: "Secure Digital Evidence Vault",
    uploadEvidence: "Upload Digital Evidence Item",
    dragDropText: "Drag & drop legal documents, CCTV, phone recordings, bank CDRs (Max 100MB)",
    sha256Verification: "Cryptographic SHA-256 Hash",
    malwareClean: "ClamAV / VirusTotal Antivirus: CLEAN",
    encryptedAES: "AES-256 Encrypted at Rest & TLS 1.3 in Transit",
    signedUrlNotice: "Time-Limited Signed URL (Expires in 60 minutes)",
    verifyIntegrity: "Verify Cryptographic Integrity",
    tamperTest: "Simulate Tamper Attack (Integrity Alert Test)",
    tamperDetectedAlert: "TAMPER ALERT: SHA-256 mismatch detected! Access blocked and incident logged to Blockchain.",
    versionHistory: "Immutable Version Control & Rollback",
    
    aiStatementAnalysis: "AI Cross-Evidence Statement Verification",
    aiSubtitle: "Automated claim extraction & cross-examination against CDRs, CCTV timestamps, geo-photos & forensic records",
    inputStatement: "Enter Witness / Suspect Oral or Typed Statement",
    recordAudio: "Record Audio Statement (with consent)",
    analyzeClaims: "Cross-Examine Statement with Evidence",
    consistent: "Consistent (Matches Evidence)",
    contradicted: "Contradicted (Direct Conflict)",
    unverified: "Unverified (Insufficient Evidence)",
    requiresReview: "Requires Officer Review",
    confidenceScore: "AI Confidence Score",
    citedSources: "Cited Evidence Records",
    aiDisclaimer: "LEGAL NOTICE: AI never declares guilt or innocence. It strictly highlights factual inconsistencies for authorized investigating officer evaluation under the Bharatiya Sakshya Adhiniyam / Indian Evidence Act.",
    
    blockchainTitle: "Hyperledger Fabric Blockchain Audit Log",
    hyperledgerInfo: "Private Permissioned Blockchain Network (Police Consortium Node)",
    blockExplorer: "Block Explorer & Transaction Hashes",
    immutableLedger: "Immutable Signed Audit Trail",
    generate65BCertificate: "Export Section 65B Electronic Evidence Certificate (PDF)",
    verifyChainOfCustody: "Verify Full Chain of Custody",
    txHash: "Transaction Hash",
    
    manualShareTitle: "Inter-Station Officer-Controlled Sharing",
    selectStation: "Select Target Police Station",
    selectOfficer: "Select Recipient Officer",
    shareDuration: "Time-Limited Access Validity",
    viewOnly: "Restricted View Only",
    downloadAllowed: "Evidence Download Allowed",
    revokeShare: "Revoke Access Immediately",
    
    fieldCaptureTitle: "Field Officer Mobile Evidence Capture",
    gpsWatermark: "GPS & Timestamp Cryptographic Watermark",
    audioConsentGranted: "Oral Statement Consent Acknowledged",
    qrEvidenceTag: "QR Seized Item Tagging",
    offlineQueue: "Offline Evidence Queue",
    syncNow: "Sync to Case Dashboard",
    
    cctnsTitle: "CCTNS (Crime & Criminal Tracking Network & Systems)",
    eSakshyaTitle: "eSakshya Digital Evidence (SID Packets)",
    cyber1930Title: "1930 National Cyber Crime Reporting Portal"
  },
  
  ta: {
    appName: "ஜஸ்டிஸ் வால்ட் (JusticeVault)",
    appSubtitle: "நீதித்துறை மற்றும் காவல்துறைக்கான பாதுகாப்பான டிஜிட்டல் சான்று மேலாண்மை தளம்",
    badgeId: "பேட்ஜ் எண்",
    policeStation: "காவல் நிலையம்",
    role: "அதிகாரி பதவி",
    clearance: "பாதுகாப்பு அனுமதி நிலை",
    sessionTimeout: "அமர்வு காலாவதி",
    extendSession: "அமர்வை நீட்டிக்குக",
    logout: "பாதுகாப்பான வெளியேறு",
    switchOfficer: "அதிகாரி பாத்திரத்தை மாற்றுக",
    
    navDashboard: "கட்டளை மையம்",
    navCases: "முதல் தகவல் அறிக்கை (FIR)",
    navEvidence: "சான்று பெட்டகம் (DB)",
    navVictimEnquiry: "பாதிக்கப்பட்டவர் குரல் விசாரணை",
    navMapLocations: "ஓபன்ஸ்ட்ரீட்மேப் வரைபடம்",
    navAIVerifier: "AI வாக்குமூல சரிபார்ப்பு",
    navRelations: "தொடர்பு & காலவரிசை வரைபடம்",
    navBlockchain: "பிளாக்செயின் & சான்று சங்கிலி",
    navSharing: "நிலையங்களுக்கு இடையிலான பகிர்வு",
    navIntegrations: "காவல்துறை அமைப்புகள் இணைப்பு",
    navMobileField: "களப் பதிவு (மொபைல்)",
    
    loginTitle: "காவல்துறை அதிகாரி உள்நுழைவு",
    loginSubtitle: "அரசு அங்கீகரித்த KYC முக அடையாளம் மற்றும் 2FA சரிபார்ப்பு கட்டாயம்",
    kycFaceAuth: "அரசு அங்கீகரித்த KYC முக அங்கீகாரம்",
    faceLivenessCheck: "உயிருள்ள முக சரிபார்ப்பு (Liveness)",
    faceVerified: "முக வடிவியல் சரிபார்க்கப்பட்டது",
    faceScanning: "முக வடிவியல் அளவீடு மற்றும் குறியாக்கம் செய்யப்படுகிறது...",
    mfaOtp: "மொபைல் OTP சரிபார்ப்பு",
    sendOtp: "பதிவுசெய்த எண்ணுக்கு OTP அனுப்புக",
    verifyAndLogin: "சான்றுகளை சரிபார்த்து உள்நுழைக",
    supervisorApproved: "கண்காணிப்பாளர் ஒப்புதல் பெறப்பட்டது (Vault KMS குறியாக்கம்)",
    
    caseDashboard: "வழக்கு விசாரணை கட்டுப்பாட்டு பலகை",
    newFIR: "புதிய FIR பதிவு செய்க",
    firNumber: "FIR எண்",
    caseId: "வழக்கு ஐடி",
    offenceSections: ["BNS/IPC சட்டப் பிரிவுகள்"],
    statusOpen: "திறந்த வழக்கு",
    statusInvestigation: "தீவிர விசாரணையில் உள்ளது",
    statusChargesheet: "குற்றப்பத்திரிகை தாக்கல் செய்யப்பட்டது",
    statusClosed: "முடிவுற்ற வழக்கு",
    deadlineAlert: "90 நாள் குற்றப்பத்திரிகை காலக்கெடு கண்காணிப்பாளர்",
    daysRemaining: "மீதமுள்ள நாட்கள்",
    evidenceCount: "சான்றுகள் எண்ணிக்கை",
    complainant: "புகார்தாரர் விவரங்கள்",
    accused: "குற்றம் சாட்டப்பட்டவர்கள்",
    incidentDesc: "சம்பவ சுருக்கம்",
    
    evidenceVault: "பாதுகாப்பான டிஜிட்டல் சான்று பெட்டகம்",
    uploadEvidence: "டிஜிட்டல் சான்றை பதிவேற்றுக",
    dragDropText: "ஆவணங்கள், சிசிடிவி, அழைப்பு பதிவுகள், வங்கி அறிக்கைகளை இழுத்து விடுக (அதிகபட்சம் 100MB)",
    sha256Verification: "கிரிப்டோகிராஃபிக் SHA-256 ஹாஷ்",
    malwareClean: "ClamAV வைரஸ் தடுப்பு: பாதுகாப்பானது (CLEAN)",
    encryptedAES: "AES-256 குறியாக்கம் & TLS 1.3 பரிமாற்றம்",
    signedUrlNotice: "காலவரையறை கொண்ட அணுகல் இணைப்பு (60 நிமிடங்களில் காலாவதியாகும்)",
    verifyIntegrity: "சான்றின் உண்மைத்தன்மையை சரிபார்க்கவும்",
    tamperTest: "சான்று மாற்ற போலி சோதனை (Tamper Alert Test)",
    tamperDetectedAlert: "எச்சரிக்கை: SHA-256 ஹாஷ் பொருந்தவில்லை! அணுகல் தடுக்கப்பட்டு பிளாக்செயினில் பதிவு செய்யப்பட்டது.",
    versionHistory: "மாற்ற முடியாத பதிப்பு வரலாறு",
    
    aiStatementAnalysis: "AI வாக்குமூல உண்மைத்தன்மை சரிபார்ப்பு",
    aiSubtitle: "வாக்குமூலக் கூற்றுகளை பிரித்தெடுத்து CDR, சிசிடிவி நேரம், புகைப்படங்களுடன் தானியங்கி ஒப்பீடு",
    inputStatement: "சாட்சி / சந்தேக நபர் வாக்குமூலத்தை உள்ளிடவும்",
    recordAudio: "ஆடியோ வாக்குமூலத்தை பதிவு செய்க",
    analyzeClaims: "சான்றுகளுடன் கூற்றுகளை ஒப்பிடுக",
    consistent: "பொருந்துகிறது (Consistent)",
    contradicted: "முரண்படுகிறது (Contradicted)",
    unverified: "சரிபார்க்கப்படவில்லை (Unverified)",
    requiresReview: "அதிகாரி மறுஆய்வு தேவை (Review Required)",
    confidenceScore: "AI நம்பகத்தன்மை மதிப்பீடு",
    citedSources: "மேற்கோள் காட்டப்பட்ட சான்றுகள்",
    aiDisclaimer: "சட்ட அறிவிப்பு: AI குற்றத்தை தீர்மானிக்காது. பாரதிய சாக்ஷிய அதினியத்தின் கீழ் புலனாய்வு அதிகாரியின் மதிப்பீட்டிற்காக முரண்பாடுகளை மட்டுமே சுட்டிக்காட்டுகிறது.",
    
    blockchainTitle: "ஹைப்பர்லெட்ஜர் ஃபேப்ரிக் பிளாக்செயின் தணிக்கை",
    hyperledgerInfo: "அங்கீகரிக்கப்பட்ட காவல்துறை பிளாக்செயின் நெட்வொர்க்",
    blockExplorer: "பிளாக் எக்ஸ்ப்ளோரர் & பரிவர்த்தனைகள்",
    immutableLedger: "மாற்ற முடியாத கையொப்பமிட்ட தணிக்கைப் பதிவு",
    generate65BCertificate: "பிரிவு 65B மின்னணு சான்று சான்றிதழ் (PDF)",
    verifyChainOfCustody: "முழு சான்று சங்கிலியை சரிபார்க்கவும்",
    txHash: "பரிவர்த்தனை ஹாஷ் (Tx Hash)",
    
    manualShareTitle: "நிலையங்களுக்கு இடையிலான அதிகாரி கட்டுப்படுத்திய பகிர்வு",
    selectStation: "இலக்கு காவல் நிலையத்தைத் தேர்வுசெய்க",
    selectOfficer: "பெறும் அதிகாரியைத் தேர்வுசெய்க",
    shareDuration: "அணுகல் கால அவகாசம்",
    viewOnly: "பார்வைக்கு மட்டும்",
    downloadAllowed: "பதிவிறக்க அனுமதி",
    revokeShare: "அணுகலை உடனடியாக ரத்துசெய்க",
    
    fieldCaptureTitle: "கள அதிகாரி மொபைல் சான்று பதிவு",
    gpsWatermark: "GPS மற்றும் நேர முத்திரை குறியாக்கம்",
    audioConsentGranted: "வாக்குமூல ஒப்புதல் பெறப்பட்டது",
    qrEvidenceTag: "QR பறிமுதல் சான்று குறியீடு",
    offlineQueue: "ஆஃப்லைன் சான்று வரிசை",
    syncNow: "கட்டுப்பாட்டு பலகையுடன் ஒத்திசை",
    
    cctnsTitle: "CCTNS குற்ற & குற்றவாளி கண்காணிப்பு அமைப்பு",
    eSakshyaTitle: "eSakshya டிஜிட்டல் சான்று (SID தொகுப்பு)",
    cyber1930Title: "1930 தேசிய சைபர் குற்ற உதவி தளம்"
  },
  
  ml: {
    appName: "ജസ്റ്റിസ് വോൾട്ട് (JusticeVault)",
    appSubtitle: "പോലീസ് ഉദ്യോഗസ്ഥർക്കായുള്ള സുരക്ഷിത ഡിജിറ്റൽ തെളിവ് മാനേജ്‌മെന്റും അന്വേഷണ ഇന്റലിജൻസും",
    badgeId: "ബാഡ്ജ് നമ്പർ",
    policeStation: "പോലീസ് സ്റ്റേഷൻ",
    role: "ഉദ്യോഗസ്ഥ പദവി",
    clearance: "സുരക്ഷാ ക്ലിയറൻസ് ലെവൽ",
    sessionTimeout: "സെഷൻ സമയപരിധി",
    extendSession: "സെഷൻ നീട്ടുക",
    logout: "സുരക്ഷിതമായി ലോഗ്ഔട്ട് ചെയ്യുക",
    switchOfficer: "ഉദ്യോഗസ്ഥ റോൾ മാറ്റുക",
    
    navDashboard: "കമാൻഡ് സെന്റർ",
    navCases: "എഫ്‌ഐആറും കേസുകളും",
    navEvidence: "തെളിവ് ശേഖരം (DB)",
    navVictimEnquiry: "ഇരയുടെ ശബ്ദ മൊഴി രേഖപ്പെടുത്തൽ",
    navMapLocations: "ഓപ്പൺസ്ട്രീറ്റ്മാപ്പ് റഡാർ",
    navAIVerifier: "AI മൊഴി പരിശോധന",
    navRelations: "ബന്ധങ്ങളും സമയക്രമ ഗ്രാഫും",
    navBlockchain: "ബ്ലോക്ക്ചെയിനും കസ്റ്റഡി ശൃംഖലയും",
    navSharing: "സ്റ്റേഷനുകൾ തമ്മിലുള്ള പങ്കിടൽ",
    navIntegrations: "പോലീസ് സിസ്റ്റം ഇന്റഗ്രേഷൻ",
    navMobileField: "ഫീൽഡ് ക്യാപ്‌ചർ (മൊബൈൽ)",
    
    loginTitle: "പോലീസ് ഉദ്യോഗസ്ഥ ലോഗിൻ",
    loginSubtitle: "സർക്കാർ അംഗീകൃത KYC മുഖ പ്രാമാണീകരണവും 2FA MFA നിർബന്ധം",
    kycFaceAuth: "സർക്കാർ അംഗീകൃത KYC ഫേസ് ഓതന്റിക്കേഷൻ",
    faceLivenessCheck: "സജീവ ലൈവ്‌നെസ്സ് കണ്ടെത്തൽ നടത്തുക",
    faceVerified: "മുഖ ജ്യാമിതിയും ലൈവ്‌നെസ്സും സ്ഥിരീകരിച്ചു",
    faceScanning: "മുഖം പരിശോധിക്കുകയും എൻക്രിപ്റ്റ് ചെയ്യുകയും ചെയ്യുന്നു...",
    mfaOtp: "മൊബൈൽ OTP പരിശോധന",
    sendOtp: "രജിസ്റ്റർ ചെയ്ത മൊബൈലിലേക്ക് OTP അയയ്ക്കുക",
    verifyAndLogin: "സ്ഥിരീകരിച്ച് പ്രവേശിക്കുക",
    supervisorApproved: "മേലുദ്യോഗസ്ഥൻ അംഗീകരിച്ചത് (Vault KMS എൻക്രിപ്ഷൻ)",
    
    caseDashboard: "കേസ് അന്വേഷണ ഡാഷ്‌ബോർഡ്",
    newFIR: "പുതിയ എഫ്‌ഐആർ രജിസ്റ്റർ ചെയ്യുക",
    firNumber: "എഫ്‌ഐആർ നമ്പർ",
    caseId: "സിസ്റ്റം കേസ് ഐഡി",
    offenceSections: ["BNS/IPC നിയമ വകുപ്പുകൾ"],
    statusOpen: "തുറന്ന കേസ്",
    statusInvestigation: "അന്വേഷണ പുരോഗതിയിൽ",
    statusChargesheet: "കുറ്റപത്രം സമർപ്പിച്ചു",
    statusClosed: "തീർപ്പാക്കിയ കേസ്",
    deadlineAlert: "90 ദിവസത്തെ കുറ്റപത്ര സമയപരിധി ട്രാക്കർ",
    daysRemaining: "ശേഷിക്കുന്ന ദിവസങ്ങൾ",
    evidenceCount: "തെളിവുകളുടെ എണ്ണം",
    complainant: "പരാതിക്കാരന്റെ വിവരങ്ങൾ",
    accused: "പ്രതികൾ / സംശയിക്കപ്പെടുന്നവർ",
    incidentDesc: "സംഭവ വിവരണം",
    
    evidenceVault: "സുരക്ഷിത ഡിജിറ്റൽ തെളിവ് ശേഖരം",
    uploadEvidence: "ഡിജിറ്റൽ തെളിവ് അപ്‌ലോഡ് ചെയ്യുക",
    dragDropText: "രേഖകൾ, സിസിടിവി, ഫോൺ കോളുകൾ, ബാങ്ക് സ്റ്റേറ്റ്‌മെന്റുകൾ വലിച്ചിടുക (പരമാവധി 100MB)",
    sha256Verification: "ക്രിപ്റ്റോഗ്രാഫിക് SHA-256 ഹാഷ്",
    malwareClean: "ClamAV ആന്റിവൈറസ്: സുരക്ഷിതം (CLEAN)",
    encryptedAES: "AES-256 എൻക്രിപ്ഷനും TLS 1.3 ട്രാൻസിറ്റും",
    signedUrlNotice: "സമയപരിമിതമായ സുരക്ഷിത ലിങ്ക് (60 മിനിറ്റിൽ കാലഹരണപ്പെടും)",
    verifyIntegrity: "തെളിവിന്റെ വിശ്വാസ്യത പരിശോധിക്കുക",
    tamperTest: "കൃത്രിമത്വ പരിശോധന (Tamper Alert Test)",
    tamperDetectedAlert: "മുന്നറിയിപ്പ്: SHA-256 ഹാഷ് പൊരുത്തക്കേട്! ആക്‌സസ് തടഞ്ഞു, ബ്ലോക്ക്‌ചെയിനിൽ രേഖപ്പെടുത്തി.",
    versionHistory: "മാറ്റമില്ലാത്ത പതിപ്പ് ചരിത്രം",
    
    aiStatementAnalysis: "AI തെളിവ് താരതമ്യ മൊഴി പരിശോധന",
    aiSubtitle: "മൊഴിയിലെ അവകാശവാദങ്ങൾ വേർതിരിച്ച് സിസിടിവി, സിഡിആർ, രേഖകളുമായി താരതമ്യം ചെയ്യുന്നു",
    inputStatement: "സാക്ഷി / പ്രതിയുടെ മൊഴി രേഖപ്പെടുത്തുക",
    recordAudio: "ഓഡിയോ മൊഴി റെക്കോർഡ് ചെയ്യുക (സമ്മതത്തോടെ)",
    analyzeClaims: "തെളിവുകളുമായി താരതമ്യം ചെയ്യുക",
    consistent: "പൊരുത്തപ്പെടുന്നു (Consistent)",
    contradicted: "പൊരുത്തക്കേട് ഉണ്ട് (Contradicted)",
    unverified: "സ്ഥിരീകരിച്ചിട്ടില്ല (Unverified)",
    requiresReview: "ഉദ്യോഗസ്ഥ പരിശോധന ആവശ്യമാണ്",
    confidenceScore: "AI ആത്മവിശ്വാസ സ്കോർ",
    citedSources: "ഉദ്ധരിച്ച തെളിവ് രേഖകൾ",
    aiDisclaimer: "നിയമപരമായ അറിയിപ്പ്: AI ഒരിക്കലും കുറ്റം വിധിക്കുന്നില്ല. ഭാരതീയ സാക്ഷ്യ അധിനിയമ പ്രകാരം അന്വേഷണ ഉദ്യോഗസ്ഥന്റെ പരിശോധനയ്ക്കായി പൊരുത്തക്കേടുകൾ ചൂണ്ടിക്കാണിക്കുക മാത്രമാണ് ചെയ്യുന്നത്.",
    
    blockchainTitle: "ഹൈപ്പർലെഡ്ജർ ഫാബ്രിക് ബ്ലോക്ക്‌ചെയിൻ ഓഡിറ്റ്",
    hyperledgerInfo: "അനുമതി നൽകിയ പോലീസ് ബ്ലോക്ക്‌ചെയിൻ നെറ്റ്‌വർക്ക്",
    blockExplorer: "ബ്ലോക്ക് എക്സ്പ്ലോററും ഇടപാടുകളും",
    immutableLedger: "മാറ്റമില്ലാത്ത ഒപ്പിട്ട ഓഡിറ്റ് ലോഗ്",
    generate65BCertificate: "സെക്ഷൻ 65B ഇലക്ട്രോണിക് തെളിവ് സർട്ടിഫിക്കറ്റ് (PDF)",
    verifyChainOfCustody: "സമ്പൂർണ്ണ കസ്റ്റഡി ശൃംഖല പരിശോധിക്കുക",
    txHash: "ഇടപാട് ഹാഷ് (Tx Hash)",
    
    manualShareTitle: "സ്റ്റേഷനുകൾ തമ്മിലുള്ള ഉദ്യോഗസ്ഥ നിയന്ത്രിത പങ്കിടൽ",
    selectStation: "ലക്ഷ്യ പോലീസ് സ്റ്റേഷൻ തിരഞ്ഞെടുക്കുക",
    selectOfficer: "സ്വീകർത്താവായ ഉദ്യോഗസ്ഥനെ തിരഞ്ഞെടുക്കുക",
    shareDuration: "സാധുത കാലയളവ്",
    viewOnly: "കാണാൻ മാത്രം",
    downloadAllowed: "ഡൗൺലോഡ് അനുവദനീയം",
    revokeShare: "ഉടൻ ആക്‌സസ് റദ്ദാക്കുക",
    
    fieldCaptureTitle: "ഫീൽഡ് ഉദ്യോഗസ്ഥ മൊബൈൽ തെളിവ് ശേഖരണം",
    gpsWatermark: "ജിപിഎസും സമയമുദ്രയും അടങ്ങിയ ക്രിപ്റ്റോഗ്രാഫിക് വാട്ടർമാർക്ക്",
    audioConsentGranted: "മൊഴി നൽകാനുള്ള സമ്മതം ലഭിച്ചു",
    qrEvidenceTag: "QR പിടിച്ചെടുത്ത വസ്തുക്കളുടെ ടാഗിംഗ്",
    offlineQueue: "ഓഫ്‌ലൈൻ തെളിവ് നിര",
    syncNow: "ഡാഷ്‌ബോർഡിലേക്ക് സമന്വയിപ്പിക്കുക",
    
    cctnsTitle: "CCTNS ക്രൈം & ക്രിമിനൽ ട്രാക്കിംഗ് നെറ്റ്‌വർക്ക്",
    eSakshyaTitle: "eSakshya ഡിജിറ്റൽ തെളിവ് (SID പാക്കറ്റ്)",
    cyber1930Title: "1930 ദേശീയ സൈബർ ക്രൈം ഹെൽപ്പ്‌ലൈൻ"
  },
  hi: {
    appName: "न्याय-साक्ष्य (JusticeVault)",
    appSubtitle: "भारत सरकार • गृह मंत्रालय • डिजिटल साक्ष्य प्रबंधन एवं अन्वेषण आसूचना पोर्टल",
    badgeId: "बैज संख्या",
    policeStation: "थाना / पुलिस स्टेशन",
    role: "अधिकारी पद",
    clearance: "सुरक्षा स्तर",
    sessionTimeout: "सत्र समय समाप्ति",
    extendSession: "सत्र बढ़ाएं",
    logout: "सुरक्षित लॉगआउट",
    switchOfficer: "अधिकारी पद बदलें",
    
    navDashboard: "कमांड सेंटर (डैशबोर्ड)",
    navCases: "प्रथम सूचना रिपोर्ट (FIR)",
    navEvidence: "साक्ष्य तिजोरी (डेटाबेस)",
    navVictimEnquiry: "पीड़ित आवाज पूछताछ",
    navMapLocations: "ओपनस्ट्रीटमैप रडार",
    navAIVerifier: "AI बयान सत्यापन",
    navRelations: "घटना व संबंध ग्राफ",
    navBlockchain: "ब्लॉकचेन व कस्टडी शृंखला",
    navSharing: "अंतर-थाना साक्ष्य साझाकरण",
    navIntegrations: "पुलिस प्रणाली एकीकरण (CCTNS)",
    navMobileField: "फील्ड रिकॉर्डिंग (मोबाइल)",
    
    loginTitle: "कानून प्रवर्तन पोर्टल लॉगिन",
    loginSubtitle: "यूआईडीएआई / राज्य पुलिस केवाईसी फेस प्रमाणीकरण एवं 2FA अनिवार्य",
    kycFaceAuth: "सरकारी केवाईसी फेस प्रमाणीकरण",
    faceLivenessCheck: "सक्रिय जीवंतता का परीक्षण करें",
    faceVerified: "चेहरा एवं जीवंतता प्रमाणित",
    faceScanning: "चेहरा ज्यामिति संरेखण और एम्बेडिंग गणना जारी...",
    mfaOtp: "मोबाइल OTP सत्यापन",
    sendOtp: "पंजीकृत मोबाइल पर OTP भेजें",
    verifyAndLogin: "प्रमाणपत्र सत्यापित कर लॉगिन करें",
    supervisorApproved: "पर्यवेक्षक अनुमोदित (Vault KMS एन्क्रिप्टेड)",
    
    caseDashboard: "केस अन्वेषण डैशबोर्ड",
    newFIR: "नई प्राथमिकी (FIR) दर्ज करें",
    firNumber: "प्राथमिकी संख्या (FIR No)",
    caseId: "प्रणाली केस आईडी",
    offenceSections: ["BNS / IPC अपराध धाराएं"],
    statusOpen: "खुला केस",
    statusInvestigation: "सक्रिय विवेचनाधीन",
    statusChargesheet: "आरोप पत्र प्रस्तुत",
    statusClosed: "निस्तारित / न्यायालय द्वारा समाप्त",
    deadlineAlert: "वैधानिक 90-दिवसीय आरोप पत्र समय सीमा ट्रैकर",
    daysRemaining: "दिन शेष",
    evidenceCount: "साक्ष्य सामग्री",
    complainant: "शिकायतकर्ता विवरण",
    accused: "अभियुक्त / संदेही",
    incidentDesc: "घटना सारांश",
    
    evidenceVault: "सुरक्षित डिजिटल साक्ष्य तिजोरी",
    uploadEvidence: "डिजिटल साक्ष्य सुरक्षित जमा करें",
    dragDropText: "दस्तावेज, सीसीटीवी, कॉल रिकॉर्डिंग, बैंक विवरण खींचें व छोड़ें (अधिकतम 100MB)",
    sha256Verification: "क्रिप्टोग्राफिक SHA-256 हैश",
    malwareClean: "ClamAV / VirusTotal एंटीवायरस: सुरक्षित (CLEAN)",
    encryptedAES: "AES-256 सुरक्षित एन्क्रिप्टेड एवं TLS 1.3 संचार",
    signedUrlNotice: "समय-सीमित हस्ताक्षरित लिंक (60 मिनट में निष्प्रभावी)",
    verifyIntegrity: "क्रिप्टोग्राफिक अखंडता का सत्यापन करें",
    tamperTest: "छेड़छाड़ हमले का परीक्षण (Tamper Alert Test)",
    tamperDetectedAlert: "चेतावनी: SHA-256 हैश बेमेल पाया गया! पहुंच अवरुद्ध और घटना ब्लॉकचेन पर दर्ज।",
    versionHistory: "अपरिवर्तनीय संस्करण इतिहास",
    
    aiStatementAnalysis: "AI परस्पर साक्ष्य बयान सत्यापन",
    aiSubtitle: "बयान दावों का स्वतः निष्कर्षण तथा सीडीआर, सीसीटीवी व साक्ष्यों से तुलना",
    inputStatement: "गवाह अथवा संदेही का बयान दर्ज करें",
    recordAudio: "ऑडियो बयान रिकॉर्ड करें",
    analyzeClaims: "साक्ष्यों के साथ दावों का मिलान करें",
    consistent: "सुसंगत (Consistent)",
    contradicted: "विरोधाभासी (Contradicted)",
    unverified: "असत्यापित (Unverified)",
    requiresReview: "विवेचक समीक्षा अपेक्षित (Review Required)",
    confidenceScore: "AI विश्वसनीयता सूचकांक",
    citedSources: "संदर्भित साक्ष्य स्रोत",
    aiDisclaimer: "वैधानिक अस्वीकरण: AI दोष निर्धारण नहीं करता है। भारतीय साक्ष्य अधिनियम 2023 के तहत विवेचना अधिकारी की समीक्षा हेतु केवल विसंगतियां प्रस्तुत करता है।",
    
    blockchainTitle: "हाइपरलेजर फैब्रिक ब्लॉकचेन ऑडिट",
    hyperledgerInfo: "अधिकृत कानून प्रवर्तन ब्लॉकचेन नेटवर्क",
    blockExplorer: "ब्लॉक अन्वेषक एवं लेनदेन",
    immutableLedger: "अपरिवर्तनीय हस्ताक्षरित ऑडिट लेजर",
    generate65BCertificate: "धारा 65B इलेक्ट्रॉनिक साक्ष्य प्रमाणपत्र (PDF)",
    verifyChainOfCustody: "संपूर्ण कस्टडी शृंखला सत्यापित करें",
    txHash: "लेनदेन हैश (Tx Hash)",
    
    manualShareTitle: "अंतर-थाना विवेचना अधिकारी साझाकरण",
    selectStation: "गंतव्य पुलिस स्टेशन चुनें",
    selectOfficer: "प्राप्तकर्ता अधिकारी चुनें",
    shareDuration: "पहुंच वैधता अवधि",
    viewOnly: "केवल देखने की अनुमति",
    downloadAllowed: "डाउनलोड की अनुमति",
    revokeShare: "पहुंच तुरंत रद्द करें",
    
    fieldCaptureTitle: "फील्ड अधिकारी मोबाइल साक्ष्य संग्रह",
    gpsWatermark: "जीपीएस व समय अंकित डिजिटल वाटरमार्क",
    audioConsentGranted: "बयान की सहमति प्राप्त",
    qrEvidenceTag: "क्यूआर साक्ष्य टैगिंग",
    offlineQueue: "ऑफलाइन साक्ष्य कतार",
    syncNow: "केंद्रीय सर्वर से सिंक करें",
    
    cctnsTitle: "CCTNS अपराध एवं अपराधी ट्रैकिंग नेटवर्क",
    eSakshyaTitle: "eSakshya डिजिटल साक्ष्य (SID पैकेट)",
    cyber1930Title: "1930 राष्ट्रीय साइबर अपराध हेल्पलाइन"
  }
};
