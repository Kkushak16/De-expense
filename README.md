# 💳 De-expense — Premium Personal Wealth & Shared Splits Suite

De-expense is a premium, strategic personal wealth and expense management application designed with a focused, glassmorphic dark-aesthetic layout to help you catalog, analyze, split, and optimize capital on-device.

Featuring native mobile standalone execution (PWA), mathematical donut spend-charts, automated recurring balance schedules, high-fidelity CSV & PDF exports, and an integrated Splitwise-like shared circle ledger.

---

## ✨ Features

### 📦 1. Core Capital Dashboard
* **Capital Metrics Grid**: Monitor available balance, aggregate monthly/yearly outgoings, and detect peak spending days using standard responsive metric cards.
* **Smart Progress Indicators**: Track your monthly budgets with real-time percentage indicators.

### 📊 2. Spending Analysis (Recharts)
* **Interactive Radial Charts**: Visualize expenditures across primary categories (Food & Dining, Vehicle, Travel, Education) in a responsive circular layout.
* **Ledger Explorer**: Deep-audit your transaction logs grouped as expandable category accordions. Drill down to review validation states (Approved/Pending) or delete mistakes.

### ⚙️ 3. Automatic cash-stream scheduler
* **Income Automation**: Configure automated cash top-ups. Set standard monthly intervals or custom day-interval timers to auto-increase your balance.

### 👥 4. Splitwise Shared Ledgers
* **Isolated Circles**: Establish circles (trips, household splits) with custom member lists.
* **Dynamic Ledger Division**: Split bills equally or input custom manual split ratios.
* **Debt Payback & Audits**: Instantly compute balances showing who owes who, settle debts, and set payment reminders.

### 📱 5. Progressive Web App (PWA) & Offline Security
* **Service Worker Caching**: Runs 100% offline with background stale-while-revalidate asset caching.
* **Apple Standalone Support**: Custom-designed Safari installation sheet with step-by-step guides for iOS devices.
* **Zero Cloud Handshakes**: Absolute local storage security. All data stays client-side, giving every user an immediate, fresh-slate initial startup.

### 📥 6. Reports & Data Exports
* **Excel Sheet Export**: Extract billing periods or yearly scopes into highly structured CSV files compatible with Excel or Google Sheets.
* **PDF Vector Compilation**: Pre-configured `@media print` styling rules to compile flat, high-contrast vector PDFs of financial charts and summaries using standard browser printing systems.

---

## 🛠️ Technology Stack

* **Build Tool**: [Vite](https://vitejs.dev/) (V5+)
* **Framework**: [React](https://react.dev/) (V18+)
* **Micro-Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Charts**: [Recharts](https://recharts.org/)
* **Iconography**: [Lucide React](https://lucide.dev/)
* **Styling**: Pure Vanilla CSS with curated glassmorphism tokens (Dark & Light theme support)

---

## 🚀 Local Development Setup

To run De-expense locally on your machine, ensure you have [Node.js](https://nodejs.org/) installed:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Kkushak16/De-expense.git
   cd De-expense
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the address shown (usually `http://localhost:5173`).

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy to Vercel

De-expense is fully optimized for single-click, zero-config deployment on [Vercel](https://vercel.com/):

1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository (`Kkushak16/De-expense`).
3. Vercel will automatically detect **Vite** as the framework preset and configure:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Click **Deploy**!

> [!NOTE]
> Client-side SPA routing overrides are pre-configured in [vercel.json](vercel.json). This guarantees that reloading pages or navigating directly to child URLs (such as `/splitwise` or `/reports`) will redirect cleanly without generating 404 errors.

---

## 👤 Credits

Created by **Kushak Dohare** — [Connect on LinkedIn](https://www.linkedin.com/in/kushak-dohare-25b0a8362/)
