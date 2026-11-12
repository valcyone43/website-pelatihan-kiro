// ─── State ───────────────────────────────────────────────────────────────────

let transactions = [];
let settings = { theme: "light", spendingLimit: 0 };
let chartInstance = null;
let currentSort = "default";

// ─── Local Storage ────────────────────────────────────────────────────────────

/**
 * Load both state keys from localStorage, falling back to defaults when absent.
 */
function loadData() {
  const storedTransactions = localStorage.getItem("transactions");
  const storedSettings = localStorage.getItem("settings");

  if (storedTransactions !== null) {
    try {
      transactions = JSON.parse(storedTransactions);
    } catch {
      transactions = [];
    }
  }

  if (storedSettings !== null) {
    try {
      settings = JSON.parse(storedSettings);
    } catch {
      settings = { theme: "light", spendingLimit: 0 };
    }
  }
}

/**
 * Persist the transactions array to localStorage.
 */
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

/**
 * Persist the settings object to localStorage.
 */
function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

// ─── Stubs (implemented in later tasks) ──────────────────────────────────────

/**
 * Return a sorted copy of the transactions array based on `currentSort`.
 * - "default"     → original insertion order
 * - "amount-asc"  → ascending by amount
 * - "amount-desc" → descending by amount
 * - "category-az" → category name A–Z (case-insensitive)
 * Satisfies OC-3.
 */
function getSortedTransactions() {
  const copy = [...transactions];

  switch (currentSort) {
    case "amount-asc":
      copy.sort((a, b) => a.amount - b.amount);
      break;
    case "amount-desc":
      copy.sort((a, b) => b.amount - a.amount);
      break;
    case "category-az":
      copy.sort((a, b) =>
        a.category.toLowerCase().localeCompare(b.category.toLowerCase())
      );
      break;
    default:
      // "default" — preserve insertion order, no-op
      break;
  }

  return copy;
}

/**
 * Add or remove the `over-limit` class on `.balance-card` based on whether
 * the total spending exceeds the configured spending limit.
 * - If `settings.spendingLimit` is 0, no limit is active → always remove the class.
 * - If total > spendingLimit → add `over-limit`.
 * - Otherwise → remove `over-limit`.
 * Satisfies OC-4.
 */
function checkLimit() {
  const card = document.querySelector(".balance-card");
  if (!card) return;

  if (settings.spendingLimit > 0) {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    if (total > settings.spendingLimit) {
      card.classList.add("over-limit");
    } else {
      card.classList.remove("over-limit");
    }
  } else {
    card.classList.remove("over-limit");
  }
}

/**
 * Aggregate transaction totals per category, then render (or re-render)
 * a Chart.js pie chart on #spending-chart.
 * - Destroys any existing chart instance first to avoid "canvas already in use".
 * - Shows a placeholder message when there are no transactions.
 * - Known categories get fixed brand colors; custom categories pull from a palette.
 * Satisfies FR-4.
 */
function renderChart() {
  const canvas = document.getElementById("spending-chart");
  if (!canvas) return;

  // Destroy previous instance to avoid "canvas already in use" error
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  // ── Handle empty state ────────────────────────────────────────────────────
  const placeholder = document.getElementById("chart-placeholder");

  if (transactions.length === 0) {
    // Hide canvas, show placeholder text
    canvas.style.display = "none";
    if (placeholder) {
      placeholder.textContent = "No transactions yet — add one to see the chart.";
      placeholder.style.display = "block";
    }
    return;
  }

  // Show canvas, hide placeholder
  canvas.style.display = "";
  if (placeholder) placeholder.style.display = "none";

  // ── Aggregate totals per category ─────────────────────────────────────────
  const totals = {};
  for (const t of transactions) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }

  // ── Build colors ──────────────────────────────────────────────────────────
  const COLOR_MAP = {
    Food: "#4caf50",
    Transport: "#2196f3",
    Fun: "#ff9800",
  };

  // Fallback palette for custom categories
  const PALETTE = [
    "#9c27b0", "#e91e63", "#00bcd4", "#8bc34a",
    "#ffc107", "#607d8b", "#795548", "#f44336",
  ];
  let paletteIndex = 0;

  const labels = Object.keys(totals);
  const data = labels.map((cat) => totals[cat]);
  const backgroundColors = labels.map((cat) => {
    if (COLOR_MAP[cat]) return COLOR_MAP[cat];
    // Assign next palette color for custom categories
    return PALETTE[paletteIndex++ % PALETTE.length];
  });

  // ── Create new chart ──────────────────────────────────────────────────────
  chartInstance = new Chart(canvas, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const value = ctx.parsed;
              const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(value);
              return ` ${ctx.label}: ${formatted}`;
            },
          },
        },
      },
    },
  });
}

