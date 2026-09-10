import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Types for the Secure Database
export interface StoredGpsLocation {
  latitude: number;
  longitude: number;
  addressName?: string;
  accuracyMeters?: number;
}

export interface StoredEvidenceRecord {
  id: string;
  caseId: string;
  title: string;
  category: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DIGITAL_RECORD' | 'FORENSIC_REPORT';
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  currentHash?: string;
  isTampered: boolean;
  uploadTimestamp: string;
  uploadedByOfficerId: string;
  uploadedByOfficerName: string;
  deviceInfo: string;
  gpsLocation?: StoredGpsLocation;
  encryptionStatus: 'AES-256-ENCRYPTED' | 'UNENCRYPTED';
  cipherAlgorithm: string;
  tags: string[];
  extractedText?: string;
  sourceSystem?: string;
  storageFilePath?: string;
}

export interface StoredCaseRecord {
  caseId: string;
  firNumber: string;
  policeStation: string;
  stationCode: string;
  registrationDate: string;
  registrationTime: string;
  offenceSections: string[];
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
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'CHARGE_SHEET_FILED' | 'CLOSED';
  chargesheetDeadline: string;
  daysRemainingForChargesheet: number;
}

export interface StoredVictimEnquiry {
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
  comparisonResult?: any;
  status: 'PENDING_ANALYSIS' | 'ANALYZED' | 'CORROBORATED' | 'CONTRADICTIONS_FOUND';
  timestamp: string;
}

export interface EncryptedContainer {
  iv: string;
  authTag: string;
  ciphertext: string;
}

// Master Encryption Key for Evidence Storage (AES-256-GCM)
const DB_SECRET_KEY = process.env.DB_ENCRYPTION_KEY || 'justicevault_law_enforcement_tamperproof_aes256_key_992184';
const KEY_BUFFER = crypto.scryptSync(DB_SECRET_KEY, 'justicevault_salt_chennai_kerala_2026', 32);

const DATA_DIR = path.join(process.cwd(), 'data');
const EVIDENCE_FILES_DIR = path.join(DATA_DIR, 'evidence_files');
const DB_FILE = path.join(DATA_DIR, 'secure_vault.json');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(EVIDENCE_FILES_DIR)) {
  fs.mkdirSync(EVIDENCE_FILES_DIR, { recursive: true });
}

// Encryption Helpers
export function encryptData(dataBuffer: Buffer): EncryptedContainer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv);
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ciphertext: encrypted.toString('base64'),
  };
}

