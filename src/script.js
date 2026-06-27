// @ts-nocheck
/**
 * Daily Self Expense Tracker
 * Core Javascript - Premium Modular Architecture
 * Works perfectly with Vite & static deployment.
 */

// Global State
let expenses = [];
let budgetLimit = 1500;
let monthlyIncome = 3000;
let savingsPct = 20;
let currency = '₹';
let currentTheme = 'light';
let activeSection = 'dashboard';

// History Ledger filters & pagination state
let ledgerFilters = {
  search: '',
  category: '',
  payment: '',
  startDate: '',
  endDate: '',
  sort: 'date-desc'
};
let ledgerCurrentPage = 1;
const ledgerPageSize = 8;

// Current calendar viewing month/year (for calendar widget)
let calCurrentDate = new Date();

// Chart.js instances so we can update/destroy them cleanly
let dashboardCategoryChart = null;
let chartCategoryPie = null;
let chartWeeklyBar = null;
let chartMonthlyTrendLine = null;
let chartPaymentDoughnut = null;

// Target items for deletion confirmation
let pendingDeleteId = null;

// Default Seed Data to ensure instant beautiful visual feedback
const seedExpenses = [
  {
    id: "seed-1",
    date: getOffsetDateString(0), // Today
    time: "13:15",
    category: "Food",
    amount: 18.50,
    payment: "UPI",
    description: "Gourmet Lunch with coworkers",
    notes: "Split with Andy later"
  },
  {
    id: "seed-2",
    date: getOffsetDateString(0), // Today
    time: "08:30",
    category: "Transport",
    amount: 4.75,
    payment: "Debit Card",
    description: "Metro Commute to HQ",
    notes: "Weekly transit pass"
  },
  {
    id: "seed-3",
    date: getOffsetDateString(-1), // Yesterday
    time: "19:40",
    category: "Groceries",
    amount: 64.20,
    payment: "Credit Card",
    description: "Whole Foods Weekly Groceries",
    notes: "Stocked up on greens and salmon"
  },
  {
    id: "seed-4",
    date: getOffsetDateString(-3), // 3 days ago
    time: "10:00",
    category: "Bills",
    amount: 112.50,
    payment: "Net Banking",
    description: "High-Speed Fiber Internet & Power Bill",
    notes: "Auto-debited from bank"
  },
  {
    id: "seed-5",
    date: getOffsetDateString(-4), // 4 days ago
    time: "21:15",
    category: "Entertainment",
    amount: 28.00,
    payment: "Wallet",
    description: "Cinema ticket & popcorn combo",
    notes: "Saw sci-fi thriller"
  },
  {
    id: "seed-6",
    date: getOffsetDateString(-6), // 6 days ago
    time: "15:30",
    category: "Shopping",
    amount: 85.00,
    payment: "Credit Card",
    description: "Breathable Running Sneakers",
    notes: "Discounted sale price"
  },
  {
    id: "seed-7",
    date: getOffsetDateString(-8), // 8 days ago
    time: "12:00",
    category: "Rent",
    amount: 750.00,
    payment: "Net Banking",
    description: "June Studio Apartment rent share",
    notes: "Direct landlord transfer"
  },
  {
    id: "seed-8",
    date: getOffsetDateString(-11), // 11 days ago
    time: "17:45",
    category: "Recharge",
    amount: 15.00,
    payment: "UPI",
    description: "LTE Data Unlimited Pack recharge",
    notes: "Valid for 30 days"
  },
  {
    id: "seed-9",
    date: getOffsetDateString(-15), // 15 days ago
    time: "11:20",
    category: "Investment",
    amount: 200.00,
    payment: "Net Banking",
    description: "Index Fund SIP Auto-Deduction",
    notes: "Wealth building asset allocation"
  },
  {
    id: "seed-10",
    date: getOffsetDateString(-18), // 18 days ago
    time: "14:00",
    category: "Travel",
    amount: 145.00,
    payment: "Credit Card",
    description: "Flight reservation deposit",
    notes: "Summer weekend trip booking"
  }
];

// Helper to calculate offset date
function getOffsetDateString(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  updateLiveClock();
  setInterval(updateLiveClock, 1000);
  
  // Navigate to default view
  navigateTo('dashboard');
  
  // Render views & chart setups
  renderAllViews();
  
  showToast("Centz Finance Loaded", "info");
});

// Load preferences and expense list from Local Storage
function loadData() {
  const storedExpenses = localStorage.getItem('centz_expenses');
  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
  } else {
    // Seed default data for breathtaking initial visualization
    expenses = [...seedExpenses];
    localStorage.setItem('centz_expenses', JSON.stringify(expenses));
  }

  budgetLimit = parseFloat(localStorage.getItem('centz_budget_limit') || "1500");
  monthlyIncome = parseFloat(localStorage.getItem('centz_monthly_income') || "3000");
  savingsPct = parseFloat(localStorage.getItem('centz_savings_pct') || "20");
  currency = localStorage.getItem('centz_currency') || "₹";
  currentTheme = localStorage.getItem('centz_theme') || "light";

  // Apply theme class to HTML element
  applyTheme(currentTheme);

  // Set default values inside settings and form controls
  document.getElementById('settings-currency').value = currency;
  document.getElementById('budget-input-limit').value = budgetLimit;
  document.getElementById('calc-monthly-income').value = monthlyIncome;
  document.getElementById('calc-savings-pct').value = savingsPct;
  
  // Set default dates for add forms to today
  const todayStr = getOffsetDateString(0);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  document.getElementById('expense-date').value = todayStr;
  document.getElementById('expense-time').value = timeStr;
  document.getElementById('modal-expense-date').value = todayStr;
  document.getElementById('modal-expense-time').value = timeStr;
}

// Save list and settings to Local Storage
function saveData() {
  localStorage.setItem('centz_expenses', JSON.stringify(expenses));
  localStorage.setItem('centz_budget_limit', budgetLimit.toString());
  localStorage.setItem('centz_monthly_income', monthlyIncome.toString());
  localStorage.setItem('centz_savings_pct', savingsPct.toString());
  localStorage.setItem('centz_currency', currency.toString());
  localStorage.setItem('centz_theme', currentTheme);
}

// Apply Selected Visual Theme
function applyTheme(theme) {
  const body = document.body;
  const themeCheckbox = document.getElementById('theme-checkbox');
  
  if (theme === 'dark') {
    body.classList.add('dark-theme');
    if (themeCheckbox) themeCheckbox.checked = true;
    document.getElementById('btn-theme-dark').className = "flex-1 py-2 px-3 rounded-xl border border-slate-700/50 bg-slate-800 text-white text-xs font-bold flex items-center gap-2 justify-center transition-all shadow-sm";
    document.getElementById('btn-theme-light').className = "flex-1 py-2 px-3 rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:bg-slate-100/30 text-xs font-bold flex items-center gap-2 justify-center transition-all text-slate-500";
  } else {
    body.classList.remove('dark-theme');
    if (themeCheckbox) themeCheckbox.checked = false;
    document.getElementById('btn-theme-light').className = "flex-1 py-2 px-3 rounded-xl border border-slate-200/50 bg-white text-slate-800 text-xs font-bold flex items-center gap-2 justify-center transition-all shadow-sm";
    document.getElementById('btn-theme-dark').className = "flex-1 py-2 px-3 rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:bg-slate-100/30 text-xs font-bold flex items-center gap-2 justify-center transition-all text-slate-500";
  }
}

