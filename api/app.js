/**
 * HELIOS — AI Corporate Legal Assistant
 * Lightweight full-stack backend with PDF/TXT extraction, Gemini API integration,
 * Clause-to-Action Translator, Evidence-First Q&A, and Before-You-Sign Review Checklist.
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenAI, Type } = require('@google/genai');

// Load environment variables from .env if present
const envFilePath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFilePath)) {
  try {
    const envData = fs.readFileSync(envFilePath, 'utf8');
    envData.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    });
  } catch (e) {
    console.warn('[HELIOS] Failed to read .env:', e.message);
  }
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB max
});

// Persistence setup: store documents in data/documents.json
const DATA_DIR = path.join(__dirname, '..', 'data');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[HELIOS] Could not create data directory, using memory only:', err.message);
  }
}

// Initial pre-seeded corporate legal documents with verified text & intelligence
const INITIAL_DOCUMENTS = [
  {
    id: "doc_nda_01",
    title: "Mutual Non-Disclosure Agreement (NDA)",
    filename: "Mutual_NDA_Zephyr_Apex_2026.txt",
    fileSize: "14.2 KB",
    uploadDate: "2026-10-15",
    fileType: "txt",
    pageCount: 3,
    wordCount: 842,
    category: "Confidentiality & IP",
    extractedText: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of October 15, 2026 ("Effective Date"), by and between:

PARTY A: Zephyr Technologies Private Limited, a company incorporated under the Companies Act, 2013, having its registered office at 4th Floor, Salarpuria Cyber Park, Electronic City Phase 1, Bengaluru, Karnataka 560100 ("Disclosing/Receiving Party"); and

PARTY B: Apex Global Solutions LLC, a corporation registered under the laws of Delaware, USA, with principal place of business at 1209 Orange Street, Wilmington, DE 19801 ("Disclosing/Receiving Party").

RECITALS:
The Parties wish to explore potential business collaboration and enterprise SaaS integration opportunities ("Purpose"). In connection with the Purpose, each party may disclose to the other certain proprietary and non-public technical, commercial, and legal information.

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any proprietary data, trade secrets, software code, customer lists, financial projections, API specifications, business plans, patent disclosures, and security audits disclosed by either party, whether orally or in writing, designated as confidential or which reasonably should be understood to be confidential.

2. EXCLUSIONS FROM CONFIDENTIAL INFORMATION
Confidential Information does not include information that:
(a) is or becomes publicly available without breach of this Agreement;
(b) was already known to the Receiving Party prior to disclosure as evidenced by written records;
(c) is independently developed by the Receiving Party without reference to or reliance upon Disclosing Party's Confidential Information; or
(d) is lawfully obtained from a third party without duty of confidentiality.

3. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
(a) protect Confidential Information with the same degree of care it uses for its own confidential data, but no less than reasonable care;
(b) restrict disclosure strictly to employees, contractors, and legal advisors who need to know for the Purpose and who are bound by written non-disclosure obligations at least as restrictive as this Agreement;
(c) not reverse engineer, decompile, or disassemble any software or firmware samples provided.

4. DURATION AND TERM
This Agreement shall govern disclosures made for a period of two (2) years from the Effective Date. The confidentiality and non-use obligations with respect to all disclosed Confidential Information shall survive for three (3) years following the termination of this Agreement, provided that trade secrets shall remain protected indefinitely.

5. REMEDIES AND INJUNCTIVE RELIEF
The Parties acknowledge that unauthorized disclosure or use of Confidential Information may cause irreparable harm for which monetary damages alone would be inadequate. Accordingly, the Disclosing Party shall be entitled to seek injunctive relief without proving actual damages, in addition to any other legal remedies available.

6. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with this Agreement shall be referred to arbitration in Bengaluru, Karnataka, conducted in English under the Arbitration and Conciliation Act, 1996, before a sole arbitrator mutually agreed upon.

7. RETURN OR DESTRUCTION OF MATERIALS
Within fourteen (14) days upon written request by Disclosing Party, Receiving Party shall return or certify the secure destruction of all physical and electronic documents containing Confidential Information.

IN WITNESS WHEREOF, the Parties have executed this Agreement by their authorized representatives.

For Zephyr Technologies Pvt Ltd:
Name: Arjun Mehta
Title: Managing Director & CEO

For Apex Global Solutions LLC:
Name: Marcus Vance
Title: Senior Vice President of Corporate Development`,
    clauseAnalysis: {
      summary: "Standard bilateral mutual NDA protecting technical, customer, and financial disclosures with a 2-year active window and 3-year survival period governed by Indian arbitration.",
      clauses: [
        {
          category: "Confidentiality & IP",
          title: "Comprehensive Scope of Confidential Information",
          reference: "Section 1",
          originalClause: "\"Confidential Information\" means any proprietary data, trade secrets, software code, customer lists, financial projections, API specifications, business plans, patent disclosures, and security audits disclosed by either party...",
          explanation: "Explicitly protects software code, APIs, security audits, financial projections, and customer lists between Zephyr and Apex.",
          potentialConcern: null,
          suggestedAction: "Ensure all engineering diagrams, source repositories, and API documentation shared with Apex are watermarked or marked 'Confidential'."
        },
        {
          category: "Contract Term & Renewal",
          title: "Two-Year Disclosure Term & 3-Year Post-Termination Survival",
          reference: "Section 4. DURATION AND TERM",
          originalClause: "This Agreement shall govern disclosures made for a period of two (2) years from the Effective Date. The confidentiality and non-use obligations with respect to all disclosed Confidential Information shall survive for three (3) years following the termination of this Agreement, provided that trade secrets shall remain protected indefinitely.",
          explanation: "Disclosures can occur for 2 years (until Oct 15, 2028). Confidentiality duties endure for 3 years post-termination, with trade secrets protected forever.",
          potentialConcern: "Indefinite survival for trade secrets requires maintaining permanent internal access logs.",
          suggestedAction: "Add calendar reminders for October 15, 2028 (end of disclosure period) and October 15, 2031 (expiration of general confidentiality obligations)."
        },
        {
          category: "Penalties & Liability",
          title: "Injunctive Relief Without Proof of Actual Damages",
          reference: "Section 5. REMEDIES AND INJUNCTIVE RELIEF",
          originalClause: "Accordingly, the Disclosing Party shall be entitled to seek injunctive relief without proving actual damages, in addition to any other legal remedies available.",
          explanation: "If a party breaches confidentiality, the non-breaching party can immediately obtain a court injunction without having to prove financial damages first.",
          potentialConcern: "An injunction could abruptly halt collaborative development or commercial integration.",
          suggestedAction: "Establish strict access control logs for third-party disclosures to maintain a clean defense record."
        },
        {
          category: "Obligations & Deadlines",
          title: "Mandatory 14-Day Return or Destruction Protocol",
          reference: "Section 7. RETURN OR DESTRUCTION OF MATERIALS",
          originalClause: "Within fourteen (14) days upon written request by Disclosing Party, Receiving Party shall return or certify the secure destruction of all physical and electronic documents containing Confidential Information.",
          explanation: "Either party can request the immediate return or verified destruction of all confidential files within 14 calendar days.",
          potentialConcern: "Fourteen days is a tight turnaround window for distributed engineering environments and cloud backups.",
          suggestedAction: "Keep all Apex confidential data in an isolated, taggable cloud repository to permit automated deletion upon request."
        }
      ]
    },
    checklist: {
      overallAssessment: "Strong Mutual Protections: Standard 2-year term with 3-year survival; governing law set to India arbitration.",
      items: [
        {
          id: "chk_nda_1",
          category: "Payment Terms",
          title: "Payment Terms & Invoicing",
          status: "Not Found",
          reference: "N/A",
          details: "Standard for standalone NDAs: No financial fees, payments, or commercial charges are contemplated under this agreement.",
          excerpt: "None"
        },
        {
          id: "chk_nda_2",
          category: "Contract Duration & Renewal",
          title: "Contract Duration & Survival Period",
          status: "Found",
          reference: "Section 4",
          details: "Clearly defined 2-year disclosure window from Effective Date with 3-year post-termination survival and perpetual trade secret protection.",
          excerpt: "This Agreement shall govern disclosures made for a period of two (2) years from the Effective Date."
        },
        {
          id: "chk_nda_3",
          category: "Termination Conditions",
          title: "Termination & Data Deletion Timeline",
          status: "Found",
          reference: "Section 7",
          details: "Governed by term expiration; certified destruction or return of materials mandated within 14 days of written demand.",
          excerpt: "Within fourteen (14) days upon written request by Disclosing Party, Receiving Party shall return or certify the secure destruction..."
        },
        {
          id: "chk_nda_4",
          category: "Penalties & Liability",
          title: "Liability Caps & Injunction Remedies",
          status: "Needs Review",
          reference: "Section 5",
          details: "Allows injunctive relief without proving monetary damages; however, there is no monetary liability cap specified.",
          excerpt: "the Disclosing Party shall be entitled to seek injunctive relief without proving actual damages..."
        },
        {
          id: "chk_nda_5",
          category: "Obligations & Deadlines",
          title: "Standard of Care & Non-Use Obligations",
          status: "Found",
          reference: "Section 3",
          details: "Reasonable degree of care mandated; strict need-to-know disclosure; reverse engineering expressly prohibited.",
          excerpt: "protect Confidential Information with the same degree of care it uses for its own confidential data, but no less than reasonable care..."
        },
        {
          id: "chk_nda_6",
          category: "Missing / Ambiguous Information",
          title: "Governing Law & Dispute Forum",
          status: "Found",
          reference: "Section 6",
          details: "Indian law with sole-arbitrator proceedings in Bengaluru under Arbitration and Conciliation Act 1996 in English.",
          excerpt: "This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute... shall be referred to arbitration in Bengaluru..."
        }
      ]
    }
  },
  {
    id: "doc_emp_02",
    title: "Senior Software Engineer Employment Agreement",
    filename: "Employment_Agreement_Senior_Engineer.txt",
    fileSize: "18.6 KB",
    uploadDate: "2026-10-20",
    fileType: "txt",
    pageCount: 4,
    wordCount: 1120,
    category: "Human Resources",
    extractedText: `ZEPHYR TECHNOLOGIES PRIVATE LIMITED
EXECUTIVE EMPLOYMENT AGREEMENT

EMPLOYEE: Rohan Deshmukh
POSITION: Lead Systems Architect / Senior Software Engineer
COMMENCEMENT DATE: November 01, 2026
LOCATION: Bengaluru, Karnataka, India

1. DUTIES AND REPORTING
The Employee agrees to serve as Lead Systems Architect, reporting directly to the Chief Technology Officer (CTO). The Employee shall devote full business time, attention, and skill to the performance of duties and shall not engage in outside commercial employment, consulting, or moonlighting without prior written consent.

2. COMPENSATION AND BENEFITS
(a) Base Salary: ₹28,00,000 (Twenty-Eight Lakhs Rupees) per annum, payable in monthly installments subject to statutory TDS deductions.
(b) Performance Bonus: Discretionary annual bonus up to 15% of annual base pay, contingent on company EBITDA targets and individual milestone delivery.
(c) Benefits: Comprehensive health insurance for Employee, spouse, and up to two dependent children up to ₹10,00,000 coverage.
(d) Leave Entitlement: 18 earned privilege leaves, 12 casual/sick leaves per calendar year under Karnataka Shops & Commercial Establishments Act.

3. PROBATION PERIOD
The Employee shall serve a probation period of three (3) months from the Commencement Date. During probation, either party may terminate this agreement with fifteen (15) days written notice or pay in lieu thereof. Upon satisfactory review, employment shall be confirmed in writing.

4. TERMINATION AND NOTICE PERIOD
Following confirmation:
(a) Either party may terminate employment without cause by providing sixty (60) days advance written notice or equivalent base salary in lieu of notice.
(b) The Company may terminate employment immediately for Cause (defined as material fraud, embezzlement, criminal conviction, intentional data leakage, or gross violation of the Company Code of Conduct) without notice or severance pay.

5. INTELLECTUAL PROPERTY AND INVENTIONS ASSIGNMENT
All inventions, source code, algorithms, architectures, patents, and copyrightable works created or conceived by Employee during the course of employment, whether on company premises or remotely, using company equipment or related to company business, shall be the sole and exclusive property of Zephyr Technologies Pvt Ltd ("Work Made for Hire"). The Employee hereby irrevocably assigns all right, title, and interest therein.

6. NON-COMPETE AND NON-SOLICITATION COVENANTS
(a) Non-Compete: During employment and for a period of twelve (12) months following termination, Employee shall not directly or indirectly accept employment with, advise, or consult for any direct competitor operating in corporate legal intelligence software in India.
(b) Non-Solicitation: For eighteen (18) months following termination, Employee shall not solicit, recruit, or attempt to induce any employee or contractor of the Company to terminate their engagement.

7. DATA PROTECTION COMPLIANCE
Employee agrees to strictly comply with the Digital Personal Data Protection (DPDP) Act, 2023 and the Company's Information Security Management System (ISMS). Any unauthorized exfiltration of corporate or customer personal data shall result in immediate disciplinary and legal proceedings.

8. GOVERNING LAW
This agreement is governed by the laws of Karnataka and India. The courts of Bengaluru shall have exclusive jurisdiction.`,
    clauseAnalysis: {
      summary: "Executive employment contract providing ₹28 LPA base salary, 60-day notice, work-for-hire IP assignment, and a 12-month post-employment non-compete.",
      clauses: [
        {
          category: "Payment Terms",
          title: "Fixed Compensation & Performance Bonus",
          reference: "Section 2(a)-(b)",
          originalClause: "(a) Base Salary: ₹28,00,000 per annum, payable in monthly installments subject to statutory TDS deductions. (b) Performance Bonus: Discretionary annual bonus up to 15% of annual base pay...",
          explanation: "Fixed annual salary is ₹28 Lakhs payable monthly. A discretionary bonus of up to 15% is tied to company financial goals.",
          potentialConcern: "Bonus is discretionary and contingent on company EBITDA targets rather than solely individual achievement.",
          suggestedAction: "Establish written quarterly milestone objectives with the CTO to benchmark bonus evaluation criteria."
        },
        {
          category: "Termination Conditions",
          title: "60-Day Notice Period & Immediate Cause Dismissal",
          reference: "Section 4. TERMINATION AND NOTICE PERIOD",
          originalClause: "(a) Either party may terminate employment without cause by providing sixty (60) days advance written notice or equivalent base salary in lieu of notice. (b) The Company may terminate employment immediately for Cause...",
          explanation: "Either side can terminate after probation with 60 days advance notice or salary in lieu. Immediate dismissal without notice applies for Cause.",
          potentialConcern: "60-day notice is standard but can complicate fast-track job transitions.",
          suggestedAction: "Maintain comprehensive project documentation to facilitate shorter transition handovers if notice buyout is requested."
        },
        {
          category: "Penalties & Liability",
          title: "12-Month Post-Employment Non-Compete Restriction",
          reference: "Section 6(a). Non-Compete",
          originalClause: "During employment and for a period of twelve (12) months following termination, Employee shall not directly or indirectly accept employment with, advise, or consult for any direct competitor operating in corporate legal intelligence software in India.",
          explanation: "Bars working for or advising competing legal intelligence software companies in India for 1 year post-departure.",
          potentialConcern: "Post-termination restrictive covenants are generally considered void under Section 27 of the Indian Contract Act, 1872, but may create legal friction.",
          suggestedAction: "Seek explicit clarification on the designated list of 'direct competitors' before signing."
        }
      ]
    },
    checklist: {
      overallAssessment: "Balanced Senior Employment Agreement: Clear compensation and IP assignment; 12-month non-compete requires review under Indian labor law.",
      items: [
        {
          id: "chk_emp_1",
          category: "Payment Terms",
          title: "Base Salary, Bonus & Health Insurance",
          status: "Found",
          reference: "Section 2",
          details: "₹28,00,000 annual base salary payable monthly; discretionary bonus up to 15%; ₹10,00,000 family health insurance.",
          excerpt: "Base Salary: ₹28,00,000 (Twenty-Eight Lakhs Rupees) per annum... Performance Bonus: Discretionary annual bonus up to 15%"
        },
        {
          id: "chk_emp_2",
          category: "Contract Duration & Renewal",
          title: "Commencement Date & Probation Period",
          status: "Found",
          reference: "Section 3",
          details: "Commences Nov 01, 2026. 3-month probation period with written confirmation required.",
          excerpt: "The Employee shall serve a probation period of three (3) months from the Commencement Date."
        },
        {
          id: "chk_emp_3",
          category: "Termination Conditions",
          title: "Notice Period & Severance Grounds",
          status: "Found",
          reference: "Section 4",
          details: "60-day notice period or pay in lieu after confirmation; 15 days during probation; immediate termination for Cause.",
          excerpt: "Either party may terminate employment without cause by providing sixty (60) days advance written notice..."
        },
        {
          id: "chk_emp_4",
          category: "Penalties & Liability",
          title: "Post-Employment Non-Compete Enforceability",
          status: "Needs Review",
          reference: "Section 6(a)",
          details: "12-month non-compete across India may face enforceability scrutiny under Section 27 of Indian Contract Act 1872.",
          excerpt: "During employment and for a period of twelve (12) months following termination, Employee shall not directly or indirectly accept employment with... any direct competitor"
        },
        {
          id: "chk_emp_5",
          category: "Obligations & Deadlines",
          title: "Full-Time Exclusivity & IP Assignment",
          status: "Found",
          reference: "Section 1 & Section 5",
          details: "Full business time commitment (no moonlighting); all code and patents assigned as Work Made for Hire.",
          excerpt: "shall devote full business time, attention, and skill... All inventions, source code, algorithms, architectures... shall be the sole and exclusive property of Zephyr"
        },
        {
          id: "chk_emp_6",
          category: "Missing / Ambiguous Information",
          title: "Data Privacy & Statutory Jurisdiction",
          status: "Found",
          reference: "Section 7 & Section 8",
          details: "DPDP 2023 compliance explicitly mandated; exclusive court jurisdiction in Bengaluru, Karnataka.",
          excerpt: "Employee agrees to strictly comply with the Digital Personal Data Protection (DPDP) Act, 2023... courts of Bengaluru shall have exclusive jurisdiction."
        }
      ]
    }
  },
  {
    id: "doc_saas_03",
    title: "Master Software-as-a-Service (SaaS) Agreement",
    filename: "Enterprise_SaaS_Service_Agreement_v3.txt",
    fileSize: "22.1 KB",
    uploadDate: "2026-11-01",
    fileType: "txt",
    pageCount: 5,
    wordCount: 1350,
    category: "Commercial Contracts",
    extractedText: `MASTER SOFTWARE-AS-A-SERVICE (SaaS) AGREEMENT

This Master SaaS Agreement ("Agreement") governs access to and use of the HELIOS Corporate Intelligence Platform provided by Zephyr Technologies Private Limited ("Vendor") to the enterprise entity subscribing to the Service ("Customer").

1. SUBSCRIPTION GRANT AND ACCESS
Vendor grants Customer a non-exclusive, non-transferable, worldwide right to access and use the HELIOS cloud application during the Subscription Term solely for Customer's internal business compliance monitoring. Customer shall not sublicense, resell, or distribute the Service to any third party.

2. SERVICE LEVEL AGREEMENT (SLA) & UPTIME
(a) Uptime Commitment: Vendor commits to 99.9% Monthly Uptime for the HELIOS Core API and Web Console, excluding Scheduled Maintenance windows.
(b) Service Credits: In the event monthly uptime falls below 99.9%, Customer shall be entitled to service fee credits:
    - 99.0% - 99.89%: 10% monthly subscription credit
    - 95.0% - 98.99%: 25% monthly subscription credit
    - Below 95.0%: 50% monthly subscription credit and right to terminate without penalty.
(c) Scheduled Maintenance: Maintenance requiring downtime shall be announced at least seventy-two (72) hours in advance and executed during off-peak hours (01:00 to 05:00 IST on weekends).

3. FEES, BILLING & TAXES
Customer shall pay subscription fees specified in the applicable Order Form within thirty (30) days from invoice date (Net 30). Late payments shall accrue interest at 1.5% per month or the statutory maximum rate. All fees are exclusive of GST, which shall be charged at the prevailing statutory rate (currently 18% under HSN/SAC 998314).

4. DATA OWNERSHIP AND PRIVACY
Customer retains sole ownership of all customer data, uploaded documents, employee rosters, and compliance records ("Customer Data"). Vendor shall not use Customer Data for model training without express written consent. Vendor shall maintain SOC-2 Type II standards, TLS 1.3 encryption in transit, and AES-256 encryption at rest.

5. SECURITY INCIDENT DISCLOSURE
In the event of a confirmed personal data breach affecting Customer Data, Vendor shall notify Customer's Designated Security Contact within forty-eight (48) hours, providing technical details to facilitate compliance with MeitY and DPDP statutory notification rules.

6. LIMITATION OF LIABILITY
EXCEPT FOR GROSS NEGLIGENCE, WILLFUL MISCONDUCT, OR BREACH OF CONFIDENTIALITY OBLIGATIONS:
(A) NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES; AND
(B) EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING UNDER THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE TOTAL FEES PAID OR PAYABLE BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

7. INDEMNIFICATION
Vendor shall defend and indemnify Customer against any third-party claim alleging that the HELIOS Platform infringes any valid patent, copyright, or trademark, provided Customer gives prompt written notice of the claim.

8. TERM AND TERMINATION
The initial term is twelve (12) months and renews automatically for successive 12-month periods unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term. Either party may terminate immediately upon thirty (30) days notice for material uncured breach.`,
    clauseAnalysis: {
      summary: "Commercial SaaS contract featuring 99.9% uptime SLA with tiered fee credits, Net 30 billing, 12-month liability cap, and 48-hour breach notification.",
      clauses: [
        {
          category: "Payment Terms",
          title: "Net 30 Payment Terms, 1.5% Monthly Late Interest & 18% GST",
          reference: "Section 3. FEES, BILLING & TAXES",
          originalClause: "Customer shall pay subscription fees specified in the applicable Order Form within thirty (30) days from invoice date (Net 30). Late payments shall accrue interest at 1.5% per month or the statutory maximum rate. All fees are exclusive of GST, which shall be charged at the prevailing statutory rate (currently 18% under HSN/SAC 998314).",
          explanation: "Invoices must be paid within 30 days. Late balances incur 1.5% monthly interest. 18% GST is added to all amounts.",
          potentialConcern: "1.5% monthly interest is equivalent to 18% annualized interest.",
          suggestedAction: "Configure accounting automated approval within 20 days of invoice arrival to guarantee timely payments."
        },
        {
          category: "Obligations & Deadlines",
          title: "99.9% Uptime SLA with 10% to 50% Service Credits",
          reference: "Section 2. SERVICE LEVEL AGREEMENT (SLA)",
          originalClause: "Vendor commits to 99.9% Monthly Uptime for the HELIOS Core API and Web Console... Below 95.0%: 50% monthly subscription credit and right to terminate without penalty.",
          explanation: "Vendor commits to 99.9% availability. If uptime drops below 95%, customer receives a 50% fee credit and can cancel penalty-free.",
          potentialConcern: "Service credits are typically the exclusive remedy for service interruptions.",
          suggestedAction: "Set up automated status monitor alerts to document outage minutes and claim SLA credits promptly."
        },
        {
          category: "Penalties & Liability",
          title: "Total Liability Capped at 12 Months Fees Paid",
          reference: "Section 6. LIMITATION OF LIABILITY",
          originalClause: "EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING UNDER THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE TOTAL FEES PAID OR PAYABLE BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
          explanation: "Overall liability for any lawsuit or claim is capped at the total amount the customer paid in the prior 12 months.",
          potentialConcern: "Check whether personal data breach liability is carved out of the general 12-month liability cap.",
          suggestedAction: "Verify that enterprise cyber risk insurance covers data breach liabilities beyond the contract cap."
        }
      ]
    },
    checklist: {
      overallAssessment: "Production-Grade SaaS Contract: SLA credits defined; 12-month liability cap; Net 30 payment terms with 48h breach notification.",
      items: [
        {
          id: "chk_saas_1",
          category: "Payment Terms",
          title: "Net 30 Invoicing & 18% GST",
          status: "Found",
          reference: "Section 3",
          details: "Net 30 payment terms, 1.5% monthly late interest, 18% GST charged under SAC 998314.",
          excerpt: "Customer shall pay subscription fees specified in the applicable Order Form within thirty (30) days from invoice date (Net 30)."
        },
        {
          id: "chk_saas_2",
          category: "Contract Duration & Renewal",
          title: "Auto-Renewal & 60-Day Opt-Out Window",
          status: "Needs Review",
          reference: "Section 8",
          details: "Initial 12-month term renews automatically unless written notice of non-renewal is submitted at least 60 days before expiration.",
          excerpt: "renews automatically for successive 12-month periods unless either party provides written notice of non-renewal at least sixty (60) days prior..."
        },
        {
          id: "chk_saas_3",
          category: "Termination Conditions",
          title: "Termination for Convenience & Cause",
          status: "Found",
          reference: "Section 2(b) & Section 8",
          details: "Immediate termination right if uptime falls below 95%; 30 days notice for material uncured breach; 60 days for non-renewal.",
          excerpt: "Below 95.0%: 50% monthly subscription credit and right to terminate without penalty... Either party may terminate immediately upon thirty (30) days notice for material uncured breach."
        },
        {
          id: "chk_saas_4",
          category: "Penalties & Liability",
          title: "12-Month Liability Cap & Consequential Damages Waiver",
          status: "Found",
          reference: "Section 6",
          details: "Mutual aggregate liability capped at fees paid in the preceding 12 months; excludes gross negligence, willful misconduct, and confidentiality breaches.",
          excerpt: "EACH PARTY'S TOTAL AGGREGATE LIABILITY... SHALL BE STRICTLY LIMITED TO THE TOTAL FEES PAID OR PAYABLE BY CUSTOMER IN THE TWELVE (12) MONTHS"
        },
        {
          id: "chk_saas_5",
          category: "Obligations & Deadlines",
          title: "Uptime SLA & 48-Hour Incident Notification",
          status: "Found",
          reference: "Section 2 & Section 5",
          details: "99.9% uptime commitment; 48-hour security breach notification for customer personal data.",
          excerpt: "Vendor commits to 99.9% Monthly Uptime... notify Customer's Designated Security Contact within forty-eight (48) hours"
        },
        {
          id: "chk_saas_6",
          category: "Missing / Ambiguous Information",
          title: "Formal Governing Law & Arbitration Forum",
          status: "Needs Review",
          reference: "Agreement Scope",
          details: "SOC-2 Type II and AES-256 encryption stated; however, an explicit governing law and arbitration clause is missing from this draft.",
          excerpt: "Vendor shall maintain SOC-2 Type II standards, TLS 1.3 encryption in transit, and AES-256 encryption at rest."
        }
      ]
    }
  }
];

// Helper: load documents from disk or initialize
function loadDocuments() {
  try {
    if (fs.existsSync(DOCUMENTS_FILE)) {
      const data = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[HELIOS] Failed to read documents.json, falling back to defaults:', err.message);
  }
  saveDocuments(INITIAL_DOCUMENTS);
  return [...INITIAL_DOCUMENTS];
}

// Helper: persist documents to disk
function saveDocuments(docs) {
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[HELIOS] Failed to write documents.json:', err.message);
  }
}

// In-memory document store
let documents = loadDocuments();

// Helper: Format file size
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// Helper: Get GoogleGenAI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Helper: Truncate long document text safely
function prepareDocText(doc, maxChars = 50000) {
  if (doc.extractedText.length <= maxChars) {
    return {
      text: doc.extractedText,
      truncated: false,
      message: null
    };
  }
  return {
    text: doc.extractedText.substring(0, maxChars),
    truncated: true,
    message: `Note: Document exceeds 50,000 characters; the first 50,000 characters were analyzed.`
  };
}

// Helper: Call Gemini with automated retries and fallback models for high-demand / 503 spikes
async function generateWithRetry(ai, params, maxRetries = 2) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const modelToUse = models[Math.min(attempt, models.length - 1)];
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelToUse
      });
      return response;
    } catch (err) {
      lastError = err;
      const errMsg = (err.message || '').toLowerCase();
      const isTransient = errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('high demand') || errMsg.includes('429') || errMsg.includes('resource_exhausted') || errMsg.includes('overloaded');
      
      if (isTransient && attempt < maxRetries) {
        console.warn(`[HELIOS] Model ${modelToUse} busy or unavailable (${err.message}). Retrying with next model in 1.2s...`);
        await new Promise(r => setTimeout(r, 1200));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Helper: Format Gemini API errors cleanly without leaking raw JSON
function formatGeminiError(err) {
  let raw = err.message || '';
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error && parsed.error.message) {
      raw = parsed.error.message;
    }
  } catch (e) {
    // raw is not JSON
  }

  const lower = raw.toLowerCase();
  if (lower.includes('high demand') || lower.includes('503') || lower.includes('unavailable') || lower.includes('overloaded')) {
    return 'Google Gemini servers are currently experiencing high demand. Automatic retries were attempted, but the service is temporarily busy. Please wait a few seconds and try your question again.';
  }
  if (lower.includes('resource_exhausted') || lower.includes('quota') || lower.includes('429')) {
    return 'Gemini API quota or rate limit exceeded. Please wait a moment before trying again.';
  }
  if (lower.includes('api_key') || lower.includes('permission_denied') || lower.includes('authentication') || lower.includes('403')) {
    return 'Gemini API authentication required. Please attach your GEMINI_API_KEY in the Settings > Secrets panel.';
  }
  return raw || 'An unexpected error occurred while communicating with Gemini API.';
}

/* ==========================================================================
   REST API Endpoints
   ========================================================================== */

