/**
 * HELIOS — AI Corporate Legal Assistant
 * Modular frontend controller for Dashboard, Document Extraction, Gemini Chat,
 * Clause-to-Action Translator, Evidence-First Answers, and Before-You-Sign Checklist.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    currentView: 'dashboard',
    documents: [],
    selectedDocId: null,
    activeDocument: null,
    isAnalyzing: false,
    geminiConfigured: true,
    lastQuestion: ''
  };

  // DOM Elements cache
  const elements = {};

  // Initialize Application
  document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    bindEvents();
    checkHealth();
    loadDocuments();
    handleInitialRoute();
  });

  function cacheDOMElements() {
    // Views
    elements.views = {
      dashboard: document.getElementById('view-dashboard'),
      documents: document.getElementById('view-documents'),
      assistant: document.getElementById('view-assistant')
    };

    // Navigation Links
    elements.navLinks = document.querySelectorAll('.nav-item');
    elements.breadcrumbCurrent = document.getElementById('breadcrumb-current');
    elements.sidebarDocCount = document.getElementById('sidebar-doc-count');
    elements.topbarDocCount = document.getElementById('topbar-doc-count');

    // Dashboard Elements
    elements.dashDocCount = document.getElementById('dash-doc-count');
    elements.dashRecentTable = document.getElementById('dash-recent-table');

    // Documents View Elements
    elements.dropzone = document.getElementById('upload-dropzone');
    elements.fileInput = document.getElementById('file-input');
    elements.uploadProgress = document.getElementById('upload-progress');
    elements.uploadAlert = document.getElementById('upload-alert');
    elements.docSearchInput = document.getElementById('doc-search-input');
    elements.docsList = document.getElementById('docs-list');

    // Modals
    elements.textModal = document.getElementById('text-modal');
    elements.modalTitle = document.getElementById('modal-doc-title');
    elements.modalMeta = document.getElementById('modal-doc-meta');
    elements.modalContent = document.getElementById('modal-doc-text');
    elements.modalCopyBtn = document.getElementById('modal-copy-btn');
    elements.modalAskBtn = document.getElementById('modal-ask-btn');
    elements.modalClausesBtn = document.getElementById('modal-clauses-btn');
    elements.modalChecklistBtn = document.getElementById('modal-checklist-btn');
    elements.modalCloseBtn = document.getElementById('modal-close-btn');

    // Intelligence Modal (Clauses & Checklist)
    elements.intelModal = document.getElementById('intel-modal');
    elements.intelModalTitle = document.getElementById('intel-modal-title');
    elements.intelModalMeta = document.getElementById('intel-modal-meta');
    elements.intelModalBody = document.getElementById('intel-modal-body');
    elements.intelModalCloseBtn = document.getElementById('intel-modal-close-btn');

    // AI Assistant Elements
    elements.docSelect = document.getElementById('assistant-doc-select');
    elements.docContextBadge = document.getElementById('doc-context-badge');
    elements.viewSourceBtn = document.getElementById('view-source-btn');
    elements.assistantClausesBtn = document.getElementById('assistant-clauses-btn');
    elements.assistantChecklistBtn = document.getElementById('assistant-checklist-btn');
    elements.chatThread = document.getElementById('chat-thread');
    elements.chatInput = document.getElementById('chat-input');
    elements.chatSendBtn = document.getElementById('chat-send-btn');
    elements.clearChatBtn = document.getElementById('clear-chat-btn');
    elements.assistantAlert = document.getElementById('assistant-alert');
    elements.suggestionPills = document.querySelectorAll('.suggestion-pill');

    // Mobile Menu
    elements.mobileMenuBtn = document.getElementById('mobile-menu-btn');
    elements.sidebar = document.querySelector('.app-sidebar');
  }

  function bindEvents() {
    // Navigation
    elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        switchView(targetView);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      if (['dashboard', 'documents', 'assistant'].includes(hash)) {
        switchView(hash, false);
      }
    });

    // Mobile Menu
    if (elements.mobileMenuBtn && elements.sidebar) {
      elements.mobileMenuBtn.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
      });
    }

    // Topbar Upload Button
    const topUploadBtn = document.getElementById('topbar-upload-btn');
    if (topUploadBtn) {
      topUploadBtn.addEventListener('click', () => {
        switchView('documents');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Drag and Drop Upload
    if (elements.dropzone && elements.fileInput) {
      elements.dropzone.addEventListener('click', () => elements.fileInput.click());

      elements.dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropzone.classList.add('dragover');
      });

      elements.dropzone.addEventListener('dragleave', () => {
        elements.dropzone.classList.remove('dragover');
      });

      elements.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Document Search Filter
    if (elements.docSearchInput) {
      elements.docSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        renderDocumentsList(query);
      });
    }

    // Text Viewer Modal Events
    if (elements.modalCloseBtn) {
      elements.modalCloseBtn.addEventListener('click', closeTextModal);
    }
    if (elements.textModal) {
      elements.textModal.addEventListener('click', (e) => {
        if (e.target === elements.textModal) closeTextModal();
      });
    }
    if (elements.modalCopyBtn) {
      elements.modalCopyBtn.addEventListener('click', () => {
        if (elements.modalContent) {
          navigator.clipboard.writeText(elements.modalContent.textContent).then(() => {
            const origText = elements.modalCopyBtn.innerHTML;
            elements.modalCopyBtn.innerHTML = '✓ Copied to Clipboard';
            setTimeout(() => { elements.modalCopyBtn.innerHTML = origText; }, 2000);
          });
        }
      });
    }
    if (elements.modalAskBtn) {
      elements.modalAskBtn.addEventListener('click', () => {
        if (state.activeDocument) {
          closeTextModal();
          selectDocumentForAssistant(state.activeDocument.id);
          switchView('assistant');
        }
      });
    }
    if (elements.modalClausesBtn) {
      elements.modalClausesBtn.addEventListener('click', () => {
        if (state.activeDocument) {
          closeTextModal();
          runClauseTranslation(state.activeDocument.id);
        }
      });
    }
    if (elements.modalChecklistBtn) {
      elements.modalChecklistBtn.addEventListener('click', () => {
        if (state.activeDocument) {
          closeTextModal();
          runChecklistGeneration(state.activeDocument.id);
        }
      });
    }

    // Intel Modal Close
    if (elements.intelModalCloseBtn) {
      elements.intelModalCloseBtn.addEventListener('click', closeIntelModal);
    }
    if (elements.intelModal) {
      elements.intelModal.addEventListener('click', (e) => {
        if (e.target === elements.intelModal) closeIntelModal();
      });
    }

    // AI Assistant Header Toolbar Events
    if (elements.docSelect) {
      elements.docSelect.addEventListener('change', (e) => {
        const docId = e.target.value;
        selectDocumentForAssistant(docId);
      });
    }

    if (elements.viewSourceBtn) {
      elements.viewSourceBtn.addEventListener('click', () => {
        if (state.selectedDocId) {
          openDocumentViewer(state.selectedDocId);
        }
      });
    }

    if (elements.assistantClausesBtn) {
      elements.assistantClausesBtn.addEventListener('click', () => {
        if (state.selectedDocId) {
          runClauseTranslation(state.selectedDocId);
        }
      });
    }

    if (elements.assistantChecklistBtn) {
      elements.assistantChecklistBtn.addEventListener('click', () => {
        if (state.selectedDocId) {
          runChecklistGeneration(state.selectedDocId);
        }
      });
    }

    // Preset Suggestion Questions
    elements.suggestionPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const question = pill.getAttribute('data-question');
        if (question) {
          if (!state.selectedDocId && state.documents.length > 0) {
            selectDocumentForAssistant(state.documents[0].id);
          }
          elements.chatInput.value = question;
          submitChat();
        }
      });
    });

    // Chat Input Submission
    if (elements.chatSendBtn) {
      elements.chatSendBtn.addEventListener('click', submitChat);
    }

    if (elements.chatInput) {
      elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitChat();
        }
      });
    }

    if (elements.clearChatBtn) {
      elements.clearChatBtn.addEventListener('click', () => {
        resetChatThread();
      });
    }
  }

  // Handle URL Routing
  function handleInitialRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchView(hash, false);
  }

  function switchView(viewName, updateHash = true) {
    if (!elements.views[viewName]) viewName = 'dashboard';
    state.currentView = viewName;

    if (updateHash) {
      window.location.hash = viewName;
    }

    // Toggle View Sections
    Object.keys(elements.views).forEach(key => {
      if (elements.views[key]) {
        elements.views[key].classList.toggle('active', key === viewName);
      }
    });

    // Update Nav Link Active States
    elements.navLinks.forEach(link => {
      const isActive = link.getAttribute('data-view') === viewName;
      link.classList.toggle('active', isActive);
    });

    // Update Breadcrumb
    const titles = {
      dashboard: 'Dashboard',
      documents: 'Document Vault',
      assistant: 'AI Legal Assistant'
    };
    if (elements.breadcrumbCurrent) {
      elements.breadcrumbCurrent.textContent = titles[viewName] || 'Dashboard';
    }

    // Close Mobile Sidebar
    if (elements.sidebar) {
      elements.sidebar.classList.remove('open');
    }

    // Ensure a document is selected when entering assistant view
    if (viewName === 'assistant' && !state.selectedDocId && state.documents.length > 0) {
      selectDocumentForAssistant(state.documents[0].id);
    }
  }

  // Check Backend Health & Gemini Status
  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      state.geminiConfigured = data.geminiConfigured;

      const healthIndicator = document.getElementById('backend-status');
      if (healthIndicator) {
        healthIndicator.textContent = 'Server Online · ' + (data.geminiConfigured ? 'Gemini 3.8 Ready' : 'API Key Needed');
      }

      if (!data.geminiConfigured && elements.assistantAlert) {
        showAssistantAlert(
          'GEMINI_API_KEY is not set on the server. Please add your GEMINI_API_KEY in Settings > Secrets to enable Clause Translation, Evidence Q&A, and Review Checklists.',
          'warning'
        );
      }
    } catch (err) {
      console.warn('[HELIOS] Health check failed:', err);
    }
  }

  // Load Documents from Backend
  async function loadDocuments() {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();

      if (data.success && Array.isArray(data.documents)) {
        state.documents = data.documents;
        updateDocumentCounters();
        renderDashboardRecent();
        renderDocumentsList();
        populateAssistantDocSelect();
      }
    } catch (err) {
      console.error('[HELIOS] Failed to load documents:', err);
      showUploadAlert('Failed to connect to backend server. Make sure the server is running.', 'danger');
    }
  }

  function updateDocumentCounters() {
    const count = state.documents.length;
    if (elements.sidebarDocCount) elements.sidebarDocCount.textContent = count;
    if (elements.topbarDocCount) elements.topbarDocCount.textContent = count + (count === 1 ? ' Doc' : ' Docs');
    if (elements.dashDocCount) elements.dashDocCount.textContent = count;
  }

  // Render Dashboard Recent Documents
  function renderDashboardRecent() {
    if (!elements.dashRecentTable) return;

    if (state.documents.length === 0) {
      elements.dashRecentTable.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #64748B;">
            No documents uploaded yet. Click <strong>Upload Document</strong> above to get started.
          </td>
        </tr>
      `;
      return;
    }

    const recent = state.documents.slice(0, 5);
    elements.dashRecentTable.innerHTML = recent.map(doc => `
      <tr>
        <td>
          <div class="doc-title-cell">
            <span class="doc-format-badge format-${doc.fileType}">${doc.fileType}</span>
            <div>
              <div style="font-weight: 700; color: #0F172A;">${escapeHtml(doc.title)}</div>
              <div class="doc-meta-sub">${escapeHtml(doc.filename)}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size: 0.825rem; color: #475569;">${doc.uploadDate}</span></td>
        <td><span style="font-size: 0.825rem; color: #475569;">${doc.fileSize} · ${doc.wordCount} words</span></td>
        <td><span style="font-size: 0.825rem; color: #475569;">${doc.pageCount} ${doc.pageCount === 1 ? 'page' : 'pages'}</span></td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-secondary btn-sm" onclick="window.HELIOS_APP.runClauses('${doc.id}')" title="Translate Clauses to Actions">
              ⚡ Clauses
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.HELIOS_APP.runChecklist('${doc.id}')" title="Generate Review Checklist">
              📋 Checklist
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.HELIOS_APP.viewDocument('${doc.id}')">
              👁️ Text
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.HELIOS_APP.openInAssistant('${doc.id}')">
              💬 Ask AI
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Render Documents View List
  function renderDocumentsList(filterQuery = '') {
    if (!elements.docsList) return;

    let filtered = state.documents;
    if (filterQuery) {
      filtered = state.documents.filter(d => 
        d.title.toLowerCase().includes(filterQuery) ||
        d.filename.toLowerCase().includes(filterQuery) ||
        (d.preview && d.preview.toLowerCase().includes(filterQuery))
      );
    }

    if (filtered.length === 0) {
      elements.docsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; background-color: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 10px;">
          <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 0.75rem;">
            ${filterQuery ? 'No documents matched your search filter.' : 'No documents in the vault yet.'}
          </p>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('file-input').click()">
            Upload Document Now
          </button>
        </div>
      `;
      return;
    }

    elements.docsList.innerHTML = filtered.map(doc => `
      <div class="card" style="margin-bottom: 1.25rem; padding: 1.35rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: flex-start; gap: 0.85rem; flex-grow: 1;">
            <span class="doc-format-badge format-${doc.fileType}" style="margin-top: 3px;">${doc.fileType}</span>
            <div style="flex-grow: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A;">
                  ${escapeHtml(doc.title)}
                </h3>
                <span class="clause-category-badge">${escapeHtml(doc.category)}</span>
              </div>
              <p style="font-size: 0.8rem; color: #64748B; margin: 0.25rem 0 0.6rem;">
                ${escapeHtml(doc.filename)} · Uploaded: ${doc.uploadDate} · Size: ${doc.fileSize} · ${doc.wordCount} words · ${doc.pageCount} ${doc.pageCount === 1 ? 'page' : 'pages'}
              </p>
              <div style="font-size: 0.85rem; color: #334155; background-color: #F8FAFC; border-left: 3px solid #3B82F6; padding: 0.6rem 0.85rem; border-radius: 4px; max-width: 900px;">
                "${escapeHtml(doc.preview || '')}"
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end;">
            <button class="btn btn-primary btn-sm" onclick="window.HELIOS_APP.runClauses('${doc.id}')">
              ⚡ Clauses to Actions
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.HELIOS_APP.runChecklist('${doc.id}')">
              📋 Review Checklist
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.HELIOS_APP.viewDocument('${doc.id}')">
              👁️ View Text
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.HELIOS_APP.openInAssistant('${doc.id}')">
              💬 Ask AI
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.HELIOS_APP.deleteDocument('${doc.id}')" title="Delete Document">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Populate Document Selector in AI Assistant
  function populateAssistantDocSelect() {
    if (!elements.docSelect) return;

    if (state.documents.length === 0) {
      elements.docSelect.innerHTML = `<option value="">No documents available. Upload one first.</option>`;
      elements.docContextBadge.innerHTML = `No document active`;
      return;
    }

    elements.docSelect.innerHTML = state.documents.map(d => `
      <option value="${d.id}" ${state.selectedDocId === d.id ? 'selected' : ''}>
        [${d.fileType.toUpperCase()}] ${escapeHtml(d.title)} (${d.wordCount} words)
      </option>
    `).join('');

    if (!state.selectedDocId) {
      selectDocumentForAssistant(state.documents[0].id);
    } else {
      updateContextBadge();
    }
  }

  function selectDocumentForAssistant(docId) {
    state.selectedDocId = docId;
    if (elements.docSelect) {
      elements.docSelect.value = docId;
    }
    updateContextBadge();
  }

  function updateContextBadge() {
    const doc = state.documents.find(d => d.id === state.selectedDocId);
    if (doc && elements.docContextBadge) {
      elements.docContextBadge.innerHTML = `
        📄 <strong>${escapeHtml(doc.title)}</strong> (${doc.pageCount}p · ${doc.wordCount} words)
      `;
      if (elements.viewSourceBtn) elements.viewSourceBtn.style.display = 'inline-flex';
      if (elements.assistantClausesBtn) elements.assistantClausesBtn.style.display = 'inline-flex';
      if (elements.assistantChecklistBtn) elements.assistantChecklistBtn.style.display = 'inline-flex';
    } else if (elements.docContextBadge) {
      elements.docContextBadge.innerHTML = `No document selected`;
      if (elements.viewSourceBtn) elements.viewSourceBtn.style.display = 'none';
      if (elements.assistantClausesBtn) elements.assistantClausesBtn.style.display = 'none';
      if (elements.assistantChecklistBtn) elements.assistantChecklistBtn.style.display = 'none';
    }
  }

  // File Upload Handler (PDF & TXT)
  async function handleFileUpload(file) {
    if (!file) return;

    const name = file.name || '';
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase();

    // Validation
    if (ext !== '.pdf' && ext !== '.txt') {
      showUploadAlert(`Invalid file format "${ext}". HELIOS accepts .pdf and .txt files.`, 'danger');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showUploadAlert('File exceeds the 20 MB size limit. Please upload a smaller document.', 'danger');
      return;
    }

    // Show Progress
    if (elements.uploadProgress) elements.uploadProgress.style.display = 'flex';
    hideUploadAlert();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' '));

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      showUploadAlert(`✓ Document "${data.document.title}" uploaded and text extracted successfully!`, 'success');

      // Refresh documents
      await loadDocuments();

      // Automatically select newly uploaded document
      selectDocumentForAssistant(data.document.id);

    } catch (err) {
      console.error('[HELIOS] Upload error:', err);
      showUploadAlert(err.message, 'danger');
    } finally {
      if (elements.uploadProgress) elements.uploadProgress.style.display = 'none';
      if (elements.fileInput) elements.fileInput.value = '';
    }
  }

  function showUploadAlert(msg, type = 'danger') {
    if (!elements.uploadAlert) return;
    elements.uploadAlert.className = `alert-box alert-${type}`;
    elements.uploadAlert.innerHTML = `<span>${msg}</span>`;
    elements.uploadAlert.style.display = 'flex';
  }

  function hideUploadAlert() {
    if (elements.uploadAlert) elements.uploadAlert.style.display = 'none';
  }

  function showAssistantAlert(msg, type = 'warning') {
    if (!elements.assistantAlert) return;
    elements.assistantAlert.className = `alert-box alert-${type}`;
    elements.assistantAlert.innerHTML = `<span>${msg}</span>`;
    elements.assistantAlert.style.display = 'flex';
  }

  function hideAssistantAlert() {
    if (elements.assistantAlert) elements.assistantAlert.style.display = 'none';
  }

  // View Document Full Extracted Text Modal
  async function openDocumentViewer(docId) {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      const data = await res.json();

      if (!data.success || !data.document) {
        throw new Error(data.error || 'Document details could not be retrieved.');
      }

      state.activeDocument = data.document;

      if (elements.modalTitle) elements.modalTitle.textContent = data.document.title;
      if (elements.modalMeta) {
        elements.modalMeta.textContent = `${data.document.filename} · ${data.document.fileType.toUpperCase()} · ${data.document.pageCount} pages · ${data.document.wordCount} words · Uploaded: ${data.document.uploadDate}`;
      }
      if (elements.modalContent) {
        elements.modalContent.textContent = data.document.extractedText || 'No text extracted from this document.';
      }

      if (elements.textModal) elements.textModal.classList.add('open');
    } catch (err) {
      alert('Error loading document: ' + err.message);
    }
  }

  function closeTextModal() {
    if (elements.textModal) elements.textModal.classList.remove('open');
  }

  function closeIntelModal() {
    if (elements.intelModal) elements.intelModal.classList.remove('open');
  }

  // Delete Document
  async function deleteDocument(docId) {
    const doc = state.documents.find(d => d.id === docId);
    const title = doc ? doc.title : 'this document';

    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete document.');
      }

      if (state.selectedDocId === docId) {
        state.selectedDocId = null;
      }

      await loadDocuments();
    } catch (err) {
      alert('Error deleting document: ' + err.message);
    }
  }

  /* ========================================================================
     FEATURE 1: Clause-to-Action Translator
     ======================================================================== */
  async function runClauseTranslation(docId) {
    const doc = state.documents.find(d => d.id === docId);
    if (!doc) return;

    openIntelModal(`Clause-to-Action Translator: ${doc.title}`, 'Analyzing document clauses, obligations, and risks...');

    try {
      const res = await fetch(`/api/documents/${docId}/clauses`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze clauses.');
      }

      renderClauseResults(doc, data);

    } catch (err) {
      console.error('[HELIOS] Clause error:', err);
      let errMsg = err.message || '';
      try {
        const parsed = typeof errMsg === 'string' && errMsg.includes('{') ? JSON.parse(errMsg.substring(errMsg.indexOf('{'))) : null;
        if (parsed && parsed.error && parsed.error.message) errMsg = parsed.error.message;
      } catch (e) {}

      const lower = errMsg.toLowerCase();
      const is503 = lower.includes('high demand') || lower.includes('503') || lower.includes('unavailable') || lower.includes('overloaded');

      elements.intelModalBody.innerHTML = `
        <div class="alert-box ${is503 ? 'alert-warning' : 'alert-danger'}">
          <strong>${is503 ? '⏳ Upstream Gemini Server Busy (503)' : 'Analysis Error:'}</strong>
          <p style="margin-top: 0.35rem; font-size: 0.85rem;">
            ${is503 ? "Google's Gemini model servers are currently experiencing temporary high demand. Your document and API key are configured correctly. Please retry in a few seconds." : escapeHtml(errMsg)}
          </p>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="window.HELIOS_APP.runClauses('${docId}')">
            🔄 Retry Analysis
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.HELIOS_APP.closeIntelModal()">
            Close
          </button>
        </div>
      `;
    }
  }

  function renderClauseResults(doc, data) {
    const clauses = data.clauses || [];

    let html = `
      <div style="margin-bottom: 1.25rem;">
        <div style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin-bottom: 0.35rem;">
          Executive Clause Summary
        </div>
        <p style="font-size: 0.875rem; color: #334155; line-height: 1.5;">
          ${escapeHtml(data.summary)}
        </p>
        ${data.truncated ? `
          <div class="alert-box alert-warning" style="margin-top: 0.75rem;">
            ${escapeHtml(data.truncationMessage || 'Document length was partially truncated for analysis.')}
          </div>
        ` : ''}
      </div>

      <div class="section-header" style="margin-top: 1.5rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #0F172A;">
          Extracted Clauses &amp; Recommended Actions (${clauses.length})
        </h4>
        <span style="font-size: 0.75rem; color: #64748B;">Click "View Supporting Excerpt" to inspect verbatim text</span>
      </div>

      <div class="clause-container">
    `;

    clauses.forEach((c, idx) => {
      const drawerId = `clause_drawer_${idx}`;
      html += `
        <div class="clause-card">
          <div class="clause-header">
            <span class="clause-category-badge">${escapeHtml(c.category || 'General')}</span>
            <span class="clause-ref-tag">${escapeHtml(c.reference || 'Section Reference')}</span>
          </div>
          
          <h5 class="clause-title">${escapeHtml(c.title)}</h5>
          
          <div class="clause-explanation">
            <strong>Plain English:</strong> ${escapeHtml(c.explanation)}
          </div>

          ${c.potentialConcern ? `
            <div class="clause-concern-box">
              <strong>⚠️ Potential Concern / Risk:</strong> ${escapeHtml(c.potentialConcern)}
            </div>
          ` : ''}

          <div class="clause-action-box">
            <strong>Suggested Next Action:</strong> ${escapeHtml(c.suggestedAction)}
          </div>

          <div>
            <button class="evidence-toggle-btn" onclick="document.getElementById('${drawerId}').classList.toggle('open')">
              👁️ View Supporting Excerpt
            </button>
            <div class="evidence-drawer" id="${drawerId}">
              "${escapeHtml(c.originalClause)}"
            </div>
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <div class="disclaimer-banner" style="margin-top: 1.5rem;">
        ${escapeHtml(data.disclaimer)}
      </div>
    `;

    elements.intelModalBody.innerHTML = html;
  }

  /* ========================================================================
     FEATURE 3: Before-You-Sign Checklist
     ======================================================================== */
  async function runChecklistGeneration(docId) {
    const doc = state.documents.find(d => d.id === docId);
    if (!doc) return;

    openIntelModal(`Before-You-Sign Checklist: ${doc.title}`, 'Auditing standard commercial terms, liabilities, and renewal rules...');

    try {
      const res = await fetch(`/api/documents/${docId}/checklist`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate review checklist.');
      }

      renderChecklistResults(doc, data);

    } catch (err) {
      console.error('[HELIOS] Checklist error:', err);
      let errMsg = err.message || '';
      try {
        const parsed = typeof errMsg === 'string' && errMsg.includes('{') ? JSON.parse(errMsg.substring(errMsg.indexOf('{'))) : null;
        if (parsed && parsed.error && parsed.error.message) errMsg = parsed.error.message;
      } catch (e) {}

      const lower = errMsg.toLowerCase();
      const is503 = lower.includes('high demand') || lower.includes('503') || lower.includes('unavailable') || lower.includes('overloaded');

      elements.intelModalBody.innerHTML = `
        <div class="alert-box ${is503 ? 'alert-warning' : 'alert-danger'}">
          <strong>${is503 ? '⏳ Upstream Gemini Server Busy (503)' : 'Checklist Error:'}</strong>
          <p style="margin-top: 0.35rem; font-size: 0.85rem;">
            ${is503 ? "Google's Gemini model servers are currently experiencing temporary high demand. Your document and API key are configured correctly. Please retry in a few seconds." : escapeHtml(errMsg)}
          </p>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="window.HELIOS_APP.runChecklist('${docId}')">
            🔄 Retry Checklist Generation
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.HELIOS_APP.closeIntelModal()">
            Close
          </button>
        </div>
      `;
    }
  }

  function renderChecklistResults(doc, data) {
    const items = data.items || [];

    let html = `
      <div class="checklist-wrapper">
        <div class="checklist-assessment-banner">
          <div>
            <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: #F59E0B; font-weight: 700;">
              Before-You-Sign Review Audit
            </div>
            <div style="font-size: 1.05rem; font-weight: 700; margin-top: 2px;">
              ${escapeHtml(data.overallAssessment)}
            </div>
          </div>
          <span style="font-size: 0.75rem; background: rgba(255, 255, 255, 0.1); padding: 4px 10px; border-radius: 6px;">
            ${items.length} Core Dimensions Audited
          </span>
        </div>

        ${data.truncated ? `
          <div class="alert-box alert-warning" style="margin: 1rem 1.5rem 0;">
            ${escapeHtml(data.truncationMessage || 'Document length was partially truncated for analysis.')}
          </div>
        ` : ''}

        <div class="checklist-items-list">
    `;

    items.forEach((item, idx) => {
      const drawerId = `chk_drawer_${idx}`;
      const statusClass = 
        item.status === 'Found' ? 'badge-found' :
        item.status === 'Needs Review' ? 'badge-review' :
        item.status === 'Not Found' ? 'badge-notfound' : 'badge-verify';

      html += `
        <div class="checklist-item-row ${item.reviewed ? 'is-reviewed' : ''}" id="row_${item.id}">
          <div class="checklist-checkbox-col">
            <input 
              type="checkbox" 
              class="checklist-checkbox" 
              id="chk_input_${item.id}" 
              ${item.reviewed ? 'checked' : ''} 
              onchange="window.HELIOS_APP.toggleChecklistItem('${doc.id}', '${item.id}', this.checked)"
              title="Mark as reviewed"
            >
          </div>
          <div class="checklist-content-col">
            <div class="checklist-header-line">
              <span class="checklist-item-title">${escapeHtml(item.title)}</span>
              <span class="status-badge ${statusClass}">${escapeHtml(item.status)}</span>
              <span class="clause-ref-tag">${escapeHtml(item.reference || 'N/A')}</span>
            </div>

            <p class="checklist-details">${escapeHtml(item.details)}</p>

            ${item.excerpt && item.excerpt !== 'None' ? `
              <button class="evidence-toggle-btn" onclick="document.getElementById('${drawerId}').classList.toggle('open')">
                🔍 View Supporting Excerpt
              </button>
              <div class="evidence-drawer" id="${drawerId}">
                "${escapeHtml(item.excerpt)}"
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
      <div class="disclaimer-banner" style="margin-top: 1.25rem;">
        ${escapeHtml(data.disclaimer)}
      </div>
    `;

    elements.intelModalBody.innerHTML = html;
  }

  async function toggleChecklistItem(docId, itemId, isChecked) {
    try {
      const res = await fetch(`/api/documents/${docId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: isChecked })
      });
      const data = await res.json();

      const row = document.getElementById(`row_${itemId}`);
      if (row) {
        row.classList.toggle('is-reviewed', isChecked);
      }
    } catch (err) {
      console.warn('[HELIOS] Failed to update checklist item:', err);
    }
  }

  function openIntelModal(title, meta = '') {
    if (!elements.intelModal) return;
    elements.intelModalTitle.textContent = title;
    elements.intelModalMeta.textContent = meta;
    elements.intelModalBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div class="typing-dots" style="justify-content: center; margin-bottom: 1rem;">
          <div class="typing-dot" style="background-color: #2563EB; width: 10px; height: 10px;"></div>
          <div class="typing-dot" style="background-color: #2563EB; width: 10px; height: 10px;"></div>
          <div class="typing-dot" style="background-color: #2563EB; width: 10px; height: 10px;"></div>
        </div>
        <p style="font-size: 0.95rem; font-weight: 600; color: #0F172A;">
          Generating intelligence with Gemini 3.8 Flash...
        </p>
        <p style="font-size: 0.8rem; color: #64748B; margin-top: 0.35rem;">
          Grounding analysis strictly in verbatim document clauses
        </p>
      </div>
    `;
    elements.intelModal.classList.add('open');
  }

  /* ========================================================================
     FEATURE 2: Evidence-First AI Answers
     ======================================================================== */
  async function submitChat(overrideQuestion) {
    if (state.isAnalyzing) return;

    const question = (typeof overrideQuestion === 'string' && overrideQuestion.trim()) 
      ? overrideQuestion.trim() 
      : (elements.chatInput ? elements.chatInput.value.trim() : '');

    if (!question) return;

    if (!state.selectedDocId) {
      showAssistantAlert('Please select a document to analyze first.', 'warning');
      return;
    }

    state.lastQuestion = question;
    hideAssistantAlert();

    // Append User Message to Thread
    appendUserMessage(question);
    if (elements.chatInput) elements.chatInput.value = '';

    // Show AI Typing Indicator
    const typingId = showTypingIndicator();
    state.isAnalyzing = true;
    if (elements.chatSendBtn) elements.chatSendBtn.disabled = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: state.selectedDocId,
          question: question
        })
      });

      const data = await res.json();
      removeTypingIndicator(typingId);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to obtain AI response.');
      }

      appendEvidenceFirstAIMessage(data);

    } catch (err) {
      removeTypingIndicator(typingId);
      console.error('[HELIOS] Chat error:', err);
      appendErrorMessage(err.message);
    } finally {
      state.isAnalyzing = false;
      if (elements.chatSendBtn) elements.chatSendBtn.disabled = false;
      if (elements.chatInput) elements.chatInput.focus();
    }
  }

  function appendUserMessage(text) {
    if (!elements.chatThread) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message user-message';
    msgDiv.innerHTML = `
      <div class="message-avatar avatar-user">You</div>
      <div class="message-bubble">
        <div class="message-text">${escapeHtml(text)}</div>
      </div>
    `;

    elements.chatThread.appendChild(msgDiv);
    elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
  }

  function appendEvidenceFirstAIMessage(data) {
    if (!elements.chatThread) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ai-message';

    const evidenceDrawerId = `chat_evidence_${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedAnswer = formatMarkdown(data.answer);

    msgDiv.innerHTML = `
      <div class="message-avatar avatar-ai">☀️</div>
      <div class="message-bubble">
        
        <!-- Header Tag -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap;">
          <span class="clause-category-badge" style="background-color: #EFF6FF; color: #1D4ED8;">
            HELIOS Evidence-Grounded AI
          </span>
          ${data.reference && data.reference !== 'N/A' ? `
            <span class="clause-ref-tag">Ref: ${escapeHtml(data.reference)}</span>
          ` : ''}
          ${!data.isFound ? `
            <span class="status-badge badge-review">Not found in document</span>
          ` : ''}
        </div>

        <!-- Answer Text -->
        <div class="message-text" style="font-size: 0.925rem; line-height: 1.6;">
          ${formattedAnswer}
        </div>

        <!-- Evidence-First Interaction Drawer -->
        ${data.evidence && data.evidence !== 'No verbatim excerpt found.' ? `
          <div class="evidence-box-chat">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <button class="evidence-toggle-btn" onclick="document.getElementById('${evidenceDrawerId}').classList.toggle('open')">
                🔍 View Supporting Evidence Excerpt
              </button>
              <span style="font-size: 0.7rem; color: #64748B;">Direct Document Quotation</span>
            </div>
            <div class="evidence-drawer" id="${evidenceDrawerId}">
              "${escapeHtml(data.evidence)}"
            </div>
          </div>
        ` : ''}

        ${data.truncated ? `
          <div style="font-size: 0.72rem; color: #D97706; margin-top: 0.5rem;">
            ⚠️ ${escapeHtml(data.truncationMessage || 'Analyzed first 50,000 characters of document.')}
          </div>
        ` : ''}

        <!-- Message Meta & Actions -->
        <div class="message-meta">
          <span>${escapeHtml(data.documentTitle || 'Document')} · ${timeStr}</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.message-bubble').querySelector('.message-text').innerText); this.textContent='✓ Copied'; setTimeout(() => this.textContent='Copy', 2000);">
            Copy Answer
          </button>
        </div>

      </div>
    `;

    elements.chatThread.appendChild(msgDiv);
    elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
  }

  function appendErrorMessage(rawError) {
    if (!elements.chatThread) return;

    let cleanMsg = rawError || 'An error occurred while communicating with Gemini.';
    let is503 = false;
    let isKeyMissing = false;

    // Check if error message has raw JSON
    try {
      const jsonStart = cleanMsg.indexOf('{');
      if (jsonStart !== -1) {
        const parsed = JSON.parse(cleanMsg.substring(jsonStart));
        if (parsed.error && parsed.error.message) {
          cleanMsg = parsed.error.message;
        } else if (parsed.message) {
          cleanMsg = parsed.message;
        }
      }
    } catch (e) {
      // not JSON
    }

    const lower = cleanMsg.toLowerCase();
    if (lower.includes('high demand') || lower.includes('503') || lower.includes('unavailable') || lower.includes('overloaded')) {
      is503 = true;
      cleanMsg = "Google's Gemini model servers are currently experiencing temporary high demand. Your document and API key are working properly. Automatic retries were attempted, but the upstream model was momentarily congested.";
    } else if (lower.includes('api_key') || lower.includes('secrets') || lower.includes('403') || lower.includes('unauthorized')) {
      isKeyMissing = true;
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ai-message';
    msgDiv.innerHTML = `
      <div class="message-avatar avatar-ai">☀️</div>
      <div class="message-bubble" style="border-left: 3px solid ${is503 ? '#F59E0B' : '#EF4444'};">
        <div style="font-weight: 700; color: ${is503 ? '#B45309' : '#B91C1C'}; margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <span>${is503 ? '⏳ Upstream Gemini Server Busy (503)' : '⚠️ Request Could Not Be Completed'}</span>
          ${is503 ? '<span class="status-badge badge-review" style="font-size: 0.7rem;">Temporary High Demand</span>' : ''}
        </div>
        <p style="font-size: 0.875rem; color: #334155; margin-bottom: 0.65rem; line-height: 1.5;">
          ${escapeHtml(cleanMsg)}
        </p>
        ${state.lastQuestion ? `
          <div style="margin-bottom: 0.65rem;">
            <button class="btn btn-primary btn-sm" onclick="window.HELIOS_APP.retryLastQuestion()" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; padding: 0.35rem 0.75rem;">
              <span>🔄</span> Try Again Now
            </button>
          </div>
        ` : ''}
        <p style="font-size: 0.75rem; color: #64748B;">
          ${is503 ? 'Demand spikes usually clear within a few seconds. Clicking "Try Again Now" will re-query the model with automated fallback.' : (isKeyMissing ? 'If GEMINI_API_KEY is missing, attach your API key in the Settings > Secrets panel.' : 'Please check your connection and try again.')}
        </p>
      </div>
    `;

    elements.chatThread.appendChild(msgDiv);
    elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
  }

  function showTypingIndicator() {
    const id = 'typing_' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'chat-message ai-message';
    typingDiv.innerHTML = `
      <div class="message-avatar avatar-ai">☀️</div>
      <div class="message-bubble" style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.85rem; color: #64748B;">Grounding answer with Gemini 3.8 Flash</span>
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    elements.chatThread.appendChild(typingDiv);
    elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function resetChatThread() {
    if (!elements.chatThread) return;
    elements.chatThread.innerHTML = `
      <div class="chat-message ai-message">
        <div class="message-avatar avatar-ai">☀️</div>
        <div class="message-bubble">
          <p><strong>Hello! I am HELIOS, your Evidence-First AI Legal Assistant.</strong></p>
          <p style="margin-top: 0.4rem; color: #475569;">
            Select a document above, then ask any question. Every answer includes verifiable supporting document excerpts via the <strong>View Evidence</strong> drawer.
          </p>
        </div>
      </div>
    `;
  }

  // Basic Markdown Formatter for legal citations, bold, bullet points
  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text*)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Headers (### Header)
    html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');

    // Bullet lists (- Item)
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // Merge consecutive ul

    // Line breaks to paragraphs
    html = html.replace(/\n\n/g, '<br><br>');

    return html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose global methods for onclick handlers
  window.HELIOS_APP = {
    viewDocument: (id) => openDocumentViewer(id),
    openInAssistant: (id) => {
      selectDocumentForAssistant(id);
      switchView('assistant');
    },
    runClauses: (id) => runClauseTranslation(id),
    runChecklist: (id) => runChecklistGeneration(id),
    toggleChecklistItem: (docId, itemId, isChecked) => toggleChecklistItem(docId, itemId, isChecked),
    deleteDocument: (id) => deleteDocument(id),
    closeIntelModal: () => closeIntelModal(),
    retryLastQuestion: () => {
      if (state.lastQuestion) {
        submitChat(state.lastQuestion);
      }
    }
  };

})();