export function decryptData(container: EncryptedContainer): Buffer {
  const iv = Buffer.from(container.iv, 'hex');
  const authTag = Buffer.from(container.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(container.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return decrypted;
}

export function computeSha256(data: Buffer | string): string {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return '0x' + hash.digest('hex');
}

// In-Memory Catalog Cache
interface VaultSchema {
  version: string;
  cipher: string;
  lastIntegrityCheck: string;
  cases: Record<string, StoredCaseRecord>;
  evidence: Record<string, StoredEvidenceRecord>;
  victimEnquiries: Record<string, StoredVictimEnquiry>;
  blockchainBlocks: any[];
}

let vault: VaultSchema = {
  version: '2.5.0-BSA2023',
  cipher: 'AES-256-GCM',
  lastIntegrityCheck: new Date().toISOString(),
  cases: {},
  evidence: {},
  victimEnquiries: {},
  blockchainBlocks: [],
};

// Save Vault Catalog to Disk Atomically
function persistVaultToDisk() {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(vault, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist vault catalog:', err);
  }
}

// Load Vault from Disk or Initialize with Police Consortium Seed Data
export function initializeSecureDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      vault = JSON.parse(content);
      console.log(`[SecureDB] Loaded ${Object.keys(vault.evidence).length} evidence items and ${Object.keys(vault.cases).length} cases from ${DB_FILE}`);
      return;
    } catch (err) {
      console.warn('[SecureDB] Error parsing existing db, re-seeding:', err);
    }
  }

  // Seed Initial Cases
  const seedCases: StoredCaseRecord[] = [
    {
      caseId: 'TN-CHN-2026-004812',
      firNumber: 'FIR No. 482/2026',
      policeStation: 'E-3 T. Nagar Police Station, Chennai',
      stationCode: 'TN-CHN-E03',
      registrationDate: '2026-08-08',
      registrationTime: '14:20:00',
      offenceSections: ['BNS Sec 303 (Theft)', 'BNS Sec 318 (Cheating by Impersonation)', 'IT Act 66D'],
      ipcSectionsEquivalent: ['IPC 379', 'IPC 420'],
      complainant: {
        name: 'S. Rajendran',
        contact: '+91 98401 23456',
        address: 'No. 14, Usman Road, T. Nagar, Chennai - 600017',
        identification: 'Aadhaar XXXX-XXXX-4819',
      },
      accused: [
        {
          name: 'Dinesh Kumar alias Rocky',
          alias: 'Rocky',
          status: 'Identified',
          details: 'Spotted on SBI ATM CCTV camera at Usman Road junction withdrawing ₹1,80,000 using cloned debit card.',
        },
        {
          name: 'Unknown Accomplice',
          status: 'Unknown',
          details: 'Rider of black Yamaha FZ motorcycle TN-09-CB-4491 waiting outside ATM.',
        },
      ],
      incidentDate: '2026-08-08 10:15:00',
      incidentLocation: 'State Bank of India ATM, Usman Road, T. Nagar, Chennai',
      gpsCoordinates: { lat: 13.0418, lng: 80.2342 },
      briefDescription: 'Cloned card financial fraud and targeted physical extortion outside SBI ATM kiosk on Usman Road.',
      investigatingOfficerId: 'TN-INSP-4081',
      investigatingOfficerName: 'Inspector K. Ramanathan',
      status: 'UNDER_INVESTIGATION',
      chargesheetDeadline: '2026-10-07',
      daysRemainingForChargesheet: 31,
    },
    {
      caseId: 'KL-EKM-2026-001290',
      firNumber: 'FIR No. 129/2026',
      policeStation: 'Central Police Station, Ernakulam, Kochi',
      stationCode: 'KL-EKM-C01',
      registrationDate: '2026-08-02',
      registrationTime: '11:00:00',
      offenceSections: ['BNS Sec 111 (Organized Crime Syndicate)', 'IT Act 66C'],
      ipcSectionsEquivalent: ['IPC 120B'],
      complainant: {
        name: 'Federal Bank Regional Security Manager',
        contact: '+91 94471 88921',
        address: 'Marine Drive Branch, Kochi - 682031',
        identification: 'Bank Official ID: FB-SEC-44',
      },
      accused: [
        {
          name: 'Anish Varma',
          alias: 'Kochi Anish',
          status: 'In Custody',
          details: 'Operated mule bank accounts laundering ₹42,50,000 from interstate cyber phishing.',
        },
      ],
      incidentDate: '2026-08-01 16:45:00',
      incidentLocation: 'Marine Drive Commercial Complex, MG Road, Ernakulam, Kochi',
      gpsCoordinates: { lat: 9.9816, lng: 76.2764 },
      briefDescription: 'High-volume cyber fraud mule network operating fake call centers in Ernakulam.',
      investigatingOfficerId: 'KL-INSP-1092',
      investigatingOfficerName: 'Sub-Inspector F. Joseph',
      status: 'UNDER_INVESTIGATION',
      chargesheetDeadline: '2026-10-30',
      daysRemainingForChargesheet: 54,
    },
  ];

  seedCases.forEach((c) => {
    vault.cases[c.caseId] = c;
  });

  // Seed Actual Evidence Files Stored In Database
  const initialEvidence = [
    {
      id: 'EVD-TN-004812-001',
      caseId: 'TN-CHN-2026-004812',
      title: 'ATM CCTV Footage Frame - SBI Usman Road Kiosk',
      category: 'IMAGE' as const,
      fileName: 'sbi_atm_kiosk_cctv_1015am.jpg',
      mimeType: 'image/jpeg',
      rawText: 'CCTV SCREENSHOT RECORD: Camera #02 SBI Usman Road ATM. Timestamp: 2026-08-08 10:15:32 IST. Accused wearing black jacket and blue helmet, debit card insertion, withdrawal amount ₹1,80,000.',
      tags: ['CCTV', 'ATM', 'Accused', 'Usman Road', 'Card Cloning'],
      gpsLocation: {
        latitude: 13.0405,
        longitude: 80.2337,
        addressName: 'SBI ATM, Usman Road, T. Nagar, Chennai - 600017',
        accuracyMeters: 4.5,
      },
      officerId: 'TN-INSP-4081',
      officerName: 'Inspector K. Ramanathan',
      deviceInfo: 'Dahua NVR 4K Forensic Export / USB Hash Sealed',
    },
    {
      id: 'EVD-TN-004812-002',
      caseId: 'TN-CHN-2026-004812',
      title: 'Call Detail Record (CDR) & Cell Tower Latch Dump',
      category: 'DIGITAL_RECORD' as const,
      fileName: 'airtel_cdr_suspect_tower_dump.csv',
      mimeType: 'text/csv',
      rawText: 'MSISDN: +91 98402 99182, IMEI: 864921049281729, Tower ID: CHN-TNG-401 (Kodambakkam-Usman Rd Border), Time: 2026-08-08 10:14:11 to 10:22:45 IST. Inbound call from +91 94451 00293.',
      tags: ['CDR', 'Telecom', 'Cell Tower', 'IMEI', 'Airtel'],
      gpsLocation: {
        latitude: 13.0452,
        longitude: 80.2301,
        addressName: 'Kodambakkam Main Road Cell Tower #401, Chennai',
        accuracyMeters: 15.0,
      },
      officerId: 'TN-INSP-4081',
      officerName: 'Inspector K. Ramanathan',
      deviceInfo: 'CCTNS Telecom Intercept Node / Chennai City Police',
    },
    {
      id: 'EVD-TN-004812-003',
      caseId: 'TN-CHN-2026-004812',
      title: 'Seized Vehicle Forensic Mahazar - Yamaha FZ TN-09-CB-4491',
      category: 'DOCUMENT' as const,
      fileName: 'vehicle_seizure_mahazar_sec105.pdf',
      mimeType: 'application/pdf',
      rawText: 'BNSS Section 105 Seizure Mahazar: Yamaha FZ motorcycle registered TN-09-CB-4491. Seized from Guindy Industrial Estate parking. Chassis No: ME4RG0819K1928, Engine No: G3J2E99182. 2 helmet visors recovered.',
      tags: ['Seizure', 'Vehicle', 'Yamaha FZ', 'Guindy', 'BNSS 105'],
      gpsLocation: {
        latitude: 13.0067,
        longitude: 80.2025,
        addressName: 'Guindy Industrial Estate 3rd Cross, Chennai',
        accuracyMeters: 8.0,
      },
      officerId: 'TN-INSP-4081',
      officerName: 'Inspector K. Ramanathan',
      deviceInfo: 'Field Tablet Panasonic Toughbook / eSakshya App',
    },
    {
      id: 'EVD-KL-001290-001',
      caseId: 'KL-EKM-2026-001290',
      title: 'Mule Bank Ledger Statements - Marine Drive Branch',
      category: 'FORENSIC_REPORT' as const,
      fileName: 'federal_bank_mule_statement_aug2026.pdf',
      mimeType: 'application/pdf',
      rawText: 'Federal Bank Account #1481029381920 held by Anish Varma. Total credits ₹42,50,000 through UPI batch transfers from 18 distinct victim accounts across Tamil Nadu & Kerala.',
      tags: ['Banking', 'UPI', 'Cyber Phishing', 'Kochi', 'Mule Account'],
      gpsLocation: {
        latitude: 9.9816,
        longitude: 76.2764,
        addressName: 'Federal Bank, Marine Drive, MG Road, Ernakulam, Kochi',
        accuracyMeters: 5.0,
      },
      officerId: 'KL-INSP-1092',
      officerName: 'Sub-Inspector F. Joseph',
      deviceInfo: 'State Forensic Science Lab (SFSL) Thiruvananthapuram',
    },
  ];

  initialEvidence.forEach((item) => {
    const rawBuffer = Buffer.from(item.rawText, 'utf8');
    const hash = computeSha256(rawBuffer);
    const encrypted = encryptData(rawBuffer);

    // Save encrypted file payload to disk
    const storageFileName = `${item.id}.enc`;
    const storagePath = path.join(EVIDENCE_FILES_DIR, storageFileName);
    fs.writeFileSync(storagePath, JSON.stringify(encrypted), 'utf8');

    vault.evidence[item.id] = {
      id: item.id,
      caseId: item.caseId,
      title: item.title,
      category: item.category,
      fileName: item.fileName,
      fileSizeBytes: rawBuffer.length,
      mimeType: item.mimeType,
      sha256Hash: hash,
      currentHash: hash,
      isTampered: false,
      uploadTimestamp: new Date().toISOString(),
      uploadedByOfficerId: item.officerId,
      uploadedByOfficerName: item.officerName,
      deviceInfo: item.deviceInfo,
      gpsLocation: item.gpsLocation,
      encryptionStatus: 'AES-256-ENCRYPTED',
      cipherAlgorithm: 'AES-256-GCM',
      tags: item.tags,
      extractedText: item.rawText,
      sourceSystem: 'DIRECT_UPLOAD',
      storageFilePath: storageFileName,
    };
  });

  // Seed Initial Victim Enquiry
  vault.victimEnquiries['ENQ-TN-001'] = {
    id: 'ENQ-TN-001',
    caseId: 'TN-CHN-2026-004812',
    victimName: 'S. Rajendran',
    victimContact: '+91 98401 23456',
    incidentLocation: 'Outside SBI ATM, Usman Road, T. Nagar, Chennai',
    gpsCoordinates: { lat: 13.0418, lng: 80.2342 },
    enquiryDate: '2026-08-08',
    audioDurationSeconds: 65,
    hasAudioRecording: true,
    transcriptText: 'I went to SBI ATM at Usman Road around 10:15 AM on Saturday to withdraw pension money. A young man wearing a dark jacket and blue full-face helmet offered to help with the machine. He swapped my debit card and took off on a black motorcycle waiting outside. Within 5 minutes, ₹1,80,000 was debited in multiple SMS alerts.',
    language: 'en',
    officerId: 'TN-INSP-4081',
    officerName: 'Inspector K. Ramanathan',
    status: 'CORROBORATED',
    timestamp: '2026-08-08T11:45:00.000Z',
    comparisonResult: {
      overallCredibilityScore: 98,
      summary: 'Victim statement is exceptionally accurate and 100% corroborated by SBI ATM CCTV timestamp (10:15 AM), helmet description, withdrawal amounts (₹1,80,000), and cell tower triangulation.',
      claimsCount: 4,
      corroboratedCount: 4,
      contradictedCount: 0,
      newLeadsCount: 1,
      claims: [
        {
          claimId: 'CLM-V-1',
          statementSnippet: 'Went to SBI ATM at Usman Road around 10:15 AM',
          topic: 'TIMELINE',
          verdict: 'CORROBORATED',
          confidence: 99,
          reasoning: 'CCTV Camera #02 timecode confirms victim entering kiosk at 10:14:48 AM.',
          matchingEvidence: [
            {
              evidenceId: 'EVD-TN-004812-001',
              evidenceTitle: 'ATM CCTV Footage Frame - SBI Usman Road Kiosk',
              evidenceCategory: 'IMAGE',
              relevanceNote: 'Camera timestamp matches exactly 10:15:32 AM.',
            },
          ],
        },
        {
          claimId: 'CLM-V-2',
          statementSnippet: 'Young man wearing dark jacket and blue full-face helmet',
          topic: 'SUSPECT_ID',
          verdict: 'CORROBORATED',
          confidence: 97,
          reasoning: 'CCTV screenshot captures suspect in black jacket and blue helmet.',
          matchingEvidence: [
            {
              evidenceId: 'EVD-TN-004812-001',
              evidenceTitle: 'ATM CCTV Footage Frame - SBI Usman Road Kiosk',
              evidenceCategory: 'IMAGE',
              relevanceNote: 'Visual analysis matches victim description perfectly.',
            },
          ],
        },
        {
          claimId: 'CLM-V-3',
          statementSnippet: 'Took off on a black motorcycle waiting outside',
          topic: 'VEHICLE',
          verdict: 'CORROBORATED',
          confidence: 95,
          reasoning: 'Seized black Yamaha FZ (TN-09-CB-4491) recovered at Guindy matches escape route.',
          matchingEvidence: [
            {
              evidenceId: 'EVD-TN-004812-003',
              evidenceTitle: 'Seized Vehicle Forensic Mahazar - Yamaha FZ',
              evidenceCategory: 'DOCUMENT',
              relevanceNote: 'Seized bike recovered with matching helmet visor.',
            },
          ],
        },
        {
          claimId: 'CLM-V-4',
          statementSnippet: '₹1,80,000 was debited in multiple SMS alerts',
          topic: 'MONEY',
          verdict: 'CORROBORATED',
          confidence: 98,
          reasoning: 'Bank transaction log confirms 9 consecutive ₹20,000 ATM debits totaling ₹1,80,000.',
          matchingEvidence: [
            {
              evidenceId: 'EVD-TN-004812-001',
              evidenceTitle: 'ATM CCTV Footage Frame - SBI Usman Road Kiosk',
              evidenceCategory: 'IMAGE',
              relevanceNote: 'ATM machine transaction log confirms ₹1,80,000 total.',
            },
          ],
        },
      ],
      immediateInvestigativeActions: [
        'Issue Lookout Notice for identified rider Dinesh alias Rocky',
        'Freeze SBI destination beneficiary accounts through 1930 Cyber Cell portal',
        'Dispatch forensic team to Guindy Industrial Estate vehicle seizure location',
      ],
    },
  };

  // Seed Blockchain Genesis Block
  vault.blockchainBlocks = [
    {
      blockNumber: 1,
      blockHash: '0x0000a98f12c88910eb4412039481203891048190382910381029381029384918',
      previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      merkleRoot: '0x8891283910283910283910283910283910283910283910283910283910283910',
      timestamp: '2026-08-08T09:00:00.000Z',
      transactionsCount: 4,
      channelId: 'police-consortium-chn',
      organization: 'Tamil Nadu Police Consortium Node',
      transactions: [
        {
          id: 'TX-INIT-001',
          timestamp: '2026-08-08T10:30:00.000Z',
          action: 'EVIDENCE_UPLOAD',
          officerId: 'TN-INSP-4081',
          officerName: 'Inspector K. Ramanathan',
          officerBadge: 'TN-4081',
          stationCode: 'TN-CHN-E03',
          evidenceId: 'EVD-TN-004812-001',
          evidenceHash: vault.evidence['EVD-TN-004812-001']?.sha256Hash,
          details: 'Genesis seal: SBI ATM CCTV footage stored in AES-256 DB',
          signature: 'SIG_ED25519_TN_POLICE_0x88912',
        },
      ],
    },
  ];

  persistVaultToDisk();
  console.log('[SecureDB] Successfully initialized and persisted new Secure Database at', DB_FILE);
}

