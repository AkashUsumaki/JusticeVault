export type UserRole = 'INVESTIGATION_OFFICER' | 'STATION_SUPERVISOR' | 'PUBLIC_PROSECUTOR' | 'DEPARTMENT_ADMIN';

export type LanguageCode = 'en' | 'ta' | 'ml' | 'hi';

export type ClearanceLevel = 'LEVEL_1_GENERAL' | 'LEVEL_2_SENSITIVE' | 'LEVEL_3_CONFIDENTIAL';

export interface OfficerUser {
  id: string;
  badgeNumber: string;
  name: string;
  designation: string;
  role: UserRole;
  policeStation: string;
  stationCode: string;
  state: 'Tamil Nadu' | 'Kerala' | 'Karnataka';
  clearanceLevel: ClearanceLevel;
  department: string;
  phone: string;
  email: string;
  faceEnrolled: boolean;
  faceEmbeddingId: string;
  avatarUrl: string;
}

export type CaseStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CHARGE_SHEET_FILED' | 'CLOSED';

export interface FIRDetails {
  firNumber: string;
  caseId: string;
  policeStation: string;
  stationCode: string;
  registrationDate: string;
  registrationTime: string;
  offenceSections: string[]; // e.g. ["BNS 303 (Theft)", "BNS 318 (Cheating)", "IT Act 66D"]
  ipcSectionsEquivalent?: string[];
  complainant: {
    name: string;
    contact: string;
    address: string;
    identification: string;
  };
  accused: {
    name: string;
    alias?: string;
    status: 'Identified' | 'Absconding' | 'In Custody' | 'Unknown';
    details: string;
  }[];
  incidentDate: string;
  incidentLocation: string;
  gpsCoordinates?: { lat: number; lng: number };
  briefDescription: string;
  investigatingOfficerId: string;
  investigatingOfficerName: string;
  status: CaseStatus;
  chargesheetDeadline: string; // ISO date (usually 60 or 90 days from FIR)
  daysRemainingForChargesheet: number;
}

export type EvidenceCategory = 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DIGITAL_RECORD' | 'FORENSIC_REPORT';

export interface EvidenceItem {
  id: string;
  caseId: string;
  title: string;
  category: EvidenceCategory;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  currentHash?: string;
  isTampered?: boolean;
  uploadTimestamp: string;
  uploadedByOfficerId: string;
  uploadedByOfficerName: string;
  deviceInfo: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    addressName?: string;
  };
  encryptionStatus: 'AES-256-ENCRYPTED' | 'UNENCRYPTED';
  malwareScanStatus: 'CLEAN' | 'INFECTED' | 'PENDING';
  version: number;
  versionsList?: {
    versionNumber: number;
    timestamp: string;
    sha256Hash: string;
    modifiedBy: string;
  }[];
  extractedText?: string;
  language?: LanguageCode | 'mixed';
  ocrConfidence?: number;
  audioDurationSeconds?: number;
  tags: string[];
  entitiesExtracted?: ExtractedEntity[];
  thumbnailUrl?: string;
  objectLockExpiry?: string;
  signedUrl?: string;
  signedUrlExpiry?: string;
  sourceSystem?: 'DIRECT_UPLOAD' | 'FIELD_MOBILE_APP' | 'MOBILE_APP' | 'eSakshya_SID' | 'CCTNS_IMPORT' | '1930_CYBER_HELPLINE';
}

export type EntityType = 'PERSON' | 'PHONE' | 'LOCATION' | 'BANK_ACCOUNT' | 'VEHICLE' | 'DATE_TIME' | 'AMOUNT' | 'IP_ADDRESS';

export interface ExtractedEntity {
  id: string;
  type: EntityType;
  value: string;
  context: string;
  confidence: number;
  language?: LanguageCode;
  documentId?: string;
  documentTitle?: string;
}

export type ClaimVerificationStatus = 'CONSISTENT' | 'CONTRADICTED' | 'UNVERIFIED' | 'REQUIRES_OFFICER_REVIEW';

export interface ClaimVerification {
  id: string;
  claimText: string;
  language: LanguageCode;
  category: 'ALIBI' | 'FINANCIAL_TRANSACTION' | 'PRESENCE' | 'VEHICLE_USE' | 'PHONE_CALL' | 'GENERAL' | string;
  status: ClaimVerificationStatus;
  confidenceScore: number; // 0 to 100
  evidenceMatchSummary: string;
  citedEvidence: {
    evidenceId: string;
    evidenceTitle: string;
    evidenceType?: EvidenceCategory;
    timestampOrPage?: string;
    quoteOrSnippet?: string;
    contradictionReason?: string;
  }[];
  officerNotes?: string;
  flaggedForSupervisor?: boolean;
}

export type StatementClaim = ClaimVerification;

export interface StatementVerificationReport {
  id: string;
  caseId: string;
  speakerName: string;
  speakerRole: 'SUSPECT' | 'WITNESS' | 'COMPLAINANT' | 'INFORMANT' | 'VICTIM' | string;
  statementDate: string;
  recordedByOfficer?: string;
  language: LanguageCode;
  rawStatementText: string;
  audioEvidenceId?: string;
  analysisTimestamp: string;
  overallConsistencyScore: number;
  totalClaimsCount: number;
  consistentCount: number;
  contradictedCount: number;
  unverifiedCount: number;
  reviewRequiredCount: number;
  claims: ClaimVerification[];
  aiDisclaimer: string;
}