// Live Clock & Header Updater
function updateLiveClock() {
  const now = new Date();
  
  // Format live time: HH:MM:SS
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  
  // Format live date: Thursday, Jun 27, 2026
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  const dateString = now.toLocaleDateString('en-US', options);

  const clockEl = document.getElementById('live-clock');
  const dateEl = document.getElementById('live-date');
  
  if (clockEl) clockEl.innerText = `${hh}:${mm}:${ss}`;
  if (dateEl) dateEl.innerText = dateString;
}

// Navigation router
function navigateTo(sectionId) {
  activeSection = sectionId;

  // Toggle active views
  const sections = ['dashboard', 'add-expense', 'history', 'analytics', 'budget', 'settings'];
  sections.forEach(sec => {
    const el = document.getElementById(`section-${sec}`);
    if (el) {
      if (sec === sectionId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Toggle active class on sidebar buttons
  document.querySelectorAll('.nav-link').forEach(btn => {
    if (btn.getAttribute('data-section') === sectionId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update top header title with dynamic icons
  const headerTitleEl = document.getElementById('header-page-title');
  if (headerTitleEl) {
    let titleStr = '';
    switch (sectionId) {
      case 'dashboard': titleStr = '<i class="fa-solid fa-chart-pie mr-2 text-blue-500 animate-pulse"></i>Dashboard'; break;
      case 'add-expense': titleStr = '<i class="fa-solid fa-circle-plus mr-2 text-indigo-500"></i>Register Expense'; break;
      case 'history': titleStr = '<i class="fa-solid fa-receipt mr-2 text-emerald-500"></i>Transaction Ledger'; break;
      case 'analytics': titleStr = '<i class="fa-solid fa-chart-line mr-2 text-purple-500"></i>Financial Analytics'; break;
      case 'budget': titleStr = '<i class="fa-solid fa-sliders mr-2 text-amber-500"></i>Budget Control Room'; break;
      case 'settings': titleStr = '<i class="fa-solid fa-gear mr-2 text-slate-500"></i>System Settings'; break;
    }
    headerTitleEl.innerHTML = titleStr;
  }

  // Refresh view tables, metrics, calendar, and re-draw Chart.js charts
  renderAllViews();
}

// Centralized View Renderer
function renderAllViews() {
  // Update currency display indicators on input headers
  document.querySelectorAll('.currency-indicator').forEach(el => {
    el.innerText = currency;
  });

  // Calculate high level metrics
  const metrics = calculateMetrics();

  // Draw Dashboard components
  renderDashboardCounters(metrics);
  renderDashboardBento(metrics);
  renderRecentTransactions();
  renderCalendarWidget();

  // Draw History Ledger
  renderHistoryTable();

  // Draw Budget Control Room
  renderBudgetControls(metrics);

  // Render analytics charts if they are currently drawn
  renderAnalyticsTabPanels();
  renderCharts(metrics);
}

// Math Engine: Metrics Calculator
function calculateMetrics() {
  const now = new Date();
  const todayStr = getOffsetDateString(0);
  
  // Weekly bounds (current week Monday to Sunday)
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Monday is 1, Sunday is 7
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Monthly bounds
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Yearly bounds
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  let totalExpensesVal = 0;
  let todayExpensesVal = 0;
  let weeklyExpensesVal = 0;
  let monthlyExpensesVal = 0;
  let yearlyExpensesVal = 0;
  let totalTransactionsCount = expenses.length;

  // Track category amounts
  const categoryTotals = {};
  // Track payment method amounts
  const paymentTotals = {};
  
  // Day of week spending tracking (Monday-Sunday index 0-6)
  const weeklyDaySpends = [0, 0, 0, 0, 0, 0, 0];

  // Month-wise spending tracking (Jan-Dec index 0-11)
  const monthlyYearSpends = Array(12).fill(0);

  let highestExpenseItem = null;
  let todayTxns = [];

  expenses.forEach(exp => {
    const expDate = new Date(exp.date);
    const amt = parseFloat(exp.amount);
    
    // Total
    totalExpensesVal += amt;

    // Today
    if (exp.date === todayStr) {
      todayExpensesVal += amt;
      todayTxns.push(exp);
    }

    // Weekly
    if (expDate >= startOfWeek && expDate <= endOfWeek) {
      weeklyExpensesVal += amt;
      let dayIndex = expDate.getDay() === 0 ? 6 : expDate.getDay() - 1; // Mon=0, Sun=6
      weeklyDaySpends[dayIndex] += amt;
    }

    // Monthly
    if (expDate >= startOfMonth && expDate <= endOfMonth) {
      monthlyExpensesVal += amt;
      
      // Update Category distributions for current month
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;

      // Update Payment distributions
      paymentTotals[exp.payment] = (paymentTotals[exp.payment] || 0) + amt;
    }

    // Yearly
    if (expDate >= startOfYear && expDate <= endOfYear) {
      yearlyExpensesVal += amt;
      monthlyYearSpends[expDate.getMonth()] += amt;
    }

    // Overall Highest single transaction
    if (!highestExpenseItem || amt > highestExpenseItem.amount) {
      highestExpenseItem = exp;
    }
  });

  const remainingBudgetVal = Math.max(0, budgetLimit - monthlyExpensesVal);
  const budgetUtilizationPct = budgetLimit > 0 ? (monthlyExpensesVal / budgetLimit) * 100 : 0;
  const targetSavingsValue = (monthlyIncome * savingsPct) / 100;
  const estimatedSavings = Math.max(0, monthlyIncome - monthlyExpensesVal);

  return {
    totalExpenses: totalExpensesVal,
    todayExpenses: todayExpensesVal,
    weeklyExpenses: weeklyExpensesVal,
    monthlyExpenses: monthlyExpensesVal,
    yearlyExpenses: yearlyExpensesVal,
    remainingBudget: remainingBudgetVal,
    totalTransactions: totalTransactionsCount,
    budgetUtilizationPct: budgetUtilizationPct,
    targetSavingsValue: targetSavingsValue,
    estimatedSavings: estimatedSavings,
    categoryTotals: categoryTotals,
    paymentTotals: paymentTotals,
    weeklyDaySpends: weeklyDaySpends,
    monthlyYearSpends: monthlyYearSpends,
    highestExpenseItem: highestExpenseItem,
    todayTxns: todayTxns
  };
}

// Render Dashboard Counter Metrics
function renderDashboardCounters(metrics) {
  animateValueCounter('card-total-expenses', metrics.totalExpenses, true);
  animateValueCounter('card-today-expenses', metrics.todayExpenses, true);
  animateValueCounter('card-weekly-expenses', metrics.weeklyExpenses, true);
  animateValueCounter('card-monthly-expenses', metrics.monthlyExpenses, true);
  animateValueCounter('card-remaining-budget', metrics.remainingBudget, true);
  animateValueCounter('card-total-transactions', metrics.totalTransactions, false);

  // Update Banner Overview
  document.getElementById('dashboard-total-income').innerText = `${currency}${monthlyIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('dashboard-total-expense').innerText = `${currency}${metrics.monthlyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('dashboard-savings-target').innerText = `${currency}${metrics.targetSavingsValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  // Calculate efficiency: (Net Income - Spendings) as % of Net Income
  let efficiencyPct = 0;
  if (monthlyIncome > 0) {
    efficiencyPct = ((monthlyIncome - metrics.monthlyExpenses) / monthlyIncome) * 100;
  }
  document.getElementById('dashboard-savings-pct').innerText = `${Math.max(0, Math.round(efficiencyPct))}%`;

  // Determine budget status warning colors and borders
  const statusLabel = document.getElementById('budget-status-label');
  const cardRemainingBudget = document.getElementById('card-remaining-budget').parentElement;

  if (statusLabel && cardRemainingBudget) {
    if (metrics.budgetUtilizationPct >= 100) {
      statusLabel.innerText = "OVERSPENT";
      statusLabel.className = "text-[10px] font-bold text-rose-500 bg-rose-500/15 px-1.5 py-0.5 rounded-md";
      cardRemainingBudget.classList.add('pulsing-border');
      cardRemainingBudget.style.borderColor = 'rgba(239, 110, 110, 0.4)';
    } else if (metrics.budgetUtilizationPct >= 90) {
      statusLabel.innerText = "CRITICAL";
      statusLabel.className = "text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md";
      cardRemainingBudget.classList.remove('pulsing-border');
      cardRemainingBudget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    } else if (metrics.budgetUtilizationPct >= 75) {
      statusLabel.innerText = "WARNING";
      statusLabel.className = "text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md";
      cardRemainingBudget.classList.remove('pulsing-border');
      cardRemainingBudget.style.borderColor = 'rgba(245, 158, 11, 0.2)';
    } else {
      statusLabel.innerText = "SAFE";
      statusLabel.className = "text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md";
      cardRemainingBudget.classList.remove('pulsing-border');
      cardRemainingBudget.style.borderColor = '';
    }
  }

  // Update dynamic trend comparisons
  // Calculate relative spends to seed metrics as generic comparisons
  const trendTotal = document.getElementById('trend-total');
  const totalPrevMonth = 1400; // Mock historical baseline
  const totalChangePct = totalPrevMonth > 0 ? ((metrics.totalExpenses - totalPrevMonth) / totalPrevMonth) * 100 : 0;
  
  if (trendTotal) {
    if (totalChangePct >= 0) {
      trendTotal.innerHTML = `<i class="fa-solid fa-caret-up"></i> +${Math.abs(Math.round(totalChangePct))}%`;
      trendTotal.className = "text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md";
    } else {
      trendTotal.innerHTML = `<i class="fa-solid fa-caret-down"></i> -${Math.abs(Math.round(totalChangePct))}%`;
      trendTotal.className = "text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md";
    }
  }
}

// Incremental Numeric Value Counter Animator
function animateValueCounter(elementId, targetValue, isCurrency) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  const formattedTarget = isCurrency 
    ? `${currency}${targetValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    : targetValue.toLocaleString('en-US');
  
  // Instant clean update to avoid lagging interfaces
  el.innerText = formattedTarget;
}

// Render Dashboard Bento elements (Leaderboard, Highest spend card, financial grade report)
function renderDashboardBento(metrics) {
  // Sort Category spends
  const sortedCategories = Object.entries(metrics.categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  const topSpendingListEl = document.getElementById('top-spending-categories-list');
  if (topSpendingListEl) {
    if (sortedCategories.length === 0) {
      topSpendingListEl.innerHTML = `<p class="text-xs text-slate-400 text-center py-8">No transaction history detected.</p>`;
    } else {
      // Show top 3 categories
      let html = '';
      const highestSpendVal = sortedCategories[0][1];
      
      sortedCategories.slice(0, 3).forEach(([cat, val]) => {
        const pct = highestSpendVal > 0 ? (val / highestSpendVal) * 100 : 0;
        let badgeColor = `badge-gradient-${cat.toLowerCase()}`;
        
        html += `
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-semibold">
              <span class="px-2 py-0.5 rounded-md ${badgeColor} text-[10px] font-bold">${cat}</span>
              <span class="font-mono text-slate-800 dark:text-white">${currency}${val.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800/40 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      });
      topSpendingListEl.innerHTML = html;
    }
  }

  // Update Highest Expense subcard
  const highestDesc = document.getElementById('highest-expense-desc');
  const highestVal = document.getElementById('highest-expense-value');
  const highestDate = document.getElementById('highest-expense-date');

  if (metrics.highestExpenseItem) {
    if (highestDesc) highestDesc.innerText = metrics.highestExpenseItem.description;
    if (highestVal) highestVal.innerText = `${currency}${metrics.highestExpenseItem.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (highestDate) highestDate.innerText = formatDate(metrics.highestExpenseItem.date);
  } else {
    if (highestDesc) highestDesc.innerText = "No Data";
    if (highestVal) highestVal.innerText = `${currency}0.00`;
    if (highestDate) highestDate.innerText = "--/--/--";
  }

  // Update Automated Financial Scorecard
  const scoreBadge = document.getElementById('report-score-badge');
  const gradeTitle = document.getElementById('report-grade');
  const gradeDesc = document.getElementById('report-description');

  if (expenses.length === 0) {
    if (scoreBadge) scoreBadge.innerText = "Pending";
    if (gradeTitle) gradeTitle.innerText = "Evaluating Spendings...";
    if (gradeDesc) gradeDesc.innerText = "Add transactions to receive an immediate automated summary of your credit utilization, budget safety, and financial behavior score.";
  } else {
    const budgetPct = metrics.budgetUtilizationPct;
    let grade = 'A+';
    let title = 'Flawless Spend Control!';
    let desc = `Splendid job! You spent only ${Math.round(budgetPct)}% of your monthly allowance. Your remaining budget is safe, and savings metrics are expanding rapidly.`;
    let colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400";

    if (budgetPct > 100) {
      grade = 'F';
      title = 'Budget Deficit Alert';
      desc = `Critical warning: you exceeded your monthly boundary limit by ${currency}${(metrics.monthlyExpenses - budgetLimit).toLocaleString('en-US')}. Immediate cost cutting is advised.`;
      colorClass = "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400";
    } else if (budgetPct > 90) {
      grade = 'D';
      title = 'Critical Allowance Exhaustion';
      desc = `Caution: you utilized ${Math.round(budgetPct)}% of your limit. Only ${currency}${metrics.remainingBudget.toLocaleString('en-US')} is left. Restrict non-essential shopping.`;
      colorClass = "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300";
    } else if (budgetPct > 75) {
      grade = 'C';
      title = 'Elevated Mid-tier Spending';
      desc = `Moderate: spendings crossed 75% of your ceiling. Monitor upcoming grocery and bill plans to stay safe before month end.`;
      colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
    } else if (budgetPct > 50) {
      grade = 'B';
      title = 'Balanced Credit Sourcing';
      desc = `Stable footprint: current expenditure is ${Math.round(budgetPct)}% of budget. Standard transactions are well structured.`;
      colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
    }

    if (scoreBadge) {
      scoreBadge.innerText = `Grade ${grade}`;
      scoreBadge.className = `font-bold py-1 px-2.5 rounded-full text-xs ${colorClass}`;
    }
    if (gradeTitle) gradeTitle.innerText = title;
    if (gradeDesc) gradeDesc.innerText = desc;
  }
}

// Render Recent Transactions Widget
function renderRecentTransactions() {
  const tbody = document.getElementById('dashboard-recent-txs-body');
  if (!tbody) return;

  // Sort expenses to get latest 5 items
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`);
  });

  if (sortedExpenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-xs text-slate-400 font-medium">No recent transactions. Click Quick Add to log an expense!</td>
      </tr>
    `;
    return;
  }

  let html = '';
  sortedExpenses.slice(0, 5).forEach(exp => {
    const badgeColor = `badge-gradient-${exp.category.toLowerCase()}`;
    const formattedAmt = `${currency}${parseFloat(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    
    html += `
      <tr class="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-all">
        <td class="py-3 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div>${formatDate(exp.date)}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">${exp.time || '00:00'}</div>
        </td>
        <td class="py-3 px-2">
          <span class="px-2 py-0.5 rounded-md ${badgeColor} text-[10px] font-bold">${exp.category}</span>
        </td>
        <td class="py-3 px-2 text-xs text-slate-700 dark:text-slate-300 font-medium max-w-[140px] truncate" title="${exp.description}">
          <div>${exp.description}</div>
          ${exp.notes ? `<span class="text-[10px] text-slate-400 block truncate italic">${exp.notes}</span>` : ''}
        </td>
        <td class="py-3 px-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span class="flex items-center gap-1">
            <i class="${getPaymentMethodIcon(exp.payment)} text-[10px]"></i>
            <span>${exp.payment}</span>
          </span>
        </td>
        <td class="py-3 px-2 text-xs text-right font-bold text-slate-800 dark:text-white font-mono">
          ${formattedAmt}
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// Render Custom Interactive Calendar Widget
function renderCalendarWidget() {
  const gridContainer = document.getElementById('calendar-days-container');
  const monthYearLabel = document.getElementById('cal-month-year');
  if (!gridContainer || !monthYearLabel) return;

  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth(); // 0-11

  // Format month label: JUNE 2026
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  monthYearLabel.innerText = `${monthNames[month]} ${year}`;

  // Find start day of month (Monday index)
  // standard JS: Sunday is 0, Monday is 1...
  const firstDayOfMonth = new Date(year, month, 1);
  let startDayIndex = firstDayOfMonth.getDay();
  // shift to Mon=0, Sun=6
  startDayIndex = startDayIndex === 0 ? 6 : startDayIndex - 1;

  // Days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Draw empty cells for preceding month overlap
  let html = '';
  for (let i = 0; i < startDayIndex; i++) {
    html += `<div class="aspect-ratio calendar-day opacity-0 pointer-events-none"></div>`;
  }

  // Draw days
  const todayStr = getOffsetDateString(0);
  const selectedYearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

  for (let day = 1; day <= totalDays; day++) {
    const dayStr = `${selectedYearMonth}-${String(day).padStart(2, '0')}`;
    
    // Check if transactions exist on this day
    const hasExpense = expenses.some(exp => exp.date === dayStr);
    const isToday = dayStr === todayStr;
    
    let activeClass = isToday ? 'active-day font-bold' : 'text-slate-700 dark:text-slate-300 font-medium';
    
    html += `
      <div class="calendar-day ${activeClass}" onclick="filterLedgerByDate('${dayStr}')" title="${isToday ? 'Today' : ''} ${hasExpense ? 'Has transactions' : 'Empty day'}">
        <span>${day}</span>
        ${hasExpense ? '<span class="dot"></span>' : ''}
      </div>
    `;
  }
  gridContainer.innerHTML = html;
}

// Calendar day clicks auto filter ledger
window.filterLedgerByDate = function(targetDate) {
  ledgerFilters.startDate = targetDate;
  ledgerFilters.endDate = targetDate;
  
  // Set date filter inputs
  const startIn = document.getElementById('filter-start-date');
  const endIn = document.getElementById('filter-end-date');
  if (startIn) startIn.value = targetDate;
  if (endIn) endIn.value = targetDate;

  navigateTo('history');
  showToast(`Filtered ledger by: ${formatDate(targetDate)}`, "info");
};

// Render Transaction History Table (Ledger)
function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  const paginationInfo = document.getElementById('history-pagination-info');
  if (!tbody) return;

  // Apply search/filter inputs
  let filtered = expenses.filter(exp => {
    // Search
    const searchLow = ledgerFilters.search.toLowerCase();
    const matchSearch = !searchLow || 
      exp.description.toLowerCase().includes(searchLow) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchLow));
    
    // Category
    const matchCategory = !ledgerFilters.category || exp.category === ledgerFilters.category;

    // Payment method
    const matchPayment = !ledgerFilters.payment || exp.payment === ledgerFilters.payment;

    // Start Date
    const matchStart = !ledgerFilters.startDate || exp.date >= ledgerFilters.startDate;

    // End Date
    const matchEnd = !ledgerFilters.endDate || exp.date <= ledgerFilters.endDate;

    return matchSearch && matchCategory && matchPayment && matchStart && matchEnd;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    const amtA = parseFloat(a.amount);
    const amtB = parseFloat(b.amount);
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);

    switch (ledgerFilters.sort) {
      case 'date-desc': return dateB - dateA;
      case 'date-asc': return dateA - dateB;
      case 'amount-desc': return amtB - amtA;
      case 'amount-asc': return amtA - amtB;
      default: return dateB - dateA;
    }
  });

  const totalFiltered = filtered.length;
  const maxPages = Math.max(1, Math.ceil(totalFiltered / ledgerPageSize));
  
  // Guard current page
  if (ledgerCurrentPage > maxPages) ledgerCurrentPage = maxPages;
  if (ledgerCurrentPage < 1) ledgerCurrentPage = 1;

  // Extract page items
  const startIndex = (ledgerCurrentPage - 1) * ledgerPageSize;
  const pageItems = filtered.slice(startIndex, startIndex + ledgerPageSize);

  // Update pagination UI controls
  if (paginationInfo) {
    paginationInfo.innerText = `Showing ${Math.min(totalFiltered, startIndex + 1)}-${Math.min(totalFiltered, startIndex + ledgerPageSize)} of ${totalFiltered} logs`;
  }
  
  const prevBtn = document.getElementById('btn-pagination-prev');
  const nextBtn = document.getElementById('btn-pagination-next');
  if (prevBtn) prevBtn.disabled = ledgerCurrentPage === 1;
  if (nextBtn) nextBtn.disabled = ledgerCurrentPage === maxPages;

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-xs text-slate-400 font-medium">
          <i class="fa-solid fa-receipt text-3xl mb-3 text-slate-300 block"></i>
          No matching transactions found. Try adjusting your filters.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  pageItems.forEach(exp => {
    const badgeColor = `badge-gradient-${exp.category.toLowerCase()}`;
    const formattedAmt = `${currency}${parseFloat(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    html += `
      <tr class="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-all">
        <td class="py-3 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">${formatDate(exp.date)}</td>
        <td class="py-3 px-2 text-[11px] text-slate-500 font-mono">${exp.time || '00:00'}</td>
        <td class="py-3 px-2">
          <span class="px-2.5 py-0.5 rounded-md ${badgeColor} text-[10px] font-bold">${exp.category}</span>
        </td>
        <td class="py-3 px-2 text-xs font-semibold text-slate-800 dark:text-white max-w-[200px] truncate" title="${exp.description}">
          <div class="truncate">${exp.description}</div>
          ${exp.notes ? `<span class="text-[10px] text-slate-400 italic block truncate mt-0.5">${exp.notes}</span>` : ''}
        </td>
        <td class="py-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1.5">
            <i class="${getPaymentMethodIcon(exp.payment)}"></i>
            <span>${exp.payment}</span>
          </span>
        </td>
        <td class="py-3 px-2 text-xs text-right font-extrabold text-slate-800 dark:text-white font-mono">
          ${formattedAmt}
        </td>
        <td class="py-3 px-2 text-center">
          <div class="flex items-center justify-center gap-1">
            <button onclick="launchEditModal('${exp.id}')" class="p-1.5 hover:bg-blue-500/10 hover:text-blue-500 dark:text-slate-400 text-slate-500 rounded-lg transition-all" title="Edit entry">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button onclick="triggerConfirmDelete('${exp.id}')" class="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-400 text-slate-500 rounded-lg transition-all" title="Delete entry">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// Render Budget Management Screen
function renderBudgetControls(metrics) {
  // Update view indices
  document.getElementById('budget-view-limit').innerText = `${currency}${budgetLimit.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('budget-view-spent').innerText = `${currency}${metrics.monthlyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('budget-view-remaining').innerText = `${currency}${metrics.remainingBudget.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('budget-view-savings').innerText = `${currency}${metrics.estimatedSavings.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

  // Update Progress Fill and Text
  const barFill = document.getElementById('budget-progress-bar-fill');
  const pctText = document.getElementById('budget-status-percentage');
  const roundedPct = Math.round(metrics.budgetUtilizationPct);

  if (barFill && pctText) {
    pctText.innerText = `${roundedPct}%`;
    barFill.style.width = `${Math.min(100, roundedPct)}%`;

    // Color code progress depending on limit levels
    if (roundedPct >= 100) {
      barFill.className = "h-full rounded-full bg-red-500 pulsing-border";
    } else if (roundedPct >= 90) {
      barFill.className = "h-full rounded-full bg-red-400";
    } else if (roundedPct >= 75) {
      barFill.className = "h-full rounded-full bg-amber-500";
    } else {
      barFill.className = "h-full rounded-full bg-emerald-500";
    }
  }

  // Update sidebar elements
  const sidebarPct = document.getElementById('sidebar-budget-pct');
  const sidebarBar = document.getElementById('sidebar-budget-bar');
  if (sidebarPct) sidebarPct.innerText = `${roundedPct}%`;
  if (sidebarBar) {
    sidebarBar.style.width = `${Math.min(100, roundedPct)}%`;
    if (roundedPct >= 90) sidebarBar.className = "bg-rose-500 h-full w-0 transition-all duration-500";
    else if (roundedPct >= 75) sidebarBar.className = "bg-amber-500 h-full w-0 transition-all duration-500";
    else sidebarBar.className = "bg-emerald-500 h-full w-0 transition-all duration-500";
  }

  // Generate warning alert panels depending on percentage bounds
  const alertsContainer = document.getElementById('budget-status-alerts');
  if (alertsContainer) {
    let alertsHtml = '';

    if (roundedPct >= 100) {
      alertsHtml = `
        <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex gap-3 animate-slide-up">
          <i class="fa-solid fa-triangle-exclamation text-lg"></i>
          <div>
            <span class="block font-bold">BUDGET DEFICIT EXCEEDED (100%+)</span>
            <span class="block mt-0.5 text-[11px] font-medium leading-relaxed">Your monthly spending is in a deficit. You have crossed your target limit by ${currency}${(metrics.monthlyExpenses - budgetLimit).toLocaleString('en-US')}. Delay non-essential acquisitions immediately.</span>
          </div>
        </div>
      `;
    } else if (roundedPct >= 90) {
      alertsHtml = `
        <div class="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-semibold flex gap-3 animate-slide-up">
          <i class="fa-solid fa-triangle-exclamation text-lg"></i>
          <div>
            <span class="block font-bold">CRITICAL THRESHOLD BREACH (90%+)</span>
            <span class="block mt-0.5 text-[11px] font-medium leading-relaxed">Alert: You utilized ${roundedPct}% of your ceiling. Only ${currency}${metrics.remainingBudget.toLocaleString('en-US')} remains for the billing cycle. Guard expenditures closely.</span>
          </div>
        </div>
      `;
    } else if (roundedPct >= 75) {
      alertsHtml = `
        <div class="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-500 text-xs font-semibold flex gap-3 animate-slide-up">
          <i class="fa-solid fa-circle-exclamation text-lg"></i>
          <div>
            <span class="block font-bold">ELEVATED EXPENDITURE WARN (75%+)</span>
            <span class="block mt-0.5 text-[11px] font-medium leading-relaxed">Warning: Spent more than 75% of your target. Your monthly trends suggest a steady burn rate. Be mindful of entertainment or shopping segments.</span>
          </div>
        </div>
      `;
    } else if (roundedPct >= 50) {
      alertsHtml = `
        <div class="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-500 text-xs font-semibold flex gap-3 animate-slide-up">
          <i class="fa-solid fa-circle-info text-lg"></i>
          <div>
            <span class="block font-bold">MID-MONTH CEILING MILESTONE (50%+)</span>
            <span class="block mt-0.5 text-[11px] font-medium leading-relaxed">Info: You utilized half of your configured budget. Your savings are currently well structured and aligned with expectations.</span>
          </div>
        </div>
      `;
    } else {
      alertsHtml = `
        <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex gap-3 animate-slide-up">
          <i class="fa-solid fa-circle-check text-lg"></i>
          <div>
            <span class="block font-bold">OUTSTANDING BUDGET ALLOCATION</span>
            <span class="block mt-0.5 text-[11px] font-medium leading-relaxed">Congratulations: You used only ${roundedPct}% of your threshold limit. Keep up the high efficiency to maximize compound savings goals!</span>
          </div>
        </div>
      `;
    }

    alertsContainer.innerHTML = alertsHtml;
  }
}

// Render Analytics Tab Panels
function renderAnalyticsTabPanels() {
  const activeTab = document.querySelector('.analytics-tab-btn.border-blue-500').getAttribute('data-analytics-tab');
  
  // Toggle panel displays
  document.querySelectorAll('.analytics-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  const targetPanel = document.getElementById(`analytics-panel-${activeTab}`);
  if (targetPanel) targetPanel.classList.remove('hidden');

  // Load analytics calculations
  const now = new Date();
  const todayStr = getOffsetDateString(0);

  // Filter Today
  const todayTxns = expenses.filter(exp => exp.date === todayStr);
  const todayTotal = todayTxns.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const todayHighest = todayTxns.length > 0 ? Math.max(...todayTxns.map(exp => parseFloat(exp.amount))) : 0;
  const todayLowest = todayTxns.length > 0 ? Math.min(...todayTxns.map(exp => parseFloat(exp.amount))) : 0;
  const todayAvg = todayTxns.length > 0 ? (todayTotal / todayTxns.length) : 0;

  document.getElementById('anal-daily-spend').innerText = `${currency}${todayTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-daily-highest').innerText = `${currency}${todayHighest.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-daily-lowest').innerText = `${currency}${todayLowest.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-daily-avg').innerText = `${currency}${todayAvg.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-daily-txs').innerText = todayTxns.length;

  // Filter Weekly
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDayOfWeek + 1);
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  const weeklyTxns = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const weeklyTotal = weeklyTxns.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const weeklyAvg = weeklyTotal / 7;

  // Calculate highest/lowest spend days
  const dailySpends = Array(7).fill(0);
  weeklyTxns.forEach(exp => {
    const d = new Date(exp.date);
    let dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
    dailySpends[dayIndex] += parseFloat(exp.amount);
  });

  const daysStr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let maxDayIndex = 0;
  let minDayIndex = 6;
  let maxDayVal = dailySpends[0];
  let minDayVal = dailySpends[0];

  for (let i = 1; i < 7; i++) {
    if (dailySpends[i] > maxDayVal) {
      maxDayVal = dailySpends[i];
      maxDayIndex = i;
    }
    if (dailySpends[i] < minDayVal) {
      minDayVal = dailySpends[i];
      minDayIndex = i;
    }
  }

  document.getElementById('anal-weekly-total').innerText = `${currency}${weeklyTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-weekly-avg').innerText = `${currency}${weeklyAvg.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-weekly-highest').innerText = weeklyTotal > 0 ? daysStr[maxDayIndex] : "None";
  document.getElementById('anal-weekly-lowest').innerText = weeklyTotal > 0 ? daysStr[minDayIndex] : "None";

  // Filter Monthly
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthlyTxns = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d >= startOfMonth && d <= endOfMonth;
  });

  const monthlyTotal = monthlyTxns.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthlyAvg = monthlyTotal / daysInMonth;
  const monthlyHighest = monthlyTxns.length > 0 ? Math.max(...monthlyTxns.map(exp => parseFloat(exp.amount))) : 0;
  const monthlyLowest = monthlyTxns.length > 0 ? Math.min(...monthlyTxns.map(exp => parseFloat(exp.amount))) : 0;
  const monthlySavings = Math.max(0, monthlyIncome - monthlyTotal);

  document.getElementById('anal-monthly-total').innerText = `${currency}${monthlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-monthly-avg').innerText = `${currency}${monthlyAvg.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-monthly-txs').innerText = monthlyTxns.length;
  document.getElementById('anal-monthly-highest').innerText = `${currency}${monthlyHighest.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-monthly-lowest').innerText = `${currency}${monthlyLowest.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-monthly-savings').innerText = `${currency}${monthlySavings.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

  // Filter Yearly
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const yearlyTxns = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d >= startOfYear && d <= endOfYear;
  });

  const yearlyTotal = yearlyTxns.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const yearlyAvg = yearlyTotal / 12;

  // Calculate high/low month
  const monthlySpends = Array(12).fill(0);
  yearlyTxns.forEach(exp => {
    const d = new Date(exp.date);
    monthlySpends[d.getMonth()] += parseFloat(exp.amount);
  });

  const monthsStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let maxMonthIndex = 0;
  let minMonthIndex = 0;
  let maxMonthVal = monthlySpends[0];
  let minMonthVal = monthlySpends[0];

  for (let i = 1; i < 12; i++) {
    if (monthlySpends[i] > maxMonthVal) {
      maxMonthVal = monthlySpends[i];
      maxMonthIndex = i;
    }
    if (monthlySpends[i] < minMonthVal) {
      minMonthVal = monthlySpends[i];
      minMonthIndex = i;
    }
  }

  document.getElementById('anal-yearly-total').innerText = `${currency}${yearlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-yearly-avg').innerText = `${currency}${yearlyAvg.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('anal-yearly-highest').innerText = yearlyTotal > 0 ? monthsStr[maxMonthIndex] : "None";
  document.getElementById('anal-yearly-lowest').innerText = yearlyTotal > 0 ? monthsStr[minMonthIndex] : "None";
}

// Master Chart Renderer Engine
function renderCharts(metrics) {
  const isDark = document.body.classList.contains('dark-theme');
  
  // Custom theme colors for charts
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)';
  const labelColor = isDark ? '#94a3b8' : '#475569';
  const mainFont = 'Inter';

  // Categories configurations
  const defaultCategories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Travel", "Recharge", "Rent", "Investment", "Groceries", "Other"];
  const categoryColors = [
    '#f59e0b', '#38bdf8', '#ec4899', '#ef4444', '#a855f7',
    '#10b981', '#6366f1', '#14b8a6', '#f97316', '#64748b',
    '#34d399', '#eab308', '#9ca3af'
  ];

  // 1. Prepare Category spending arrays
  const categoryVals = defaultCategories.map(cat => metrics.categoryTotals[cat] || 0);

  // Helper chart configurations
  const barColors = '#4f46e5';
  const lineColors = '#2563eb';

  // Set up chart data
  const pieData = {
    labels: defaultCategories.filter((_, idx) => categoryVals[idx] > 0),
    datasets: [{
      data: categoryVals.filter(v => v > 0),
      backgroundColor: categoryColors.filter((_, idx) => categoryVals[idx] > 0),
      borderWidth: isDark ? 2 : 1,
      borderColor: isDark ? '#1e293b' : '#ffffff'
    }]
  };

  const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"];
  const paymentColors = ['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#64748b'];
  const paymentVals = paymentMethods.map(m => metrics.paymentTotals[m] || 0);

  const doughnutData = {
    labels: paymentMethods.filter((_, idx) => paymentVals[idx] > 0),
    datasets: [{
      data: paymentVals.filter(v => v > 0),
      backgroundColor: paymentColors.filter((_, idx) => paymentVals[idx] > 0),
      borderWidth: isDark ? 2 : 1,
      borderColor: isDark ? '#1e293b' : '#ffffff'
    }]
  };

  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: 'Spending',
      data: metrics.weeklyDaySpends,
      backgroundColor: 'rgba(79, 70, 229, 0.85)',
      borderRadius: 8,
      hoverBackgroundColor: '#4f46e5'
    }]
  };

  const monthsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const lineData = {
    labels: monthsLabels,
    datasets: [{
      label: 'Monthly Trend',
      data: metrics.monthlyYearSpends,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2563eb',
      pointRadius: 4
    }]
  };

  // Rebuild Charts
  // Clean up existing instances
  if (dashboardCategoryChart) dashboardCategoryChart.destroy();
  if (chartCategoryPie) chartCategoryPie.destroy();
  if (chartWeeklyBar) chartWeeklyBar.destroy();
  if (chartMonthlyTrendLine) chartMonthlyTrendLine.destroy();
  if (chartPaymentDoughnut) chartPaymentDoughnut.destroy();

  // Create Dashboard Sidebar Category Chart
  const ctxDash = document.getElementById('dashboardCategoryChart');
  if (ctxDash) {
    const displayPieData = categoryVals.some(v => v > 0);
    dashboardCategoryChart = new Chart(ctxDash, {
      type: displayPieData ? 'doughnut' : 'doughnut',
      data: displayPieData ? pieData : {
        labels: ["No Transactions"],
        datasets: [{
          data: [1],
          backgroundColor: [isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: labelColor, font: { family: mainFont, size: 10 } }
          }
        },
        cutout: '70%'
      }
    });
  }

  // Create full charts on analytics view
  const ctxPie = document.getElementById('chartCategoryPie');
  if (ctxPie) {
    chartCategoryPie = new Chart(ctxPie, {
      type: 'pie',
      data: pieData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: labelColor, font: { family: mainFont, size: 10 } }
          }
        }
      }
    });
  }

  const ctxBar = document.getElementById('chartWeeklyBar');
  if (ctxBar) {
    chartWeeklyBar = new Chart(ctxBar, {
      type: 'bar',
      data: weeklyData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: labelColor, font: { family: mainFont, size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: mainFont, size: 10 } } }
        }
      }
    });
  }

  const ctxLine = document.getElementById('chartMonthlyTrendLine');
  if (ctxLine) {
    chartMonthlyTrendLine = new Chart(ctxLine, {
      type: 'line',
      data: lineData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: labelColor, font: { family: mainFont, size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: mainFont, size: 10 } } }
        }
      }
    });
  }

  const ctxDoughnut = document.getElementById('chartPaymentDoughnut');
  if (ctxDoughnut) {
    chartPaymentDoughnut = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: doughnutData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: labelColor, font: { family: mainFont, size: 10 } }
          }
        }
      }
    });
  }
}