// Database Query & Mutation Operations

export function getDatabaseStats() {
  const evidenceCount = Object.keys(vault.evidence).length;
  const casesCount = Object.keys(vault.cases).length;
  const enquiriesCount = Object.keys(vault.victimEnquiries).length;
  let totalBytes = 0;
  let tamperedCount = 0;

  Object.values(vault.evidence).forEach((e) => {
    totalBytes += e.fileSizeBytes;
    if (e.isTampered) tamperedCount++;
  });

  return {
    databaseEngine: 'JusticeVault Secure AES-256-GCM Encrypted Engine',
    version: vault.version,
    cipher: vault.cipher,
    storagePath: DB_FILE,
    evidenceFilesDir: EVIDENCE_FILES_DIR,
    totalEvidenceStored: evidenceCount,
    totalCases: casesCount,
    totalVictimEnquiries: enquiriesCount,
    totalEncryptedBytes: totalBytes,
    tamperedAlertCount: tamperedCount,
    lastIntegrityCheck: vault.lastIntegrityCheck,
  };
}

export function getAllCases(): StoredCaseRecord[] {
  return Object.values(vault.cases);
}

export function getCaseById(caseId: string): StoredCaseRecord | null {
  return vault.cases[caseId] || null;
}

export function createCase(caseData: Partial<StoredCaseRecord>): StoredCaseRecord {
  const caseId = caseData.caseId || `CASE-${Date.now()}`;
  const record: StoredCaseRecord = {
    caseId,
    firNumber: caseData.firNumber || `FIR No. ${Math.floor(Math.random() * 900) + 100}/2026`,
    policeStation: caseData.policeStation || 'Central Police Station',
    stationCode: caseData.stationCode || 'POL-01',
    registrationDate: caseData.registrationDate || new Date().toISOString().split('T')[0],
    registrationTime: caseData.registrationTime || new Date().toTimeString().split(' ')[0],
    offenceSections: caseData.offenceSections || ['BNS Sec 303'],
    ipcSectionsEquivalent: caseData.ipcSectionsEquivalent || [],
    complainant: caseData.complainant || {
      name: 'Complainant',
      contact: '',
      address: '',
      identification: '',
    },
    accused: caseData.accused || [],
    incidentDate: caseData.incidentDate || new Date().toISOString(),
    incidentLocation: caseData.incidentLocation || 'Chennai City',
    gpsCoordinates: caseData.gpsCoordinates || { lat: 13.0827, lng: 80.2707 },
    briefDescription: caseData.briefDescription || 'Case registered under BNS 2023',
    investigatingOfficerId: caseData.investigatingOfficerId || 'TN-OFFICER-1',
    investigatingOfficerName: caseData.investigatingOfficerName || 'Duty Officer',
    status: caseData.status || 'OPEN',
    chargesheetDeadline: caseData.chargesheetDeadline || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    daysRemainingForChargesheet: caseData.daysRemainingForChargesheet || 60,
  };

  vault.cases[caseId] = record;
  persistVaultToDisk();
  return record;
}

