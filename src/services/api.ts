import { EvidenceItem, ExtractedEntity, LanguageCode, StatementVerificationReport } from '../types';

export async function verifyStatementAI(params: {
  statementText: string;
  speakerName: string;
  speakerRole: string;
  language: LanguageCode;
  caseId: string;
  evidenceList: EvidenceItem[];
}): Promise<StatementVerificationReport> {
  const response = await fetch('/api/ai/verify-statement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to verify statement');
  }
  return data.data;
}

export async function runOcrAndEntityExtraction(params: {
  textContent?: string;
  base64Image?: string;
  fileName?: string;
  mimeType?: string;
  language?: LanguageCode;
}): Promise<{
  extractedText: string;
  detectedLanguage: string;
  ocrConfidence: number;
  entities: ExtractedEntity[];
}> {
  const response = await fetch('/api/ai/ocr-extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to extract OCR & Entities');
  }
  return data.data;
}

export async function runEvidenceItemOcr(evidenceId: string): Promise<{
  success: boolean;
  evidence: EvidenceItem;
  ocrData: {
    extractedText: string;
    detectedLanguage: string;
    ocrConfidence: number;
    entities: ExtractedEntity[];
  };
}> {
  const response = await fetch(`/api/evidence/${evidenceId}/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to run OCR on evidence');
  }
  return data;
}

export async function runSemanticSearch(params: {
  query: string;
  caseId?: string;
  documents: EvidenceItem[];
  filterField?: string;
}): Promise<{
  documentId: string;
  score: number;
  highlight: string;
  matchedField?: string;
  matchedEntities?: ExtractedEntity[];
}[]> {
  const response = await fetch('/api/ai/semantic-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Semantic search failed');
  }
  return data.results || [];
}

export async function transcribeAudioAI(params: {
  language: LanguageCode;
  audioSnippetType?: string;
}): Promise<{ transcript: string; language: string; confidence: number; durationSeconds: number }> {
  const response = await fetch('/api/ai/transcribe-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Transcription failed');
  }
  return data;
}
