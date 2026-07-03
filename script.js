// ==========================================================================
// FinTrack Pro - Core JavaScript Application Logic
// ==========================================================================

// --- App State ---
let state = {
  users: [],
  currentUser: null,
  transactions: []
};


// --- DOM Element Selectors ---
// Auth selectors
const authContainer = document.getElementById('auth-container');
const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toRegisterLink = document.getElementById('to-register');
const toLoginLink = document.getElementById('to-login');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// App Layout selectors
const appWrapper = document.getElementById('app-wrapper');
const userDisplayName = document.getElementById('user-display-name');
const logoutBtn = document.getElementById('logout-btn');

// View panel selectors
const viewDashboard = document.getElementById('view-dashboard');
const viewSettings = document.getElementById('view-settings');
const tabDashboard = document.getElementById('tab-dashboard');
const tabSettings = document.getElementById('tab-settings');

// Summary Cards selectors
const cardBalanceVal = document.getElementById('card-balance-val');
const cardIncomeVal = document.getElementById('card-income-val');
const cardExpenseVal = document.getElementById('card-expense-val');
const cardTransactionsVal = document.getElementById('card-transactions-val');

// Theme Toggles selectors (Top Right)
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const authThemeToggleBtn = document.getElementById('auth-theme-toggle-btn');
const resetAllBtn = document.getElementById('reset-all-btn');

// Transactions Table & Filter selectors
const transactionSearch = document.getElementById('transaction-search');
const transactionFilterType = document.getElementById('transaction-filter-type');
const transactionsListBody = document.getElementById('transactions-list-body');
const tableEmptyState = document.getElementById('table-empty-state');

// Settings selectors
const settingsForm = document.getElementById('settings-form');
const settingsFullname = document.getElementById('settings-fullname');
const settingsCurrency = document.getElementById('settings-currency');
const settingsSuccess = document.getElementById('settings-success');

// Modal selectors
const transactionModal = document.getElementById('transaction-modal');
const openAddTxBtn = document.getElementById('open-add-transaction-btn');
const closeTxBtn = document.getElementById('close-modal-btn');
const cancelTxBtn = document.getElementById('cancel-modal-btn');
const transactionForm = document.getElementById('transaction-form');
const txAmountInput = document.getElementById('tx-amount');
const txTypeInput = document.getElementById('tx-type');
const txCategoryInput = document.getElementById('tx-category');
const txDateInput = document.getElementById('tx-date');
const txDescInput = document.getElementById('tx-desc');

