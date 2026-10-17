/**
 * Vehicle Loan Calculator - Global Application UI Manager
 * Handles navigation state, user profile dropdown, toasts,
 * active link state, and home dashboard widgets.
 */

// Show modern Toast Notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container-custom';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-custom toast-${type}`;

  let icon = 'bi-info-circle-fill';
  if (type === 'success') icon = 'bi-check-circle-fill';
  if (type === 'danger' || type === 'error') icon = 'bi-exclamation-triangle-fill';
  if (type === 'warning') icon = 'bi-exclamation-circle-fill';

  toast.innerHTML = `
    <i class="bi ${icon}" style="font-size: 1.25rem;"></i>
    <div class="flex-grow-1">${message}</div>
    <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close" style="font-size: 0.75rem;"></button>
  `;

  const closeBtn = toast.querySelector('.btn-close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Update the Navbar UI based on current authentication state
function updateNavbarAuth() {
  const authContainer = document.getElementById('navbarAuthArea');
  if (!authContainer) return;

  const user = getCurrentUser();

  if (user) {
    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    authContainer.innerHTML = `
      <div class="dropdown">
        <button class="navbar-user-badge border-0 bg-transparent text-white dropdown-toggle" type="button" id="userMenuBtn" data-bs-toggle="dropdown" aria-expanded="false">
          <div class="navbar-user-avatar">${initials}</div>
          <span class="d-none d-sm-inline">${user.name}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" aria-labelledby="userMenuBtn" style="border-radius: 12px; min-width: 200px;">
          <li class="px-3 py-2 border-bottom">
            <div class="fw-bold text-dark">${user.name}</div>
            <small class="text-muted text-truncate d-block" style="max-width: 170px;">${user.email}</small>
          </li>
          <li>
            <a class="dropdown-item py-2" href="calculator.html">
              <i class="bi bi-calculator me-2 text-primary"></i> New Calculation
            </a>
          </li>
          <li>
            <a class="dropdown-item py-2" href="history.html">
              <i class="bi bi-clock-history me-2 text-primary"></i> Loan History
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item py-2 text-danger" type="button" id="logoutActionBtn">
              <i class="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    `;

    // Attach logout click handler
    const logoutBtn = document.getElementById('logoutActionBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    }
  } else {
    authContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="login.html" class="btn btn-outline-light-custom btn-sm">
          <i class="bi bi-box-arrow-in-right"></i> Log In
        </a>
        <a href="register.html" class="btn btn-primary-custom btn-sm">
          <i class="bi bi-person-plus-fill"></i> Register
        </a>
      </div>
    `;
  }
}

// Highlight the current page nav-link
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-custom .nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Render Dashboard Recent Calculation Widget on index.html
function renderDashboardRecentWidget() {
  const recentContainer = document.getElementById('homeRecentCalculationCard');
  if (!recentContainer) return;

  const user = getCurrentUser();

  if (!user) {
    recentContainer.innerHTML = `
      <div class="card-modern p-4 text-center h-100 d-flex flex-column justify-content-center">
        <div class="mb-3">
          <span class="badge bg-primary-subtle text-primary p-3 rounded-circle">
            <i class="bi bi-shield-lock" style="font-size: 1.8rem;"></i>
          </span>
        </div>
        <h5 class="fw-bold mb-2">Save & Track Your Loans</h5>
        <p class="text-muted small mb-3">Sign in to save your vehicle loan calculations, track history, and compare multiple finance quotes.</p>
        <div>
          <a href="login.html" class="btn btn-outline-primary btn-sm me-2">Log In</a>
          <a href="register.html" class="btn btn-primary-custom btn-sm">Create Free Account</a>
        </div>
      </div>
    `;
    return;
  }

  // Check user recent calculation
  const recentRaw = localStorage.getItem(`vlc_recent_${user.email.toLowerCase()}`);
  if (!recentRaw) {
    recentContainer.innerHTML = `
      <div class="card-modern p-4 text-center h-100 d-flex flex-column justify-content-center">
        <div class="mb-3">
          <span class="badge bg-info-subtle text-info p-3 rounded-circle">
            <i class="bi bi-speedometer2" style="font-size: 1.8rem;"></i>
          </span>
        </div>
        <h5 class="fw-bold mb-2">Ready to Calculate, ${user.name.split(' ')[0]}?</h5>
        <p class="text-muted small mb-3">You don't have any saved calculations yet. Try our instant Vehicle EMI Calculator to get a tailored estimate.</p>
        <div>
          <a href="calculator.html" class="btn btn-primary-custom btn-sm">
            <i class="bi bi-calculator me-1"></i> Calculate First EMI
          </a>
        </div>
      </div>
    `;
    return;
  }

  try {
    const recent = JSON.parse(recentRaw);
    const vehicleIcon = recent.vehicleType.toLowerCase() === 'car' ? 'bi-car-front-fill' : (recent.vehicleType.toLowerCase() === 'bike' ? 'bi-bicycle' : 'bi-truck-front-fill');
    const calcQuery = `type=${encodeURIComponent((recent.vehicleType || 'car').toLowerCase())}&price=${recent.vehiclePrice}&dp=${recent.downPayment}&rate=${recent.interestRate}&tenure=${recent.tenureMonths || (recent.tenureYears * 12)}`;

    recentContainer.innerHTML = `
      <div class="card-modern p-4 h-100 border-primary" style="border-left: 5px solid var(--accent-blue-500);">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill fw-semibold">
            <i class="bi ${vehicleIcon} me-1"></i> Recent Estimate: ${recent.vehicleType} Loan
          </span>
          <small class="text-muted"><i class="bi bi-clock me-1"></i>Just saved</small>
        </div>
        
        <div class="row align-items-center g-3">
          <div class="col-sm-6">
            <div class="text-muted small">Estimated Monthly EMI</div>
            <div class="h2 fw-bold text-primary mb-1">${formatINR(recent.emi)}</div>
            <div class="small text-muted">Vehicle Price: <strong>${formatINR(recent.vehiclePrice)}</strong></div>
          </div>
          <div class="col-sm-6">
            <div class="p-2 rounded bg-light small mb-2">
              <div class="d-flex justify-content-between">
                <span>Principal:</span> <strong>${formatINR(recent.principal)}</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span>Interest:</span> <strong>${recent.interestRate}% p.a.</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span>Tenure:</span> <strong>${recent.tenureYears} Years</strong>
              </div>
            </div>
            <div class="d-flex gap-2">
              <a href="calculator.html?${calcQuery}" class="btn btn-primary-custom btn-sm flex-grow-1">
                <i class="bi bi-arrow-repeat me-1"></i> Recalculate
              </a>
              <a href="history.html" class="btn btn-secondary-custom btn-sm">
                <i class="bi bi-journal-text"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    console.error('Error rendering recent widget:', e);
  }
}

// Global Document Initializer
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuth();
  highlightActiveNav();
  renderDashboardRecentWidget();
});

// Export to window
window.showToast = showToast;
window.updateNavbarAuth = updateNavbarAuth;
