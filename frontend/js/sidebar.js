// js/sidebar.js - Inject sidebar HTML dynamically

/**
 * Renders the customer sidebar into #sidebar-container.
 * Highlights the active page automatically.
 */
function renderCustomerSidebar() {
  const html = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">🚗 Rent <span>A Ride</span></div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Menu</div>
      <a href="customer-dashboard.html" class="sidebar-link">
        <span class="icon">🏠</span> Dashboard
      </a>
      <a href="browse-cars.html" class="sidebar-link">
        <span class="icon">🚙</span> Browse Cars
      </a>
      <a href="my-rentals.html" class="sidebar-link">
        <span class="icon">📋</span> My Rentals
      </a>
      <a href="payments.html" class="sidebar-link">
        <span class="icon">💳</span> Payments
      </a>
      <a href="history.html" class="sidebar-link">
        <span class="icon">🕐</span> History
      </a>
      <div class="nav-section-label" style="margin-top:12px;">Account</div>
      <a href="profile.html" class="sidebar-link">
        <span class="icon">👤</span> Profile
      </a>
      <a href="support.html" class="sidebar-link">
        <span class="icon">💬</span> Support
      </a>
    </nav>
    <div class="sidebar-footer">
      <button class="sidebar-link" style="width:100%;" onclick="logout()">
        <span class="icon">🚪</span> Logout
      </button>
    </div>
  </aside>`;

  const container = document.getElementById('sidebar-container');
  if (container) container.innerHTML = html;
  setActiveSidebarLink();
}

/**
 * Renders the admin sidebar into #sidebar-container.
 */
function renderAdminSidebar() {
  const user = getUser();
  const isSuperAdmin = user && user.role === 'superadmin';

  const html = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">🛡️ Admin <span>Panel</span></div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Overview</div>
      <a href="admin-dashboard.html" class="sidebar-link">
        <span class="icon">📊</span> Dashboard
      </a>
      <div class="nav-section-label" style="margin-top:12px;">Management</div>
      <a href="admin-cars.html" class="sidebar-link">
        <span class="icon">🚙</span> Manage Cars
      </a>
      <a href="admin-rentals.html" class="sidebar-link">
        <span class="icon">📋</span> Manage Rentals
      </a>
      <a href="admin-payments.html" class="sidebar-link">
        <span class="icon">💳</span> Payments
      </a>
      <a href="admin-customers.html" class="sidebar-link">
        <span class="icon">👥</span> Customers
      </a>
      ${isSuperAdmin ? `
      <a href="admin-admins.html" class="sidebar-link">
        <span class="icon">🛡️</span> Admin Accounts
      </a>
      ` : ''}
      <a href="admin-support.html" class="sidebar-link">
        <span class="icon">💬</span> Support Tickets
      </a>
    </nav>
    <div class="sidebar-footer">
      <button class="sidebar-link" style="width:100%;" onclick="adminLogout()">
        <span class="icon">🚪</span> Logout
      </button>
    </div>
  </aside>`;

  const container = document.getElementById('sidebar-container');
  if (container) container.innerHTML = html;
  setActiveSidebarLink();
}

function adminLogout() {
  clearAuth();
  window.location.href = 'admin-login.html';
}

// Mobile hamburger toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}
