# ☀️ HELIOS — Legal & Compliance Intelligence for Companies

> **"Your Company's Legal & Compliance Intelligence Layer"**  
> An enterprise-grade legal support and corporate compliance platform designed for startups, MSMEs, founders, finance teams, HR heads, and company administrators.

[![Stack](https://img.shields.io/badge/Stack-Node.js_%7C_Express_%7C_Vanilla_ES6+-f7df1e?logo=javascript&logoColor=black)](#-tech-stack)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployment_Ready-000000?logo=vercel&logoColor=white)](#-vercel-deployment)
[![Compliance](https://img.shields.io/badge/Security-SOC2_Type_II_%7C_Multi--Tenant-2ea44f?logo=shield&logoColor=white)](#-enterprise-security--tenancy)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ⚖️ Responsible Legal AI Notice

> **IMPORTANT:** HELIOS is an informational corporate intelligence platform and decision-support system. **HELIOS IS NOT A LAWYER AND DOES NOT PROVIDE BINDING LEGAL ADVICE.**
>
> The system strictly distinguishes between:
> 1. **Level 1 / 2 Verified Government & Gazette Information**
> 2. **AI-Generated Heuristic Analysis & Document Extractions**
> 3. **Risk Flags & Discrepancy Warnings**
> 4. **Actionable Compliance Recommendations**
> 5. **Matters Mandating Professional Attorney or Chartered Accountant Verification**
>
> All proposed legislation is explicitly marked: `PROPOSED — NOT CURRENT LAW`. Active statutory rules are marked: `CURRENT / EFFECTIVE`.

---

## 🌟 Core Product Capabilities

- **Command Center Dashboard:** High-density Bloomberg-style overview covering composite compliance health, upcoming statutory deadlines, active document vault counts, open risks, and recent gazette notifications.
- **Company Onboarding:** 3-step setup configuring official corporate identity (CIN, PAN, GSTIN, RoC state jurisdiction, headcount, turnover bracket, and directors), applicable compliance areas, and initial document intake.
- **Document Vault & OCR Extraction:** Drag-and-drop ingestion of PDF, DOCX, XLSX, CSV, and scanned certificates with automated detection of CIN, PAN, GSTIN, expiration dates, statutory obligations, and risk flags.
- **Document Comparison Engine ("Compare Against Rules"):** Itemized side-by-side comparison of company documents against current statutory regulations with granular Green (Compliant), Yellow (Needs Review), and Red (Potential Non-Compliance) checklists.
- **In-Document AI Chat:** Query specific document clauses and validity dates directly within the document viewer with strict zero-hallucination grounding.
- **Regulatory Intelligence Feed:** Curated official gazette and circular stream from Central Ministries, MCA, CBIC (GST), CBDT, MeitY, and Department of Labour with Level 1-4 source trust ratings.
- **Rule Change Radar ("What's Changed?"):** Side-by-side rule diff engine comparing previous requirements vs new mandates, effective dates, and company-specific impact assessments.
- **Company Impact Engine:** Automated matching of active company parameters (turnover, headcount, state, industry) against newly notified regulations, assigning High, Medium, or Low relevance ratings with 1-click compliance tasks.
- **Parliament & Policy Watch:** Track legislative bills, standing committee reports, and draft consultative rules before they become enforceable law.
- **Policy Impact Analyzer:** Benchmark employee handbooks, POSH rules, overtime policies, and data privacy terms against statutory codes with explainable Policy Health Scores (0-100).
- **Tax & GST Center:** Statutory filing calendar for GSTR-1, GSTR-3B, Form 26Q TDS, and corporate advance tax. Features transparent integration indicators (`Integration not connected — Manual / Verified Filing Records Active`) without fabricating live API syncs.
- **Statutory Approval Center:** Track municipal licenses, Shops & Establishments registrations, trademark applications, and renewal windows.
- **Unified Compliance Calendar:** Consolidated timeline and tabular views with severity classification (Critical, High, Medium, Low).
- **Explainable Risk Engine:** Multi-vector compliance risk score (0-100) across 8 dimensions (Tax, Corporate, Legal, HR, Documents, Regulatory, Data Privacy, Licenses) with itemized risk drivers.
- **Ask HELIOS AI Legal Assistant:** Conversational AI grounded in company filings and official gazette notifications with clickable citations and statutory disclaimers.
- **Enterprise Governance & Audit Trail:** Write-once, append-only immutable event logs with 1-click CSV export for SOC-2 and statutory auditor verification.
- **Global Command Palette (`Ctrl + K` / `⌘K`):** Instant keyboard search across documents, regulations, policies, approvals, and tax deadlines from anywhere in the application.

---

## 💻 Tech Stack & Architecture

| Layer | Technologies / Specifications |
| :--- | :--- |
| **Backend & REST API** | Node.js (v18+ / v20+ / v24+), Express.js, Multer (Document processing), CORS |
| **Frontend & Design System** | Pure Vanilla HTML5, Modern CSS3 (Tokens, Bloomberg/Linear dark theme), Modular ES6+ JavaScript |
| **AI Reasoning & Extraction** | Server-side Gemini API connector / Internal Neural Compliance Engine with citation parsing |
| **Cloud & Deployment** | Vercel Serverless (`api/index.js` + `vercel.json`), Static Frontend edge caching |
| **Tenancy & Security** | Cryptographically isolated multi-tenant workspaces, zero client-side secrets, SOC-2 audit logs |

---

## 📁 Directory Structure

```text
HELIOS/
├── api/
│   ├── app.js               # Core Express REST API, Multi-tenant DB, OCR parser, Risk engine
│   └── index.js             # Vercel Serverless Function entry point
├── frontend/                # Production web application
│   ├── css/
│   │   ├── global.css       # Dark-first design tokens, Bloomberg terminal palette, typography
│   │   ├── layout.css       # Command sidebar, sticky header, mobile nav bar
│   │   ├── components.css   # Buttons, cards, metric tiles, badges, upload zones, command palette
│   │   └── pages.css        # Landing hero, animated pipeline, compare engine, chat stream
│   ├── js/
│   │   └── ui.js            # Global navigation shell, Command Palette (Ctrl+K), workspace switcher
│   ├── pages/
│   │   ├── approvals.html   # Statutory licenses, registrations & renewals
│   │   ├── audit-logs.html  # SOC-2 verifiable audit trail & CSV export
│   │   ├── calendar.html    # Unified compliance calendar (Timeline & Table)
│   │   ├── compare.html     # Document Comparison Engine vs statutory rules
│   │   ├── dashboard.html   # Main Legal & Compliance Command Center
│   │   ├── documents.html   # Document Vault, drag & drop upload & in-doc AI chat
│   │   ├── impact.html      # Company-specific regulatory impact engine
│   │   ├── onboarding.html  # 3-step company onboarding wizard
│   │   ├── policy-analyzer.html # Internal policy health auditor (0-100 score)
│   │   ├── policy-chat.html # Ask HELIOS AI legal assistant with citations
│   │   ├── policy-watch.html# Parliament & legislative radar (Proposed vs Effective)
│   │   ├── regulations.html # Official gazette feed & What's Changed diffs
│   │   ├── risk.html        # 8-vector explainable risk engine
│   │   └── tax-center.html  # GST & direct tax compliance calendar
│   └── index.html           # Public landing page with animated pipeline visualization
├── server.js                # Local development & Node.js production server
├── vercel.json              # Vercel deployment routing & build specifications
├── package.json             # NPM dependencies & build scripts
└── README.md                # Comprehensive documentation
```

---

## ⚡ How to Run Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/princenikki2007-lang/Helios-TheCorporateAgent.git
cd Helios-TheCorporateAgent
npm install
```

### 2. Run Local Server
```bash
npm start
# or
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Vercel Deployment

HELIOS is architected for zero-configuration deployment to Vercel:

1. **Verify build:**
   ```bash
   npm run build
   ```
2. **Deploy via Vercel CLI:**
   ```bash
   npx vercel
   ```
   Or connect your GitHub repository directly in the [Vercel Dashboard](https://vercel.com).
3. **Environment Variables (Optional):**
   - `GEMINI_API_KEY` or `AI_API_KEY`: Server-side API key for live Gemini generative models.
   - `PORT`: Defaults to `3000` for local server.

---

## 🏢 Multi-Tenant Workspaces & Demo Mode

HELIOS includes an active Demo Workspace preloaded with corporate data:
- **Company Name:** Zephyr Technologies Private Limited
- **CIN:** `U72900KA2022PTC158941`
- **PAN:** `AABCZ9821K`
- **GSTIN:** `29AABCZ9821K1ZX`
- **Jurisdiction:** Bengaluru, Karnataka
- **Industry:** Software & SaaS Technology
- **Turnover:** ₹5 Cr - ₹25 Cr (Triggers E-Invoicing Rule 48(4) mandate)

To create a live tenant workspace:
- Click **"Create Company Workspace"** from the landing page or navigate to `pages/onboarding.html`.
- Toggle between Demo and Live data at any time via the topbar mode switcher.
