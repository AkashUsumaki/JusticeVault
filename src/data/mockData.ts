import { BlockchainBlock, BlockchainTransaction, CaseSharingRecord, EvidenceItem, FIRDetails, OfficerUser, RelationshipLink, RelationshipNode, StatementVerificationReport } from '../types';

export const mockOfficers: OfficerUser[] = [
  {
    id: 'OFF-TN-0482',
    badgeNumber: 'TN-POL-4892',
    name: 'Inspector K. Senthil Kumar',
    designation: 'Inspector of Police (Investigating Officer)',
    role: 'INVESTIGATION_OFFICER',
    policeStation: 'E-1 Mylapore Police Station, Chennai',
    stationCode: 'TN-CHN-MYL',
    state: 'Tamil Nadu',
    clearanceLevel: 'LEVEL_2_SENSITIVE',
    department: 'Crime Branch / Economic Offences',
    phone: '+91 94454 60101',
    email: 'senthil.k@tnpolice.gov.in',
    faceEnrolled: true,
    faceEmbeddingId: 'VAULT-KMS-FACE-TN0482-9981',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'OFF-TN-0115',
    badgeNumber: 'TN-POL-1150',
    name: 'ACP R. Meenakshi Sundaram',
    designation: 'Assistant Commissioner / Station Supervisor',
    role: 'STATION_SUPERVISOR',
    policeStation: 'E-1 Mylapore Police Station, Chennai',
    stationCode: 'TN-CHN-MYL',
    state: 'Tamil Nadu',
    clearanceLevel: 'LEVEL_3_CONFIDENTIAL',
    department: 'Law & Order / Supervisory Wing',
    phone: '+91 94454 60050',
    email: 'meenakshi.s@tnpolice.gov.in',
    faceEnrolled: true,
    faceEmbeddingId: 'VAULT-KMS-FACE-TN0115-4412',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'OFF-PROS-092',
    badgeNumber: 'TN-JUD-0092',
    name: 'Adv. Anandhi Ramanathan',
    designation: 'Senior Public Prosecutor',
    role: 'PUBLIC_PROSECUTOR',
    policeStation: 'Sessions Court Directorate of Prosecution, Chennai',
    stationCode: 'TN-CHN-COURT',
    state: 'Tamil Nadu',
    clearanceLevel: 'LEVEL_2_SENSITIVE',
    department: 'Directorate of Prosecution',
    phone: '+91 98401 55902',
    email: 'anandhi.r@tndop.gov.in',
    faceEnrolled: true,
    faceEmbeddingId: 'VAULT-KMS-FACE-PROS-8127',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'OFF-ADMIN-001',
    badgeNumber: 'TN-DGP-001',
    name: 'ADGP (Cyber) Rajesh Warrier, IPS',
    designation: 'State Police Department Admin / DGP Wing',
    role: 'DEPARTMENT_ADMIN',
    policeStation: 'State Police Headquarters, Chennai',
    stationCode: 'TN-HQ-DGP',
    state: 'Tamil Nadu',
    clearanceLevel: 'LEVEL_3_CONFIDENTIAL',
    department: 'State Cyber Command & Forensics',
    phone: '+91 94454 60001',
    email: 'rajesh.warrier@tnpolice.gov.in',
    faceEnrolled: true,
    faceEmbeddingId: 'VAULT-KMS-FACE-ADMIN-1001',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  }
];

