/**
 * Vehicle Loan Calculator - Loan History Manager
 * Handles user-specific history retrieval, table/card rendering,
 * filtering, sorting, deletion, and recalculation redirection.
 */

let currentFilterType = 'all';
let currentSortOrder = 'newest';

// Get current user's history list
function getUserHistory() {
  const user = getCurrentUser();
  if (!user) return [];

  const storageKey = `vlc_history_${user.email.toLowerCase()}`;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error fetching history:', e);
    return [];
  }
}

// Save history list back
function saveUserHistory(historyList) {
  const user = getCurrentUser();
  if (!user) return;

  const storageKey = `vlc_history_${user.email.toLowerCase()}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(historyList));
    // Update or clear recent record
    if (historyList.length > 0) {
      localStorage.setItem(`vlc_recent_${user.email.toLowerCase()}`, JSON.stringify(historyList[0]));
    } else {
      localStorage.removeItem(`vlc_recent_${user.email.toLowerCase()}`);
    }
  } catch (e) {
    console.error('Error saving updated history:', e);
  }
}

// Delete an individual history record
function deleteHistoryRecord(recordId) {
  let history = getUserHistory();
  const initialLength = history.length;
  history = history.filter(item => item.id !== recordId);

  if (history.length < initialLength) {
    saveUserHistory(history);
    renderHistoryView();
    if (typeof showToast === 'function') {
      showToast('Calculation record removed from history.', 'info');
    }
  }
}

// Clear all history for current user
function clearAllUserHistory() {
  saveUserHistory([]);
  renderHistoryView();
  if (typeof showToast === 'function') {
    showToast('Your calculation history has been cleared.', 'info');
  }
}

// Format timestamp nicely
function formatDate(isoString) {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

// Vehicle badge renderer
function getVehicleBadge(type) {
  const t = (type || 'car').toLowerCase();
  if (t === 'car') {
    return `<span class="badge-vehicle badge-vehicle-car"><i class="bi bi-car-front-fill"></i> Car Loan</span>`;
  } else if (t === 'bike') {
    return `<span class="badge-vehicle badge-vehicle-bike"><i class="bi bi-bicycle"></i> Bike Loan</span>`;
  } else {
    return `<span class="badge-vehicle badge-vehicle-other"><i class="bi bi-truck-front-fill"></i> Other</span>`;
  }
}

// Filter and Sort history data
function getProcessedHistory() {
  let list = getUserHistory();

  // Apply Vehicle Type Filter
  if (currentFilterType !== 'all') {
    list = list.filter(item => (item.vehicleType || '').toLowerCase() === currentFilterType.toLowerCase());
  }

  // Apply Sorting
  list.sort((a, b) => {
    if (currentSortOrder === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else if (currentSortOrder === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (currentSortOrder === 'highest-emi') {
      return b.emi - a.emi;
    } else if (currentSortOrder === 'lowest-emi') {
      return a.emi - b.emi;
    }
    return 0;
  });

  return list;
}

// Render the History View (Table & Empty State)
function renderHistoryView() {
  const tableBody = document.getElementById('historyTableBody');
  const emptyState = document.getElementById('historyEmptyState');
  const historyContent = document.getElementById('historyContentArea');
  const totalCountBadge = document.getElementById('historyTotalCount');

  if (!tableBody || !emptyState || !historyContent) return;

  const rawList = getUserHistory();
  const processed = getProcessedHistory();

  if (totalCountBadge) {
    totalCountBadge.textContent = `${rawList.length} Saved`;
  }

  if (rawList.length === 0) {
    emptyState.classList.remove('d-none');
    historyContent.classList.add('d-none');
    return;
  }

  emptyState.classList.add('d-none');
  historyContent.classList.remove('d-none');

  if (processed.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5 text-muted">
          <i class="bi bi-funnel text-secondary" style="font-size: 2rem;"></i>
          <p class="mt-2 mb-0">No records found matching the selected vehicle filter.</p>
        </td>
      </tr>
    `;
    return;
  }

  let rowsHtml = '';
  processed.forEach((item, index) => {
    const formattedPrice = formatINR(item.vehiclePrice);
    const formattedDownPayment = formatINR(item.downPayment);
    const formattedPrincipal = formatINR(item.principal);
    const formattedEmi = formatINR(item.emi);
    const tenureDisplay = item.tenureMonths 
      ? `${(item.tenureMonths / 12).toFixed(1)} yrs (${item.tenureMonths} mos)` 
      : `${item.tenureYears} yrs`;

    // Recalculate query url
    const calcQuery = `type=${encodeURIComponent((item.vehicleType || 'car').toLowerCase())}&price=${item.vehiclePrice}&dp=${item.downPayment}&rate=${item.interestRate}&tenure=${item.tenureMonths || (item.tenureYears * 12)}`;

    rowsHtml += `
      <tr>
        <td class="text-muted" style="font-size: 0.85rem;">
          <div class="fw-semibold text-dark">${formatDate(item.date)}</div>
          <small class="text-muted">#${item.id.replace('calc_', '')}</small>
        </td>
        <td>${getVehicleBadge(item.vehicleType)}</td>
        <td>
          <div class="fw-bold text-dark">${formattedPrice}</div>
          <small class="text-muted">DP: ${formattedDownPayment}</small>
        </td>
        <td class="fw-semibold">${formattedPrincipal}</td>
        <td><span class="badge bg-light text-dark border">${item.interestRate}% p.a.</span></td>
        <td>${tenureDisplay}</td>
        <td>
          <span class="fw-bold text-primary" style="font-size: 1.1rem;">${formattedEmi}</span>
          <small class="text-muted d-block">/ month</small>
        </td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <a href="calculator.html?${calcQuery}" class="btn btn-outline-primary" title="Load into Calculator">
              <i class="bi bi-calculator"></i> <span class="d-none d-md-inline">Recalculate</span>
            </a>
            <button type="button" class="btn btn-outline-danger" onclick="deleteHistoryRecord('${item.id}')" title="Delete Record">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rowsHtml;
}

// Initialize listeners on History page
document.addEventListener('DOMContentLoaded', () => {
  const filterSelect = document.getElementById('filterVehicleType');
  const sortSelect = document.getElementById('sortHistoryOrder');
  const clearBtn = document.getElementById('confirmClearHistoryBtn');

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      currentFilterType = e.target.value;
      renderHistoryView();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSortOrder = e.target.value;
      renderHistoryView();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearAllUserHistory();
      // Hide Bootstrap modal if present
      const modalEl = document.getElementById('clearHistoryModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
    });
  }
});

// Export functions to global window
window.deleteHistoryRecord = deleteHistoryRecord;
window.clearAllUserHistory = clearAllUserHistory;
window.renderHistoryView = renderHistoryView;
