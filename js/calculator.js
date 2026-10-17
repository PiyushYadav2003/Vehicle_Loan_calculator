/**
 * Vehicle Loan Calculator - Calculation & Chart Engine
 * Handles mathematical calculations, validation, Chart.js visualization,
 * Indian Rupee currency formatting, amortization schedule, and history saving.
 */

// Global Chart instance reference
let emiChartInstance = null;

// Currency Formatter for Indian Rupees (₹)
function formatINR(amount, includeDecimals = false) {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const val = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: 0
  }).format(val);
}

// Format raw number with Indian numbering commas (e.g., 5,00,000)
function formatIndianNumber(num) {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(Math.round(num));
}

// Parse string with commas back to pure float/integer
function parseNumber(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const cleaned = str.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

// Vehicle Defaults and Presets
const VEHICLE_PRESETS = {
  car: {
    name: 'Car Loan',
    icon: 'bi-car-front-fill',
    price: 850000,
    dpPercent: 20, // 20% down payment
    rate: 8.75,
    tenureYears: 5
  },
  bike: {
    name: 'Two-Wheeler Loan',
    icon: 'bi-bicycle',
    price: 150000,
    dpPercent: 15, // 15% down payment
    rate: 10.5,
    tenureYears: 3
  },
  other: {
    name: 'Commercial / Other',
    icon: 'bi-truck-front-fill',
    price: 1800000,
    dpPercent: 25, // 25% down payment
    rate: 11.25,
    tenureYears: 5
  }
};

/**
 * Core Loan Calculation Logic
 * @param {number} price - Total vehicle price in INR
 * @param {number} downPayment - Down payment in INR
 * @param {number} annualRate - Annual interest rate percentage
 * @param {number} totalMonths - Total loan tenure in months
 */
function calculateLoanDetails(price, downPayment, annualRate, totalMonths) {
  // Validation checks
  if (price <= 0) {
    return { error: 'Please enter a valid vehicle price greater than 0.' };
  }
  if (downPayment < 0) {
    return { error: 'Down payment cannot be negative.' };
  }
  if (downPayment > price) {
    return { error: 'Down payment cannot exceed the vehicle price! (Maximum: ' + formatINR(price) + ')' };
  }
  if (totalMonths <= 0) {
    return { error: 'Loan tenure must be at least 1 month.' };
  }
  if (annualRate < 0) {
    return { error: 'Interest rate cannot be negative.' };
  }

  const principal = price - downPayment;

  // Case 1: 100% Down payment (No loan needed)
  if (principal === 0) {
    return {
      success: true,
      price,
      downPayment,
      principal: 0,
      annualRate,
      totalMonths,
      monthlyRate: 0,
      monthlyEMI: 0,
      totalInterest: 0,
      totalRepayment: 0,
      totalCost: price,
      isZeroLoan: true
    };
  }

  // Monthly interest rate: annualRate / 12 / 100
  const monthlyRate = annualRate / 12 / 100;
  let monthlyEMI = 0;
  let totalRepayment = 0;
  let totalInterest = 0;

  // Case 2: Zero Interest Loan (r = 0)
  if (annualRate === 0 || monthlyRate === 0) {
    monthlyEMI = principal / totalMonths;
    totalRepayment = principal;
    totalInterest = 0;
  } else {
    // Standard EMI formula:
    // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyEMI = (principal * monthlyRate * factor) / (factor - 1);
    totalRepayment = monthlyEMI * totalMonths;
    totalInterest = totalRepayment - principal;
  }

  return {
    success: true,
    price,
    downPayment,
    principal,
    annualRate,
    totalMonths,
    monthlyRate,
    monthlyEMI: Math.round(monthlyEMI),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalRepayment),
    totalCost: Math.round(downPayment + totalRepayment),
    isZeroLoan: false
  };
}

/**
 * Generate month-by-month and yearly Amortization Schedule
 */