/**
 * Apply `theme` to the document and update the toggle button label.
 * - "dark"  → data-theme="dark",  button shows "☀️ Light Mode"
 * - "light" → data-theme="light", button shows "🌙 Dark Mode"
 * Satisfies OC-5.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  }
}

/**
 * Flip `settings.theme` between "light" and "dark", then persist and apply.
 * Satisfies OC-5.
 */
function toggleTheme() {
  settings.theme = settings.theme === "dark" ? "light" : "dark";
  applyTheme(settings.theme);
  saveSettings();
}

// ─── Render ───────────────────────────────────────────────────────────────────

/**
 * Sum all transaction amounts, format as USD currency, update #total-balance,
 * and trigger the spending-limit check.
 * Satisfies FR-3.
 */
function renderBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total);

  const balanceEl = document.getElementById("total-balance");
  if (balanceEl) balanceEl.textContent = formatted;

  checkLimit();
}

/**
 * Rebuild #transaction-list from the current sorted transaction array.
 * Shows a placeholder message when the list is empty.
 * Satisfies FR-2.
 */
function renderList() {
  const list = document.getElementById("transaction-list");
  if (!list) return;

  const sorted = getSortedTransactions();
  list.innerHTML = "";

  if (sorted.length === 0) {
    const empty = document.createElement("li");
    empty.className = "tx-empty";
    empty.textContent = "No transactions yet.";
    list.appendChild(empty);
    return;
  }

  sorted.forEach((t) => {
    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    nameSpan.className = "tx-name";
    nameSpan.textContent = t.name;

    const amountSpan = document.createElement("span");
    amountSpan.className = "tx-amount";
    amountSpan.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(t.amount);

    const categorySpan = document.createElement("span");
    categorySpan.className = "tx-category";
    categorySpan.textContent = t.category;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.dataset.id = t.id;
    deleteBtn.textContent = "Delete";

    li.appendChild(nameSpan);
    li.appendChild(amountSpan);
    li.appendChild(categorySpan);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

/**
 * Re-render all dynamic UI sections: balance, transaction list, and chart.
 */
function renderAll() {
  renderBalance();
  renderList();
  renderChart();
}

// ─── Form Validation ──────────────────────────────────────────────────────────

function validateForm() {
  const name = document.getElementById("item-name").value.trim();
  const amount = document.getElementById("item-amount").value.trim();
  const category = document.getElementById("item-category").value.trim();
  const errorEl = document.getElementById("form-error");

  if (!name || !amount || !category) {
    errorEl.textContent = "Please fill in all fields before submitting.";
    errorEl.style.display = "block";
    return false;
  }

  errorEl.textContent = "";
  errorEl.style.display = "none";
  return true;
}

// ─── Add / Delete Transactions ────────────────────────────────────────────────

function addTransaction(name, amount, category) {
  const transaction = {
    id: crypto.randomUUID(),
    name,
    amount: parseFloat(amount),
    category,
    date: new Date().toISOString().slice(0, 10),
  };

  transactions.push(transaction);
  saveTransactions();
  renderAll();
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  renderAll();
}

// ─── Event Binding ────────────────────────────────────────────────────────────

function bindEvents() {
  // Form submit — validate then add transaction
  const form = document.getElementById("item-name")?.closest("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const name = document.getElementById("item-name").value.trim();
      const amount = document.getElementById("item-amount").value.trim();
      const category = document.getElementById("item-category").value.trim();

      addTransaction(name, amount, category);

      // Reset form fields
      form.reset();
    });
  }

  // Click delegation for delete buttons inside #transaction-list
  const list = document.getElementById("transaction-list");
  if (list) {
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");
      if (!btn) return;
      const id = btn.dataset.id;
      if (id) deleteTransaction(id);
    });
  }

  // Sort dropdown — update currentSort and re-render the list
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      currentSort = sortSelect.value;
      renderList();
    });
  }

  // Theme toggle — flip between dark and light mode
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Spending limit — read input, persist, then refresh balance (triggers checkLimit)
  const setLimitBtn = document.getElementById("set-limit-btn");
  if (setLimitBtn) {
    setLimitBtn.addEventListener("click", () => {
      const limitInput = document.getElementById("limit-input");
      if (!limitInput) return;
      const value = parseFloat(limitInput.value);
      settings.spendingLimit = isNaN(value) || value < 0 ? 0 : value;
      saveSettings();
      renderBalance();
    });
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  applyTheme(settings.theme);
  renderAll();
  bindEvents();
});