// Event Listeners Centralized Manager
function setupEventListeners() {
  // Sidebar toggler for mobile devices
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebar-toggle-btn').addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
  });
  document.getElementById('sidebar-close-btn').addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
  });

  // Main navigation clicks
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      navigateTo(section);
      
      // Close mobile sidebar on navigation
      if (window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
      }
    });
  });

  // Navigation shortcuts from other panels
  document.querySelectorAll('[data-section]').forEach(el => {
    if (!el.classList.contains('nav-link')) {
      el.addEventListener('click', (e) => {
        navigateTo(el.getAttribute('data-section'));
      });
    }
  });

  // Theme Toggler Switch in Header
  document.getElementById('theme-checkbox').addEventListener('change', (e) => {
    currentTheme = e.target.checked ? 'dark' : 'light';
    applyTheme(currentTheme);
    saveData();
    // Redraw charts with adapted themes
    const metrics = calculateMetrics();
    renderCharts(metrics);
  });

  // Add Expense Main Form submission
  document.getElementById('main-expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleExpenseSubmit('main-expense-form');
  });

  // Quick Add Modal Trigger buttons
  const modal = document.getElementById('modal-add-expense');
  const openModal = () => {
    // Reset modal form
    document.getElementById('modal-expense-form').reset();
    document.getElementById('modal-editing-id').value = '';
    document.getElementById('modal-title').innerText = "Quick Add Transaction";
    document.getElementById('modal-icon').className = "fa-solid fa-circle-plus";
    
    // Set today dates
    const todayStr = getOffsetDateString(0);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('modal-expense-date').value = todayStr;
    document.getElementById('modal-expense-time').value = timeStr;

    document.getElementById('modal-form-error').classList.add('hidden');
    
    // Show modal
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.querySelector('.glass-panel').classList.remove('scale-95');
  };
  
  const closeModal = () => {
    modal.classList.add('pointer-events-none', 'opacity-0');
    modal.querySelector('.glass-panel').classList.add('scale-95');
  };

  document.getElementById('header-quick-add-btn').addEventListener('click', openModal);
  document.getElementById('floating-add-btn').addEventListener('click', openModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  
  // Close modal on background clicks
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Modal Form submission
  document.getElementById('modal-expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (handleExpenseSubmit('modal-expense-form')) {
      closeModal();
    }
  });

  // Cancel reset form button
  document.getElementById('form-cancel-btn').addEventListener('click', () => {
    document.getElementById('main-expense-form').reset();
    const todayStr = getOffsetDateString(0);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('expense-date').value = todayStr;
    document.getElementById('expense-time').value = timeStr;
    document.getElementById('form-editing-id').value = '';
    document.getElementById('form-submit-btn').innerText = "Submit Expense";
  });

  // History Filter inputs
  const runFilterUpdate = () => {
    ledgerFilters.search = document.getElementById('filter-search').value;
    ledgerFilters.category = document.getElementById('filter-category').value;
    ledgerFilters.payment = document.getElementById('filter-payment').value;
    ledgerFilters.startDate = document.getElementById('filter-start-date').value;
    ledgerFilters.endDate = document.getElementById('filter-end-date').value;
    ledgerFilters.sort = document.getElementById('filter-sort').value;
    ledgerCurrentPage = 1; // Reset to page 1
    renderHistoryTable();
  };

  document.getElementById('filter-search').addEventListener('input', runFilterUpdate);
  document.getElementById('filter-category').addEventListener('change', runFilterUpdate);
  document.getElementById('filter-payment').addEventListener('change', runFilterUpdate);
  document.getElementById('filter-start-date').addEventListener('change', runFilterUpdate);
  document.getElementById('filter-end-date').addEventListener('change', runFilterUpdate);
  document.getElementById('filter-sort').addEventListener('change', runFilterUpdate);

  // Clear Filter button
  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-payment').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    document.getElementById('filter-sort').value = 'date-desc';
    
    ledgerFilters = {
      search: '',
      category: '',
      payment: '',
      startDate: '',
      endDate: '',
      sort: 'date-desc'
    };
    ledgerCurrentPage = 1;
    renderHistoryTable();
    showToast("Filters reset successfully", "info");
  });

  // History Pagination controls
  document.getElementById('btn-pagination-prev').addEventListener('click', () => {
    if (ledgerCurrentPage > 1) {
      ledgerCurrentPage--;
      renderHistoryTable();
    }
  });
  document.getElementById('btn-pagination-next').addEventListener('click', () => {
    ledgerCurrentPage++;
    renderHistoryTable();
  });

  // Analytics tab selection switches
  document.querySelectorAll('.analytics-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.analytics-tab-btn').forEach(b => {
        b.className = "analytics-tab-btn py-3 px-5 text-sm font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-b-2 border-transparent";
      });
      btn.className = "analytics-tab-btn py-3 px-5 text-sm font-semibold text-blue-500 border-b-2 border-blue-500";
      renderAnalyticsTabPanels();
    });
  });

  // Calendar Widget next/prev month toggling
  document.getElementById('cal-prev-month').addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
    renderCalendarWidget();
  });
  document.getElementById('cal-next-month').addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
    renderCalendarWidget();
  });

  // Save Budget limit button
  document.getElementById('btn-save-budget').addEventListener('click', () => {
    const limitInput = document.getElementById('budget-input-limit');
    const val = parseFloat(limitInput.value);
    
    if (isNaN(val) || val <= 0) {
      showToast("Please provide a valid budget limit amount", "error");
      return;
    }

    budgetLimit = val;
    saveData();
    renderAllViews();
    showToast("Monthly Budget Updated", "success");
  });

  // Settings: Currency selector change listener
  document.getElementById('settings-currency').addEventListener('change', (e) => {
    currency = e.target.value;
    saveData();
    renderAllViews();
    showToast(`Currency symbol updated to: ${currency}`, "success");
  });

  // Theme settings buttons
  document.getElementById('btn-theme-light').addEventListener('click', () => {
    currentTheme = 'light';
    applyTheme(currentTheme);
    saveData();
    renderAllViews();
    showToast("Theme switched to Light mode", "info");
  });
  document.getElementById('btn-theme-dark').addEventListener('click', () => {
    currentTheme = 'dark';
    applyTheme(currentTheme);
    saveData();
    renderAllViews();
    showToast("Theme switched to Dark mode", "info");
  });

  // Income vs Savings Goal update click
  document.getElementById('calc-save-btn').addEventListener('click', () => {
    const incInput = document.getElementById('calc-monthly-income');
    const pctInput = document.getElementById('calc-savings-pct');
    
    const incVal = parseFloat(incInput.value);
    const pctVal = parseFloat(pctInput.value);

    if (isNaN(incVal) || incVal <= 0 || isNaN(pctVal) || pctVal < 0 || pctVal > 100) {
      showToast("Please enter valid income and savings values", "error");
      return;
    }

    monthlyIncome = incVal;
    savingsPct = pctVal;
    saveData();
    renderAllViews();
    showToast("Financial values synced", "success");
  });

  // Delete Modals button actions
  const deleteModal = document.getElementById('modal-confirm-delete');
  const closeDeleteModal = () => {
    deleteModal.classList.add('pointer-events-none', 'opacity-0');
    deleteModal.querySelector('.glass-panel').classList.add('scale-95');
    pendingDeleteId = null;
  };

  document.getElementById('btn-delete-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('btn-delete-confirm').addEventListener('click', () => {
    if (pendingDeleteId) {
      // Find entry and remove
      const idx = expenses.findIndex(exp => exp.id === pendingDeleteId);
      if (idx !== -1) {
        expenses.splice(idx, 1);
        saveData();
        renderAllViews();
        showToast("Expense Deleted", "error");
      }
      closeDeleteModal();
    }
  });

  // Export CSV button click
  document.getElementById('btn-export-csv').addEventListener('click', handleCSVExport);

  // Import CSV trigger buttons
  const csvFileIn = document.getElementById('btn-import-csv-file');
  document.getElementById('btn-import-csv-trigger').addEventListener('click', () => {
    csvFileIn.click();
  });
  
  csvFileIn.addEventListener('change', handleCSVImport);

  // Reset Data button click
  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm("WARNING: Are you absolutely sure you want to reset Centz database? All custom inputs will be lost.")) {
      localStorage.clear();
      loadData();
      renderAllViews();
      showToast("Centz database reset to factory defaults", "warning");
    }
  });

  // Add Button Ripple animations
  document.querySelectorAll('button, .nav-link').forEach(btn => {
    btn.addEventListener('mousedown', function(e) {
      if (btn.classList.contains('btn-ripple') || btn.classList.contains('nav-link')) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        btn.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    });
  });
}