// Edit Modal selectors
const editTransactionModal = document.getElementById('edit-transaction-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const editTransactionForm = document.getElementById('edit-transaction-form');
const editTxId = document.getElementById('edit-tx-id');
const editTxAmount = document.getElementById('edit-tx-amount');
const editTxType = document.getElementById('edit-tx-type');
const editTxCategory = document.getElementById('edit-tx-category');
const editTxDate = document.getElementById('edit-tx-date');
const editTxDesc = document.getElementById('edit-tx-desc');

// Dashboard preferences selectors
const dashboardDarkModeToggle = document.getElementById('dashboard-dark-mode-toggle');
const dashboardResetAllBtn = document.getElementById('dashboard-reset-all-btn');

// Chart elements
const chartYAxis = document.getElementById('chart-y-axis');
const chartBarIncome = document.getElementById('chart-bar-income');
const chartBarExpense = document.getElementById('chart-bar-expense');
const chartBarIncomeTooltip = document.getElementById('chart-bar-income-tooltip');
const chartBarExpenseTooltip = document.getElementById('chart-bar-expense-tooltip');


// ==========================================================================
// STATE MANAGEMENT & DATA PERSISTENCE
// ==========================================================================

// Load state from localStorage with Try-Catch protection
function loadState() {
  try {
    const usersJson = localStorage.getItem('fintrack_users');
    state.users = usersJson ? JSON.parse(usersJson) : [];
  } catch (e) {
    console.error("Error parsing users from localStorage:", e);
    state.users = [];
  }

  try {
    const sessionJson = localStorage.getItem('fintrack_currentUser');
    state.currentUser = sessionJson ? JSON.parse(sessionJson) : null;
  } catch (e) {
    console.error("Error parsing currentUser from localStorage:", e);
    state.currentUser = null;
  }

  try {
    const transactionsJson = localStorage.getItem('fintrack_transactions');
    state.transactions = transactionsJson ? JSON.parse(transactionsJson) : [];
  } catch (e) {
    console.error("Error parsing transactions from localStorage:", e);
    state.transactions = [];
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('fintrack_users', JSON.stringify(state.users));
  localStorage.setItem('fintrack_currentUser', JSON.stringify(state.currentUser));
  localStorage.setItem('fintrack_transactions', JSON.stringify(state.transactions));
}


// ==========================================================================
// VIEW ROUTING & AUTH NAVIGATION
// ==========================================================================

function initApp() {
  loadState();
  initTheme();
  
  if (state.currentUser) {
    showDashboardView();
  } else {
    showAuthView();
  }
}

function showAuthView() {
  if (authContainer) authContainer.classList.remove('hidden');
  if (appWrapper) appWrapper.classList.add('hidden');
  if (loginCard) loginCard.classList.remove('hidden');
  if (registerCard) registerCard.classList.add('hidden');
  if (loginForm) loginForm.reset();
  if (registerForm) registerForm.reset();
  if (loginError) loginError.textContent = '';
  if (registerError) registerError.textContent = '';
}

function showDashboardView() {
  if (authContainer) authContainer.classList.add('hidden');
  if (appWrapper) appWrapper.classList.remove('hidden');
  
  // Set user context
  if (userDisplayName && state.currentUser) {
    userDisplayName.textContent = state.currentUser.fullName;
  }
  
  // Initialize inputs in Settings
  if (state.currentUser) {
    if (settingsFullname) settingsFullname.value = state.currentUser.fullName;
    if (settingsCurrency) settingsCurrency.value = state.currentUser.currency || 'USD';
  }
  
  // Show dashboard tab by default
  switchTab('dashboard');
}

function switchTab(tabName) {
  if (tabName === 'dashboard') {
    if (viewDashboard) viewDashboard.classList.remove('hidden');
    if (viewSettings) viewSettings.classList.add('hidden');
    if (tabDashboard) tabDashboard.classList.add('active');
    if (tabSettings) tabSettings.classList.remove('active');
    renderDashboard();
  } else if (tabName === 'settings') {
    if (viewDashboard) viewDashboard.classList.add('hidden');
    if (viewSettings) viewSettings.classList.remove('hidden');
    if (tabDashboard) tabDashboard.classList.remove('active');
    if (tabSettings) tabSettings.classList.add('active');
    if (settingsSuccess) settingsSuccess.style.display = 'none';
  }
}

// Switch between login & register pages
if (toRegisterLink) {
  toRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginCard) loginCard.classList.add('hidden');
    if (registerCard) registerCard.classList.remove('hidden');
    if (registerError) registerError.textContent = '';
  });
}

if (toLoginLink) {
  toLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (registerCard) registerCard.classList.add('hidden');
    if (loginCard) loginCard.classList.remove('hidden');
    if (loginError) loginError.textContent = '';
  });
}


// ==========================================================================
// USER AUTHENTICATION HANDLERS
// ==========================================================================

// Register User
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const fullName = document.getElementById('register-fullname').value.trim();
      const username = document.getElementById('register-username').value.trim().toLowerCase();
      const password = document.getElementById('register-password').value;

      if (registerError) registerError.textContent = '';

      // Check if username already exists
      const existingUser = state.users.find(u => u.username === username);
      if (existingUser) {
        if (registerError) registerError.textContent = 'Username is already taken.';
        return;
      }

      // Create new user profile
      const newUser = {
        username,
        password, // Storing in plain text for simplicity as per vanilla client requirements
        fullName,
        currency: 'USD'
      };

      state.users.push(newUser);
      saveState();

      // Redirect to login page
      registerForm.reset();
      if (registerCard) registerCard.classList.add('hidden');
      if (loginCard) loginCard.classList.remove('hidden');
      if (loginError) {
        loginError.textContent = 'Account created successfully! Please log in.';
        loginError.style.color = '#22c55e'; // Success styling message
      }
    } catch (err) {
      console.error("Error during registration form submission:", err);
      if (registerError) registerError.textContent = "System Error: " + err.message;
    }
  });
}

