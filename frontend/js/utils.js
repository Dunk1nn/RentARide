// js/utils.js - Shared helper functions used across pages

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.getElementById('rar-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'rar-toast';
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-remove after 3.5s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/**
 * Format a number as currency (USD).
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

/**
 * Format a date string nicely.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Get status badge HTML.
 */
function statusBadge(status) {
  const map = {
    pending:   'badge-warning',
    approved:  'badge-info',
    ongoing:   'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-secondary',
    rejected:  'badge-danger',
    paid:      'badge-success',
    available: 'badge-success',
    rented:    'badge-primary',
    maintenance:'badge-warning',
    active:    'badge-success',
    suspended: 'badge-danger',
  };
  return `<span class="badge ${map[status] || 'badge-secondary'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

/**
 * Redirect to login if not authenticated.
 */
function requireAuth(role = 'user') {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = role === 'admin' ? '../pages/admin-login.html' : '../pages/login.html';
    return false;
  }
  if (role === 'admin' && user.role !== 'admin' && user.role !== 'superadmin') {
    window.location.href = '../pages/login.html';
    return false;
  }
  return true;
}

/**
 * Set active sidebar link.
 */
function setActiveSidebarLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

/**
 * Render user name in nav.
 */
function renderUserName() {
  const user = getUser();
  const el = document.getElementById('user-name');
  if (el && user) el.textContent = user.name;
}

/**
 * Logout function.
 */
function logout() {
  clearAuth();
  window.location.href = '../pages/login.html';
}

/**
 * Confirm dialog wrapper.
 */
function confirmAction(message) {
  return window.confirm(message);
}

// Auto-setup when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setActiveSidebarLink();
  renderUserName();
});