// Handle Form Submission for adding or updating expenses
function handleExpenseSubmit(formId) {
  const isModal = formId === 'modal-expense-form';
  const prefix = isModal ? 'modal-' : '';
  
  const idVal = document.getElementById(`${prefix}editing-id`).value;
  const dateVal = document.getElementById(`${prefix}expense-date`).value;
  const timeVal = document.getElementById(`${prefix}expense-time`).value;
  const catVal = document.getElementById(`${prefix}expense-category`).value;
  const amtVal = parseFloat(document.getElementById(`${prefix}expense-amount`).value);
  const payVal = document.getElementById(`${prefix}expense-payment`).value;
  const descVal = document.getElementById(`${prefix}expense-description`).value;
  const notesVal = document.getElementById(`${prefix}expense-notes`).value;

  const errorMsg = document.getElementById(isModal ? 'modal-form-error' : 'form-error-msg');

  // Basic Validation
  if (!dateVal || !catVal || isNaN(amtVal) || amtVal <= 0 || !payVal || !descVal) {
    if (errorMsg) errorMsg.classList.remove('hidden');
    showToast("Incomplete submission fields", "error");
    return false;
  }

  if (errorMsg) errorMsg.classList.add('hidden');

  const payload = {
    id: idVal || `exp-${Date.now()}`,
    date: dateVal,
    time: timeVal || "00:00",
    category: catVal,
    amount: amtVal,
    payment: payVal,
    description: descVal,
    notes: notesVal
  };

  if (idVal) {
    // Update existing transaction
    const idx = expenses.findIndex(exp => exp.id === idVal);
    if (idx !== -1) {
      expenses[idx] = payload;
      showToast("Expense Updated", "success");
    }
  } else {
    // Insert new transaction
    expenses.push(payload);
    showToast("Expense Added", "success");
  }

  saveData();
  renderAllViews();

  // Reset Form
  document.getElementById(formId).reset();
  
  // Set default date values
  const todayStr = getOffsetDateString(0);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  document.getElementById(`${prefix}expense-date`).value = todayStr;
  document.getElementById(`${prefix}expense-time`).value = timeStr;
  document.getElementById(`${prefix}editing-id`).value = '';

  const submitBtn = document.getElementById(isModal ? '' : 'form-submit-btn');
  if (submitBtn) submitBtn.innerText = "Submit Expense";

  // Check budget limits for warnings alert alerts on top
  const metrics = calculateMetrics();
  const roundedPct = Math.round(metrics.budgetUtilizationPct);
  if (roundedPct >= 100) {
    showToast("⚠️ WARNING: Monthly Limit Overdrawn!", "error");
  } else if (roundedPct >= 90) {
    showToast("⚠️ CRITICAL: Budget exceeds 90%!", "warning");
  } else if (roundedPct >= 75) {
    showToast("⚠️ WARNING: Budget exceeds 75%!", "warning");
  }

  return true;
}