export function getAllEvidence(caseId?: string): StoredEvidenceRecord[] {
  const all = Object.values(vault.evidence);
  if (caseId) {
    return all.filter((e) => e.caseId === caseId);
  }
  return all;
}

export function getEvidenceById(id: string): StoredEvidenceRecord | null {
  return vault.evidence[id] || null;
}

// Retrieve decrypted raw file buffer for downloading or viewing
export function getEvidenceRawFile(id: string): { buffer: Buffer; mimeType: string; fileName: string; isTampered: boolean } | null {
  const evidence = vault.evidence[id];
  if (!evidence) return null;

  const storageFileName = evidence.storageFilePath || `${id}.enc`;
  const storagePath = path.join(EVIDENCE_FILES_DIR, storageFileName);

  if (!fs.existsSync(storagePath)) {
    // Fallback: generate from extractedText
    const fallbackBuffer = Buffer.from(evidence.extractedText || 'Evidence content not found', 'utf8');
    return {
      buffer: fallbackBuffer,
      mimeType: evidence.mimeType,
      fileName: evidence.fileName,
      isTampered: evidence.isTampered,
    };
  }

  try {
    const rawContainerText = fs.readFileSync(storagePath, 'utf8');
    const container: EncryptedContainer = JSON.parse(rawContainerText);
    const decryptedBuffer = decryptData(container);

    // Dynamic tamper check on read
    const currentHash = computeSha256(decryptedBuffer);
    const isTampered = currentHash !== evidence.sha256Hash;
    if (isTampered !== evidence.isTampered) {
      evidence.isTampered = isTampered;
      evidence.currentHash = currentHash;
      persistVaultToDisk();
    }

    return {
      buffer: decryptedBuffer,
      mimeType: evidence.mimeType,
      fileName: evidence.fileName,
      isTampered,
    };
  } catch (err) {
    console.error('Error decrypting evidence file:', err);
    return null;
  }
}

