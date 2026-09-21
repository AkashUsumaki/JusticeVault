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
  ocrConfidence?: number;
  entitiesExtracted?: any[];
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
  // Seed Initial Cases
  const seedCases: StoredCaseRecord[] = [
    {
      caseId: 'TN-CHN-2026-004812',
      firNumber: 'FIR No. 182/2026',
      policeStation: 'E-1 Mylapore Police Station, Chennai',
      stationCode: 'TN-CHN-MYL',
      registrationDate: '2026-08-10',
      registrationTime: '14:30:00',
      offenceSections: [
        'BNS 318(4) / IPC 420 (Cheating & Financial Fraud)',
        'BNS 61(2) / IPC 120B (Criminal Conspiracy)',
        'IT Act Sec 66D (Cheating by Personation using Computer)',
      ],
      ipcSectionsEquivalent: ['IPC 420', 'IPC 120B', 'IT Act 66D'],
      complainant: {
        name: 'V. Sundaram (72 yrs, Retd. Bank Manager)',
        contact: '+91 98402 11982',
        address: 'No. 44, Luz Church Road, Mylapore, Chennai - 600004',
        identification: 'Aadhaar XXXX-XXXX-4912',
      },
      accused: [
        {
          name: 'Dinesh @ Karthik Raja',
          alias: 'Cyber Karthik',
          status: 'In Custody',
          details: 'Mule account aggregator and SIM provider operating out of Kodambakkam.',
        },
        {
          name: 'Praveen Kumar',
          alias: 'Praveen',
          status: 'Identified',
          details: 'Beneficiary of Axis Bank mule transfer account.',
        },
      ],
      incidentDate: '2026-08-08 10:15:00',
      incidentLocation: 'Mylapore / Digital Banking Network',
      gpsCoordinates: { lat: 13.0338, lng: 80.2677 },
      briefDescription: 'Complainant was deceived into transferring ₹14,50,000 via RTGS under false pretext of digital arrest for FedEx parcel containing contraband. Funds routed through 3 mule accounts.',
      investigatingOfficerId: 'OFF-TN-0482',
      investigatingOfficerName: 'Inspector K. Senthil Kumar',
      status: 'UNDER_INVESTIGATION',
      chargesheetDeadline: '2026-11-08',
      daysRemainingForChargesheet: 72,
    },
    {
      caseId: 'TN-MDU-2026-002194',
      firNumber: 'FIR No. 209/2026',
      policeStation: 'B-1 Vilakkuthoon Police Station, Madurai',
      stationCode: 'TN-MDU-VLK',
      registrationDate: '2026-08-14',
      registrationTime: '08:15:00',
      offenceSections: [
        'BNS 331(4) / IPC 457 (Lurking House-trespass / Night Burglary)',
        'BNS 305 / IPC 380 (Theft in Dwelling / Commercial Building)',
        'BNS 317(2) / IPC 411 (Dishonestly Receiving Stolen Property)',
      ],
      ipcSectionsEquivalent: ['IPC 457', 'IPC 380', 'IPC 411'],
      complainant: {
        name: 'M. Somasundaram Chettiar (Proprietor)',
        contact: '+91 94431 40912',
        address: 'Muthulakshmi Jewellers, South Avani Moola Street, Madurai - 625001',
        identification: 'GSTIN: 33AAACM4910K1Z9',
      },
      accused: [
        {
          name: 'Selvam @ Pamban Selvam',
          alias: 'Pamban',
          status: 'Absconding',
          details: 'Habitual night burglar with past record in Virudhunagar & Dindigul.',
        },
        {
          name: 'Murugan (Apprentice/Lookout)',
          alias: 'Chinna',
          status: 'Identified',
          details: 'Spotted on ANPR surveillance at Kappalur Toll Plaza riding Yamaha FZ.',
        },
      ],
      incidentDate: '2026-08-13 03:20:00',
      incidentLocation: 'Muthulakshmi Jewellers, South Avani Moola Street, Madurai',
      gpsCoordinates: { lat: 9.9195, lng: 78.1198 },
      briefDescription: 'Night break-in and burglary of jewelry store near Meenakshi Amman Temple. Rolling shutter lock cut using industrial bolt cutter. Gold ornaments worth ₹48 Lakhs and cash stolen.',
      investigatingOfficerId: 'OFF-TN-0482',
      investigatingOfficerName: 'Inspector K. Senthil Kumar',
      status: 'UNDER_INVESTIGATION',
      chargesheetDeadline: '2026-11-12',
      daysRemainingForChargesheet: 76,
    },
    {
      caseId: 'KL-TVM-2026-001087',
      firNumber: 'FIR No. 94/2026',
      policeStation: 'Fort Police Station, Thiruvananthapuram City',
      stationCode: 'KL-TVM-FRT',
      registrationDate: '2026-07-28',
      registrationTime: '06:45:00',
      offenceSections: [
        'BNS 103(1) / IPC 302 (Punishment for Murder)',
        'BNS 238 / IPC 201 (Causing Disappearance of Evidence of Offence)',
        'Arms Act Sec 25/27',
      ],
      ipcSectionsEquivalent: ['IPC 302', 'IPC 201'],
      complainant: {
        name: 'Babu K. (Timber Yard Watchman)',
        contact: '+91 94472 88102',
        address: 'Quarters No. 8, Chalakkuzhi Lane, Fort, Thiruvananthapuram - 695023',
        identification: 'Aadhaar XXXX-XXXX-9102',
      },
      accused: [
        {
          name: 'Pradeep @ Katta Pradeep',
          alias: 'Katta Pradeep',
          status: 'In Custody',
          details: 'Main suspect apprehended near Kollam bypass checkpost with victim phone.',
        },
      ],
      incidentDate: '2026-07-27 19:15:00',
      incidentLocation: 'Lakshmi Timber Depot, Chalakkuzhi, Fort PS Limits, Thiruvananthapuram',
      gpsCoordinates: { lat: 8.4822, lng: 76.9458 },
      briefDescription: 'Homicide of timber merchant in office room during evening hours following dispute over timber consignment payments. Blunt force trauma with iron crowbar.',
      investigatingOfficerId: 'OFF-TN-0482',
      investigatingOfficerName: 'Inspector K. Senthil Kumar',
      status: 'UNDER_INVESTIGATION',
      chargesheetDeadline: '2026-10-26',
      daysRemainingForChargesheet: 59,
    },
  ];

  // Seed Actual Evidence Files Stored In Database
  const initialEvidence = [
    {
      id: 'EVD-TN-004812-001',
      caseId: 'TN-CHN-2026-004812',
      title: 'ATM CCTV Footage Frame - Axis Bank Kodambakkam Kiosk',
      category: 'IMAGE' as const,
      fileName: 'axis_atm_kiosk_cctv_1205pm.jpg',
      mimeType: 'image/jpeg',
      rawText: 'CCTV Camera 02 (ATM Foyer): 08-08-2026 12:05:42 PM - Individual wearing black helmet and green striped shirt withdraws ₹50,000 cash in two tranches using Debit Card ending 4911. Leaves on motorcycle TN-09-CB-4491.',
      tags: ['CCTV Video', 'ATM Withdrawal', 'Facial Footage', 'Vehicle Sighting'],
      gpsLocation: {
        latitude: 13.0518,
        longitude: 80.2241,
        addressName: 'Axis Bank ATM, Kodambakkam High Rd, Chennai',
        accuracyMeters: 4.5,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'Dahua NVR 4K Forensic Export / USB Hash Sealed',
    },
    {
      id: 'EVD-TN-004812-002',
      caseId: 'TN-CHN-2026-004812',
      title: 'Call Detail Record (CDR) & Cell Tower Latch Dump',
      category: 'DIGITAL_RECORD' as const,
      fileName: 'airtel_cdr_suspect_tower_dump.csv',
      mimeType: 'text/csv',
      rawText: 'MSISDN: +91 98401 22941, IMEI: 864921049281729, Tower ID: CHN-KOD-041 (Kodambakkam Arcot Road), Time: 2026-08-08 10:30:11 to 12:45:00 IST. Repeated voice calls with victim +91 98402 11982.',
      tags: ['CDR', 'Telecom', 'Cell Tower', 'IMEI', 'Airtel'],
      gpsLocation: {
        latitude: 13.0531,
        longitude: 80.2260,
        addressName: 'Kodambakkam Arcot Road Cell Tower #041, Chennai',
        accuracyMeters: 15.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'CCTNS Telecom Intercept Node / Chennai City Police',
    },
    {
      id: 'EVD-TN-004812-003',
      caseId: 'TN-CHN-2026-004812',
      title: 'Bank Statement & RTGS Fraud Audit Trail - Axis Bank',
      category: 'DOCUMENT' as const,
      fileName: 'axis_bank_mule_rtgs_trail.pdf',
      mimeType: 'application/pdf',
      rawText: 'Axis Bank Account #921020048911221 held in name of Praveen Kumar. RTGS Credit of ₹14,50,000 received on 08-08-2026 at 11:22 AM from complainant V. Sundaram. Immediate ATM and IMPS splits executed within 40 minutes.',
      tags: ['Bank Statement', 'RTGS', 'Mule Account', 'Cyber Fraud'],
      gpsLocation: {
        latitude: 13.0418,
        longitude: 80.2342,
        addressName: 'Axis Bank Regional Clearing Hub, Chennai',
        accuracyMeters: 5.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'Axis Bank AML Vigilance Portal Export',
    },
    {
      id: 'EVD-TN-004812-004',
      caseId: 'TN-CHN-2026-004812',
      title: 'Seized Samsung S21 Device & SIM Packet (eSakshya SID Verified)',
      category: 'IMAGE' as const,
      fileName: 'Seizure_Item_eSakshya_SID_489102.jpg',
      mimeType: 'image/jpeg',
      rawText: 'eSakshya Digital Evidence Packet SID-TN-2026-88129 | Seized from room of accused Dinesh | Samsung Galaxy S21 with SIM 9840122941 inserted | 3 ATM cards recovered including Axis Bank Card 4911.',
      tags: ['eSakshya SID', 'Mobile Seizure', 'SIM Recovery', 'ATM Cards'],
      gpsLocation: {
        latitude: 13.0531,
        longitude: 80.2260,
        addressName: 'Arcot Road Residence, Kodambakkam, Chennai',
        accuracyMeters: 6.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'eSakshya Field Terminal #TN-882',
    },
    // Case 2: Madurai Burglary
    {
      id: 'EVD-TN-002194-001',
      caseId: 'TN-MDU-2026-002194',
      title: 'Crime Scene Fingerprint & Lock Cutter Forensic Analysis',
      category: 'FORENSIC_REPORT' as const,
      fileName: 'Forensic_Report_Madurai_FSL_882.pdf',
      mimeType: 'application/pdf',
      rawText: 'Tamil Nadu Forensic Sciences Department: Latent palm print identified on showroom cash locker matches criminal record database print of Selvam (FPR-MDU-19984). Lock shackle cut using 18-inch industrial bolt cutter with diamond grade teeth.',
      tags: ['FSL Forensic', 'Fingerprints', 'Lock Cutter', 'Physical Evidence'],
      gpsLocation: {
        latitude: 9.9195,
        longitude: 78.1198,
        addressName: 'South Avani Moola St, Madurai - 625001',
        accuracyMeters: 4.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'State Forensic Science Lab (FSL Madurai)',
    },
    {
      id: 'EVD-TN-002194-002',
      caseId: 'TN-MDU-2026-002194',
      title: 'Toll Plaza ANPR Camera Log (Kappalur Toll, Madurai Outskirts)',
      category: 'IMAGE' as const,
      fileName: 'ANPR_Kappalur_Toll_TN58BQ9921.jpg',
      mimeType: 'image/jpeg',
      rawText: 'Kappalur Toll ANPR: Vehicle TN-58-BQ-9921 (Yamaha FZ Red) passed Southbound Lane 4 on 13-08-2026 at 03:42 AM. Rider carrying large black backpack with heavy load.',
      tags: ['ANPR Vehicle', 'Toll CCTV', 'Vehicle Movement', 'Escape Route'],
      gpsLocation: {
        latitude: 9.8315,
        longitude: 78.0210,
        addressName: 'Kappalur Toll Plaza, NH 44, Madurai',
        accuracyMeters: 3.5,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'NHAI ANPR Database Link',
    },
    {
      id: 'EVD-TN-002194-003',
      caseId: 'TN-MDU-2026-002194',
      title: 'Showroom Alley CCTV Footage (03:15 AM Rear Break-in)',
      category: 'VIDEO' as const,
      fileName: 'Alley_CCTV_SouthAvani_0315AM.mp4',
      mimeType: 'video/mp4',
      rawText: 'Rear camera captures masked individual forcing rear iron shutter at 03:15 AM with bolt cutter, entering store room, leaving at 03:32 AM with heavy sack matching bike rider backpack.',
      tags: ['CCTV Video', 'Break-in', 'Shutter Force', 'Madurai'],
      gpsLocation: {
        latitude: 9.9195,
        longitude: 78.1198,
        addressName: 'South Avani Moola St, Madurai',
        accuracyMeters: 5.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'Shop Security DVR Export',
    },
    {
      id: 'EVD-TN-002194-004',
      caseId: 'TN-MDU-2026-002194',
      title: 'Seizure Mahazar of Recovered 450g Gold Ornaments & Cash',
      category: 'DOCUMENT' as const,
      fileName: 'Gold_Seizure_Mahazar_Sec105_BNSS.pdf',
      mimeType: 'application/pdf',
      rawText: 'Recovery under Section 23 BSA / Section 27 Evidence Act: 450g 22-karat gold necklaces and bangles bearing Muthulakshmi Jewellers hallmark stamps recovered from concealed compartment in hideout.',
      tags: ['Gold Seizure', 'Mahazar', 'Panchas', 'Recovery', 'BNSS 105'],
      gpsLocation: {
        latitude: 9.5872,
        longitude: 77.9578,
        addressName: 'Suspect Hideout, Virudhunagar Outskirts',
        accuracyMeters: 6.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'Field Tablet / eSakshya Mahazar Portal',
    },
    // Case 3: Thiruvananthapuram Timber Homicide
    {
      id: 'EVD-KL-001087-001',
      caseId: 'KL-TVM-2026-001087',
      title: 'Post-Mortem Medical Report (Medical College Hospital TVM)',
      category: 'FORENSIC_REPORT' as const,
      fileName: 'PostMortem_Report_MCH_TVM_94.pdf',
      mimeType: 'application/pdf',
      rawText: 'Post-Mortem Examination No. PM-TVM-2026-441: Ante-mortem blunt force cranial trauma caused by heavy cylindrical iron instrument. Time of death estimated between 18:00 and 19:30 on 27-07-2026. Blood group O-positive.',
      tags: ['Autopsy', 'Forensic', 'Head Injury', 'Medical Evidence', 'BSA 63'],
      gpsLocation: {
        latitude: 8.5241,
        longitude: 76.9366,
        addressName: 'Govt Medical College, Medical College PO, Thiruvananthapuram',
        accuracyMeters: 4.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'Forensic Medicine Department, MCH Thiruvananthapuram',
    },
    {
      id: 'EVD-KL-001087-002',
      caseId: 'KL-TVM-2026-001087',
      title: 'Murder Weapon (Heavy Iron Crowbar) Recovery Mahazar',
      category: 'DOCUMENT' as const,
      fileName: 'Weapon_Recovery_Mahazar_Sec23_BSA.pdf',
      mimeType: 'application/pdf',
      rawText: 'Section 23 BSA Recovery Mahazar: Heavy iron crowbar (2.8 kg, 3.2 feet) with rusted head recovered from marshy drainage canal 400m behind timber depot based on voluntary confession of accused Pradeep in presence of independent witnesses.',
      tags: ['Weapon Recovery', 'Crowbar', 'Mahazar', 'Confession BSA 23'],
      gpsLocation: {
        latitude: 8.4802,
        longitude: 76.9441,
        addressName: 'Drainage Canal, Killi River Canal, Fort Limits, Thiruvananthapuram',
        accuracyMeters: 8.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'eSakshya Digital Camera System',
    },
    {
      id: 'EVD-KL-001087-003',
      caseId: 'KL-TVM-2026-001087',
      title: 'Blood-Stained Cotton Shirt Seizure & Serology Report',
      category: 'IMAGE' as const,
      fileName: 'Blood_Stained_Shirt_Forensic_Photo.jpg',
      mimeType: 'image/jpeg',
      rawText: 'Chemical Examiner Serology Certificate: Human blood detected on right sleeve and collar of blue checks shirt. Serological analysis confirms blood group O-positive matching deceased timber merchant.',
      tags: ['Serology', 'DNA Blood', 'Cloth Seizure', 'Physical Evidence'],
      gpsLocation: {
        latitude: 8.4822,
        longitude: 76.9458,
        addressName: 'Timber Depot Office, Chalakkuzhi, Fort, Thiruvananthapuram',
        accuracyMeters: 5.0,
      },
      officerId: 'OFF-TN-0482',
      officerName: 'Inspector K. Senthil Kumar',
      deviceInfo: 'State Forensic Science Laboratory, Thiruvananthapuram',
    },
  ];

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      vault = JSON.parse(content);
      console.log(`[SecureDB] Loaded ${Object.keys(vault.evidence).length} evidence items and ${Object.keys(vault.cases).length} cases from ${DB_FILE}`);
      
      // Ensure all seed cases exist in the loaded database
      let dbUpdated = false;
      seedCases.forEach((c) => {
        if (!vault.cases[c.caseId]) {
          vault.cases[c.caseId] = c;
          dbUpdated = true;
        }
      });

      // Ensure all seed evidence exist in the loaded database
      initialEvidence.forEach((item) => {
        if (!vault.evidence[item.id]) {
          const rawBuffer = Buffer.from(item.rawText, 'utf8');
          const hash = computeSha256(rawBuffer);
          const encrypted = encryptData(rawBuffer);

          const storageFileName = `${item.id}.enc`;
          const storagePath = path.join(EVIDENCE_FILES_DIR, storageFileName);
          if (!fs.existsSync(storagePath)) {
            fs.writeFileSync(storagePath, JSON.stringify(encrypted), 'utf8');
          }

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
          dbUpdated = true;
        }
      });

      if (dbUpdated) {
        persistVaultToDisk();
      }
      return;
    } catch (err) {
      console.warn('[SecureDB] Error parsing existing db, re-seeding:', err);
    }
  }

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
    ocrConfidence: evidenceData.ocrConfidence || (evidenceData.extractedText ? 0.98 : undefined),
    entitiesExtracted: evidenceData.entitiesExtracted || [],
    sourceSystem: evidenceData.sourceSystem || 'DIRECT_UPLOAD',
    storageFilePath: storageFileName,
  };

  vault.evidence[id] = record;
  persistVaultToDisk();
  return record;
}

// Update existing evidence record fields (e.g. OCR text or extracted entities)
export function updateEvidenceRecord(id: string, updates: Partial<StoredEvidenceRecord>): StoredEvidenceRecord | null {
  const existing = vault.evidence[id];
  if (!existing) return null;

  vault.evidence[id] = {
    ...existing,
    ...updates,
    id: existing.id, // Immutable ID
    sha256Hash: existing.sha256Hash, // Immutable hash unless tampered
  };

  persistVaultToDisk();
  return vault.evidence[id];
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

export function recordAuditTransaction(tx: any) {
  if (!vault.blockchainBlocks || vault.blockchainBlocks.length === 0) {
    vault.blockchainBlocks = [
      {
        blockNumber: 1,
        blockHash: '0x' + crypto.randomBytes(32).toString('hex'),
        previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        merkleRoot: '0x' + crypto.randomBytes(32).toString('hex'),
        timestamp: new Date().toISOString(),
        transactionsCount: 1,
        channelId: 'police-consortium-chn',
        organization: 'Tamil Nadu Police Consortium Node',
        transactions: [tx],
      },
    ];
  } else {
    const topBlock = vault.blockchainBlocks[0];
    if (topBlock.transactions && topBlock.transactions.length >= 10) {
      const newBlockNumber = (topBlock.blockNumber || 1) + 1;
      const newBlock = {
        blockNumber: newBlockNumber,
        blockHash: '0x' + crypto.randomBytes(32).toString('hex'),
        previousHash: topBlock.blockHash,
        merkleRoot: '0x' + crypto.randomBytes(32).toString('hex'),
        timestamp: tx.timestamp || new Date().toISOString(),
        transactionsCount: 1,
        channelId: 'police-consortium-chn',
        organization: 'Tamil Nadu Police Consortium Node',
        transactions: [tx],
      };
      vault.blockchainBlocks.unshift(newBlock);
    } else {
      if (!topBlock.transactions) topBlock.transactions = [];
      topBlock.transactions.unshift(tx);
      topBlock.transactionsCount = topBlock.transactions.length;
      topBlock.merkleRoot = '0x' + crypto.randomBytes(32).toString('hex');
    }
  }
  persistVaultToDisk();
}
