import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BalanceForm from '../components/BalanceForm';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseChart from '../components/ExpenseChart';
import SettingsMenu from '../components/SettingsMenu';
import Logo from '../components/Logo';
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  RotateCcw,
  CalendarDays,
  ArrowRight,
  History,
  Sun,
  Moon,
  Users,
  Menu,
  MoreVertical,
  Utensils,
  Plane,
  BookOpen,
  Car,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Trash2
} from 'lucide-react';

const Dashboard = ({ 
  userName,
  setUserName,
  balance, 
  expenses, 
  totalSpent, 
  peakSpending, 
  formatCurrency, 
  handleReset, 
  handleSetBalance, 
  handleAddExpense, 
  handleDeleteExpense,
  categoryMap,
  onAddPrimary,
  onAddSubCategory,
  showAddBalance,
  setShowAddBalance,
  scheduledAdditions = [],
  setScheduledAdditions,
  theme,
  toggleTheme
}) => {
  const navigate = useNavigate();

  // Accordion state for Spend Explorer category list
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showResetWarning, setShowResetWarning] = useState(false);

  const toggleCategoryExpand = (catName) => {
    setExpandedCategory(expandedCategory === catName ? null : catName);
  };

  // Group expenses by primary category
  const groupedCategories = useMemo(() => {
    const groups = {};
    expenses.forEach(e => {
      const cat = e.category;
      if (!groups[cat]) {
        groups[cat] = {
          name: cat,
          total: 0,
          expenses: []
        };
      }
      groups[cat].total += e.amount;
      groups[cat].expenses.push(e);
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [expenses]);

  // Determine standard icon & colors for Spend Explorer category circles
  const getCategoryIconDetails = (catName) => {
    const lower = catName.toLowerCase();
    if (lower.includes('food') || lower.includes('dine') || lower.includes('dining')) {
      return {
        icon: <Utensils size={15} />,
        bg: 'rgba(40, 205, 65, 0.1)',
        color: 'var(--success)',
        displayName: 'Food & Dining'
      };
    }
    if (lower.includes('travel') || lower.includes('flight') || lower.includes('hotel') || lower.includes('logistics')) {
      return {
        icon: <Plane size={15} />,
        bg: 'rgba(0, 113, 227, 0.1)',
        color: 'var(--primary)',
        displayName: 'Travel & Logistics'
      };
    }
    if (lower.includes('edu') || lower.includes('school') || lower.includes('book') || lower.includes('fees')) {
      return {
        icon: <BookOpen size={15} />,
        bg: 'rgba(163, 80, 240, 0.1)',
        color: '#a350f0',
        displayName: 'Education & Study'
      };
    }
    if (lower.includes('veh') || lower.includes('car') || lower.includes('fuel') || lower.includes('gas')) {
      return {
        icon: <Car size={15} />,
        bg: 'rgba(255, 149, 0, 0.1)',
        color: 'var(--warning)',
        displayName: 'Vehicle & Transport'
      };
    }
    return {
      icon: <Wallet size={15} />,
      bg: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-muted)',
      displayName: catName
    };
  };

  const peakSpendingDayName = useMemo(() => {
    if (!peakSpending) return 'None';
    return new Date(peakSpending.date).toLocaleDateString('en-US', { weekday: 'long' });
  }, [peakSpending]);

  const confirmResetData = () => {
    setShowResetWarning(true);
  };

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* Redesigned Mockup-Matching Header */}
      <header className="flex items-center justify-between py-5 border-b border-border" style={{ marginBottom: '30px' }}>
        {/* Left Side: De-expense Branding with Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => navigate('/')}>
          <Logo size={28} />
          <span 
            className="text-lg font-extrabold tracking-tight"
            style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}
          >
            De-expense
          </span>
        </div>

        {/* Right Side Actions matching mockup layout exactly */}
        <div className="flex items-center gap-3">
          {/* Splitwise Button */}
          <button 
            onClick={() => navigate('/splitwise')} 
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-border transition-all flex items-center gap-2" 
            style={{ 
              background: 'var(--pill-bg)', 
              color: 'var(--text-main)',
              cursor: 'pointer',
              transform: 'none',
              opacity: 1
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
          >
            <Users size={14} /> Splitwise
          </button>

          {/* Reports Button */}
          <button 
            onClick={() => navigate('/reports')} 
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-border transition-all flex items-center gap-2" 
            style={{ 
              background: 'var(--pill-bg)', 
              color: 'var(--text-main)',
              cursor: 'pointer',
              transform: 'none',
              opacity: 1
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
          >
            Reports
          </button>

          {/* + Add money Button */}
          <button 
            onClick={() => setShowAddBalance(!showAddBalance)} 
            className="text-xs font-bold px-4 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 add-money-button" 
            style={{ 
              background: 'rgba(0, 113, 227, 0.1)', 
              color: 'var(--primary)',
              borderColor: 'rgba(0, 113, 227, 0.2)',
              cursor: 'pointer',
              transform: 'none',
              opacity: 1
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 113, 227, 0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 113, 227, 0.1)'; }}
          >
            <Plus size={14} />
            <span className="hidden-mobile">Add money</span>
          </button>

          {/* Reset button with circular format */}
          <button 
            onClick={confirmResetData} 
            title="Reset data"
            style={{ 
              background: 'rgba(255, 59, 48, 0.08)', 
              color: 'var(--danger)', 
              padding: '10px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transform: 'none',
              opacity: 1
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 59, 48, 0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 59, 48, 0.08)'; }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: 'var(--pill-bg)', 
              color: 'var(--text-main)', 
              padding: '10px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transform: 'none',
              opacity: 1
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Settings / Name Editor */}
          <SettingsMenu userName={userName} setUserName={setUserName} />
        </div>
      </header>

      {/* Inline Balance Add block */}
      <AnimatePresence>
        {showAddBalance && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
            <BalanceForm 
              onSetBalance={(amt, schedule) => handleSetBalance(amt, true, schedule)} 
              isAddingMode 
              scheduledAdditions={scheduledAdditions}
              onDeleteScheduledAddition={(id) => setScheduledAdditions(prev => prev.filter(item => item.id !== id))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bold Greeting heading below header matching mockup */}
      <h2 className="text-3xl font-extrabold tracking-tight" style={{ fontSize: '32px', margin: '30px 0 24px 0', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
        Welcome back, {userName}
      </h2>

      {/* Metrics Cards row */}
      <div className="stats-grid">
        
        {/* Available Balance Card */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }} 
          onClick={() => navigate('/balance-history')}
          className="apple-card balance-section-card cursor-pointer group"
          style={{ position: 'relative' }}
        >
          <div className="flex justify-between mb-3">
            <span className="text-muted font-bold text-[10px] uppercase tracking-widest">Available Balance</span>
            <History size={14} className="text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 className="text-3xl m-0 font-extrabold" style={{ letterSpacing: '-0.03em' }}>{formatCurrency(balance)}</h2>
          <div className="mt-2.5 flex items-center gap-1">
            <TrendingUp size={11} className="text-success" style={{ color: 'var(--success)' }} />
            <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '11px' }}>+2.4% this month</span>
          </div>
        </motion.div>
 
        {/* Total Outgoings Card */}
        <motion.div whileHover={{ y: -3 }} className="apple-card outgoings-section-card">
          <div className="flex justify-between mb-3">
            <span className="text-muted font-bold text-[10px] uppercase tracking-widest">Total Outgoings</span>
            <TrendingUp size={14} className="text-danger" style={{ color: 'var(--danger)', transform: 'rotate(90deg)' }} />
          </div>
          <h2 className="text-3xl m-0 font-extrabold text-danger" style={{ color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{formatCurrency(totalSpent)}</h2>
          <div className="mt-2.5 flex items-center gap-1">
            <TrendingUp size={11} className="text-danger" style={{ color: 'var(--danger)' }} />
            <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '11px' }}>+14.2% vs last month</span>
          </div>
        </motion.div>
 
        {/* Peak Spending Day Card */}
        <motion.div whileHover={{ y: -3 }} className="apple-card peak-section-card">
          <div className="flex justify-between mb-3">
            <span className="text-muted font-bold text-[10px] uppercase tracking-widest">Peak Spending Day</span>
            <CalendarDays size={14} className="text-warning" style={{ color: 'var(--warning)' }} />
          </div>
          <h2 className="text-3xl m-0 font-extrabold text-warning" style={{ color: 'var(--warning)', letterSpacing: '-0.03em' }}>{peakSpendingDayName}</h2>
          <div className="mt-2.5 text-xs text-muted font-bold uppercase tracking-wider">
            {peakSpending ? `Highest: ${formatCurrency(peakSpending.amount)}` : 'No spends logged'}
          </div>
        </motion.div>
      </div>
 
      {/* Main Form and Chart Workspace Grid */}
      <div className="main-grid mb-8">
        
        {/* Left Column - New Transaction */}
        <div className="flex flex-col">
          <div className="apple-card transaction-section-card" style={{ minHeight: '100%' }}>
            <h3 className="m-0 text-base font-extrabold mb-6 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <Plus size={18} /> New Transaction
            </h3>
            <ExpenseForm 
              onAddExpense={handleAddExpense} 
              categoryMap={categoryMap} 
              onAddPrimary={onAddPrimary}
              onAddSubCategory={onAddSubCategory}
            />
          </div>
        </div>
 
        {/* Right Column - Spending Analysis */}
        <div className="flex flex-col">
          <div className="apple-card analysis-section-card" style={{ minHeight: '100%' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="m-0 text-base font-extrabold" style={{ color: 'var(--text-main)' }}>Spending Analysis</h3>
              <button 
                type="button" 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', transform: 'none', display: 'flex', alignItems: 'center' }}
              >
                <MoreVertical size={18} />
              </button>
            </div>
            
            <ExpenseChart 
              expenses={expenses} 
              formatCurrency={formatCurrency} 
              onDrillDown={(cat) => navigate('/explorer')}
            />
          </div>
        </div>
      </div>
 
      {/* Spend Explorer Accordion Section at the bottom */}
      <div className="apple-card explorer-section-card" style={{ marginTop: '56px' }}>
        {/* Spend Explorer Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="m-0 text-base font-extrabold" style={{ color: 'var(--text-main)' }}>Spend Explorer</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/explorer')}
              style={{
                background: 'var(--pill-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                transform: 'none',
                opacity: 1
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
            >
              <Filter size={12} /> Filter
            </button>
            <Search size={16} className="text-muted" style={{ cursor: 'pointer', marginLeft: '12px' }} onClick={() => navigate('/explorer')} />
          </div>
        </div>

        {/* Categories Accordions list */}
        {groupedCategories.length === 0 ? (
          <div className="text-center py-10 text-muted">
            <span className="text-xs font-bold block">No outgoings logged yet</span>
            <p className="text-[11px] max-w-[240px] mx-auto m-0 mt-1">Submit transactions above to explore your outgoings structure.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groupedCategories.map(group => {
              const { icon, bg, color, displayName } = getCategoryIconDetails(group.name);
              const isExpanded = expandedCategory === group.name;

              return (
                <div key={group.name} className="flex flex-col">
                  {/* Category main toggle row */}
                  <div 
                    onClick={() => toggleCategoryExpand(group.name)}
                    className="flex items-center justify-between p-4 rounded-2xl border transition-all"
                    style={{ 
                      background: 'var(--list-item-bg)', 
                      borderColor: isExpanded ? 'var(--primary)' : 'var(--border)',
                      cursor: 'pointer' 
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Round category icon */}
                      <span style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '12px', 
                        background: bg, 
                        color: color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {icon}
                      </span>
                      <div>
                        <span className="text-sm font-extrabold block" style={{ color: 'var(--text-main)' }}>{displayName}</span>
                        <span className="text-[10px] text-muted font-bold block mt-0.5">{group.expenses.length} transactions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-danger" style={{ color: 'var(--text-main)' }}>
                        -{formatCurrency(group.total)}
                      </span>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Transaction list details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                        className="pl-1.5 pr-1.5 mt-1"
                      >
                        <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-border mb-3" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                          {group.expenses.map(expense => {
                            // Alternate status to pending vs approved based on amount even/odd
                            const isApproved = expense.amount % 2 === 0;
                            return (
                              <div 
                                key={expense.id} 
                                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-pill-hover-bg transition-colors"
                                style={{ background: 'var(--list-item-bg)' }}
                              >
                                <div>
                                  <span className="text-sm font-bold block" style={{ color: 'var(--text-main)' }}>{expense.description}</span>
                                  <span className="text-[10px] text-muted font-bold block mt-0.5">
                                    Sub-category: {expense.subCategory || 'General'} • {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-extrabold text-danger" style={{ color: 'var(--text-main)' }}>
                                    -{formatCurrency(expense.amount)}
                                  </span>
                                  
                                  {/* High-fidelity Approved/Pending badge */}
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: isApproved ? 'rgba(40, 205, 65, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    color: isApproved ? 'var(--success)' : 'var(--text-muted)',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                  }}>
                                    {isApproved ? 'Approved' : 'Pending'}
                                  </span>

                                  {/* Trash Deletion with confirmation */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                                        handleDeleteExpense(expense.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-pill-hover-bg rounded"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'color 0.2s ease',
                                      transform: 'none'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Spend Explorer Archive Footer Link */}
        <div 
          className="mt-6 text-center text-xs text-primary font-bold cursor-pointer hover:underline flex items-center justify-center gap-1 select-none"
          onClick={() => navigate('/explorer')}
          style={{ color: 'var(--primary)' }}
        >
          View full transaction archive (2026) <ArrowRight size={12} />
        </div>
      </div>

      {/* Bespoke iOS/Apple-style warning confirmation alert for reset */}
      <AnimatePresence>
        {showResetWarning && (
          <div className="fixed-overlay modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="apple-card modal-content-card"
              style={{ 
                border: '1px solid var(--danger)',
                background: 'radial-gradient(circle at top left, rgba(255, 59, 48, 0.04), var(--card-bg))',
                boxShadow: '0 20px 50px rgba(255, 59, 48, 0.08), var(--shadow)',
                maxWidth: '420px',
                width: '90%',
                padding: '30px'
              }}
            >
              <div className="flex flex-col items-center text-center">
                {/* Warnings glow animation */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 59, 48, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                  marginBottom: '20px'
                }}>
                  <RotateCcw size={26} className="animate-pulse" style={{ animationDuration: '2s' }} />
                </div>
                
                <h3 className="text-lg font-extrabold m-0 mb-2" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Reset Financial Suite?
                </h3>
                
                <p className="text-xs text-muted leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                  This will permanently clear all your strategic wealth data, transaction ledgers, category structures, Splitwise tabs, and customized recurring balances. <strong>This action is irreversible.</strong>
                </p>
                
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setShowResetWarning(false)}
                    style={{
                      flex: 1,
                      background: 'var(--pill-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      transform: 'none',
                      opacity: 1
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      handleReset();
                      setShowResetWarning(false);
                    }}
                    style={{
                      flex: 1,
                      background: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      transform: 'none',
                      opacity: 1
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Reset Everything
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