// 1. Health check & configuration status
app.get('/api/health', (req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'healthy',
    product: 'HELIOS',
    subtitle: 'AI Corporate Legal Assistant',
    version: '2.2.0',
    documentCount: documents.length,
    geminiConfigured: hasGeminiKey,
    model: 'gemini-3.8-flash',
    features: [
      'Clause-to-Action Translator',
      'Evidence-First AI Answers',
      'Before-You-Sign Checklist'
    ],
    timestamp: new Date().toISOString()
  });
});

// 2. List all documents (with metadata)
app.get('/api/documents', (req, res) => {
  const list = documents.map(d => ({
    id: d.id,
    title: d.title,
    filename: d.filename,
    fileSize: d.fileSize,
    uploadDate: d.uploadDate,
    fileType: d.fileType,
    pageCount: d.pageCount || 1,
    wordCount: d.wordCount || 0,
    category: d.category || 'General Legal',
    hasClauses: !!(d.clauseAnalysis && d.clauseAnalysis.clauses && d.clauseAnalysis.clauses.length > 0),
    hasChecklist: !!(d.checklist && d.checklist.items && d.checklist.items.length > 0),
    preview: (d.extractedText || '').substring(0, 180) + '...'
  }));
  res.json({
    success: true,
    count: list.length,
    documents: list
  });
});

