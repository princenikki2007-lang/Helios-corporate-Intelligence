/**
 * HELIOS — Application Initialization
 * Mounts shared layouts, enforces authentication & roles, and orchestrates page bootstrap
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication on all portal pages
  if (window.HeliosAuth) {
    if (!window.HeliosAuth.requireAuth()) {
      return; // Redirecting to login
    }

    // Role check if page specifies data-required-roles
    const requiredRolesAttr = document.body.getAttribute('data-required-roles');
    if (requiredRolesAttr) {
      const allowedRoles = requiredRolesAttr.split(',').map(r => r.trim());
      if (!window.HeliosAuth.requireRole(allowedRoles)) {
        return; // Redirecting to dashboard
      }
    }
  }

  // Ensure mock data exists
  if (!window.HELIOS_MOCK_USERS) {
    console.warn("HELIOS Mock data not yet loaded.");
  }

  // Render Shared Sidebar & Header if containers are present in HTML
  if (window.HeliosUI) {
    HeliosUI.renderSidebar('app-sidebar');
    
    // Check if custom page title is specified via meta or data attributes
    const pageTitleElem = document.querySelector('[data-page-title]');
    const customTitle = pageTitleElem ? pageTitleElem.getAttribute('data-page-title') : '';
    const breadcrumbElem = document.querySelector('[data-breadcrumb]');
    const customBreadcrumb = breadcrumbElem ? breadcrumbElem.getAttribute('data-breadcrumb') : 'Portal';

    HeliosUI.renderHeader('app-header', customTitle, customBreadcrumb);
  }

  // Handle global search if submitted
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        const query = encodeURIComponent(searchInput.value.trim());
        window.location.href = `policy-chat.html?q=${query}`;
      }
    });
  }
});
