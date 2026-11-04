/**
 * HELIOS — Authentication & Session Management
 * Handles mock login, session persistence, role checking, and page protection
 */

const HeliosAuth = (function() {
  const SESSION_KEY = 'helios_auth_session';
  const MOCK_PASSWORD = 'password123';

  // Default fallback user (Senior Software Engineer / Employee)
  const defaultUser = {
    id: "user_emp_01",
    name: "Alex Rivera",
    email: "alex.rivera@company.com",
    avatar: "AR",
    organization_id: "org_helios_01",
    organization_name: "Acme Global Enterprise",
    role: "employee",
    department: "Product Engineering",
    title: "Senior Software Engineer"
  };

  /**
   * Check if a session exists
   */
  function isAuthenticated() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        return !!user && !!user.id;
      }
    } catch (e) {
      // corrupted session
    }
    return false;
  }

  /**
   * Get current authenticated user or null if not logged in
   */
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading Helios session:", e);
    }
    return null;
  }

  /**
   * Set active session
   */
  function setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  /**
   * Mock login — validates email format and matches against mock users
   * Returns { success, user, error }
   */
  function login(email, password) {
    // Basic validation
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your corporate email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Mock password check
    if (password !== MOCK_PASSWORD) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    // Match against mock users or create generic employee session
    const mockUsers = window.HELIOS_MOCK_USERS || [defaultUser];
    const user = mockUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }

    // Unknown email — create a generic employee session with that email
    const nameFromEmail = email.split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    const avatarInitials = nameFromEmail.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const genericUser = {
      ...defaultUser,
      id: 'user_generic_' + Date.now(),
      email: email.trim(),
      name: nameFromEmail,
      avatar: avatarInitials
    };

    setCurrentUser(genericUser);
    return { success: true, user: genericUser };
  }

  /**
   * Logout — clear session and redirect to login
   */
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    const isPagesSubdir = window.location.pathname.includes('/pages/');
    window.location.href = isPagesSubdir ? '../index.html' : 'index.html';
  }

  /**
   * Require authentication — call on DOMContentLoaded for protected pages.
   * Redirects to login if no valid session exists.
   */
  function requireAuth() {
    if (!isAuthenticated()) {
      const isPagesSubdir = window.location.pathname.includes('/pages/');
      window.location.replace(isPagesSubdir ? '../index.html' : 'index.html');
      return false;
    }
    return true;
  }

  /**
   * If already authenticated and on login page, redirect to dashboard
   */
  function redirectIfAuthenticated() {
    if (isAuthenticated()) {
      window.location.replace('pages/dashboard.html');
      return true;
    }
    return false;
  }

  /**
   * Check if current user is HR Manager or Admin
   */
  function canManageDocuments() {
    const user = getCurrentUser();
    return user && (user.role === 'hr_manager' || user.role === 'company_admin');
  }

  /**
   * Check if current user is Company Admin
   */
  function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'company_admin';
  }

  /**
   * Require a specific role — redirects to dashboard if user lacks permission
   */
  function requireRole(allowedRoles) {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
      const isPagesSubdir = window.location.pathname.includes('/pages/');
      window.location.replace(isPagesSubdir ? 'dashboard.html' : 'pages/dashboard.html');
      return false;
    }
    return true;
  }

  /**
   * Switch role helper for demonstration / testing
   */
  function switchRole(role) {
    const mockUsers = window.HELIOS_MOCK_USERS || [];
    const targetUser = mockUsers.find(u => u.role === role) || {
      ...getCurrentUser(),
      role: role
    };
    setCurrentUser(targetUser);
    window.location.reload();
  }

  return {
    isAuthenticated,
    getCurrentUser,
    setCurrentUser,
    login,
    logout,
    requireAuth,
    redirectIfAuthenticated,
    canManageDocuments,
    isAdmin,
    requireRole,
    switchRole
  };
})();

window.HeliosAuth = HeliosAuth;