// 3. Get single document with full extracted text and cached intelligence
app.get('/api/documents/:id', (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, error: 'Document not found.' });
  }
  res.json({
    success: true,
    document: doc
  });
});

// 4. Upload document (PDF & TXT supported with real text extraction)
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file was uploaded. Please select a .pdf or .txt file.'
      });
    }

    const originalName = req.file.originalname || 'document.txt';
    const ext = path.extname(originalName).toLowerCase();
    const mime = req.file.mimetype || '';

    // Validate supported file extensions
    if (ext !== '.pdf' && ext !== '.txt') {
      return res.status(400).json({
        success: false,
        error: `Unsupported file format "${ext || mime}". HELIOS currently accepts .pdf and .txt legal documents.`
      });
    }

    let extractedText = '';
    let pageCount = 1;

    // Handle PDF extraction via pdf-parse
    if (ext === '.pdf' || mime === 'application/pdf') {
      try {
        const parsed = await pdfParse(req.file.buffer);
        extractedText = (parsed.text || '').trim();
        pageCount = parsed.numpages || 1;

        if (!extractedText || extractedText.length < 10) {
          return res.status(400).json({
            success: false,
            error: 'Could not extract text from this PDF. It may be a scanned image or empty. Please upload a PDF with selectable text or a .txt file.'
          });
        }
      } catch (pdfErr) {
        return res.status(400).json({
          success: false,
          error: 'Failed to parse PDF document. The file may be password-protected or corrupted: ' + pdfErr.message
        });
      }
    } else {
      // Handle TXT extraction
      extractedText = req.file.buffer.toString('utf-8').trim();
      if (!extractedText) {
        return res.status(400).json({
          success: false,
          error: 'The uploaded text file is empty. Please upload a valid document containing text.'
        });
      }
      const words = extractedText.split(/\s+/).length;
      pageCount = Math.max(1, Math.ceil(words / 400));
    }

    const words = extractedText.split(/\s+/).filter(Boolean).length;
    const cleanTitle = (req.body.title && req.body.title.trim())
      ? req.body.title.trim()
      : originalName.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ');

    const newDoc = {
      id: 'doc_' + Date.now(),
      title: cleanTitle,
      filename: originalName,
      fileSize: formatBytes(req.file.size),
      uploadDate: new Date().toISOString().split('T')[0],
      fileType: ext.replace('.', ''),
      pageCount,
      wordCount: words,
      category: req.body.category || 'Uploaded Document',
      extractedText,
      clauseAnalysis: null,
      checklist: null
    };

    // Store in-memory and persist to disk
    documents.unshift(newDoc);
    saveDocuments(documents);

    res.json({
      success: true,
      message: 'Document uploaded and text extracted successfully.',
      document: {
        id: newDoc.id,
        title: newDoc.title,
        filename: newDoc.filename,
        fileSize: newDoc.fileSize,
        uploadDate: newDoc.uploadDate,
        fileType: newDoc.fileType,
        pageCount: newDoc.pageCount,
        wordCount: newDoc.wordCount,
        category: newDoc.category,
        preview: newDoc.extractedText.substring(0, 180) + '...'
      }
    });
  } catch (err) {
    console.error('[HELIOS] Upload error:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred during document processing: ' + err.message
    });
  }
});

