import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import ExplorerPage from './pages/ExplorerPage';
import BalanceHistoryPage from './pages/BalanceHistoryPage';
import ReportsPage from './pages/ReportsPage';
import ReportPopup from './components/ReportPopup';
import SplitwisePage from './pages/SplitwisePage';
import BalanceForm from './components/BalanceForm';
import WelcomeForm from './components/WelcomeForm';
import Logo from './components/Logo';
import { getBillingPeriod, isBillingCycleCompleted, isBillingYearCompleted } from './utils/reportUtils';
import BottomNavBar from './components/BottomNavBar';
import Footer from './components/Footer';
import './index.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

const INITIAL_CATEGORY_MAP = {
  'Food': ['Dining Out', 'Groceries', 'Snacks'],
  'Education': ['Books', 'Courses', 'Fees'],
  'Vehicle': ['Fuel', 'Maintenance', 'Insurance'],
  'Travel': ['Flights', 'Hotels', 'Local Transport']
};

function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('wallet_user_name') || null);

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('wallet_balance');
    return saved !== null ? parseFloat(saved) : null;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('wallet_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [balanceHistory, setBalanceHistory] = useState(() => {
    const saved = localStorage.getItem('wallet_balance_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [categoryMap, setCategoryMap] = useState(() => {
    const saved = localStorage.getItem('wallet_category_map');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORY_MAP;
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('wallet_theme') || 'dark');
  const [showAddBalance, setShowAddBalance] = useState(false);

  // Financial Reports custom cycles & viewed states
  const [startOfMonthDay, setStartOfMonthDay] = useState(() => {
    const saved = localStorage.getItem('wallet_start_of_month');
    return saved !== null ? parseInt(saved) : 1;
  });

  const [viewedReports, setViewedReports] = useState(() => {
    const saved = localStorage.getItem('wallet_viewed_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedReportToShow, setCompletedReportToShow] = useState(null);

  const [scheduledAdditions, setScheduledAdditions] = useState(() => {
    const saved = localStorage.getItem('wallet_scheduled_additions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wallet_scheduled_additions', JSON.stringify(scheduledAdditions));
  }, [scheduledAdditions]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wallet_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('wallet_start_of_month', startOfMonthDay);
  }, [startOfMonthDay]);

  useEffect(() => {
    localStorage.setItem('wallet_viewed_reports', JSON.stringify(viewedReports));
  }, [viewedReports]);

  // Check if a billing cycle or billing year was recently completed but not yet viewed by the user.
  useEffect(() => {
    if (!userName || balance === null || expenses.length === 0) return;

    // 1. Group expenses by cycle id
    const periodsMap = {};
    expenses.forEach(e => {
      const p = getBillingPeriod(e.date, startOfMonthDay);
      if (!periodsMap[p.id]) {
        periodsMap[p.id] = {
          id: p.id,
          label: p.label,
          year: p.year,
          expenses: [],
          totalSpent: 0
        };
      }
      periodsMap[p.id].expenses.push(e);
      periodsMap[p.id].totalSpent += e.amount;
    });

    const today = new Date();

    // 2. Check for completed billing cycles
    const sortedPeriodIds = Object.keys(periodsMap).sort((a, b) => b.localeCompare(a));
    for (const cycleId of sortedPeriodIds) {
      if (isBillingCycleCompleted(cycleId, startOfMonthDay, today)) {
        if (!viewedReports.includes(cycleId)) {
          const pData = periodsMap[cycleId];
          setCompletedReportToShow({
            id: cycleId,
            label: pData.label,
            year: pData.year,
            isYearly: false,
            expenses: pData.expenses,
            totalSpent: pData.totalSpent
          });
          return; // Show one report at a time
        }
      }
    }

    // 3. Check for completed billing years
    const years = [...new Set(Object.values(periodsMap).map(p => p.year))].sort((a, b) => b - a);
    for (const year of years) {
      const yearId = `year-${year}`;
      if (isBillingYearCompleted(year, startOfMonthDay, today)) {
        if (!viewedReports.includes(yearId)) {
          const yearExpenses = expenses.filter(e => {
            const p = getBillingPeriod(e.date, startOfMonthDay);
            return p.year === year;
          });
          const totalSpent = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
          setCompletedReportToShow({
            id: yearId,
            label: `Yearly Billing Cycle: ${year}`,
            year,
            isYearly: true,
            expenses: yearExpenses,
            totalSpent
          });
          return;
        }
      }
    }
  }, [expenses, startOfMonthDay, viewedReports, userName, balance]);

  // Check and apply recurring balance scheduled additions dynamically
  useEffect(() => {
    if (!userName || balance === null || scheduledAdditions.length === 0) return;
    
    let balanceUpdated = false;
    let newBalance = balance;
    const newHistory = [...balanceHistory];
    const now = new Date();
    
    const updatedAdditions = scheduledAdditions.map(item => {
      let nextDue = new Date(item.nextDueDate);
      let lastApplied = new Date(item.lastAppliedDate || item.startDate);
      let timesToApply = 0;
      
      while (now >= nextDue) {
        timesToApply++;
        lastApplied = new Date(nextDue);
        
        if (item.interval === 'month') {
          nextDue.setMonth(nextDue.getMonth() + 1);
        } else if (item.interval === 'days') {
          nextDue.setDate(nextDue.getDate() + parseInt(item.days || 30));
        } else {
          break; // Avoid infinite loops
        }
      }
      
      if (timesToApply > 0) {
        const totalAdd = item.amount * timesToApply;
        newBalance += totalAdd;
        balanceUpdated = true;
        
        for (let i = 0; i < timesToApply; i++) {
          newHistory.push({
            id: Date.now() + Math.random(),
            amount: item.amount,
            date: lastApplied.toISOString(),
            label: `Auto-Addition: ₹${item.amount} (${item.interval === 'month' ? 'Monthly' : `Every ${item.days} days`})`
          });
        }
      }
      
      return {
        ...item,
        lastAppliedDate: lastApplied.toISOString(),
        nextDueDate: nextDue.toISOString()
      };
    });
    
    if (balanceUpdated) {
      setBalance(newBalance);
      setBalanceHistory(newHistory);
      setScheduledAdditions(updatedAdditions);
    }
  }, [userName, balance, balanceHistory, scheduledAdditions]);

  const handleArchiveReport = () => {
    if (completedReportToShow) {
      setViewedReports(prev => [...prev, completedReportToShow.id]);
      setCompletedReportToShow(null);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (userName) localStorage.setItem('wallet_user_name', userName);
  }, [userName]);

  useEffect(() => {
    if (balance !== null) localStorage.setItem('wallet_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('wallet_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('wallet_balance_history', JSON.stringify(balanceHistory));
  }, [balanceHistory]);

  useEffect(() => {
    localStorage.setItem('wallet_category_map', JSON.stringify(categoryMap));
  }, [categoryMap]);

  const handleSetBalance = (amount, isAdding = false, schedule = null) => {
    if (isAdding) {
      setBalance(prev => prev + amount);
      setBalanceHistory(prev => [...prev, { id: Date.now(), amount, date: new Date().toISOString(), label: 'Manual Addition' }]);
      
      if (schedule && schedule.interval !== 'one-time') {
        const now = new Date();
        const nextDue = new Date(now);
        if (schedule.interval === 'month') {
          nextDue.setMonth(nextDue.getMonth() + 1);
        } else if (schedule.interval === 'days') {
          nextDue.setDate(nextDue.getDate() + parseInt(schedule.days || 30));
        }
        
        const newAddition = {
          id: Date.now().toString() + '-' + Math.random(),
          amount: parseFloat(amount),
          interval: schedule.interval,
          days: schedule.days ? parseInt(schedule.days) : 30,
          startDate: now.toISOString(),
          lastAppliedDate: now.toISOString(),
          nextDueDate: nextDue.toISOString()
        };
        
        setScheduledAdditions(prev => [...prev, newAddition]);
      }
    } else {
      setBalance(amount);
      setBalanceHistory([{ id: Date.now(), amount, date: new Date().toISOString(), label: 'Initial Setup' }]);
    }
    setShowAddBalance(false);
  };

  const handleAddExpense = (newExpense) => {
    setExpenses(prev => [...prev, newExpense]);
    setBalance(prev => prev - newExpense.amount);
    
    if (newExpense.subCategory && !categoryMap[newExpense.category].includes(newExpense.subCategory)) {
      setCategoryMap(prev => ({
        ...prev,
        [newExpense.category]: [...prev[newExpense.category], newExpense.subCategory]
      }));
    }
  };

  const handleAddPrimaryCategory = (category) => {
    if (!categoryMap[category]) {
      setCategoryMap(prev => ({ ...prev, [category]: [] }));
    }
  };

  const handleAddSubCategory = (primary, sub) => {
    setCategoryMap(prev => {
      const subs = prev[primary] || [];
      if (!subs.includes(sub)) {
        return { ...prev, [primary]: [...subs, sub] };
      }
      return prev;
    });
  };

  const handleRemoveSubCategory = (primary, sub) => {
    setCategoryMap(prev => {
      const subs = prev[primary] || [];
      return {
        ...prev,
        [primary]: subs.filter(s => s !== sub)
      };
    });
  };

  const handleDeleteExpense = (id) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    if (expenseToDelete) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      setBalance(prev => prev + expenseToDelete.amount);
    }
  };

  const handleReset = () => {
    localStorage.clear();
    setUserName(null);
    setBalance(null);
    setExpenses([]);
    setBalanceHistory([]);
    setCategoryMap(INITIAL_CATEGORY_MAP);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const peakSpending = useMemo(() => {
    const dailyTotals = expenses.reduce((acc, curr) => {
      acc[curr.date] = (acc[curr.date] || 0) + curr.amount;
      return acc;
    }, {});
    const sortedDays = Object.entries(dailyTotals).sort((a, b) => b[1] - a[1]);
    return sortedDays.length > 0 ? { date: sortedDays[0][0], amount: sortedDays[0][1] } : null;
  }, [expenses]);

  if (!userName) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '90vh' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '400px' }}>
          <div className="text-center mb-10 flex flex-col items-center">
            <Logo size={80} style={{ marginBottom: '20px' }} />
            <h1 className="mb-2 tracking-tight font-extrabold" style={{ letterSpacing: '-0.03em' }}>De-expense</h1>
            <p className="text-muted">Strategic wealth management.</p>
          </div>
          <WelcomeForm onSetName={setUserName} />
        </motion.div>
      </div>
    );
  }

  if (balance === null) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '90vh' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '400px' }}>
          <div className="text-center mb-10 flex flex-col items-center">
            <Logo size={80} style={{ marginBottom: '20px' }} />
            <h1 className="mb-2 tracking-tight font-extrabold" style={{ letterSpacing: '-0.03em' }}>De-expense</h1>
            <p className="text-muted">Strategic wealth management.</p>
          </div>
          <BalanceForm onSetBalance={handleSetBalance} />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <Dashboard 
            userName={userName}
            setUserName={setUserName}
            balance={balance}
            expenses={expenses}
            totalSpent={totalSpent}
            peakSpending={peakSpending}
            formatCurrency={formatCurrency}
            handleReset={handleReset}
            handleSetBalance={handleSetBalance}
            handleAddExpense={handleAddExpense}
            handleDeleteExpense={handleDeleteExpense}
            categoryMap={categoryMap}
            onAddPrimary={handleAddPrimaryCategory}
            onAddSubCategory={handleAddSubCategory}
            showAddBalance={showAddBalance}
            setShowAddBalance={setShowAddBalance}
            scheduledAdditions={scheduledAdditions}
            setScheduledAdditions={setScheduledAdditions}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        } />
        <Route path="/explorer" element={
          <ExplorerPage 
            expenses={expenses}
            categoryMap={categoryMap}
            formatCurrency={formatCurrency}
            onDeleteExpense={handleDeleteExpense}
            onAddSubCategory={handleAddSubCategory}
            onRemoveSubCategory={handleRemoveSubCategory}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        } />
        <Route path="/balance-history" element={
          <BalanceHistoryPage 
            history={balanceHistory}
            formatCurrency={formatCurrency}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        } />
        <Route path="/reports" element={
          <ReportsPage 
            expenses={expenses}
            formatCurrency={formatCurrency}
            startOfMonthDay={startOfMonthDay}
            setStartOfMonthDay={setStartOfMonthDay}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        } />
        <Route path="/splitwise" element={
          <SplitwisePage 
            formatCurrency={formatCurrency}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        } />
      </Routes>
      
      <Footer />
      
      <BottomNavBar />

      {/* Dynamic Month-End/Year-End Smart Report Overlay */}
      {completedReportToShow && (
        <ReportPopup 
          period={completedReportToShow}
          formatCurrency={formatCurrency}
          onClose={handleArchiveReport}
        />
      )}
    </>
  );
}

export default App;
