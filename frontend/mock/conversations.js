/**
 * HELIOS — Mock Conversations Data
 * Seed conversations with message threads, timestamps, and policy source citations
 */

window.HELIOS_MOCK_CONVERSATIONS = [
  {
    id: "conv_101",
    title: "Earned leave carry forward policy",
    last_message: "According to the company's Leave Policy, employees can carry forward up to 10 earned leaves per calendar year.",
    timestamp: "Today, 10:24 AM",
    group: "Today",
    messages: [
      {
        id: "msg_101_1",
        sender: "user",
        text: "How many earned leaves can I carry forward to next year?",
        timestamp: "10:23 AM"
      },
      {
        id: "msg_101_2",
        sender: "ai",
        text: "According to the company's <strong>Leave Policy</strong>, full-time employees are entitled to carry forward a maximum of <strong>10 earned leaves (EL)</strong> into the subsequent calendar year.<br><br>Key guidelines to keep in mind:<br>• Any accumulated leave exceeding the 10-day limit will automatically lapse on December 31st.<br>• Unused leaves above the ceiling may be eligible for encashment during the annual payroll reconciliation cycle (subject to manager endorsement).<br>• Casual and sick leaves cannot be carried forward.",
        timestamp: "10:24 AM",
        sources: [
          {
            document_id: "doc_001",
            document_name: "Employee_Leave_Policy_2026.pdf",
            section: "Section 4.2 — Annual Carry-Forward Limits",
            page_number: 7,
            excerpt: "Employees in continuous active service may roll over up to ten (10) accrued Earned Leaves into the next calendar year. Accumulated balances beyond ten days shall expire unless prior encashment authorization is granted by People Operations."
          }
        ]
      }
    ]
  },
  {
    id: "conv_102",
    title: "Remote work & home office setup allowance",
    last_message: "Employees are eligible for a $500 one-time home office setup reimbursement under the Hybrid Work Policy.",
    timestamp: "Yesterday, 3:15 PM",
    group: "Yesterday",
    messages: [
      {
        id: "msg_102_1",
        sender: "user",
        text: "What equipment or stipend is provided for remote work?",
        timestamp: "3:14 PM"
      },
      {
        id: "msg_102_2",
        sender: "ai",
        text: "Under the <strong>Hybrid Work & Remote Office Guidelines</strong>, the company supports employees working in hybrid or remote capacities through the following allowances:<br><br>1. <strong>Hardware Provision:</strong> Company laptop, secondary monitor, and standard ergonomic peripherals (keyboard, mouse, headset).<br>2. <strong>One-Time Setup Reimbursement:</strong> Up to <strong>$500 (or local equivalent)</strong> for approved ergonomic desk furniture or display equipment upon joining.<br>3. <strong>Monthly Internet Stipend:</strong> A <strong>$50 monthly allowance</strong> credited directly with payroll.",
        timestamp: "3:15 PM",
        sources: [
          {
            document_id: "doc_002",
            document_name: "Hybrid_Work_Guidelines_v3.pdf",
            section: "Section 3.1 — Home Workspace Equipment",
            page_number: 4,
            excerpt: "The organization allocates a one-time setup reimbursement capped at $500 for home ergonomic equipment, alongside standard IT-supplied hardware. Expense claims must be submitted via the expense portal within 45 days of purchase."
          }
        ]
      }
    ]
  },
  {
    id: "conv_103",
    title: "Probation period review criteria",
    last_message: "The standard probation period is 90 days with a formal 60-day midpoint review.",
    timestamp: "3 days ago",
    group: "Previous 7 Days",
    messages: [
      {
        id: "msg_103_1",
        sender: "user",
        text: "What are the probation rules and evaluation timelines?",
        timestamp: "2:40 PM"
      },
      {
        id: "msg_103_2",
        sender: "ai",
        text: "The standard <strong>probation period is 90 days</strong> from your official date of joining.<br><br>The evaluation structure includes:<br>• <strong>30-Day Check-in:</strong> Informal goal-alignment meeting with your reporting manager.<br>• <strong>60-Day Midpoint Review:</strong> Formal milestone review evaluating performance against initial KPIs.<br>• <strong>90-Day Final Evaluation:</strong> People Ops issues official confirmation of regular employment status upon satisfactory review completion.",
        timestamp: "2:41 PM",
        sources: [
          {
            document_id: "doc_003",
            document_name: "Global_Employee_Handbook_2026.pdf",
            section: "Section 2.4 — Probationary Period & Confirmation",
            page_number: 12,
            excerpt: "All newly appointed personnel undergo a ninety (90) day probationary period. Formal written confirmation of employment status is issued upon successful review by the department lead and People Operations."
          }
        ]
      }
    ]
  },
  {
    id: "conv_104",
    title: "Business travel expense per-diem limits",
    last_message: "Domestic travel per-diem allows up to $85 per day for meals and incidental expenses.",
    timestamp: "Last week",
    group: "Older",
    messages: [
      {
        id: "msg_104_1",
        sender: "user",
        text: "What are the daily meal allowances during domestic business trips?",
        timestamp: "11:10 AM"
      },
      {
        id: "msg_104_2",
        sender: "ai",
        text: "According to the <strong>Corporate Travel & Expense Policy</strong>, domestic travel meal per-diems are set as follows:<br><br>• <strong>Daily Meal Cap:</strong> Up to <strong>$85/day</strong> ($20 Breakfast, $25 Lunch, $40 Dinner).<br>• <strong>Itemized Receipts:</strong> Required for any single expense above $25.<br>• <strong>Submission Deadline:</strong> All travel expense reports must be submitted within 15 business days following return.",
        timestamp: "11:11 AM",
        sources: [
          {
            document_id: "doc_004",
            document_name: "Travel_Expense_Policy_2026.docx",
            section: "Section 5.3 — Meal & Incidental Allowances",
            page_number: 9,
            excerpt: "Domestic business travel permits a maximum daily per-diem of $85 for sustenance. Alcohol and personal entertainment expenses are strictly non-reimbursable."
          }
        ]
      }
    ]
  }
];