// 5. Delete document
app.delete('/api/documents/:id', (req, res) => {
  const index = documents.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Document not found.' });
  }

  const removed = documents.splice(index, 1)[0];
  saveDocuments(documents);

  res.json({
    success: true,
    message: `Document "${removed.title}" deleted successfully.`
  });
});

/* ==========================================================================
   FEATURE 1: Clause-to-Action Translator
   ========================================================================== */
app.post('/api/documents/:id/clauses', async (req, res) => {
  try {
    const doc = documents.find(d => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const forceRefresh = !!req.body.forceRefresh;

    // Use cached clause analysis if already available and no force refresh requested
    if (doc.clauseAnalysis && doc.clauseAnalysis.clauses && doc.clauseAnalysis.clauses.length > 0 && !forceRefresh) {
      return res.json({
        success: true,
        documentId: doc.id,
        documentTitle: doc.title,
        summary: doc.clauseAnalysis.summary,
        clauses: doc.clauseAnalysis.clauses,
        truncated: doc.clauseAnalysis.truncated || false,
        truncationMessage: doc.clauseAnalysis.truncationMessage || null,
        disclaimer: "HELIOS analysis is informational assistance and does not constitute formal legal advice."
      });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in Settings > Secrets to enable Clause-to-Action translation.'
      });
    }

    const { text, truncated, message: truncMsg } = prepareDocText(doc, 50000);

    const systemInstruction = `You are the HELIOS Clause-to-Action Translator, an expert corporate legal intelligence engine.
Your task is to analyze the provided legal document and translate key clauses into clear, actionable corporate intelligence.

CRITICAL GROUNDING RULES:
1. ONLY identify clauses explicitly present in the provided text.
2. DO NOT invent obligations, deadlines, penalties, or consequences absent from the text.
3. Distinguish explicitly stated contractual terms from your suggested practical next actions.
4. Extract the exact original wording or faithful supporting excerpt for each clause.
5. Provide:
   - category: One of "Payment Terms", "Contract Term & Renewal", "Termination Conditions", "Penalties & Liability", "Obligations & Deadlines", "Confidentiality & IP", "Ambiguous / Unclear Terms"
   - title: Short descriptive title
   - reference: Section number, clause title, or page reference if available
   - originalClause: Exact supporting excerpt from the document text
   - explanation: Simple English explanation of what the clause means in plain terms
   - potentialConcern: Specific risk, legal concern, or unfavorable aspect (or null if standard/balanced)
   - suggestedAction: Clear, practical next action (e.g. negotiation advice, compliance reminder, calendar alert)`;

    const prompt = `DOCUMENT: ${doc.title} (${doc.filename})
PAGES: ${doc.pageCount}
WORDS: ${doc.wordCount}

=== EXTRACTED TEXT START ===
${text}
=== EXTRACTED TEXT END ===

Extract 4 to 8 of the most critical clauses covering:
- Obligations and Deadlines
- Payment and Invoicing Terms
- Termination Conditions
- Penalties, Liabilities, or Indemnities
- Restrictive or Unclear Wording

Return ONLY a valid JSON object matching the requested schema.`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Brief 1-2 sentence overview of the document clause architecture'
            },
            clauses: {
              type: Type.ARRAY,
              description: 'List of translated clauses',
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  reference: { type: Type.STRING },
                  originalClause: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  potentialConcern: { type: Type.STRING, nullable: true },
                  suggestedAction: { type: Type.STRING }
                },
                required: ['category', 'title', 'reference', 'originalClause', 'explanation', 'suggestedAction']
              }
            }
          },
          required: ['summary', 'clauses']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Cache on the document
    doc.clauseAnalysis = {
      summary: parsedData.summary || 'Clause-to-action analysis complete.',
      clauses: parsedData.clauses || [],
      analyzedAt: new Date().toISOString(),
      truncated,
      truncationMessage: truncMsg
    };
    saveDocuments(documents);

    res.json({
      success: true,
      documentId: doc.id,
      documentTitle: doc.title,
      summary: doc.clauseAnalysis.summary,
      clauses: doc.clauseAnalysis.clauses,
      truncated,
      truncationMessage: truncMsg,
      disclaimer: "HELIOS analysis is informational assistance and does not constitute formal legal advice."
    });

  } catch (err) {
    console.error('[HELIOS] Clause translation error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Clause-to-Action analysis: ' + formatGeminiError(err)
    });
  }
});