// Trigger Edit Modal for a specific transaction
window.launchEditModal = function(id) {
  const exp = expenses.find(exp => exp.id === id);
  if (!exp) return;

  const modal = document.getElementById('modal-add-expense');
  if (!modal) return;

  // Populate fields
  document.getElementById('modal-editing-id').value = exp.id;
  document.getElementById('modal-expense-date').value = exp.date;
  document.getElementById('modal-expense-time').value = exp.time || '00:00';
  document.getElementById('modal-expense-category').value = exp.category;
  document.getElementById('modal-expense-amount').value = exp.amount;
  document.getElementById('modal-expense-payment').value = exp.payment;
  document.getElementById('modal-expense-description').value = exp.description;
  document.getElementById('modal-expense-notes').value = exp.notes || '';

  // Update header text in modal
  document.getElementById('modal-title').innerText = "Edit Transaction";
  document.getElementById('modal-icon').className = "fa-solid fa-pen";
  document.getElementById('modal-form-error').classList.add('hidden');

  // Trigger modal visibility
  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.querySelector('.glass-panel').classList.remove('scale-95');
};

// Launch Delete Confirmation
window.triggerConfirmDelete = function(id) {
  pendingDeleteId = id;
  const modal = document.getElementById('modal-confirm-delete');
  if (modal) {
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.querySelector('.glass-panel').classList.remove('scale-95');
  }
};