// Store New Evidence in Database with AES-256-GCM Encryption
export function storeEvidence(
  evidenceData: Partial<StoredEvidenceRecord>,
  fileBufferOrBase64: Buffer | string
): StoredEvidenceRecord {
  let fileBuffer: Buffer;
  if (Buffer.isBuffer(fileBufferOrBase64)) {
    fileBuffer = fileBufferOrBase64;
  } else if (fileBufferOrBase64.startsWith('data:')) {
    const base64Data = fileBufferOrBase64.split(',')[1];
    fileBuffer = Buffer.from(base64Data, 'base64');
  } else {
    fileBuffer = Buffer.from(fileBufferOrBase64, 'utf8');
  }

  const id = evidenceData.id || `EVD-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
  const sha256Hash = computeSha256(fileBuffer);
  const encrypted = encryptData(fileBuffer);

  const storageFileName = `${id}.enc`;
  const storagePath = path.join(EVIDENCE_FILES_DIR, storageFileName);
  fs.writeFileSync(storagePath, JSON.stringify(encrypted), 'utf8');

  const record: StoredEvidenceRecord = {
    id,
    caseId: evidenceData.caseId || 'TN-CHN-2026-004812',
    title: evidenceData.title || 'Seized Evidence Item',
    category: evidenceData.category || 'DIGITAL_RECORD',
    fileName: evidenceData.fileName || `${id}.bin`,
    fileSizeBytes: fileBuffer.length,
    mimeType: evidenceData.mimeType || 'application/octet-stream',
    sha256Hash,
    currentHash: sha256Hash,
    isTampered: false,
    uploadTimestamp: new Date().toISOString(),
    uploadedByOfficerId: evidenceData.uploadedByOfficerId || 'TN-OFFICER-1',
    uploadedByOfficerName: evidenceData.uploadedByOfficerName || 'Investigating Officer',
    deviceInfo: evidenceData.deviceInfo || 'Secure Digital Evidence Vault Portal',
    gpsLocation: evidenceData.gpsLocation,
    encryptionStatus: 'AES-256-ENCRYPTED',
    cipherAlgorithm: 'AES-256-GCM',
    tags: evidenceData.tags || [],
    extractedText: evidenceData.extractedText || '',
    sourceSystem: evidenceData.sourceSystem || 'DIRECT_UPLOAD',
    storageFilePath: storageFileName,
  };

  vault.evidence[id] = record;
  persistVaultToDisk();
  return record;
}

// Tamper simulation toggle for testing tamper-detection
export function toggleEvidenceTamper(id: string, tamperState?: boolean): StoredEvidenceRecord | null {
  const evidence = vault.evidence[id];
  if (!evidence) return null;

  const storageFileName = evidence.storageFilePath || `${id}.enc`;
  const storagePath = path.join(EVIDENCE_FILES_DIR, storageFileName);

  const newState = tamperState !== undefined ? tamperState : !evidence.isTampered;
  evidence.isTampered = newState;

  if (newState) {
    evidence.currentHash = '0xTAMPERED_' + crypto.randomBytes(28).toString('hex');
    if (fs.existsSync(storagePath)) {
      try {
        const rawContainerText = fs.readFileSync(storagePath, 'utf8');
        const container: EncryptedContainer = JSON.parse(rawContainerText);
        // Tamper with ciphertext by altering a few bytes
        const modified = Buffer.from(container.ciphertext, 'base64');
        modified[0] = modified[0] ^ 0xff;
        container.ciphertext = modified.toString('base64');
        fs.writeFileSync(storagePath, JSON.stringify(container), 'utf8');
      } catch (e) {
        // ignore
      }
    }
  } else {
    evidence.currentHash = evidence.sha256Hash;
    // Restore clean data
    const rawBuffer = Buffer.from(evidence.extractedText || 'Clean verified evidence', 'utf8');
    const encrypted = encryptData(rawBuffer);
    fs.writeFileSync(storagePath, JSON.stringify(encrypted), 'utf8');
  }

  persistVaultToDisk();
  return evidence;
}

// Victim Enquiry Operations
export function getAllVictimEnquiries(caseId?: string): StoredVictimEnquiry[] {
  const all = Object.values(vault.victimEnquiries);
  if (caseId) {
    return all.filter((v) => v.caseId === caseId);
  }
  return all;
}

export function saveVictimEnquiry(data: Partial<StoredVictimEnquiry>): StoredVictimEnquiry {
  const id = data.id || `ENQ-${Date.now()}`;
  const record: StoredVictimEnquiry = {
    id,
    caseId: data.caseId || 'TN-CHN-2026-004812',
    victimName: data.victimName || 'Victim Name',
    victimContact: data.victimContact,
    incidentLocation: data.incidentLocation,
    gpsCoordinates: data.gpsCoordinates,
    enquiryDate: data.enquiryDate || new Date().toISOString().split('T')[0],
    audioDurationSeconds: data.audioDurationSeconds || 0,
    hasAudioRecording: Boolean(data.hasAudioRecording),
    audioFileName: data.audioFileName,
    transcriptText: data.transcriptText || '',
    language: data.language || 'en',
    officerId: data.officerId || 'TN-OFFICER-1',
    officerName: data.officerName || 'Investigating Officer',
    comparisonResult: data.comparisonResult,
    status: data.status || (data.comparisonResult ? 'ANALYZED' : 'PENDING_ANALYSIS'),
    timestamp: new Date().toISOString(),
  };

  vault.victimEnquiries[id] = record;
  persistVaultToDisk();
  return record;
}

export function getBlockchainBlocks(): any[] {
  return vault.blockchainBlocks;
}

export function addBlockchainBlock(block: any) {
  vault.blockchainBlocks.unshift(block);
  persistVaultToDisk();
}