export const mockCases: FIRDetails[] = [
  {
    firNumber: 'FIR No. 182/2026',
    caseId: 'TN-CHN-2026-004812',
    policeStation: 'E-1 Mylapore Police Station, Chennai',
    stationCode: 'TN-CHN-MYL',
    registrationDate: '2026-08-10',
    registrationTime: '14:30',
    offenceSections: [
      'BNS 318(4) / IPC 420 (Cheating & Financial Fraud)',
      'BNS 61(2) / IPC 120B (Criminal Conspiracy)',
      'IT Act Sec 66D (Cheating by Personation using Computer)'
    ],
    ipcSectionsEquivalent: ['IPC 420', 'IPC 120B', 'IT Act 66D'],
    complainant: {
      name: 'V. Sundaram (72 yrs, Retd. Bank Manager)',
      contact: '+91 98402 11982',
      address: 'No. 44, Luz Church Road, Mylapore, Chennai - 600004',
      identification: 'Aadhaar XXXX-XXXX-4912'
    },
    accused: [
      {
        name: 'Dinesh @ Karthik Raja',
        alias: 'Cyber Karthik',
        status: 'In Custody',
        details: 'Mule account aggregator and SIM provider operating out of Kodambakkam.'
      },
      {
        name: 'Praveen Kumar',
        status: 'Identified',
        details: 'Beneficiary of Axis Bank mule transfer account.'
      }
    ],
    incidentDate: '2026-08-08',
    incidentLocation: 'Mylapore / Digital Banking Network',
    gpsCoordinates: { lat: 13.0338, lng: 80.2677 },
    briefDescription: 'Complainant was deceived into transferring ₹14,50,000 via RTGS under false pretext of digital arrest for FedEx parcel containing contraband. Funds routed through 3 mule accounts.',
    investigatingOfficerId: 'OFF-TN-0482',
    investigatingOfficerName: 'Inspector K. Senthil Kumar',
    status: 'UNDER_INVESTIGATION',
    chargesheetDeadline: '2026-11-08',
    daysRemainingForChargesheet: 72
  },
  {
    firNumber: 'FIR No. 209/2026',
    caseId: 'TN-MDU-2026-002194',
    policeStation: 'B-1 Vilakkuthoon Police Station, Madurai',
    stationCode: 'TN-MDU-VIL',
    registrationDate: '2026-08-14',
    registrationTime: '09:15',
    offenceSections: [
      'BNS 303(2) / IPC 379 (Lurking House-trespass & Grand Theft)',
      'BNS 317 / IPC 411 (Receiving Stolen Property)'
    ],
    complainant: {
      name: 'M. Muthulakshmi Jewellers',
      contact: '+91 94431 88204',
      address: 'South Avani Moola Street, Madurai - 625001',
      identification: 'GSTIN 33AAACM4821K1Z2'
    },
    accused: [
      {
        name: 'Selvam @ Bullet Selvam',
        alias: 'Bullet Selvam',
        status: 'In Custody',
        details: 'Key suspect spotted on CCTV riding red Yamaha motorcycle TN-58-BQ-9921.'
      }
    ],
    incidentDate: '2026-08-13',
    incidentLocation: 'South Avani Moola Street, Madurai',
    gpsCoordinates: { lat: 9.9195, lng: 78.1198 },
    briefDescription: 'Break-in during power outage at jewelry showroom. 450 grams gold ornaments and ₹3.2 Lakh cash seized from locker.',
    investigatingOfficerId: 'OFF-TN-0482',
    investigatingOfficerName: 'Inspector K. Senthil Kumar',
    status: 'UNDER_INVESTIGATION',
    chargesheetDeadline: '2026-11-12',
    daysRemainingForChargesheet: 76
  },
  {
    firNumber: 'FIR No. 94/2026',
    caseId: 'KL-TVM-2026-001087',
    policeStation: 'Fort Police Station, Thiruvananthapuram',
    stationCode: 'KL-TVM-FRT',
    registrationDate: '2026-07-28',
    registrationTime: '18:45',
    offenceSections: [
      'BNS 103(1) / IPC 302 (Murder / Homicide)',
      'BNS 238 / IPC 201 (Causing Disappearance of Evidence)'
    ],
    complainant: {
      name: 'Dr. Jacob Varghese',
      contact: '+91 94471 23091',
      address: 'Near Padmanabhaswamy Temple, East Fort, Thiruvananthapuram',
      identification: 'Aadhaar XXXX-XXXX-8812'
    },
    accused: [
      {
        name: 'Unnikrishnan Nair',
        status: 'In Custody',
        details: 'Business partner with disputed warehouse lease agreement.'
      }
    ],
    incidentDate: '2026-07-27',
    incidentLocation: 'Chalakkuzhi Road, Thiruvananthapuram',
    gpsCoordinates: { lat: 8.4835, lng: 76.9446 },
    briefDescription: 'Fatal assault behind timber warehouse. Accused claims he was at Kottayam hospital during incident time.',
    investigatingOfficerId: 'OFF-TN-0482',
    investigatingOfficerName: 'Inspector K. Senthil Kumar',
    status: 'CHARGE_SHEET_FILED',
    chargesheetDeadline: '2026-10-26',
    daysRemainingForChargesheet: 59
  }
];

