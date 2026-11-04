/**
 * HELIOS — Global UI Controller
 * Renders unified Dark-First Navigation Shell, Topbar, Command Palette (Ctrl+K),
 * Multi-Tenant Switcher, Demo Mode Banner, and Legal Disclaimers.
 */

const HeliosUI = (function() {
  let activeWorkspace = null;

  /**
   * Fetch active workspace profile
   */
  async function loadActiveWorkspace() {
    try {
      const res = await fetch('/api/workspace');
      const data = await res.json();
      if (data && data.success) {
        activeWorkspace = data.workspace;
      }
    } catch (e) {
      console.warn("Could not fetch workspace from API; using cached session:", e);
    }

    if (!activeWorkspace) {
      activeWorkspace = {
        id: "org_default",
        isDemo: true,
        name: "Zephyr Technologies Private Limited",
        legalEntityType: "Private Limited Company",
        cin: "U72900KA2022PTC158941",
        pan: "AABCZ9821K",
        gstin: "29AABCZ9821K1ZX",
        registeredState: "Karnataka"
      };
    }
    return activeWorkspace;
  }

  /**
   * Render Sidebar
   */
  function renderSidebar(activePage) {
    const sidebarEl = document.getElementById('app-sidebar');
    if (!sidebarEl) return;

    const ws = activeWorkspace || { name: "Zephyr Technologies", isDemo: true };

    sidebarEl.innerHTML = `
      <div class="sidebar-header">
        <a href="../index.html" class="brand-logo" title="HELIOS — Legal & Compliance Intelligence">
          <div class="brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">HELIOS</span>
            <span class="brand-subtitle">Compliance Layer</span>
          </div>
        </a>
      </div>

      <nav class="sidebar-nav" aria-label="Main Navigation">
        <div class="nav-section-title">COMMAND CENTER</div>
        <a href="dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Overview Dashboard
        </a>

        <a href="risk.html" class="nav-link ${activePage === 'risk' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Company Risk Engine
          <span class="nav-badge">Score: 28</span>
        </a>

        <a href="calendar.html" class="nav-link ${activePage === 'calendar' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Compliance Calendar
        </a>

        <div class="nav-section-title">DOCUMENT INTELLIGENCE</div>
        <a href="documents.html" class="nav-link ${activePage === 'documents' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Document Vault
        </a>

        <a href="compare.html" class="nav-link ${activePage === 'compare' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Compare vs Rules
        </a>

        <a href="policy-analyzer.html" class="nav-link ${activePage === 'policy-analyzer' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Policy Analyzer
        </a>

        <div class="nav-section-title">REGULATORY INTELLIGENCE</div>
        <a href="regulations.html" class="nav-link ${activePage === 'regulations' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          Statutory Circulars
        </a>

        <a href="impact.html" class="nav-link ${activePage === 'impact' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          Company Impact Engine
          <span class="nav-badge">3 High</span>
        </a>

        <a href="policy-watch.html" class="nav-link ${activePage === 'policy-watch' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Parliament Watch
        </a>

        <div class="nav-section-title">TAX & STATUTORY</div>
        <a href="tax-center.html" class="nav-link ${activePage === 'tax-center' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Tax & GST Center
        </a>

        <a href="approvals.html" class="nav-link ${activePage === 'approvals' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          Approval Center
        </a>

        <div class="nav-section-title">ASSISTANCE & AUDIT</div>
        <a href="policy-chat.html" class="nav-link ${activePage === 'policy-chat' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Ask HELIOS (Legal AI)
        </a>

        <a href="audit-logs.html" class="nav-link ${activePage === 'audit-logs' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Audit & Governance
        </a>
      </nav>

      <div class="sidebar-footer">
        <a href="onboarding.html" class="workspace-chip" title="Company Workspace Settings">
          <div>
            <div class="ws-name">${ws.name}</div>
            <div class="ws-type">${ws.isDemo ? 'DEMO WORKSPACE' : 'LIVE TENANT'}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>
    `;
  }

  /**
   * Render Topbar
   */
  function renderHeader(breadcrumbText) {
    const headerEl = document.getElementById('app-header');
    if (!headerEl) return;

    const ws = activeWorkspace || { name: "Zephyr Technologies", isDemo: true };

    headerEl.innerHTML = `
      <div class="header-left">
        <button class="btn btn-ghost btn-sm mobile-menu-btn" style="display: none;" onclick="HeliosUI.toggleSidebar()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="font-size: var(--font-size-xs); font-weight: 600; color: var(--text-primary);">${breadcrumbText || 'Command Center'}</span>
          <span style="font-size: var(--font-size-2xs); color: var(--text-muted); font-family: var(--font-family-mono);">· CIN: ${ws.cin || 'U72900KA2022PTC158941'}</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Command Search Trigger -->
        <button class="cmd-trigger-btn" onclick="HeliosUI.openCommandPalette()" title="Global Command Search (Ctrl+K)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Search documents, rules, tax...</span>
          <kbd class="cmd-shortcut">⌘K</kbd>
        </button>

        <!-- Demo Mode Indicator / Toggle -->
        <button class="btn btn-sm ${ws.isDemo ? 'btn-secondary' : 'btn-primary'}" onclick="HeliosUI.toggleDemoMode()" title="Toggle Demo Data Mode">
          <span style="width: 6px; height: 6px; border-radius: 50%; background-color: ${ws.isDemo ? '#F59E0B' : '#10B981'}; display: inline-block;"></span>
          ${ws.isDemo ? 'DEMO MODE' : 'LIVE DATA'}
        </button>

        <!-- Role Badge -->
        <div class="badge badge-brand" id="user-role-badge" title="Active Role Permissions">
          Role: Founder
        </div>

        <!-- Help & Disclaimers -->
        <button class="btn btn-ghost btn-sm" onclick="HeliosUI.showLegalNotice()" title="Statutory AI Disclaimer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </button>
      </div>
    `;
  }

  /**
   * Render Mobile Navigation Bar
   */
  function renderMobileNav(activePage) {
    let mobileBar = document.getElementById('mobile-nav-bar');
    if (!mobileBar) {
      mobileBar = document.createElement('div');
      mobileBar.id = 'mobile-nav-bar';
      mobileBar.className = 'mobile-nav-bar';
      document.body.appendChild(mobileBar);
    }

    mobileBar.innerHTML = `
      <a href="dashboard.html" class="mobile-nav-item ${activePage === 'dashboard' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Home</span>
      </a>
      <a href="calendar.html" class="mobile-nav-item ${activePage === 'calendar' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>Tasks</span>
      </a>
      <a href="documents.html" class="mobile-nav-item ${activePage === 'documents' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
        <span>Vault</span>
      </a>
      <a href="impact.html" class="mobile-nav-item ${activePage === 'impact' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>Alerts</span>
      </a>
      <a href="policy-chat.html" class="mobile-nav-item ${activePage === 'policy-chat' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span>AI Legal</span>
      </a>
    `;
  }

  /**
   * Command Palette Modal (Ctrl + K)
   */
  function initCommandPalette() {
    let paletteEl = document.getElementById('cmd-palette-backdrop');
    if (!paletteEl) {
      paletteEl = document.createElement('div');
      paletteEl.id = 'cmd-palette-backdrop';
      paletteEl.className = 'cmd-palette-backdrop';
      paletteEl.innerHTML = `
        <div class="cmd-palette-modal">
          <div class="cmd-input-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="cmd-search-input" class="cmd-input" placeholder="Search documents, regulations, policies, approvals (e.g. GST, DPDP, Shops)..." autocomplete="off" />
            <kbd class="cmd-shortcut">ESC</kbd>
          </div>
          <div id="cmd-results-container" class="cmd-results">
            <div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">
              Type to search across corporate documents, statutory regulations, and filings...
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(paletteEl);

      paletteEl.addEventListener('click', (e) => {
        if (e.target === paletteEl) HeliosUI.closeCommandPalette();
      });

      const input = document.getElementById('cmd-search-input');
      let debounceTimer = null;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => HeliosUI.searchCommandPalette(input.value), 180);
      });
    }

    // Keyboard shortcut listeners
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        HeliosUI.openCommandPalette();
      } else if (e.key === 'Escape') {
        HeliosUI.closeCommandPalette();
      }
    });
  }

  /**
   * Toast notification helper
   */
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="color: ${type === 'danger' ? '#EF4444' : type === 'success' ? '#10B981' : '#F59E0B'};">●</span>
      <span style="flex: 1;">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  return {
    async init() {
      await loadActiveWorkspace();
      const body = document.body;
      const activePage = body.getAttribute('data-page') || '';
      const breadcrumb = body.getAttribute('data-breadcrumb') || '';

      renderSidebar(activePage);
      renderHeader(breadcrumb);
      renderMobileNav(activePage);
      initCommandPalette();
    },

    toggleSidebar() {
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    },

    openCommandPalette() {
      const p = document.getElementById('cmd-palette-backdrop');
      if (p) {
        p.style.display = 'flex';
        const input = document.getElementById('cmd-search-input');
        if (input) {
          input.value = '';
          input.focus();
          this.searchCommandPalette('');
        }
      }
    },

    closeCommandPalette() {
      const p = document.getElementById('cmd-palette-backdrop');
      if (p) p.style.display = 'none';
    },

    async searchCommandPalette(query) {
      const container = document.getElementById('cmd-results-container');
      if (!container) return;

      if (!query || query.trim().length === 0) {
        container.innerHTML = `
          <div style="padding: var(--space-3); font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Quick Actions</div>
          <a href="onboarding.html" class="cmd-item"><span>🏢 Configure Company Workspace</span><span class="badge badge-brand">Settings</span></a>
          <a href="documents.html" class="cmd-item"><span>📂 Upload New Document to Vault</span><span class="badge badge-info">Vault</span></a>
          <a href="policy-chat.html" class="cmd-item"><span>💬 Ask HELIOS Legal Assistant</span><span class="badge badge-success">AI</span></a>
          <a href="compare.html" class="cmd-item"><span>⚖️ Compare Document Against Rules</span><span class="badge badge-warning">Rules</span></a>
          <a href="tax-center.html" class="cmd-item"><span>📊 Check Upcoming GST Deadlines</span><span class="badge badge-danger">Tax</span></a>
        `;
        return;
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          container.innerHTML = data.results.map(r => `
            <a href="${r.url}" class="cmd-item">
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">${r.title}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${r.subtitle}</div>
              </div>
              <span class="badge badge-info">${r.badge}</span>
            </a>
          `).join('');
        } else {
          container.innerHTML = `<div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">No matching documents, regulations, or approvals found for "${query}".</div>`;
        }
      } catch (e) {
        container.innerHTML = `<div style="padding: var(--space-4); text-align: center; color: var(--color-danger); font-size: var(--font-size-xs);">Error searching index.</div>`;
      }
    },

    async toggleDemoMode() {
      const nextState = !activeWorkspace.isDemo;
      try {
        const res = await fetch('/api/workspace/demo-toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enableDemo: nextState })
        });
        const data = await res.json();
        if (data.success) {
          activeWorkspace = data.workspace;
          showToast(nextState ? 'Switched to Demo Workspace (Zephyr Tech)' : 'Switched to Live Company Workspace', 'success');
          setTimeout(() => window.location.reload(), 400);
        }
      } catch (e) {
        showToast('Failed to switch workspace mode.', 'danger');
      }
    },

    showLegalNotice() {
      alert("HELIOS LEGAL DISCLAIMER:\n\nHELIOS provides compliance intelligence and informational legal analysis based on public statutory notifications and uploaded company documents.\n\nHELIOS IS NOT A LAWYER AND DOES NOT PROVIDE BINDING LEGAL ADVICE. All high-risk or disputed matters require review by a licensed attorney or chartered accountant.");
    },

    showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  HeliosUI.init();
});
