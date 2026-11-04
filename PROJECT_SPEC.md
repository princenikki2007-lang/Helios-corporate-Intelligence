# HELIOS — The Ultimate Corporate Agent

## 1. Project Overview

HELIOS is an AI-powered corporate intelligence platform designed to help employees and organizations access, understand, and interact with corporate knowledge.

**Tagline:** The Ultimate Corporate Agent

The first module being built is the **Internal Policy AI Portal**, where employees can securely ask questions about their company's internal policies and receive AI-generated answers based only on approved company documents.

HELIOS will later expand into additional corporate intelligence and legal validation capabilities.

---

# 2. Current Module: Internal Policy AI Portal

The current development scope is the frontend for the Internal Policy AI Portal.

Employees should be able to ask questions such as:

- How many earned leaves can I carry forward?
- What is the work-from-home policy?
- What are the probation rules?
- What benefits am I eligible for?
- What is the company's travel reimbursement policy?

The AI will eventually answer using a FastAPI backend and a Retrieval-Augmented Generation (RAG) system.

For the current phase, build the frontend using mock data and mock API responses.

---

# 3. Technology Constraints

The frontend must use only:

- HTML5
- CSS3
- Vanilla JavaScript

Do NOT use:

- React
- Vue
- Angular
- TypeScript
- Tailwind CSS
- Bootstrap
- Any frontend framework

Use modern JavaScript while keeping the code simple, readable, modular, and easy to connect to a backend later.

---

# 4. Brand Guidelines

## Product Name

**HELIOS**

## Tagline

**The Ultimate Corporate Agent**

## Naming in the UI

Use **HELIOS** as the main product name throughout the interface.

Use **The Ultimate Corporate Agent** as a supporting tagline, primarily in places such as:

- Login page
- Brand section of the sidebar
- Welcome or onboarding areas
- Marketing or product introduction sections

Do not repeat the full product name excessively throughout the application.

Preferred wording:

- Ask Helios
- Helios Assistant
- Helios Policy Assistant
- What can Helios help you with today?

Avoid generic labels such as:

- AI Bot
- Chatbot
- Policy Bot
- Ask Policy

## Brand Personality

HELIOS should feel:

- Intelligent
- Trustworthy
- Professional
- Premium
- Calm
- Corporate
- Modern
- Authoritative without feeling intimidating

The visual identity should subtly connect to the idea of **Helios** as a source of clarity, guidance, and intelligence.

Do not use an overly literal or cartoonish sun theme.

---

# 5. Main Users and Roles

The application has three roles.

## Employee

Can:

- Log in
- Access the dashboard
- Ask Helios questions about company policies
- View AI answers
- View source citations
- View conversation history
- Manage their profile

Cannot:

- Upload documents
- Manage company documents
- Access admin functionality

## HR Manager

Can:

- Access all employee features
- Upload company policy documents
- View and manage documents
- View document processing status

## Company Admin

Can:

- Access all employee and HR features
- Manage company documents
- Access future administrative functionality

---

# 6. Application Pages

## 6.1 Login

Path:

`/index.html`

Features:

- HELIOS logo or brand mark
- HELIOS as the main heading
- The Ultimate Corporate Agent tagline
- Welcome message
- Email input
- Password input
- Show/hide password functionality
- Remember me checkbox
- Forgot password link
- Login button
- Form validation
- Error state
- Loading state

Suggested login copy:

**Welcome to HELIOS**

**The Ultimate Corporate Agent**

*Your intelligent assistant for company policies and corporate knowledge.*

For now, use mock authentication.

After successful login, redirect to:

`pages/dashboard.html`

Authentication logic must be kept inside:

`js/auth.js`

---

## 6.2 Dashboard

Path:

`pages/dashboard.html`

The dashboard should include:

### Welcome Section

Display a personalized greeting.

Example:

> Good morning, [User Name] 👋
>
> What can Helios help you with today?

Supporting text:

> Ask anything about your company policies, benefits, work rules, and approved corporate information.

### Summary Cards

Display mock information such as:

- Active Policies
- My Conversations
- Helios Status

### Main Question Area

A large, visually prominent input where the employee can immediately ask a policy question.

Example placeholder:

> Ask Helios anything about leave, benefits, work policies, or company rules...

When the user submits a question, redirect to:

`policy-chat.html`

The submitted question should appear automatically in the chat.

### Popular Questions

Display clickable suggestions such as:

- How many leaves can I carry forward?
- What is the work-from-home policy?
- What benefits am I eligible for?
- What are the probation rules?

### Recent Conversations

Display a small list of recent conversations using mock data.

---

# 7. Helios Policy AI Chat

Path:

`pages/policy-chat.html`

This is the most important page in the application.

The page should provide a professional AI chat experience specifically designed for asking questions about company policies.

Use the page title:

**Ask Helios**

Suggested subtitle:

> Get clear answers from your company's approved policies and documents.

Features:

