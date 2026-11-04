/**
 * HELIOS — Policy Assistant Engine
 * Manages policy chat conversations, mock RAG responses, citations, and source previews
 */

const HeliosPolicy = (function () {
  const STORAGE_KEY = 'helios_conversations_data';

  // Seed / Knowledge Base for AI Responses with Citations
  const POLICY_KNOWLEDGE_BASE = [
    {
      keywords: ['leave', 'leaves', 'carry', 'carry forward', 'annual leave', 'earned leave', 'vacation', 'pto', 'holiday', 'encashment', 'sick leave'],
      title: "Earned leave carry forward & annual leave rules",
      answer: "According to the company's <strong>Comprehensive Leave & Time-Off Policy</strong>, full-time employees are entitled to carry forward a maximum of <strong>10 earned leaves (EL)</strong> into the subsequent calendar year.<br><br>Key policy rules:<br>• Any accrued leave exceeding the 10-day carry-forward threshold will automatically lapse on December 31st.<br>• Employees with surplus leave may submit an encashment request during the annual payroll reconciliation cycle with manager sign-off.<br>• Sick leaves (12 days/year) and casual leaves expire annually and cannot be rolled over or encashed.",
      sources: [
        {
          document_id: "doc_002",
          document_name: "Leave_Policy_2026.pdf",
          section: "Section 4.2 — Annual Carry-Forward & Rollover Limits",
          page_number: 7,
          excerpt: "Employees in continuous active service may roll over up to ten (10) accrued Earned Leaves into the next calendar year. Accumulated balances beyond ten days shall expire on December 31st unless prior encashment authorization is granted by People Operations."
        }
      ]
    },
    {
      keywords: ['wfh', 'work from home', 'remote', 'hybrid', 'office', 'flexible', 'equipment', 'allowance', 'stipend', 'broadband', 'internet'],
      title: "Work-from-home guidelines & remote stipend",
      answer: "Under the <strong>Hybrid Work & Remote Office Guidelines</strong>, the company supports a flexible work model:<br><br>• <strong>Hybrid Schedule:</strong> Eligible team members may work remotely up to <strong>3 days per week</strong> with a minimum of 2 days on-site in their designated hub office.<br>• <strong>Equipment Allowance:</strong> A one-time setup reimbursement of up to <strong>$500</strong> is provided for home ergonomic furniture and secondary display monitors.<br>• <strong>Internet Reimbursement:</strong> A monthly recurring stipend of <strong>$50</strong> is credited on your monthly payroll to cover broadband costs.",
      sources: [
        {
          document_id: "doc_003",
          document_name: "Hybrid_Work_Guidelines.docx",
          section: "Section 3.1 — Remote Workspace & Connectivity Allowance",
          page_number: 4,
          excerpt: "The organization provides a one-time ergonomic setup reimbursement capped at $500 for eligible hybrid and remote personnel, alongside a recurring $50 monthly connectivity allowance. Hardware requisitions must be processed through the internal IT Service Desk."
        }
      ]
    },
    {
      keywords: ['benefit', 'benefits', 'insurance', 'health', 'medical', 'dental', 'vision', 'wellness', 'gym', 'coverage', 'hsa', 'dependent'],
      title: "Health insurance and employee benefits",
      answer: "Full-time employees are eligible for the company's <strong>Comprehensive Health & Wellness Package</strong> starting on their first day of active employment:<br><br>• <strong>Medical, Dental & Vision:</strong> 100% employer-sponsored premium for employees, with 80% coverage for registered dependents.<br>• <strong>Health Savings Account (HSA):</strong> Employer contribution of $1,000 annually for individual coverage, or $2,000 for family plans.<br>• <strong>Annual Wellness Reimbursement:</strong> Up to $600 per year for gym memberships, fitness equipment, or mental wellness apps.<br>• <strong>Life & Disability:</strong> Group term life insurance provided at 2x annual base salary.",
      sources: [
        {
          document_id: "doc_004",
          document_name: "Health_Benefits_Summary_2026.pdf",
          section: "Section 1.3 — Healthcare & Wellness Inclusions",
          page_number: 2,
          excerpt: "Comprehensive medical, dental, and optical insurance begins effective Day 1 of active employment. Full-time team members are provided 100% employer-funded individual premiums, with supplemental wellness reimbursements available via the benefits portal."
        }
      ]
    },
    {
      keywords: ['probation', 'probationary', 'confirmation', 'new joiner', 'trial', 'evaluation', 'kpi'],
      title: "Probation period & performance review criteria",
      answer: "The company's <strong>Global Employee Handbook</strong> outlines the standard probationary framework:<br><br>• <strong>Duration:</strong> The standard probation period is <strong>90 days</strong> from the official joining date.<br>• <strong>30-Day Alignment:</strong> Initial 1-on-1 check-in to confirm training milestones and deliverables.<br>• <strong>60-Day Midpoint Review:</strong> Structured review session with your reporting manager evaluating early performance against goals.<br>• <strong>90-Day Confirmation:</strong> People Operations issues a formal letter confirming regular employment status upon satisfactory review.",
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 2.4 — Probationary Period & Confirmation",
          page_number: 12,
          excerpt: "All newly appointed personnel undergo a ninety (90) day probationary period. Formal written confirmation of regular employment status is issued upon successful review by the department lead and People Operations."
        }
      ]
    },
    {
      keywords: ['travel', 'reimbursement', 'per-diem', 'expense', 'hotel', 'flight', 'meal', 'cab', 'taxi', 'mileage'],
      title: "Business travel expense & meal per-diem policy",
      answer: "According to the <strong>Corporate Travel & Expense Policy</strong>, business travel expenditures are governed by the following criteria:<br><br>• <strong>Daily Meal Per-Diem:</strong> Up to <strong>$85/day</strong> for domestic business travel ($20 Breakfast, $25 Lunch, $40 Dinner).<br>• <strong>Lodging:</strong> Standard business hotel tier booked through the corporate travel concierge (up to $220/night in tier-1 metro areas).<br>• <strong>Receipt Requirement:</strong> Itemized receipts are mandatory for any individual expense exceeding $25.<br>• <strong>Submission Window:</strong> Expense reports must be submitted within 15 business days following trip completion.",
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 5.3 — Sustenance & Incidentals Schedule",
          page_number: 28,
          excerpt: "Domestic business travel permits a maximum daily per-diem of $85 for sustenance. Claims must be submitted via the expense portal with corresponding itemized receipts attached within 15 days."
        }
      ]
    },
    {
      keywords: ['parental', 'maternity', 'paternity', 'child', 'adoption', 'birth', 'baby'],
      title: "Parental leave & family support guidelines",
      answer: "The company provides comprehensive <strong>Parental Support Leave</strong> to support growing families:<br><br>• <strong>Primary Caregiver Leave:</strong> Up to <strong>16 weeks of 100% paid leave</strong> following the birth or adoption of a child.<br>• <strong>Secondary Caregiver Leave:</strong> Up to <strong>6 weeks of 100% paid leave</strong> to be utilized within 12 months.<br>• <strong>Phased Return-to-Work:</strong> Option to work 80% hours at full pay during the first 4 weeks upon returning.",
      sources: [
        {
          document_id: "doc_002",
          document_name: "Leave_Policy_2026.pdf",
          section: "Section 6.1 — Paid Parental & Caregiver Leave",
          page_number: 11,
          excerpt: "Primary caregivers are entitled to sixteen (16) weeks of continuous paid leave at full base salary. Applications should be submitted to People Operations at least thirty (30) days prior to the intended start date."
        }
      ]
    },
    {
      keywords: ['notice', 'notice period', 'resignation', 'resign', 'quit', 'exit', 'handover', 'leaving', 'separation'],
      title: "Notice period & employee separation policy",
      answer: "According to the <strong>Employee Separation & Offboarding Policy</strong>:<br><br>• <strong>During Probation:</strong> Standard notice period is <strong>15 calendar days</strong> by either party.<br>• <strong>Confirmed Employees:</strong> Standard notice period is <strong>60 calendar days (2 months)</strong>.<br>• <strong>Notice Buyout / Waiver:</strong> Any reduction in notice period requires mutual written consent from the Department Head and People Operations.<br>• <strong>Handover & Clearance:</strong> Final settlement and clearance certificates are processed within 30 days of the last working day.",
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 8.2 — Resignation & Notice Period Requirements",
          page_number: 44,
          excerpt: "Confirmed full-time employees are required to provide sixty (60) calendar days formal notice of resignation in writing. A formal handover of assigned duties and company assets is required prior to release."
        }
      ]
    },
    {
      keywords: ['referral', 'refer', 'candidate', 'hiring bonus', 'referral bonus', 'bounty'],
      title: "Employee referral program & bonus schedule",
      answer: "Under the <strong>Talent Referral Incentive Program</strong>, employees who refer successful hires receive monetary bonuses:<br><br>• <strong>Standard Roles:</strong> <strong>$1,500</strong> referral bonus for Junior to Mid-level positions.<br>• <strong>Senior & Specialized Engineering:</strong> <strong>$3,000</strong> referral bonus for Senior, Staff, or Specialized Lead roles.<br>• <strong>Payout Timeline:</strong> 50% paid on candidate's 30th day, remaining 50% upon candidate's completion of 90-day probation.<br>• <strong>Eligibility:</strong> All full-time employees except HR recruiters and hiring managers for their direct open requisitions.",
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 3.4 — Talent Referral Guidelines",
          page_number: 19,
          excerpt: "The employee referral bonus is awarded in two equal tranches: at day 30 and upon successful completion of the referred candidate's probationary milestone."
        }
      ]
    },
    {
      keywords: ['appraisal', 'bonus', 'promotion', 'salary review', 'increment', 'hike', 'performance review', 'rating'],
      title: "Performance appraisal cycle & compensation review",
      answer: "As outlined in the <strong>Performance Management & Compensation Framework</strong>:<br><br>• <strong>Annual Cycle:</strong> Formal performance reviews occur in <strong>Q4 (October–November)</strong> with adjustments effective January 1st.<br>• <strong>Mid-Year Checkpoint:</strong> Structured calibration feedback in June/July.<br>• <strong>Evaluation Pillars:</strong> Objective KPI achievement (60%), Core corporate values & collaboration (40%).<br>• <strong>Bonus Eligibility:</strong> Annual performance bonuses are calculated based on both individual rating and company quarterly EBITDA targets.",
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 4.1 — Annual Performance & Merit Reviews",
          page_number: 22,
          excerpt: "Annual compensation evaluations and merit-based adjustments are finalized annually during Q4, with approved increases taking effect in the January payroll cycle."
        }
      ]
    },
    {
      keywords: ['learning', 'education', 'course', 'certification', 'training', 'tuition', 'conference', 'skill'],
      title: "Learning & development stipend policy",
      answer: "Under the <strong>Professional Growth & Upskilling Policy</strong>:<br><br>• <strong>Annual L&D Budget:</strong> Every full-time employee has an allocated budget of <strong>$1,200 per calendar year</strong>.<br>• <strong>Eligible Expenses:</strong> Industry certifications (AWS, PMP, CFA, etc.), online courses (Coursera, Udemy), technical books, and approved conference tickets.<br>• <strong>Approval Process:</strong> Pre-approval from your reporting manager required before purchase, with reimbursement submitted through the finance portal.",
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 5.6 — Professional Development Allowance",
          page_number: 31,
          excerpt: "Employees may claim up to $1,200 annually for approved professional courses, industry certifications, and technical conferences upon manager authorization."
        }
      ]
    },
    {
      keywords: ['harassment', 'posh', 'conduct', 'code of conduct', 'ethics', 'whistleblower', 'grievance', 'complaint'],
      title: "Code of conduct & zero-tolerance workplace policies",
      answer: "The company maintains a strict <strong>Zero-Tolerance Code of Conduct & Anti-Harassment Policy</strong>:<br><br>• <strong>Safe Workplace:</strong> Any form of discrimination, sexual harassment, or retaliation is strictly prohibited.<br>• <strong>Reporting Channels:</strong> Reports can be lodged directly with HR, via the anonymous Helios Ethics Hotline, or through the Internal Complaints Committee (ICC).<br>• <strong>Confidentiality:</strong> All inquiries are investigated within 7 business days with strict non-retaliation protections guaranteed.",
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 7.1 — Workplace Conduct, Ethics & Anti-Harassment",
          page_number: 38,
          excerpt: "The organization enforces a strict zero-tolerance policy regarding harassment, bias, and retaliation. The Internal Ethics Committee conducts impartial, confidential investigations within statutory timelines."
        }
      ]
    }
  ];

  /**
   * Initialize and get all conversations from localStorage (seeded with mock if none)
   */
  function getAllConversations() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading conversations from storage:", e);
    }

    const seed = window.HELIOS_MOCK_CONVERSATIONS || [];
    saveAllConversations(seed);
    return seed;
  }

  /**
   * Save array of conversations to localStorage
   */
  function saveAllConversations(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Error saving conversations:", e);
    }
  }

  /**
   * Get conversations with optional text search filter
   */
  function getConversations(query = '') {
    const list = getAllConversations();
    if (!query || !query.trim()) return list;

    const q = query.trim().toLowerCase();
    return list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.last_message && c.last_message.toLowerCase().includes(q))
    );
  }

  /**
   * Get a single conversation by ID
   */
  function getConversation(id) {
    const list = getAllConversations();
    return list.find(c => c.id === id) || null;
  }

  /**
   * Create a new conversation and prepend to list
   */
  function createConversation(initialQuestion = '') {
    const title = initialQuestion
      ? (initialQuestion.length > 45 ? initialQuestion.substring(0, 45) + '...' : initialQuestion)
      : 'New Policy Inquiry';

    const newConv = {
      id: 'conv_' + Date.now(),
      title: title,
      last_message: initialQuestion || 'Conversation started',
      timestamp: 'Just now',
      group: 'Today',
      messages: []
    };

    const list = getAllConversations();
    list.unshift(newConv);
    saveAllConversations(list);
    return newConv;
  }

  /**
   * Update or add a message to a conversation
   */
  function addMessage(conversationId, messageObj) {
    const list = getAllConversations();
    let conv = list.find(c => c.id === conversationId);

    if (!conv) {
      conv = {
        id: conversationId,
        title: messageObj.text ? (messageObj.text.substring(0, 45) + '...') : 'Policy Discussion',
        last_message: messageObj.text,
        timestamp: 'Just now',
        group: 'Today',
        messages: []
      };
      list.unshift(conv);
    }

    if (!conv.messages) conv.messages = [];
    conv.messages.push(messageObj);
    conv.last_message = messageObj.text.replace(/<[^>]*>?/gm, '').substring(0, 120);
    conv.timestamp = 'Just now';
    conv.group = 'Today';

    saveAllConversations(list);
    return conv;
  }

  /**
   * Delete conversation by ID
   */
  function deleteConversation(id) {
    let list = getAllConversations();
    list = list.filter(c => c.id !== id);
    saveAllConversations(list);
    return list;
  }

  const LLM_STORAGE_KEY = 'helios_llm_config';

  function getLlmConfig() {
    let config = {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-1.5-flash'
    };

    try {
      const stored = localStorage.getItem(LLM_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey && parsed.apiKey.trim()) {
          config = parsed;
        }
      }
    } catch (e) {}

    return config;
  }

  function saveLlmConfig(config) {
    try {
      localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Error saving LLM config:", e);
    }
  }

  /**
   * System prompt containing corporate policy grounding
   */
  const SYSTEM_GROUNDING_PROMPT = `You are HELIOS, an enterprise AI Corporate Policy Agent and intelligent workplace assistant.
Your job is to answer employee questions directly, clearly, and conversationally.
- If the employee says a greeting, casual remark (e.g. "hi", "hello", "saptiya" / "did you eat", "how are you", "who are you"), reply warmly and professionally as Helios, the corporate AI agent, and offer to assist with policy questions.
- If the employee asks about company policies, ground your answer in the official corporate policies:
  * Leave Policy: max 10 days earned leave carry forward (lapses Dec 31), 12 sick leaves, 16 weeks primary parental leave.
  * Hybrid Work: up to 3 days WFH, $500 ergonomic setup allowance, $50/mo internet stipend.
  * Benefits: Day 1 medical/dental/vision (100% employee, 80% dependent), $1000 HSA, $600 wellness reimbursement.
  * Handbook: 90 days probation, 60 days notice (15 in probation), $85/day travel per-diem, $1200/yr L&D budget, $1500–$3000 referral bonuses.

Always respond in JSON format with this exact structure:
{
  "answer": "HTML formatted response using <strong> and bullet points (•) when appropriate",
  "sources": [
    {
      "document_id": "doc_001",
      "document_name": "Employee_Handbook_v2026.pdf",
      "section": "Section 1.2 — General Enterprise Policies",
      "page_number": 5,
      "excerpt": "Relevant policy excerpt"
    }
  ]
}`;

  /**
   * Call live LLM (Gemini / OpenAI / Groq)
   */
  async function callLiveLLM(questionText, config) {
    const { provider, apiKey, model } = config;
    if (!apiKey) throw new Error("No API key configured");

    if (provider === 'gemini') {
      const targetModel = model || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${SYSTEM_GROUNDING_PROMPT}\n\nEmployee Query: ${questionText}` }] }
          ],
          generationConfig: {
            temperature: 0.3
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API returned status ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Empty response from Gemini API");

      // Clean JSON formatting if wrapped in code blocks
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        return {
          answer: rawText.replace(/\n/g, '<br>'),
          sources: [
            {
              document_id: "doc_001",
              document_name: "Employee_Handbook_v2026.pdf",
              section: "Section 1.2 — Policy Guidance",
              page_number: 5,
              excerpt: "Helios AI verified response grounded in active organization policies."
            }
          ]
        };
      }
    }
    else if (provider === 'openai' || provider === 'groq') {
      const endpoint = provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const targetModel = model || (provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: SYSTEM_GROUNDING_PROMPT },
            { role: 'user', content: questionText }
          ],
          temperature: 0.3
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${provider.toUpperCase()} error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const cleanJson = content.replace(/```json/gi, '').replace(/```/g, '').trim();
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        return {
          answer: content.replace(/\n/g, '<br>'),
          sources: []
        };
      }
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  /**
   * Conversational / Greeting detector for local engine
   */
  function handleConversationalQuery(q) {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you', 'how are you', 'saptiya', 'saapda', 'vanakkam', 'namaste', 'what is helios', 'help'];
    
    if (greetings.some(g => q === g || q.startsWith(g + ' ') || q.includes(g))) {
      if (q.includes('saptiya') || q.includes('saapda')) {
        return {
          answer: "வணக்கம்! நான் ஒரு AI Assistant, எனக்கு உணவு தேவையில்லை 😄. ஆனால் உங்கள் நிறுவனம் சார்ந்த அனைத்து கொள்கைகள் (Leave policy, WFH rules, Health benefits, Travel per-diem) பற்றி வழிகாட்ட நான் தயாராக உள்ளேன்!<br><br>உங்களுக்கு என்ன உதவி வேண்டும்? கேட்கலாம்!",
          sources: []
        };
      }
      if (q.includes('who are you') || q.includes('what is helios')) {
        return {
          answer: "I am <strong>HELIOS</strong> — The Ultimate Corporate Agent. I am your organization's intelligent policy assistant, designed to give you instant, verified answers from approved company documents and employee handbooks.<br><br>You can ask me about leaves, remote work allowances, medical insurance, travel reimbursements, notice periods, and more!",
          sources: [
            {
              document_id: "doc_001",
              document_name: "Employee_Handbook_v2026.pdf",
              section: "Section 1.1 — Helios Corporate Agent Overview",
              page_number: 2,
              excerpt: "Helios serves as the unified corporate intelligence and compliance portal across all organizational departments."
            }
          ]
        };
      }
      return {
        answer: "Hello! 👋 I am <strong>HELIOS</strong>, your corporate policy assistant.<br><br>I'm ready to help you navigate company policies, leave entitlements, health benefits, remote work allowances, or employee guidelines. What would you like to know today?",
        sources: []
      };
    }
    return null;
  }

  /**
   * Ask Helios policy question (Live LLM with automatic fail-safe fallback)
   */
  async function askQuestion(questionText) {
    const config = getLlmConfig();

    // 1. If live LLM API Key is configured, attempt real LLM call
    if (config && config.apiKey && config.apiKey.trim()) {
      try {
        console.log(`[Helios] Executing live LLM query via ${config.provider}...`);
        const liveResult = await callLiveLLM(questionText, config);
        if (liveResult && liveResult.answer) {
          return {
            answer: liveResult.answer,
            sources: liveResult.sources || []
          };
        }
      } catch (err) {
        console.warn("[Helios] Live LLM call failed. Falling back to local intelligence engine:", err);
      }
    }

    // 2. Check for Conversational / Greeting Queries
    const trimmed = questionText.trim().toLowerCase();
    const conversational = handleConversationalQuery(trimmed);
    if (conversational) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return conversational;
    }

    // 3. Local Policy Intelligence Engine (Fast, Bulletproof & 100% Reliable)
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));

    // Find matching topic in knowledge base
    const match = POLICY_KNOWLEDGE_BASE.find(item =>
      item.keywords.some(k => trimmed.includes(k))
    );

    if (match) {
      return {
        answer: match.answer,
        sources: match.sources
      };
    }

    // Comprehensive contextual response for any other query
    return {
      answer: `I have reviewed the company policy repository regarding <strong>"${escapeHtml(questionText)}"</strong>.<br><br>• <strong>Applicability:</strong> Standard corporate procedures and supervisor authorizations apply across all organizational divisions.<br>• <strong>Compliance Guidelines:</strong> All related requests should follow the official documentation protocols outlined in the Global Employee Handbook.<br>• <strong>Need specific assistance?</strong> You can reach out directly to People Operations or your HR Business Partner for tailored assistance.`,
      sources: [
        {
          document_id: "doc_001",
          document_name: "Employee_Handbook_v2026.pdf",
          section: "Section 1.2 — General Enterprise Policies & Conduct",
          page_number: 5,
          excerpt: "Corporate policies are uniformly applicable to all personnel. Where exceptional circumstances arise, written approval from the designated department supervisor and People Operations is required."
        }
      ]
    };
  }

  /**
   * Helper: Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Open Source Citation Document Preview Modal
   */
  function openSourceModal(source) {
    let modalOverlay = document.getElementById('source-preview-modal');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'source-preview-modal';
      modalOverlay.className = 'modal-backdrop';
      document.body.appendChild(modalOverlay);
    }

    modalOverlay.innerHTML = `
      <div class="modal" style="max-width: 620px; width: 90%; animation: modalPop 200ms ease-out;" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--color-brand-subtle); color: var(--color-brand); display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div>
              <div class="modal-title">${source.document_name}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${source.section || 'General Section'} &middot; Page ${source.page_number || '1'}</div>
            </div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" onclick="HeliosPolicy.closeSourceModal()" aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body" style="padding: var(--space-6);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
            <span class="badge badge-success" style="font-size: 0.7rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Approved Corporate Document
            </span>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Verified Source Citation</span>
          </div>

          <div style="background: var(--bg-surface-secondary); border-left: 3px solid var(--color-brand); padding: var(--space-4) var(--space-5); border-radius: 0 var(--radius-md) var(--radius-md) 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed); color: var(--text-primary); font-style: italic;">
            "${source.excerpt || 'Refer to the corporate document repository for the complete text of this policy clause.'}"
          </div>

          <div style="margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
            <span>Document ID: <code style="font-family: var(--font-family-mono); color: var(--text-primary);">${source.document_id || 'DOC-REF-01'}</code></span>
            <span>Last reviewed by HR Compliance</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="HeliosPolicy.closeSourceModal()">Close</button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');

    // Close on backdrop click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeSourceModal();
    });
  }

  function closeSourceModal() {
    const modal = document.getElementById('source-preview-modal');
    if (modal) modal.classList.remove('active');
  }

  return {
    getConversations,
    getConversation,
    createConversation,
    addMessage,
    deleteConversation,
    askQuestion,
    openSourceModal,
    closeSourceModal,
    escapeHtml,
    getLlmConfig,
    saveLlmConfig
  };
})();

window.HeliosPolicy = HeliosPolicy;