// Login User
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const username = document.getElementById('login-username').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      if (loginError) {
        loginError.textContent = '';
        loginError.style.color = '#ef4444'; // Restore error color
      }

      const user = state.users.find(u => u.username === username && u.password === password);
      if (!user) {
        if (loginError) loginError.textContent = 'Invalid username or password.';
        return;
      }

      state.currentUser = user;
      saveState();
      showDashboardView();
    } catch (err) {
      console.error("Error during login form submission:", err);
      if (loginError) loginError.textContent = "System Error: " + err.message;
    }
  });
}

// Logout User
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    state.currentUser = null;
    saveState();
    showAuthView();
  });
}


// ==========================================================================
// CURRENCY & FORMATTING UTILITIES
// ==========================================================================

// --- Currency Symbols Mapping ---
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥'
};

function getCurrencySymbol() {
  const code = state.currentUser ? state.currentUser.currency : 'USD';
  return currencySymbols[code] || '$';
}

function formatCurrency(amount) {
  const symbol = getCurrencySymbol();
  
  // Standard format options
  return symbol + amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


// ==========================================================================
// PREFERENCES & UTILITIES (Dual Toggle Synchronizer)
// ==========================================================================

// Initialize theme from localStorage preference
function initTheme() {
  const darkModeSaved = localStorage.getItem('fintrack_darkMode');
  const isDark = darkModeSaved === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  if (dashboardDarkModeToggle) {
    dashboardDarkModeToggle.checked = isDark;
  }
}

// Global toggle handler
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('fintrack_darkMode', isDark ? 'true' : 'false');
  if (dashboardDarkModeToggle) {
    dashboardDarkModeToggle.checked = isDark;
  }
  if (state.currentUser) {
    renderDashboard();
  }
}

// Add click listeners to both top-right toggles
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}
if (authThemeToggleBtn) {
  authThemeToggleBtn.addEventListener('click', toggleTheme);
}

// Watch dashboard Preferences Dark Mode toggle switch
if (dashboardDarkModeToggle) {
  dashboardDarkModeToggle.addEventListener('change', () => {
    const isDark = dashboardDarkModeToggle.checked;
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('fintrack_darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('fintrack_darkMode', 'false');
    }
    if (state.currentUser) {
      renderDashboard();
    }
  });
}

// Reset System Callback Function
function resetAllApplicationData() {
  const confirmWipe = confirm('WARNING: Are you sure you want to reset all data? This will permanently delete all users, configurations, and transaction logs. You will be logged out.');
  if (confirmWipe) {
    localStorage.removeItem('fintrack_users');
    localStorage.removeItem('fintrack_currentUser');
    localStorage.removeItem('fintrack_transactions');
    // Keep theme preference intact
    
    // Reset internal state variables
    state.users = [];
    state.currentUser = null;
    state.transactions = [];
    
    // Uncheck dashboard switch
    if (dashboardDarkModeToggle) {
      dashboardDarkModeToggle.checked = false;
    }
    
    showAuthView();
  }
}

// Bind reset buttons (Settings and Dashboard Preferences)
if (resetAllBtn) {
  resetAllBtn.addEventListener('click', resetAllApplicationData);
}
if (dashboardResetAllBtn) {
  dashboardResetAllBtn.addEventListener('click', resetAllApplicationData);
}

// Password Visibility Toggles
document.querySelectorAll('.btn-toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;
    
    const icon = btn.querySelector('i');
    if (icon) {
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }
  });
});


// ==========================================================================
// SETTINGS UPDATE HANDLER
// ==========================================================================