- User messages
- Helios AI messages
- Message timestamps
- Helios typing indicator
- Auto-scroll to the latest message
- Empty chat state
- Suggested questions
- New Chat button
- Multiple messages in a conversation

Example empty state:

**What can Helios help you with today?**

*Ask a question about your company's policies, benefits, work rules, or approved documents.*

For now, use mock AI responses.

All AI communication logic must be kept inside:

`js/policy.js`

---

# 8. AI Source Citations

Every Helios answer should support source citations.

A citation card should display:

- Document icon
- Document name
- Section number
- Page number
- View source button

Example:

**Leave Policy.pdf**

Section 4.2 · Page 7

View Source →

The visual design should make it clear that the Helios answer is supported by an official company policy document.

Example Helios response:

> According to the company's Leave Policy, employees can carry forward up to 10 earned leaves.

Example source:

- Leave Policy.pdf
- Section 4.2
- Page 7

The frontend should be designed to receive source data from the future backend.

Expected future response structure:

```json
{
  "answer": "According to the company's Leave Policy, employees can carry forward up to 10 earned leaves.",
  "sources": [
    {
      "document_id": "doc_123",
      "document_name": "Leave Policy.pdf",
      "section": "4.2",
      "page_number": 7
    }
  ]
}
```

---

# 9. Conversation History

Path:

`pages/conversations.html`

Use the title:

**My Conversations**

Features:

- Search conversations
- Group conversations by date
- Today
- Yesterday
- Previous 7 Days
- Older
- Open a previous conversation
- Delete a conversation
- Create a new conversation

Each conversation should display:

- Conversation title
- Last message preview
- Last updated time

Use mock data for now.

---

# 10. Documents Management

Path:

`pages/documents.html`

This page must only be visible to HR Managers and Company Admins.

Features:

- Page heading
- Upload Document button
- Search documents
- Filter by document type
- Filter by status
- Document list or table

Each document should display:

- Document name
- Document type
- Version
- Status
- Last updated date
- Processing status
- Actions menu

Possible document statuses:

- Processing
- Active
- Failed
- Archived

Use mock data initially.

---

# 11. Upload Document

Path:

`pages/upload-document.html`

Create a three-step document upload process.

## Step 1 — Upload File

Features:

- Drag and drop area
- Choose file button
- PDF validation
- DOCX validation
- File size validation
- Selected file preview

## Step 2 — Document Details

Fields:

- Document title
- Document type
- Version
- Effective date

## Step 3 — Review

Display:

- Selected file
- Document details
- Confirmation button

For now, simulate a successful upload using JavaScript.

Do not connect to real storage yet.

---

# 12. Profile

Path:

`pages/profile.html`

Features:

- Profile information
- Full name
- Email
- Role
- Organization
- Change password placeholder
- Logout button

Use mock user data initially.

---

# 13. Role-Based Navigation

The sidebar navigation should adapt based on the user's role.

## Brand Area

Display:

**HELIOS**

*The Ultimate Corporate Agent*

Use a subtle, professional brand mark or icon.

Do not use an oversized logo.

## Employee Navigation

- Dashboard
- Ask Helios
- My Conversations
- Profile

## HR Manager Navigation

- Dashboard
- Ask Helios
- My Conversations
- Documents
- Profile

## Company Admin Navigation

- Dashboard
- Ask Helios
- My Conversations
- Documents
- Profile

The Documents menu item must not be visible to employees.

For now, use mock role data.

---

# 14. Project Structure

Use the following structure:

```text
frontend/
│
├── index.html
│
├── pages/
│   ├── dashboard.html
│   ├── policy-chat.html
│   ├── conversations.html
│   ├── documents.html
│   ├── upload-document.html
│   └── profile.html
│
├── css/
│   ├── global.css
│   ├── layout.css
│   ├── components.css
│   └── pages.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── api.js
│   ├── policy.js
│   ├── documents.js
│   └── ui.js
│
├── mock/
│   ├── users.js
│   ├── conversations.js
│   └── documents.js
│
├── assets/
│   ├── icons/
│   └── images/
│
└── PROJECT_SPEC.md
```

Do not unnecessarily change this architecture.

---

# 15. JavaScript Architecture

Keep responsibilities separated.

## app.js

Responsible for:

- Application initialization
- Shared page setup
- General application state

## auth.js

Responsible for:

- Login
- Logout
- Mock session handling
- Current user
- Role checking
- Protected page checks

## api.js

Responsible for:

- Future backend API calls
- Centralized fetch configuration
- Authorization headers
- Error handling

## policy.js

Responsible for:

- Sending questions to Helios
- Receiving AI responses
- Managing conversations
- Rendering chat messages

## documents.js

Responsible for:

- Document listing
- Document filtering
- Upload workflow
- Document status handling

## ui.js

Responsible for:

- Shared UI components
- Sidebar generation
- Header generation
- Notifications
- Loading states
- Modals

---

# 16. Mock Data Requirement

During the frontend development phase, use mock data.

Do not hardcode mock data randomly inside every HTML file.

Keep mock data organized.