function generateAmortizationSchedule(principal, annualRate, totalMonths, monthlyEMI) {
  const schedule = [];
  let remainingBalance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let month = 1; month <= totalMonths; month++) {
    let interestForMonth = 0;
    if (annualRate > 0) {
      interestForMonth = remainingBalance * monthlyRate;
    }

    let principalForMonth = monthlyEMI - interestForMonth;
    // Adjustment for the last month to zero-out rounding differences
    if (month === totalMonths || principalForMonth > remainingBalance) {
      principalForMonth = remainingBalance;
      remainingBalance = 0;
    } else {
      remainingBalance -= principalForMonth;
    }

    schedule.push({
      month,
      year: Math.ceil(month / 12),
      beginningBalance: Math.round(remainingBalance + principalForMonth),
      emi: monthlyEMI,
      principalPaid: Math.round(principalForMonth),
      interestPaid: Math.round(interestForMonth),
      endingBalance: Math.max(0, Math.round(remainingBalance))
    });

    if (remainingBalance <= 0) break;
  }

  // Also build Year-wise summary
  const yearlySummary = {};
  schedule.forEach(item => {
    if (!yearlySummary[item.year]) {
      yearlySummary[item.year] = {
        year: item.year,
        principalPaid: 0,
        interestPaid: 0,
        totalPaid: 0,
        endingBalance: item.endingBalance
      };
    }
    yearlySummary[item.year].principalPaid += item.principalPaid;
    yearlySummary[item.year].interestPaid += item.interestPaid;
    yearlySummary[item.year].totalPaid += item.emi;
    yearlySummary[item.year].endingBalance = item.endingBalance;
  });

  return {
    monthly: schedule,
    yearly: Object.values(yearlySummary)
  };
}

/**
 * Render or Update the Chart.js Donut Chart
 */
function renderLoanChart(principal, totalInterest) {
  const canvas = document.getElementById('loanChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hasZeroValues = principal === 0 && totalInterest === 0;

  const dataValues = hasZeroValues ? [1, 0] : [principal, totalInterest];
  const labels = hasZeroValues ? ['No Loan Required', 'Interest'] : ['Principal Loan Amount', 'Total Interest Payable'];
  const bgColors = hasZeroValues ? ['#cbd5e1', '#e2e8f0'] : ['#0ea5e9', '#f59e0b'];

  if (emiChartInstance) {
    emiChartInstance.data.datasets[0].data = dataValues;
    emiChartInstance.data.labels = labels;
    emiChartInstance.data.datasets[0].backgroundColor = bgColors;
    emiChartInstance.update();
  } else {
    // If Chart is loaded from CDN
    if (typeof Chart !== 'undefined') {
      emiChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: bgColors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              display: false // We use our custom legend in HTML
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  return ' ' + context.label + ': ' + formatINR(val);
                }
              }
            }
          }
        }
      });
    }
  }
}

/**
 * Save calculation to the current user's history in LocalStorage
 */
function saveCalculationToHistory(calcData) {
  const user = getCurrentUser();
  if (!user) {
    if (typeof showToast === 'function') {
      showToast('Please log in to save calculations to your personal history.', 'warning');
    }
    return false;
  }

  const storageKey = `vlc_history_${user.email.toLowerCase()}`;
  let history = [];
  try {
    const raw = localStorage.getItem(storageKey);
    history = raw ? JSON.parse(raw) : [];
  } catch (e) {
    history = [];
  }

  const record = {
    id: 'calc_' + Date.now(),
    userId: user.id,
    userEmail: user.email,
    vehicleType: calcData.vehicleType || 'Car',
    vehiclePrice: calcData.price,
    downPayment: calcData.downPayment,
    principal: calcData.principal,
    interestRate: calcData.annualRate,
    tenureYears: (calcData.totalMonths / 12).toFixed(1),
    tenureMonths: calcData.totalMonths,
    emi: calcData.monthlyEMI,
    totalInterest: calcData.totalInterest,
    totalRepayment: calcData.totalRepayment,
    date: new Date().toISOString()
  };

  // Add to start of array
  history.unshift(record);

  // Keep maximum 50 records per user
  if (history.length > 50) history = history.slice(0, 50);

  try {
    localStorage.setItem(storageKey, JSON.stringify(history));
    // Also save recent calculation for quick dashboard display
    localStorage.setItem(`vlc_recent_${user.email.toLowerCase()}`, JSON.stringify(record));
    return true;
  } catch (e) {
    console.error('Error saving history record:', e);
    return false;
  }
}

// Export functions to global window for accessibility
window.formatINR = formatINR;
window.formatIndianNumber = formatIndianNumber;
window.parseNumber = parseNumber;
window.calculateLoanDetails = calculateLoanDetails;
window.generateAmortizationSchedule = generateAmortizationSchedule;
window.renderLoanChart = renderLoanChart;
window.saveCalculationToHistory = saveCalculationToHistory;
window.VEHICLE_PRESETS = VEHICLE_PRESETS;