if (settingsForm) {
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = settingsFullname.value.trim();
    const newCurrency = settingsCurrency.value;

    if (!newName) return;

    // Update current user values
    if (state.currentUser) {
      state.currentUser.fullName = newName;
      state.currentUser.currency = newCurrency;

      // Update the user records in local state array
      const userIdx = state.users.findIndex(u => u.username === state.currentUser.username);
      if (userIdx !== -1) {
        state.users[userIdx].fullName = newName;
        state.users[userIdx].currency = newCurrency;
      }
    }

    saveState();

    // Update display components
    if (userDisplayName && state.currentUser) {
      userDisplayName.textContent = newName;
    }

    // Render dashboard calculations using new settings
    renderDashboard();

    // Display feedback
    if (settingsSuccess) {
      settingsSuccess.style.display = 'block';
      setTimeout(() => {
        settingsSuccess.style.display = 'none';
      }, 3000);
    }
  });
}


// ==========================================================================
// MODAL TRANSACTION OPERATIONS
// ==========================================================================

// Open Modal overlay
if (openAddTxBtn) {
  openAddTxBtn.addEventListener('click', () => {
    if (transactionModal) transactionModal.classList.remove('hidden');
    // Pre-fill today's date
    const today = new Date().toISOString().split('T')[0];
    if (txDateInput) txDateInput.value = today;
    if (transactionForm) transactionForm.reset();
    if (txDateInput) txDateInput.value = today;
  });
}

// Close Modal overlay
function closeModal() {
  if (transactionModal) transactionModal.classList.add('hidden');
}

if (closeTxBtn) closeTxBtn.addEventListener('click', closeModal);
if (cancelTxBtn) cancelTxBtn.addEventListener('click', closeModal);

// Close overlay on background click
if (transactionModal) {
  transactionModal.addEventListener('click', (e) => {
    if (e.target === transactionModal) {
      closeModal();
    }
  });
}

// Form Submission (Add Transaction)
if (transactionForm) {
  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(txAmountInput.value);
    const type = txTypeInput.value;
    const category = txCategoryInput.value; // Gets current selected dropdown option value
    const date = txDateInput.value;
    const description = txDescInput.value.trim();

    if (isNaN(amount) || amount < 0 || !type || !category || !date || !description) {
      alert('Please fill out all inputs with valid information.');
      return;
    }

    const newTransaction = {
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      username: state.currentUser.username, // Associate transaction with active account
      amount,
      type,
      category,
      date,
      description
    };

    state.transactions.push(newTransaction);
    saveState();
    closeModal();
    renderDashboard();
  });
}

// Delete Transaction
window.deleteTransaction = function(txId) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    state.transactions = state.transactions.filter(t => t.id !== txId);
    saveState();
    renderDashboard();
  }
};


// ==========================================================================
// METRICS, TRANSACTION HISTORY, & CHART RENDERING
// ==========================================================================

function renderDashboard() {
  if (!state.currentUser) return;

  // Filter transactions owned by active user account
  const userTransactions = state.transactions.filter(t => t.username === state.currentUser.username);

  // Sorting descending by date
  userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate Metrics
  let totalIncome = 0;
  let totalExpense = 0;

  userTransactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
    }
  });

  const currentBalance = totalIncome - totalExpense;
  const totalCount = userTransactions.length;

  // Update Summary Card elements
  if (cardBalanceVal) cardBalanceVal.textContent = formatCurrency(currentBalance);
  if (cardIncomeVal) cardIncomeVal.textContent = formatCurrency(totalIncome);
  if (cardExpenseVal) cardExpenseVal.textContent = formatCurrency(totalExpense);
  if (cardTransactionsVal) cardTransactionsVal.textContent = totalCount;

  // Update nav transactions count badge
  const navTxBadge = document.getElementById('nav-tx-badge');
  if (navTxBadge) {
    navTxBadge.textContent = totalCount;
    if (totalCount > 0) {
      navTxBadge.classList.remove('hidden');
    } else {
      navTxBadge.classList.add('hidden');
    }
  }

  // Toggle visual negative color representation if balance is less than zero
  if (cardBalanceVal) {
    if (currentBalance < 0) {
      cardBalanceVal.style.color = 'var(--danger-color)';
    } else {
      cardBalanceVal.style.color = 'inherit';
    }
  }

  // Draw Cash Flow Chart
  renderChart(totalIncome, totalExpense);

  // Render Table Data
  renderTable(userTransactions);
}

// Chart.js global instance tracker
let cashFlowChartInstance = null;