// Custom Toast System
function showToast(message, type = "info") {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  
  let iconClass = "fa-circle-info";
  if (type === "success") iconClass = "fa-circle-check";
  else if (type === "error") iconClass = "fa-circle-xmark";
  else if (type === "warning") iconClass = "fa-triangle-exclamation";

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} text-lg"></i>
    <span class="text-xs font-bold font-sans">${message}</span>
  `;

  container.appendChild(toast);

  // Auto close after 3 seconds with slide animations
  setTimeout(() => {
    toast.classList.add('closing');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Export Transactions ledger to CSV format
function handleCSVExport() {
  if (expenses.length === 0) {
    showToast("No transaction ledger items to export", "error");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Date,Time,Category,Amount,Payment Method,Description,Notes\r\n";

  expenses.forEach(exp => {
    const row = [
      exp.date,
      exp.time || "00:00",
      `"${exp.category}"`,
      exp.amount,
      `"${exp.payment}"`,
      `"${exp.description.replace(/"/g, '""')}"`,
      `"${(exp.notes || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(",") + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "centz_expense_ledger.csv");
  document.body.appendChild(link); // Required for FF

  link.click();
  document.body.removeChild(link);
  showToast("Ledger exported successfully", "success");
}

// Import CSV Ledger data
function handleCSVImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);
      
      if (lines.length < 2) {
        throw new Error("Empty CSV file.");
      }

      // Read Header Row
      const headers = lines[0].split(",");
      if (headers.length < 5) {
        throw new Error("Invalid columns layout.");
      }

      let parsedCount = 0;
      const importedExpenses = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom split parsing to handle quotes appropriately
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const columns = line.split(regex).map(col => col.replace(/^"|"$/g, '').trim());

        if (columns.length < 4) continue;

        const date = columns[0];
        const time = columns[1] || "00:00";
        const category = columns[2];
        const amount = parseFloat(columns[3]);
        const payment = columns[4];
        const description = columns[5] || "Imported Expense";
        const notes = columns[6] || "";

        // Basic sanity validation
        if (!date || !category || isNaN(amount) || amount <= 0 || !payment) {
          continue;
        }

        importedExpenses.push({
          id: `imp-${Date.now()}-${parsedCount}`,
          date: date,
          time: time,
          category: category,
          amount: amount,
          payment: payment,
          description: description,
          notes: notes
        });
        
        parsedCount++;
      }

      if (importedExpenses.length === 0) {
        showToast("No valid transaction lines detected in CSV", "error");
        return;
      }

      // Merge imported data
      expenses = [...expenses, ...importedExpenses];
      saveData();
      renderAllViews();
      showToast(`Successfully imported ${parsedCount} transactions`, "success");

      // Reset file input
      e.target.value = '';

    } catch (err) {
      showToast(`Import failed: ${err.message}`, "error");
    }
  };
  reader.readAsText(file);
}

// Utility formatting functions
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function getPaymentMethodIcon(method) {
  switch (method) {
    case 'Cash': return 'fa-solid fa-money-bill-1-wave text-emerald-500';
    case 'UPI': return 'fa-solid fa-mobile-screen-button text-purple-500';
    case 'Credit Card': return 'fa-solid fa-credit-card text-blue-500';
    case 'Debit Card': return 'fa-solid fa-credit-card text-indigo-500';
    case 'Net Banking': return 'fa-solid fa-building-columns text-amber-500';
    case 'Wallet': return 'fa-solid fa-wallet text-pink-500';
    default: return 'fa-solid fa-money-bill-transfer text-slate-500';
  }
}