export type BlockchainActionType = 
  | 'EVIDENCE_UPLOAD'
  | 'EVIDENCE_VIEW'
  | 'EVIDENCE_DOWNLOAD'
  | 'EVIDENCE_MODIFIED'
  | 'EVIDENCE_DELETED'
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'AI_VERIFICATION_RUN'
  | 'AI_STATEMENT_VERIFIED'
  | 'CASE_SHARED'
  | 'INTER_STATION_SHARE'
  | 'SHARE_REVOKED'
  | 'TAMPER_DETECTED'
  | 'CHAIN_OF_CUSTODY_EXPORT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'MFA_VERIFIED'
  | 'FIR_GENESIS_COMMIT'
  | 'OFFICER_AUTH_LOGIN'
  | 'CCTNS_SYNC'
  | 'ESAKSHYA_VERIFY'
  | 'I4C_MULE_FREEZE'
  | string;

export interface BlockchainTransaction {
  id?: string;
  txId?: string;
  blockNumber?: number;
  timestamp: string;
  action: BlockchainActionType;
  caseId?: string;
  evidenceId?: string;
  evidenceHash?: string;
  officerId?: string;
  officerName: string;
  officerBadge: string;
  policeStation?: string;
  stationCode?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  details: string;
  signature: string;
  previousBlockHash?: string;
  blockHash?: string;
  status?: 'COMMITTED' | 'VERIFIED' | 'TAMPER_FLAGGED';
}

export type NavTab = 
  | 'DASHBOARD'
  | 'CASES'
  | 'EVIDENCE'
  | 'VICTIM_ENQUIRY'
  | 'MAP_LOCATIONS'
  | 'AI_VERIFIER'
  | 'RELATIONSHIPS'
  | 'BLOCKCHAIN'
  | 'SHARING'
  | 'INTEGRATIONS'
  | 'FIELD_CAPTURE'
  | 'LEGAL';

export interface DatabaseStats {
  databaseEngine: string;
  version: string;
  cipher: string;
  storagePath: string;
  evidenceFilesDir: string;
  totalEvidenceStored: number;
  totalCases: number;
  totalVictimEnquiries: number;
  totalEncryptedBytes: number;
  tamperedAlertCount: number;
  lastIntegrityCheck: string;
}

export interface VictimClaimComparison {
  claimId: string;
  statementSnippet: string;
  topic: 'TIMELINE' | 'LOCATION' | 'SUSPECT_ID' | 'VEHICLE' | 'MONEY' | 'PHYSICAL_ASSAULT' | 'OTHER';
  verdict: 'CORROBORATED' | 'CONTRADICTED' | 'NEW_LEAD' | 'UNVERIFIED';
  confidence: number;
  reasoning: string;
  matchingEvidence: {
    evidenceId: string;
    evidenceTitle: string;
    evidenceCategory: string;
    relevanceNote: string;
    exactMatchSnippet?: string;
  }[];
}

export interface VictimEnquiryComparison {
  overallCredibilityScore: number;
  summary: string;
  claimsCount: number;
  corroboratedCount: number;
  contradictedCount: number;
  newLeadsCount: number;
  claims: VictimClaimComparison[];
  immediateInvestigativeActions: string[];
}

export interface VictimEnquiryRecord {
  id: string;
  caseId: string;
  victimName: string;
  victimContact?: string;
  incidentLocation?: string;
  gpsCoordinates?: { lat: number; lng: number };
  enquiryDate: string;
  audioDurationSeconds?: number;
  hasAudioRecording: boolean;
  audioFileName?: string;
  transcriptText: string;
  language: 'en' | 'ta' | 'ml' | 'hi';
  officerId: string;
  officerName: string;
  comparisonResult?: VictimEnquiryComparison;
  status: 'PENDING_ANALYSIS' | 'ANALYZED' | 'CORROBORATED' | 'CONTRADICTIONS_FOUND';
  timestamp: string;
}

export interface BlockchainBlock {
  blockNumber: number;
  blockHash: string;
  currentHash?: string;
  previousHash: string;
  merkleRoot: string;
  timestamp: string;
  transactionsCount?: number;
  channelId?: string;
  organization?: string;
  transactions: BlockchainTransaction[];
}

export interface CaseSharingRecord {
  id: string;
  caseId: string;
  caseFirNumber?: string;
  sourceStationCode?: string;
  targetStationCode?: string;
  targetOfficerBadge?: string;
  authorizedByOfficerId?: string;
  authorizedTimestamp?: string;
  permissions?: string[];
  purpose?: string;
  sharedByOfficerId?: string;
  sharedByOfficerName?: string;
  fromStation?: string;
  toStation?: string;
  toOfficerId?: string;
  toOfficerName?: string;
  permission?: 'VIEW_ONLY' | 'DOWNLOAD_ALLOWED';
  expiresAt: string;
  createdAt?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  accessPasscodeHash?: string;
  accessCount?: number;
  lastAccessedAt?: string;
}

export type InterStationShareRequest = CaseSharingRecord;

export interface EntityNode {
  id: string;
  label: string;
  subLabel?: string;
  type: 'PERSON' | 'PHONE' | 'BANK_ACCOUNT' | 'VEHICLE' | 'LOCATION' | 'EVIDENCE_ITEM' | string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
}

export interface RelationshipEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  description: string;
  evidenceSourceId?: string;
  confidenceScore?: number;
  verifiedByOfficer?: string;
}

export interface RelationshipNode {
  id: string;
  label: string;
  type: 'PERSON_SUSPECT' | 'PERSON_WITNESS' | 'PERSON_VICTIM' | 'PHONE' | 'BANK_ACCOUNT' | 'VEHICLE' | 'LOCATION' | 'EVIDENCE_DOC' | string;
  details?: string;
  caseId?: string;
}

export interface RelationshipLink {
  source: string;
  target: string;
  relation: string;
  evidenceId?: string;
  confidence?: number;
}