/* ==========================================================================
   FEATURE 2: Evidence-First AI Answers (POST /api/chat)
   ========================================================================== */
app.post('/api/chat', async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please select a document to analyze.'
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a question to ask HELIOS.'
      });
    }

    const doc = documents.find(d => d.id === documentId);
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'Selected document was not found.'
      });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in Settings > Secrets to enable Evidence-First AI answers.'
      });
    }

    const { text, truncated, message: truncMsg } = prepareDocText(doc, 50000);

    const systemInstruction = `You are HELIOS, an Evidence-First Corporate Legal Assistant.
Your core principle is that EVERY substantive legal answer MUST be strictly supported by verifiable excerpts from the provided document.

CRITICAL INSTRUCTIONS:
1. Ground your answers SOLELY in the document text provided below.
2. DO NOT invent, assume, or extrapolate facts, clauses, dates, names, or numbers.
3. NEVER fabricate quotations, section references, or contractual terms.
4. If the document does not contain sufficient evidence to answer the question, set "isFound" to false, set "answer" to "Not found in the provided document.", and explain briefly what was searched for.
5. In "evidence", provide the exact supporting quotation(s) from the document text.
6. In "reference", cite the specific Section number, Clause title, or Paragraph (e.g., "Section 4. DURATION AND TERM", "Clause 2(b)"). If not identifiable, state "Document Body".
7. Deliver a clean, professional, plain English "answer" that directly addresses the user's inquiry.`;

    const userPrompt = `DOCUMENT TITLE: ${doc.title}
FILENAME: ${doc.filename}
TOTAL PAGES: ${doc.pageCount}
TOTAL WORDS: ${doc.wordCount}

=== EXTRACTED TEXT START ===
${text}
=== EXTRACTED TEXT END ===

USER QUESTION:
${question.trim()}

Return a valid JSON object matching the requested schema.`;

    const response = await generateWithRetry(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFound: {
              type: Type.BOOLEAN,
              description: 'True if sufficient supporting evidence exists in document text, False otherwise'
            },
            answer: {
              type: Type.STRING,
              description: 'Clear, plain English explanation answering the question'
            },
            evidence: {
              type: Type.STRING,
              description: 'Exact supporting excerpt(s) quoted from the document'
            },
            reference: {
              type: Type.STRING,
              description: 'Specific Section number, Clause heading, or Page reference'
            }
          },
          required: ['isFound', 'answer', 'evidence', 'reference']
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || '{}');

    res.json({
      success: true,
      documentId: doc.id,
      documentTitle: doc.title,
      question: question.trim(),
      isFound: parsedResponse.isFound !== false,
      answer: parsedResponse.answer || 'Not found in the provided document.',
      evidence: parsedResponse.evidence || 'No verbatim excerpt found.',
      reference: parsedResponse.reference || 'N/A',
      truncated,
      truncationMessage: truncMsg,
      disclaimer: "HELIOS provides informational legal document assistance for college demonstration purposes only and does not constitute formal legal advice."
    });

  } catch (err) {
    console.error('[HELIOS] Evidence-First Chat error:', err);
    res.status(500).json({
      success: false,
      error: formatGeminiError(err)
    });
  }
});