// Render dynamic Chart.js bar chart
function renderChart(income, expense) {
  const ctx = document.getElementById('cash-flow-chart');
  if (!ctx) return;

  // Destroy previous chart instance if exists to prevent drawing overlays
  if (cashFlowChartInstance) {
    cashFlowChartInstance.destroy();
  }

  // Get active theme state (dark mode check)
  const isDark = document.body.classList.contains('dark-mode');
  
  // Read colors dynamically from CSS variables (single-source of truth)
  const bodyStyles = getComputedStyle(document.body);
  const incomeBg = bodyStyles.getPropertyValue('--chart-income-bg').trim() || (isDark ? '#0070f3' : '#1ea64a');
  const expenseBg = bodyStyles.getPropertyValue('--chart-expense-bg').trim() || (isDark ? '#ff4d4d' : '#ff3d8b');
  const textLabelColor = bodyStyles.getPropertyValue('--text-secondary').trim() || (isDark ? '#888888' : '#333333');
  const gridLineColor = bodyStyles.getPropertyValue('--border-color').trim() || (isDark ? '#222222' : '#e6e6e6');
  
  // Format labels using symbol
  const symbol = getCurrencySymbol();

  cashFlowChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        label: 'Cash Flow',
        data: [income, expense],
        backgroundColor: [incomeBg, expenseBg],
        borderWidth: 0,
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#111111' : '#000000',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: isDark ? '#333333' : '#000000',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              return ' ' + symbol + context.raw.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridLineColor,
            drawBorder: false
          },
          ticks: {
            color: textLabelColor,
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            callback: function(value) {
              if (value >= 1e6) return symbol + (value / 1e6).toFixed(1) + 'M';
              if (value >= 1e3) return symbol + (value / 1e3).toFixed(1) + 'k';
              return symbol + value;
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: textLabelColor,
            font: {
              family: "'Inter', sans-serif",
              weight: '600',
              size: 12
            }
          }
        }
      }
    }
  });
}

// Format currency in compact label for Y-axis (e.g. $10k, $1M)
function formatCurrencyShort(amount) {
  const symbol = getCurrencySymbol();
  if (amount >= 1e6) {
    return symbol + (amount / 1e6).toFixed(1) + 'M';
  }
  if (amount >= 1e3) {
    return symbol + (amount / 1e3).toFixed(1) + 'k';
  }
  return symbol + amount.toFixed(0);
}

// Emojis mapping for categories
const categoryEmojis = {
  'food & dining': '🍔 Food & Dining',
  'shopping': '🛍️ Shopping',
  'recharge & bills': '🧾 Recharge & Bills',
  'petrol & auto': '⛽ Petrol & Auto',
  'utilities': '💡 Utilities',
  'salary': '💵 Salary',
  'entertainment': '🎬 Entertainment',
  'other': '📦 Other'
};