Example future user structure:

```json
{
  "id": "user_123",
  "name": "Nikki",
  "email": "employee@company.com",
  "organization_id": "org_123",
  "organization_name": "Demo Company",
  "role": "employee"
}
```

The frontend should later be able to replace mock data with real API data without major UI changes.

---

# 17. Future Backend Integration

The frontend will eventually connect to:

- FastAPI backend
- Supabase Authentication
- PostgreSQL
- pgvector
- RAG pipeline
- Document storage

Do not implement these backend systems in the frontend phase.

Prepare the JavaScript architecture for future integration.

Example future API endpoints:

```text
POST /api/auth/login

GET /api/auth/me

POST /api/policy/chat

GET /api/conversations

GET /api/conversations/:id

DELETE /api/conversations/:id

GET /api/documents

POST /api/documents/upload
```

All future API requests should eventually pass through `js/api.js`.

---

# 18. Expected Policy Chat API

The future frontend request:

```json
{
  "conversation_id": "conv_123",
  "question": "How many earned leaves can I carry forward?"
}
```

The future backend response:

```json
{
  "conversation_id": "conv_123",
  "answer": "According to the company's Leave Policy, employees can carry forward up to 10 earned leaves.",
  "sources": [
    {
      "document_id": "doc_123",
      "document_name": "Leave Policy.pdf",
      "section": "4.2",
      "page_number": 7
    }
  ]
}
```

Design the frontend around this type of response.

---

# 19. Design Requirements

The application should have a:

- Professional enterprise SaaS appearance
- Modern AI product feel
- Clean and minimal interface
- Trustworthy and corporate design
- Premium but not flashy appearance
- Excellent spacing
- Clear typography hierarchy
- Subtle visual effects
- Good accessibility
- Responsive design

The design should make HELIOS feel like a serious corporate intelligence product.

Avoid:

- Excessive gradients
- Excessive animations
- Overly colorful dashboards
- Cluttered interfaces
- Gaming-style UI
- Unnecessary glassmorphism
- Cartoonish sun graphics

---

# 20. Responsive Design

The application must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop is the primary design target.

On smaller screens:

- Sidebar should collapse
- Navigation should remain accessible
- Tables should adapt into cards or horizontally scroll
- Chat input should remain fixed and usable
- Buttons should remain accessible

---

# 21. Accessibility Requirements

Ensure:

- Proper labels for form fields
- Keyboard-accessible navigation
- Visible focus states
- Sufficient text contrast
- Buttons have clear labels
- Interactive elements are accessible

---

# 22. Development Rules for Antigravity

Before making changes:

1. Read this `PROJECT_SPEC.md`.
2. Inspect the existing relevant code.
3. Understand the current project architecture.
4. Do not rewrite unrelated files.
5. Do not introduce React or any frontend framework.
6. Do not change the project architecture without a clear reason.

When implementing a feature:

1. Implement only the requested feature.
2. Reuse existing CSS and JavaScript components where possible.
3. Keep code modular.
4. Avoid duplication.
5. Test the feature.
6. Fix errors before considering the task complete.

Do not attempt to build the entire application in one task.

---

# 23. Development Order

Build the application in this exact order.

## Phase 1 — Application Foundation

1. Project structure
2. HELIOS brand area
3. Shared sidebar
4. Shared header
5. Navigation
6. Basic routing between HTML pages

## Phase 2 — Authentication UI

7. HELIOS login page
8. Mock authentication
9. Mock session
10. Role-based navigation
11. Protected page behavior

## Phase 3 — Employee Portal

12. Dashboard
13. Ask Helios chat
14. Source citations
15. Mock AI responses
16. Conversation history

## Phase 4 — HR/Admin Portal

17. Documents page
18. Upload document page
19. Document status UI
20. Role-based access

## Phase 5 — Quality

21. Responsive design
22. Loading states
23. Error states
24. Empty states
25. Accessibility review
26. Final UI polish

## Phase 6 — Backend Integration

27. Replace mock authentication
28. Connect FastAPI APIs
29. Connect real RAG responses
30. Connect document APIs
31. Test complete frontend-backend integration

---

# 24. Future Product Direction

The current frontend focuses on the Internal Policy AI Portal.

In the future, HELIOS will expand into a broader corporate intelligence platform with additional capabilities, including:

- Corporate policy intelligence
- Legal and regulatory validation
- Major decision compliance checks
- Government law and regulation retrieval
- Corporate knowledge management
- Compliance and advisory workflows

The current frontend architecture should remain modular enough to support additional HELIOS modules later.

---

# 25. Important Rule

The current goal is to build a fully navigable and polished HELIOS frontend using:

**HTML + CSS + Vanilla JavaScript + Mock Data**

Do not implement the real AI, RAG pipeline, vector database, document processing, or backend logic during the frontend-only phase.

The frontend should be designed so that mock services can later be replaced by FastAPI API calls with minimal changes.

Always prioritize a clean, maintainable, working implementation over unnecessary complexity.
