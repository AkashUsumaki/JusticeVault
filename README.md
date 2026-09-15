# JusticeVault (न्याय-साक्ष्य)
### Government of India Digital Evidence Management & Investigation Intelligence Platform

JusticeVault is an enterprise-grade, tamperproof digital evidence management, blockchain chain-of-custody audit trail, and AI forensic analysis platform tailored for Indian law enforcement, prosecutors, and judiciary under the **Bharatiya Sakshya Adhiniyam (BSA), 2023** and **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023**.

---

## Key Capabilities

- **Secure Evidence Vault**: Hardware-accelerated AES-256-GCM encrypted local storage with SHA-256 cryptographic hashing and simulated tampering detection.
- **Section 63 BSA Digital Certificate Generation**: Instant court-admissible certificate generation with hash seals, device metadata, and officer digital signatures.
- **Field Evidence Capture**: Mobile-optimized field evidence intake with live camera capture, GPS geotagging, audio statement recording, and offline sync.
- **AI Forensic Cross-Examination & Statement Verification**: Powered by Google Gemini to analyze statements, verify alibis against CDR, CCTV, and financial evidence.
- **Victim Enquiry & Voice-to-Text Comparison**: Instant voice statement recording, multilingual transcription (English, Tamil, Malayalam, Hindi), and automated claim-by-claim corroboration against evidence records.
- **GIS Crime Scene & Evidence Mapping**: Interactive OpenStreetMap / Leaflet mapping with geofencing, multi-layer station views, and patrol radius analysis.
- **Blockchain Audit Trail**: Immutable hyperledger block explorer recording every evidence upload, transfer, view, and certificate generation.
- **Inter-Station Sharing & ICJS Integration**: End-to-end encrypted evidence sharing requests across state police jurisdictions (e.g., Tamil Nadu & Kerala Police).

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, Leaflet & React-Leaflet
- **Backend / API**: Express 4, Node.js, Google GenAI SDK (`@google/genai`), AES-256-GCM cryptographic storage
- **PDF & Certificate Generation**: jsPDF
- **Build Tooling**: Vite 6, esbuild, TypeScript

---

## Local Development Setup

### 1. Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **npm** (comes with Node.js)

### 2. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/justicevault.git
cd justicevault
npm install
```

### 3. Configure Environment Variables
Create a `.env` or `.env.local` file in the root folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
*(Note: If no Gemini API key is provided, the platform automatically utilizes its high-fidelity local heuristic forensic analysis engine for offline or air-gapped police station environments).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for Production

```bash
# Build both frontend and backend server bundle
npm run build

# Start production server
npm start
```

---

## Deployment on Vercel

1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your `justicevault` GitHub repository.
4. Set the Build Command to `npm run build:client` (or `vite build`) and the Output Directory to `dist`.
5. Under **Environment Variables**, optionally set `GEMINI_API_KEY`.
6. Click **Deploy**. The included `vercel.json` configures SPA rewrites automatically.