// Filters & search query processing for the transactions table
function renderTable(userTransactions) {
  if (!transactionsListBody) return;
  
  const searchQuery = transactionSearch ? transactionSearch.value.trim().toLowerCase() : '';
  const filterType = transactionFilterType ? transactionFilterType.value : 'all';

  // Filter operations
  const filtered = userTransactions.filter(t => {
    // Type Filter
    if (filterType !== 'all' && t.type !== filterType) {
      return false;
    }
    
    // Search query matching (matches Category or Description or Amount)
    if (searchQuery) {
      const matchDesc = t.description.toLowerCase().includes(searchQuery);
      const matchCategory = t.category.toLowerCase().includes(searchQuery);
      const matchAmount = t.amount.toString().includes(searchQuery);
      return matchDesc || matchCategory || matchAmount;
    }
    
    return true;
  });

  // Clear existing row items
  transactionsListBody.innerHTML = '';

  if (filtered.length === 0) {
    if (tableEmptyState) tableEmptyState.classList.remove('hidden');
    return;
  }

  if (tableEmptyState) tableEmptyState.classList.add('hidden');

  // Loop and render row elements
  filtered.forEach(t => {
    const row = document.createElement('tr');
    
    // Format values
    const dateFormatted = formatDate(t.date);
    const amountClass = t.type === 'income' ? 'tx-amount-income' : 'tx-amount-expense';
    const amountPrefix = t.type === 'income' ? '+' : '-';
    const amountVal = formatCurrency(t.amount);
    const displayCategory = categoryEmojis[t.category.toLowerCase()] || t.category;
    
    row.innerHTML = `
      <td class="tx-date-col">${dateFormatted}</td>
      <td><strong>${escapeHtml(t.description)}</strong></td>
      <td><span class="tx-category-badge">${escapeHtml(displayCategory)}</span></td>
      <td class="tx-amount-col ${amountClass}">${amountPrefix}${amountVal}</td>
      <td>
        <button class="btn-icon btn-icon-edit" onclick="openEditTransaction('${t.id}')" title="Edit transaction">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-icon-delete" onclick="deleteTransaction('${t.id}')" title="Delete transaction">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    transactionsListBody.appendChild(row);
  });
}

// Convert YYYY-MM-DD input date to readable format (e.g. Oct 12, 2026)
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Escape HTML characters to prevent XSS (since we append innerHTML directly)
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Wire up Filters & Search Events ---
if (transactionSearch) {
  transactionSearch.addEventListener('input', () => {
    if (!state.currentUser) return;
    const userTransactions = state.transactions.filter(t => t.username === state.currentUser.username);
    userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderTable(userTransactions);
  });
}

if (transactionFilterType) {
  transactionFilterType.addEventListener('change', () => {
    if (!state.currentUser) return;
    const userTransactions = state.transactions.filter(t => t.username === state.currentUser.username);
    userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderTable(userTransactions);
  });
}

// Export Transactions to CSV file download
function exportToCSV() {
  if (!state.currentUser) return;
  const userTransactions = state.transactions.filter(t => t.username === state.currentUser.username);
  
  if (userTransactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  // Create CSV Header
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  
  // Map rows
  const rows = userTransactions.map(t => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`, 
    `"${t.category.replace(/"/g, '""')}"`,
    t.type,
    t.amount
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `FinTrackPro_${state.currentUser.username}_Transactions.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const exportCsvBtn = document.getElementById('export-csv-btn');
if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', exportToCSV);
}


// ==========================================================================
// EDIT TRANSACTION OPERATIONS
// ==========================================================================

// Close Edit Modal overlay
if (closeEditModalBtn) {
  closeEditModalBtn.addEventListener('click', () => {
    if (editTransactionModal) editTransactionModal.classList.add('hidden');
  });
}

// Open Edit Transaction Modal & populate details
window.openEditTransaction = function(txId) {
  const transaction = state.transactions.find(t => t.id === txId);
  if (!transaction) return;

  if (editTxId) editTxId.value = transaction.id;
  if (editTxType) editTxType.value = transaction.type;
  if (editTxDesc) editTxDesc.value = transaction.description;
  if (editTxAmount) editTxAmount.value = transaction.amount;
  if (editTxDate) editTxDate.value = transaction.date;
  if (editTxCategory) editTxCategory.value = transaction.category;

  if (editTransactionModal) editTransactionModal.classList.remove('hidden');
};

// Form Submission (Save Edited Changes)
if (editTransactionForm) {
  editTransactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const txId = editTxId.value;
      const amount = parseFloat(editTxAmount.value);
      const type = editTxType.value;
      const category = editTxCategory.value;
      const date = editTxDate.value;
      const description = editTxDesc.value.trim();

      if (isNaN(amount) || amount < 0 || !type || !category || !date || !description) {
        alert('Please fill out all inputs with valid information.');
        return;
      }

      // Update in state
      const txIdx = state.transactions.findIndex(t => t.id === txId);
      if (txIdx !== -1) {
        state.transactions[txIdx].amount = amount;
        state.transactions[txIdx].type = type;
        state.transactions[txIdx].category = category;
        state.transactions[txIdx].date = date;
        state.transactions[txIdx].description = description;
      }

      saveState();
      
      // Close modal
      if (editTransactionModal) editTransactionModal.classList.add('hidden');
      
      renderDashboard();
    } catch (err) {
      console.error("Error during edit transaction form submission:", err);
    }
  });
}


// ==========================================================================
// BOOTSTRAP INITIALIZATION (Safe readyState Check)
// ==========================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