export const mockEvidenceItems: EvidenceItem[] = [
  // Evidence for Case TN-CHN-2026-004812 (Cyber Fraud)
  {
    id: 'EVD-TN-004812-001',
    caseId: 'TN-CHN-2026-004812',
    title: 'Complainant Bank Account Statement (HDFC Bank RTGS Outflow)',
    category: 'DIGITAL_RECORD',
    fileName: 'HDFC_Statement_Sundaram_Aug2026.csv',
    fileSizeBytes: 2450000,
    mimeType: 'text/csv',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploadTimestamp: '2026-08-11T10:15:00Z',
    uploadedByOfficerId: 'OFF-TN-0482',
    uploadedByOfficerName: 'Inspector K. Senthil Kumar',
    deviceInfo: 'Station Workstation #4 (IP 10.14.8.12)',
    gpsLocation: {
      latitude: 13.0338,
      longitude: 80.2677,
      addressName: 'E-1 Mylapore Police Station'
    },
    encryptionStatus: 'AES-256-ENCRYPTED',
    malwareScanStatus: 'CLEAN',
    version: 1,
    extractedText: 'Account No: 50100489128912 | IFSC: HDFC0000124 | Date: 08-08-2026 11:22 AM | Debit: ₹14,50,000 | Beneficiary: Axis Bank A/C 921020048911221 (Praveen Kumar, IFSC UTIB0000491) | Remarks: UTR HDFCR520260808110291 FedEx Clearance',
    tags: ['Bank Statement', 'RTGS Outflow', 'Mule Transfer', 'Fraud Amount'],
    entitiesExtracted: [
      { id: 'ENT-01', type: 'PERSON', value: 'V. Sundaram', context: 'Account Holder', confidence: 0.99 },
      { id: 'ENT-02', type: 'PERSON', value: 'Praveen Kumar', context: 'Beneficiary Mule Holder', confidence: 0.96 },
      { id: 'ENT-03', type: 'BANK_ACCOUNT', value: '921020048911221', context: 'Axis Bank Mule Account', confidence: 0.99 },
      { id: 'ENT-04', type: 'AMOUNT', value: '₹14,50,000', context: 'Fraud Outflow Transfer', confidence: 0.99 },
      { id: 'ENT-05', type: 'DATE_TIME', value: '08-08-2026 11:22 AM', context: 'RTGS Execution Timestamp', confidence: 0.98 }
    ],
    signedUrl: 'https://casemind.police.internal/evidence/signed/sundaram-hdfc.csv?token=exp3600',
    sourceSystem: 'DIRECT_UPLOAD'
  },
  {
    id: 'EVD-TN-004812-002',
    caseId: 'TN-CHN-2026-004812',
    title: 'Call Detail Record (CDR) of Suspect Phone +91 98401 22941',
    category: 'DIGITAL_RECORD',
    fileName: 'CDR_9840122941_Aug2026_CellTower.xlsx',
    fileSizeBytes: 4100000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sha256Hash: '4a53c3d115998a44b82b947c611467475d65ec8de5dbf6204c32b5ca5f144df3',
    uploadTimestamp: '2026-08-11T14:40:00Z',
    uploadedByOfficerId: 'OFF-TN-0482',
    uploadedByOfficerName: 'Inspector K. Senthil Kumar',
    deviceInfo: 'Station Terminal #2 (Cyber Cell)',
    gpsLocation: {
      latitude: 13.0338,
      longitude: 80.2677,
      addressName: 'E-1 Mylapore Police Station'
    },
    encryptionStatus: 'AES-256-ENCRYPTED',
    malwareScanStatus: 'CLEAN',
    version: 1,
    extractedText: 'Target MSISDN: 919840122941 | IMEI: 869401048892100 | Tower ID: CHN-KOD-041 (Kodambakkam Arcot Road) | 08-08-2026 10:45 AM - Call to +91 98402 11982 (Sundaram) Duration: 23 mins | 08-08-2026 11:35 AM - SMS from AXIS-BNK Tx Confirm ₹14,50,000 | Tower: CHN-KOD-041',
    tags: ['CDR Logs', 'Cell Tower', 'Call Duration', 'IMEI Tracker'],
    entitiesExtracted: [
      { id: 'ENT-06', type: 'PHONE', value: '+91 98401 22941', context: 'Calling Phone Used by Impersonator', confidence: 0.99 },
      { id: 'ENT-07', type: 'LOCATION', value: 'Kodambakkam Arcot Road, Chennai', context: 'Cell Tower Triangulation', confidence: 0.94 },
      { id: 'ENT-08', type: 'DATE_TIME', value: '08-08-2026 10:45 AM', context: 'Fraud Call Window', confidence: 0.99 }
    ],
    signedUrl: 'https://casemind.police.internal/evidence/signed/cdr_9840122941.xlsx?token=exp3600',
    sourceSystem: 'CCTNS_IMPORT'
  },
  {
    id: 'EVD-TN-004812-003',
    caseId: 'TN-CHN-2026-004812',
    title: 'ATM Cash Withdrawal CCTV Footage (Axis Bank Kodambakkam Branch)',
    category: 'VIDEO',
    fileName: 'ATM_CCTV_Kodambakkam_08Aug_1205PM.mp4',
    fileSizeBytes: 48900000,
    mimeType: 'video/mp4',
    sha256Hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    uploadTimestamp: '2026-08-12T11:00:00Z',
    uploadedByOfficerId: 'OFF-TN-0482',
    uploadedByOfficerName: 'Inspector K. Senthil Kumar',
    deviceInfo: 'Station Video Server',
    gpsLocation: {
      latitude: 13.0524,
      longitude: 80.2241,
      addressName: 'Axis Bank ATM, Kodambakkam High Rd'
    },
    encryptionStatus: 'AES-256-ENCRYPTED',
    malwareScanStatus: 'CLEAN',
    version: 1,
    extractedText: 'CCTV Camera 02 (ATM Foyer): 08-08-2026 12:05:42 PM - Individual wearing black helmet and green striped shirt withdraws ₹50,000 cash in two tranches using Debit Card ending 4911. Leaves on motorcycle TN-09-CB-4491.',
    tags: ['CCTV Video', 'ATM Withdrawal', 'Facial Footage', 'Vehicle Sighting'],
    entitiesExtracted: [
      { id: 'ENT-09', type: 'VEHICLE', value: 'TN-09-CB-4491', context: 'Motorcycle seen leaving ATM', confidence: 0.95 },
      { id: 'ENT-10', type: 'DATE_TIME', value: '08-08-2026 12:05 PM', context: 'ATM Cash Extraction Time', confidence: 0.99 },
      { id: 'ENT-11', type: 'LOCATION', value: 'Axis Bank Kodambakkam', context: 'Cash Extraction Point', confidence: 0.98 }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400',
    sourceSystem: 'DIRECT_UPLOAD'
  },
  {
    id: 'EVD-TN-004812-004',
    caseId: 'TN-CHN-2026-004812',
    title: 'Seized Samsung S21 Device & SIM Packet (eSakshya SID Verified)',
    category: 'IMAGE',
    fileName: 'Seizure_Item_eSakshya_SID_489102.jpg',
    fileSizeBytes: 8200000,
    mimeType: 'image/jpeg',
    sha256Hash: '98f7e6d5c4b3a29182736455049382716a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d',
    uploadTimestamp: '2026-08-13T16:20:00Z',
    uploadedByOfficerId: 'OFF-TN-0482',
    uploadedByOfficerName: 'Inspector K. Senthil Kumar',
    deviceInfo: 'eSakshya Field Terminal #TN-882',
    gpsLocation: {
      latitude: 13.0531,
      longitude: 80.2260,
      addressName: 'Arcot Road Residence, Kodambakkam'
    },
    encryptionStatus: 'AES-256-ENCRYPTED',
    malwareScanStatus: 'CLEAN',
    version: 1,
    extractedText: 'eSakshya Digital Evidence Packet SID-TN-2026-88129 | Seized from room of accused Dinesh | Samsung Galaxy S21 with SIM 9840122941 inserted | 3 ATM cards recovered including Axis Bank Card 4911.',
    tags: ['eSakshya SID', 'Mobile Seizure', 'SIM Recovery', 'ATM Cards'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=400',
    sourceSystem: 'eSakshya_SID'
  },

  // Evidence for Case TN-MDU-2026-002194 (Gold Burglary)
  {
    id: 'EVD-TN-002194-001',
    caseId: 'TN-MDU-2026-002194',
    title: 'Crime Scene Fingerprint & Lock Cutter Forensic Analysis',
    category: 'FORENSIC_REPORT',
    fileName: 'Forensic_Report_Madurai_FSL_882.pdf',
    fileSizeBytes: 6400000,
    mimeType: 'application/pdf',
    sha256Hash: '3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c',
    uploadTimestamp: '2026-08-15T09:00:00Z',
    uploadedByOfficerId: 'OFF-TN-0482',
    uploadedByOfficerName: 'Inspector K. Senthil Kumar',
    deviceInfo: 'State Forensic Science Lab (FSL Madurai)',
    gpsLocation: {
      latitude: 9.9195,
      longitude: 78.1198,
      addressName: 'South Avani Moola St, Madurai'
    },
    encryptionStatus: 'AES-256-ENCRYPTED',
    malwareScanStatus: 'CLEAN',
    version: 1,
    extractedText: 'Tamil Nadu Forensic Sciences Department: Latent palm print identified on showroom cash locker matches criminal record database print of Selvam (FPR-MDU-19984). Lock shackle cut using 18-inch industrial bolt cutter with diamond grade teeth.',
    tags: ['FSL Forensic', 'Fingerprints', 'Lock Cutter', 'Physical Evidence'],
    sourceSystem: 'DIRECT_UPLOAD'
  },
  {
    id: 'EVD-TN-002194-002',
    caseId: 'TN-MDU-2026-002194',
    title: 'Toll Plaza ANPR Camera Log (Kappalur Toll, Madurai Outskirts)',
    category: 'IMAGE',
    fileName: 'ANPR_Kappalur_Toll_TN58BQ9921.jpg',
    fileSizeBytes: 3900000,
    mimeType: 'image/jpeg',
    sha256Hash: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    uploadTimestamp: '2026-08-15T15:30:00Z',
    uploadedByOfficerId: 'OFF-TN-0482',
    uploadedByOfficerName: 'Inspector K. Senthil Kumar',
    deviceInfo: 'NHAI ANPR Database Link',
    gpsLocation: {
      latitude: 9.8315,
      longitude: 78.0210,
      addressName: 'Kappalur Toll Plaza, NH 44'
    },
    encryptionStatus: 'AES-256-ENCRYPTED',
    malwareScanStatus: 'CLEAN',
    version: 1,
    extractedText: 'Kappalur Toll ANPR: Vehicle TN-58-BQ-9921 (Yamaha FZ Red) passed Southbound Lane 4 on 13-08-2026 at 03:42 AM. Rider carrying large black backpack.',
    tags: ['ANPR Vehicle', 'Toll CCTV', 'Vehicle Movement', 'Escape Route'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=400',
    sourceSystem: 'CCTNS_IMPORT'
  }
];

export const mockStatementReports: StatementVerificationReport[] = [
  {
    id: 'STMT-REP-001',
    caseId: 'TN-CHN-2026-004812',
    speakerName: 'Dinesh @ Karthik Raja (Accused)',
    speakerRole: 'SUSPECT',
    statementDate: '2026-08-14',
    recordedByOfficer: 'Inspector K. Senthil Kumar',
    language: 'en',
    rawStatementText: 'I have never contacted Mr. V. Sundaram. On August 8th morning between 10:00 AM and 1:00 PM, I was completely at my mother\'s house in Tambaram (over 25 km away) and my phone was switched off the entire morning. I do not own any motorcycle with registration TN-09-CB-4491, nor did I withdraw any cash from Axis Bank ATM in Kodambakkam. I have no connection with Praveen Kumar or Axis Bank Account 921020048911221.',
    analysisTimestamp: '2026-08-14T17:00:00Z',
    overallConsistencyScore: 12,
    totalClaimsCount: 5,
    consistentCount: 0,
    contradictedCount: 4,
    unverifiedCount: 1,
    reviewRequiredCount: 0,
    aiDisclaimer: 'AI strictly evaluates consistency against registered case evidence for officer review. AI never determines criminal liability.',
    claims: [
      {
        id: 'CLM-01',
        claimText: 'I was completely at my mother\'s house in Tambaram between 10:00 AM and 1:00 PM on August 8th.',
        language: 'en',
        category: 'ALIBI',
        status: 'CONTRADICTED',
        confidenceScore: 97,
        evidenceMatchSummary: 'Contradicted by Cell Tower CDR records. Mobile 9840122941 was latched onto Tower CHN-KOD-041 (Kodambakkam) from 10:30 AM to 12:45 PM.',
        citedEvidence: [
          {
            evidenceId: 'EVD-TN-004812-002',
            evidenceTitle: 'Call Detail Record (CDR) of Suspect Phone +91 98401 22941',
            evidenceType: 'DIGITAL_RECORD',
            timestampOrPage: 'Row 48 - 08-08-2026 10:45 AM',
            quoteOrSnippet: 'Tower ID: CHN-KOD-041 (Kodambakkam Arcot Road), Lat: 13.0524, Lng: 80.2241',
            contradictionReason: 'Physical location triangulated in Kodambakkam, not Tambaram.'
          }
        ]
      },
      {
        id: 'CLM-02',
        claimText: 'My phone was switched off the entire morning on August 8th.',
        language: 'en',
        category: 'PHONE_CALL',
        status: 'CONTRADICTED',
        confidenceScore: 99,
        evidenceMatchSummary: 'Directly contradicted by active CDR call logs. An outgoing call of 23 minutes duration occurred at 10:45 AM to complainant Sundaram.',
        citedEvidence: [
          {
            evidenceId: 'EVD-TN-004812-002',
            evidenceTitle: 'Call Detail Record (CDR) of Suspect Phone +91 98401 22941',
            evidenceType: 'DIGITAL_RECORD',
            timestampOrPage: 'Row 48',
            quoteOrSnippet: '08-08-2026 10:45 AM - Call to +91 98402 11982 (Sundaram) Duration: 23 mins',
            contradictionReason: 'Phone was active and in live voice communication for 23 minutes.'
          }
        ]
      },
      {
        id: 'CLM-03',
        claimText: 'I did not withdraw any cash from Axis Bank ATM in Kodambakkam.',
        language: 'en',
        category: 'FINANCIAL_TRANSACTION',
        status: 'CONTRADICTED',
        confidenceScore: 94,
        evidenceMatchSummary: 'Contradicted by ATM CCTV footage & eSakshya seized debit cards.',
        citedEvidence: [
          {
            evidenceId: 'EVD-TN-004812-003',
            evidenceTitle: 'ATM Cash Withdrawal CCTV Footage (Axis Bank Kodambakkam Branch)',
            evidenceType: 'VIDEO',
            timestampOrPage: 'Timestamp 12:05:42 PM',
            quoteOrSnippet: 'Subject withdraws ₹50,000 using Card ending 4911 matching seized card.',
            contradictionReason: 'Physical match on CCTV and card possession confirmed in seizure SID.'
          }
        ]
      },
      {
        id: 'CLM-04',
        claimText: 'I do not own or ride motorcycle TN-09-CB-4491.',
        language: 'en',
        category: 'VEHICLE_USE',
        status: 'CONTRADICTED',
        confidenceScore: 92,
        evidenceMatchSummary: 'Motorcycle TN-09-CB-4491 visible in ATM CCTV exit footage and verified registered in VAHAN portal.',
        citedEvidence: [
          {
            evidenceId: 'EVD-TN-004812-003',
            evidenceTitle: 'ATM Cash Withdrawal CCTV Footage',
            evidenceType: 'VIDEO',
            quoteOrSnippet: 'Leaves on motorcycle TN-09-CB-4491 at 12:08 PM',
            contradictionReason: 'CCTV footage documents suspect mounting this exact vehicle.'
          }
        ]
      },
      {
        id: 'CLM-05',
        claimText: 'I have no connection with Praveen Kumar.',
        language: 'en',
        category: 'GENERAL',
        status: 'UNVERIFIED',
        confidenceScore: 40,
        evidenceMatchSummary: 'No direct WhatsApp or contact book evidence linking Praveen Kumar yet; requires bank KYC verification from Axis Bank.',
        citedEvidence: []
      }
    ]
  }
];

export const mockBlockchainBlocks: BlockchainBlock[] = [
  {
    blockNumber: 1048,
    blockHash: '0000a94b817f6920194812048129481928491028491028491028491028491028',
    previousHash: '0000781290384019284019284019284019284019284019284019284019284019',
    merkleRoot: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    timestamp: '2026-08-11T10:15:30Z',
    transactionsCount: 2,
    channelId: 'casemind-police-consortium-chn',
    organization: 'TN_POLICE_MYLAPORE_ORG',
    transactions: [
      {
        txId: 'TX-FABRIC-TN0482-1048-01',
        blockNumber: 1048,
        timestamp: '2026-08-11T10:15:00Z',
        action: 'EVIDENCE_UPLOAD',
        caseId: 'TN-CHN-2026-004812',
        evidenceId: 'EVD-TN-004812-001',
        evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        officerId: 'OFF-TN-0482',
        officerName: 'Inspector K. Senthil Kumar',
        officerBadge: 'TN-POL-4892',
        policeStation: 'E-1 Mylapore Police Station, Chennai',
        ipAddress: '10.14.8.12',
        deviceFingerprint: 'STATION-MYL-WS4-MAC-8A19',
        details: 'Initial deposit & SHA-256 seal of HDFC Bank RTGS Outflow Statement CSV',
        signature: 'SIG-ECDSA-P384-TN0482-881a9f-398401',
        previousBlockHash: '0000781290384019284019284019284019284019284019284019284019284019',
        blockHash: '0000a94b817f6920194812048129481928491028491028491028491028491028',
        status: 'COMMITTED'
      },
      {
        txId: 'TX-FABRIC-TN0482-1048-02',
        blockNumber: 1048,
        timestamp: '2026-08-11T10:16:12Z',
        action: 'EVIDENCE_VIEW',
        caseId: 'TN-CHN-2026-004812',
        evidenceId: 'EVD-TN-004812-001',
        evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        officerId: 'OFF-TN-0482',
        officerName: 'Inspector K. Senthil Kumar',
        officerBadge: 'TN-POL-4892',
        policeStation: 'E-1 Mylapore Police Station, Chennai',
        ipAddress: '10.14.8.12',
        deviceFingerprint: 'STATION-MYL-WS4-MAC-8A19',
        details: 'Authorized officer accessed signed URL for OCR Entity indexing',
        signature: 'SIG-ECDSA-P384-TN0482-9901fa-112489',
        previousBlockHash: '0000781290384019284019284019284019284019284019284019284019284019',
        blockHash: '0000a94b817f6920194812048129481928491028491028491028491028491028',
        status: 'COMMITTED'
      }
    ]
  },
  {
    blockNumber: 1049,
    blockHash: '0000bc7120938401928401928401928401928401928401928401928401928401',
    previousHash: '0000a94b817f6920194812048129481928491028491028491028491028491028',
    merkleRoot: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    timestamp: '2026-08-14T17:01:00Z',
    transactionsCount: 1,
    channelId: 'casemind-police-consortium-chn',
    organization: 'TN_POLICE_MYLAPORE_ORG',
    transactions: [
      {
        txId: 'TX-FABRIC-TN0482-1049-01',
        blockNumber: 1049,
        timestamp: '2026-08-14T17:00:30Z',
        action: 'AI_VERIFICATION_RUN',
        caseId: 'TN-CHN-2026-004812',
        officerId: 'OFF-TN-0482',
        officerName: 'Inspector K. Senthil Kumar',
        officerBadge: 'TN-POL-4892',
        policeStation: 'E-1 Mylapore Police Station, Chennai',
        ipAddress: '10.14.8.12',
        deviceFingerprint: 'STATION-MYL-WS4-MAC-8A19',
        details: 'Gemini AI Cross-Evidence statement analysis executed on Accused Dinesh statement (4 contradictions flagged)',
        signature: 'SIG-ECDSA-P384-TN0482-3344aa-778899',
        previousBlockHash: '0000a94b817f6920194812048129481928491028491028491028491028491028',
        blockHash: '0000bc7120938401928401928401928401928401928401928401928401928401',
        status: 'VERIFIED'
      }
    ]
  }
];

export const mockRelationshipGraph = {
  nodes: [
    { id: 'N-SUSP-1', label: 'Dinesh @ Karthik Raja', type: 'PERSON' as const, metadata: { role: 'Prime Suspect', phone: '+91 98401 22941', status: 'In Police Remand' } },
    { id: 'N-VICT-1', label: 'V. Sundaram', type: 'PERSON' as const, metadata: { role: 'Complainant', phone: '+91 98402 11982', status: 'Victim' } },
    { id: 'N-MULE-1', label: 'Praveen Kumar', type: 'PERSON' as const, metadata: { role: 'Mule Account Holder', bank: 'Axis Bank', status: 'Under Look Out' } },
    { id: 'N-PH-1', label: '+91 98401 22941', type: 'PHONE' as const, metadata: { imei: '869401048892100', operator: 'Airtel TN', tower: 'Kodambakkam CHN-KOD-041' } },
    { id: 'N-PH-2', label: '+91 98402 11982', type: 'PHONE' as const, metadata: { owner: 'V. Sundaram', callDuration: '23 mins' } },
    { id: 'N-BK-1', label: 'Axis A/C 921020048911221', type: 'BANK_ACCOUNT' as const, metadata: { ifsc: 'UTIB0000491', amountReceived: '₹14,50,000' } },
    { id: 'N-VEH-1', label: 'TN-09-CB-4491', type: 'VEHICLE' as const, metadata: { make: 'Yamaha FZ', color: 'Midnight Black', seized: 'Yes' } },
    { id: 'N-LOC-1', label: 'Kodambakkam Arcot Road', type: 'LOCATION' as const, metadata: { landmark: 'Axis Bank ATM / Arcot Road', city: 'Chennai' } },
    { id: 'N-EVD-1', label: 'CCTV Footage ATM 12:05PM', type: 'EVIDENCE_ITEM' as const, metadata: { id: 'EVD-TN-004812-003', hash: '8f9e0a1b2c3d...' } },
    { id: 'N-EVD-2', label: 'eSakshya Seizure SID-88129', type: 'EVIDENCE_ITEM' as const, metadata: { id: 'EVD-TN-004812-004', items: 'Samsung S21 + ATM Cards' } }
  ],
  edges: [
    { id: 'E-01', sourceNodeId: 'N-SUSP-1', targetNodeId: 'N-PH-1', relationshipType: 'OPERATED_PHONE', description: 'Device registered to suspect and active during crime window', evidenceSourceId: 'EVD-TN-004812-002' },
    { id: 'E-02', sourceNodeId: 'N-PH-1', targetNodeId: 'N-PH-2', relationshipType: 'CALL_COMMUNICATION', description: '23-minute voice call impersonating Customs officer', evidenceSourceId: 'EVD-TN-004812-002' },
    { id: 'E-03', sourceNodeId: 'N-VICT-1', targetNodeId: 'N-BK-1', relationshipType: 'FINANCIAL_TRANSFER', description: '₹14,50,000 RTGS fraud transfer executed under duress', evidenceSourceId: 'EVD-TN-004812-001' },
    { id: 'E-04', sourceNodeId: 'N-MULE-1', targetNodeId: 'N-BK-1', relationshipType: 'ACCOUNT_HOLDER', description: 'Mule bank account opened for commission', evidenceSourceId: 'EVD-TN-004812-001' },
    { id: 'E-05', sourceNodeId: 'N-SUSP-1', targetNodeId: 'N-VEH-1', relationshipType: 'VEHICLE_USED', description: 'Ridden to and from ATM cash withdrawal location', evidenceSourceId: 'EVD-TN-004812-003' },
    { id: 'E-06', sourceNodeId: 'N-SUSP-1', targetNodeId: 'N-LOC-1', relationshipType: 'PHYSICAL_PRESENCE', description: 'Cell tower latched at Kodambakkam from 10:30 AM to 12:45 PM', evidenceSourceId: 'EVD-TN-004812-002' },
    { id: 'E-07', sourceNodeId: 'N-BK-1', targetNodeId: 'N-EVD-1', relationshipType: 'ATM_WITHDRAWAL', description: '₹50,000 withdrawn using card 4911 captured on video', evidenceSourceId: 'EVD-TN-004812-003' },
    { id: 'E-08', sourceNodeId: 'N-SUSP-1', targetNodeId: 'N-EVD-2', relationshipType: 'SEIZED_FROM', description: 'Recovered from suspect room in presence of panchas', evidenceSourceId: 'EVD-TN-004812-004' }
  ]
};

export const mockRelationshipNodes: RelationshipNode[] = [

  { id: 'N-SUSP-1', label: 'Dinesh @ Karthik Raja', type: 'PERSON_SUSPECT', details: 'Primary Suspect / Kodambakkam Gang' },
  { id: 'N-VICT-1', label: 'V. Sundaram', type: 'PERSON_VICTIM', details: 'Complainant / 72 yrs Retd Manager' },
  { id: 'N-MULE-1', label: 'Praveen Kumar', type: 'PERSON_SUSPECT', details: 'Mule Account Holder (Axis Bank)' },
  { id: 'N-PH-1', label: '+91 98401 22941', type: 'PHONE', details: 'SIM active at Kodambakkam Tower' },
  { id: 'N-PH-2', label: '+91 98402 11982', type: 'PHONE', details: 'Complainant Phone Number' },
  { id: 'N-BK-1', label: 'Axis A/C 921020048911221', type: 'BANK_ACCOUNT', details: '₹14,50,000 Fraud Recipient Account' },
  { id: 'N-VEH-1', label: 'TN-09-CB-4491', type: 'VEHICLE', details: 'Hero Splendor spotted at ATM CCTV' },
  { id: 'N-LOC-1', label: 'Kodambakkam Arcot Road', type: 'LOCATION', details: 'Tower ID CHN-KOD-041 / ATM location' },
  { id: 'N-EVD-1', label: 'CCTV Footage ATM 12:05PM', type: 'EVIDENCE_DOC', details: 'Cash Withdrawal Proof' },
  { id: 'N-EVD-2', label: 'eSakshya Seizure SID-88129', type: 'EVIDENCE_DOC', details: 'Samsung S21 + SIM Card' }
];

export const mockRelationshipLinks: RelationshipLink[] = [
  { source: 'N-SUSP-1', target: 'N-PH-1', relation: 'Operated MSISDN', confidence: 0.98 },
  { source: 'N-PH-1', target: 'N-PH-2', relation: '23-Min Fraud Call (08-Aug)', confidence: 0.99 },
  { source: 'N-VICT-1', target: 'N-BK-1', relation: 'Transferred ₹14.5L RTGS', confidence: 0.99 },
  { source: 'N-MULE-1', target: 'N-BK-1', relation: 'Registered KYC Holder', confidence: 0.95 },
  { source: 'N-SUSP-1', target: 'N-VEH-1', relation: 'Rode on CCTV Exit', confidence: 0.94 },
  { source: 'N-SUSP-1', target: 'N-LOC-1', relation: 'Tower CDR Latch (10:30AM - 12:45PM)', confidence: 0.97 },
  { source: 'N-BK-1', target: 'N-EVD-1', relation: '₹50,000 ATM Debit', confidence: 0.99 },
  { source: 'N-SUSP-1', target: 'N-EVD-2', relation: 'Recovered from Physical Custody', confidence: 0.99 }
];

export const mockSharingRecords: CaseSharingRecord[] = [
  {
    id: 'SHR-TN-001',
    caseId: 'TN-CHN-2026-004812',
    caseFirNumber: 'FIR No. 182/2026',
    sharedByOfficerId: 'OFF-TN-0482',
    sharedByOfficerName: 'Inspector K. Senthil Kumar',
    fromStation: 'E-1 Mylapore PS, Chennai',
    toStation: 'Cyber Crime Wing, Madurai City PS',
    toOfficerId: 'OFF-TN-0912',
    toOfficerName: 'Inspector V. Anand (Cyber Wing)',
    permission: 'VIEW_ONLY',
    expiresAt: '2026-09-04T23:59:59Z',
    createdAt: '2026-08-28T10:00:00Z',
    status: 'ACTIVE',
    accessPasscodeHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    accessCount: 3,
    lastAccessedAt: '2026-08-28T19:30:00Z'
  }
];