/* ==========================================================================
   FEATURE 3: Before-You-Sign Checklist
   ========================================================================== */
app.post('/api/documents/:id/checklist', async (req, res) => {
  try {
    const doc = documents.find(d => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const forceRefresh = !!req.body.forceRefresh;

    // Use cached checklist if already available and no force refresh requested
    if (doc.checklist && doc.checklist.items && doc.checklist.items.length > 0 && !forceRefresh) {
      return res.json({
        success: true,
        documentId: doc.id,
        documentTitle: doc.title,
        overallAssessment: doc.checklist.overallAssessment,
        items: doc.checklist.items,
        truncated: doc.checklist.truncated || false,
        truncationMessage: doc.checklist.truncationMessage || null,
        disclaimer: "HELIOS review checklist is informational assistance and does not constitute formal legal advice."
      });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in Settings > Secrets to generate the review checklist.'
      });
    }

    const { text, truncated, message: truncMsg } = prepareDocText(doc, 50000);

    const systemInstruction = `You are the HELIOS "Before-You-Sign" Contract Review Auditor.
Generate a compact, rigorous checklist evaluating standard commercial/legal contract essentials based exclusively on the provided document text.

STATUS VALUES RULES:
- "Found": The term/condition is clearly defined in the text with adequate detail.
- "Needs Review": The term exists but has ambiguities, one-sided terms, missing specifics, or notable risks that require attorney or management review.
- "Not Found": The term is completely absent from the text, and a standard contract of this nature typically includes it. (Use only when the text provides a sufficient basis for this conclusion).
- "Unable to Verify": The available document excerpt is insufficient or silent without enough context to be certain.

Cover these 6 core dimensions:
1. Payment & Invoicing Terms (rates, due dates, taxes, late fees)
2. Contract Duration & Renewal (term length, automatic renewal windows, expiry)
3. Termination Conditions (termination for convenience vs cause, notice period)
4. Penalties & Liability Caps (limitation of liability, indemnities, liquidated damages)
5. Key Obligations & Deliverables (core duties, performance milestones, SLAs)
6. Missing, Ambiguous, or Unclear Information (governing law, dispute forum, IP assignment, data privacy)`;

    const prompt = `DOCUMENT: ${doc.title} (${doc.filename})
PAGES: ${doc.pageCount}
WORDS: ${doc.wordCount}

=== EXTRACTED TEXT START ===
${text}
=== EXTRACTED TEXT END ===

Evaluate the document and generate a 6-item "Before-You-Sign" checklist. Return ONLY valid JSON.`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallAssessment: {
              type: Type.STRING,
              description: '1-2 sentence executive summary of contract readiness'
            },
            items: {
              type: Type.ARRAY,
              description: 'Checklist items',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    description: 'One of: "Found", "Needs Review", "Not Found", "Unable to Verify"'
                  },
                  details: { type: Type.STRING },
                  reference: { type: Type.STRING },
                  excerpt: { type: Type.STRING }
                },
                required: ['id', 'category', 'title', 'status', 'details', 'reference']
              }
            }
          },
          required: ['overallAssessment', 'items']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    doc.checklist = {
      overallAssessment: parsed.overallAssessment || 'Checklist generated.',
      items: (parsed.items || []).map((item, idx) => ({
        ...item,
        id: item.id || `chk_${idx + 1}`,
        reviewed: false
      })),
      generatedAt: new Date().toISOString(),
      truncated,
      truncationMessage: truncMsg
    };
    saveDocuments(documents);

    res.json({
      success: true,
      documentId: doc.id,
      documentTitle: doc.title,
      overallAssessment: doc.checklist.overallAssessment,
      items: doc.checklist.items,
      truncated,
      truncationMessage: truncMsg,
      disclaimer: "HELIOS review checklist is informational assistance and does not constitute formal legal advice."
    });

  } catch (err) {
    console.error('[HELIOS] Checklist generation error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Before-You-Sign checklist: ' + formatGeminiError(err)
    });
  }
});

// Update checklist item review status
app.patch('/api/documents/:id/checklist/:itemId', (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc || !doc.checklist || !Array.isArray(doc.checklist.items)) {
    return res.status(404).json({ success: false, error: 'Checklist not found.' });
  }

  const item = doc.checklist.items.find(i => i.id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Checklist item not found.' });
  }

  item.reviewed = typeof req.body.reviewed === 'boolean' ? req.body.reviewed : !item.reviewed;
  saveDocuments(documents);

  res.json({
    success: true,
    item
  });
});

// Backward-compatible alias
app.post('/api/documents/:id/chat', (req, res) => {
  req.body.documentId = req.params.id;
  app._router.handle({ ...req, url: '/api/chat', method: 'POST' }, res);
});

module.exports = app;
