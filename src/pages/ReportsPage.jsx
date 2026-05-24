import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, FileText, BarChart3, PieChart, Sparkles, AlertCircle, Sun, Moon, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { getBillingPeriod, generateSavingsInsights } from '../utils/reportUtils';
import ExpenseList from '../components/ExpenseList';

const CATEGORY_COLORS = {
  Food: '#ff2d55',
  Education: '#5856d6',
  Vehicle: '#ff9500',
  Travel: '#007aff',
  Books: '#34c759',
  Other: '#8e8e93'
};

const escapeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const ReportsPage = ({ 
  expenses, 
  formatCurrency, 
  startOfMonthDay, 
  setStartOfMonthDay,
  theme,
  toggleTheme
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' | 'yearly'

  const handleExportCSV = (periodData) => {
    if (!periodData || periodData.expenses.length === 0) return;
    
    const headers = ["Date", "Description", "Category", "Sub-Category", "Amount (INR)", "Status"];
    const rows = periodData.expenses.map(e => [
      new Date(e.date).toLocaleDateString('en-IN'),
      e.description,
      e.category,
      e.subCategory || 'General',
      e.amount,
      e.amount % 2 === 0 ? 'Approved' : 'Pending'
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const labelVal = periodData.label || `Year_${periodData.year}`;
    const safeLabel = labelVal.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    link.setAttribute("download", `de_expense_report_${safeLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate periods dynamically based on current startOfMonthDay
  const { sortedPeriods, sortedYears } = useMemo(() => {
    const periodsMap = {};
    expenses.forEach(e => {
      const period = getBillingPeriod(e.date, startOfMonthDay);
      if (!periodsMap[period.id]) {
        periodsMap[period.id] = {
          id: period.id,
          label: period.label,
          year: period.year,
          expenses: [],
          totalSpent: 0
        };
      }
      periodsMap[period.id].expenses.push(e);
      periodsMap[period.id].totalSpent += e.amount;
    });

    const sortedP = Object.values(periodsMap).sort((a, b) => b.id.localeCompare(a.id));

    const yearsMap = {};
    Object.values(periodsMap).forEach(p => {
      const y = p.year;
      if (!yearsMap[y]) {
        yearsMap[y] = {
          year: y,
          periods: [],
          totalSpent: 0,
          expenses: []
        };
      }
      yearsMap[y].periods.push(p);
      yearsMap[y].totalSpent += p.totalSpent;
      yearsMap[y].expenses.push(...p.expenses);
    });

    const sortedY = Object.values(yearsMap).sort((a, b) => b.year - a.year);

    return { sortedPeriods: sortedP, sortedYears: sortedY };
  }, [expenses, startOfMonthDay]);

  // Selected states
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [selectedYearVal, setSelectedYearVal] = useState('');

  // Default selections
  const currentPeriod = useMemo(() => {
    if (sortedPeriods.length === 0) return null;
    const found = sortedPeriods.find(p => p.id === selectedPeriodId);
    return found || sortedPeriods[0];
  }, [sortedPeriods, selectedPeriodId]);

  const currentYear = useMemo(() => {
    if (sortedYears.length === 0) return null;
    const found = sortedYears.find(y => y.year === parseInt(selectedYearVal));
    return found || sortedYears[0];
  }, [sortedYears, selectedYearVal]);

  // Handle dropdown changes
  const handlePeriodChange = (e) => setSelectedPeriodId(e.target.value);
  const handleYearChange = (e) => setSelectedYearVal(e.target.value);

  // Grouped category data for Monthly Donut Chart
  const monthlyChartData = useMemo(() => {
    if (!currentPeriod) return [];
    const catMap = {};
    currentPeriod.expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other
    }));
  }, [currentPeriod]);

  // Grouped monthly flux data for Yearly Bar Chart
  const yearlyChartData = useMemo(() => {
    if (!currentYear) return [];
    // Sort periods chronologically
    return [...currentYear.periods]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(p => {
        // e.g. "2026-05" -> "May"
        const [,, monthStr] = p.label.split(' '); // Label is "05 May 2026 - 04 Jun 2026"
        // Let's extract first cycle starting month
        const cycleMonth = new Date(p.id + '-01').toLocaleDateString('en-IN', { month: 'short' });
        return {
          name: cycleMonth,
          amount: p.totalSpent
        };
      });
  }, [currentYear]);

  // Grouped category data for Yearly summary
  const yearlyCategoryData = useMemo(() => {
    if (!currentYear) return [];
    const catMap = {};
    currentYear.expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
        percentage: currentYear.totalSpent > 0 ? ((value / currentYear.totalSpent) * 100).toFixed(0) : 0
      }));
  }, [currentYear]);

  // Generate saving tips
  const currentInsights = useMemo(() => {
    if (!currentPeriod) return [];
    return generateSavingsInsights(currentPeriod.expenses, currentPeriod.totalSpent);
  }, [currentPeriod]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'var(--pill-bg)', 
              padding: '10px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="m-0 text-3xl">Financial Reports</h1>
            <p className="text-muted text-sm">Deep, data-driven billing summaries.</p>
          </div>
        </div>
        <button 
          onClick={toggleTheme} 
          style={{ 
            background: 'var(--pill-bg)', 
            color: 'var(--text-main)', 
            padding: '12px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border)',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Cycle Configuration Card */}
      <div className="apple-card explorer-section-card mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="m-0 text-lg font-bold" style={{ color: 'var(--text-main)' }}>Cycle Configuration</h3>
            <p className="text-muted text-xs m-0 mt-1">Set your monthly starting day. Spends will automatically catalog into custom periods.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted font-bold">Starts on:</span>
            <select
              value={startOfMonthDay}
              onChange={(e) => setStartOfMonthDay(parseInt(e.target.value))}
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="apple-card text-center py-20 text-muted">
          <FileText size={56} className="mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold mb-2">No Transactions Recorded Yet</h2>
          <p className="text-sm max-w-md mx-auto m-0 leading-relaxed">
            Please log your deposits and expenses in the dashboard to unlock mathematical reports and smart savings tips!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-border pb-px gap-6">
            <button 
              onClick={() => setActiveTab('monthly')}
              className={`pb-4 px-1 text-base font-bold transition-all relative border-none bg-transparent cursor-pointer ${
                activeTab === 'monthly' ? 'text-primary' : 'text-muted hover:text-main'
              }`}
              style={{ color: activeTab === 'monthly' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-2">
                <PieChart size={18} /> Monthly Reports
              </span>
              {activeTab === 'monthly' && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  style={{ background: 'var(--primary)' }}
                />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('yearly')}
              className={`pb-4 px-1 text-base font-bold transition-all relative border-none bg-transparent cursor-pointer ${
                activeTab === 'yearly' ? 'text-primary' : 'text-muted hover:text-main'
              }`}
              style={{ color: activeTab === 'yearly' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-2">
                <BarChart3 size={18} /> Yearly Reports
              </span>
              {activeTab === 'yearly' && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  style={{ background: 'var(--primary)' }}
                />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'monthly' ? (
              <motion.div
                key="monthly-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Selector and Total Card */}
                <div className="apple-card explorer-section-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5 w-full md:w-auto">
                      <span className="text-xs text-muted font-bold uppercase tracking-wider block">Billing Period</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <select
                          value={currentPeriod?.id || ''}
                          onChange={handlePeriodChange}
                          style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            outline: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            minWidth: '240px'
                          }}
                        >
                          {sortedPeriods.map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                          ))}
                        </select>
                        
                        {/* Export Buttons */}
                        {currentPeriod && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleExportCSV(currentPeriod)}
                              style={{
                                background: 'var(--pill-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
                            >
                              <FileText size={14} /> Export Excel
                            </button>
                            <button
                              onClick={() => window.print()}
                              style={{
                                background: 'var(--pill-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
                            >
                              <Download size={14} /> Export PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {currentPeriod && (
                      <div className="text-right">
                        <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">Total Period Expenditure</span>
                        <span className="text-3xl font-extrabold text-danger" style={{ color: 'var(--danger)' }}>
                          -{formatCurrency(currentPeriod.totalSpent)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {currentPeriod && (
                  <>
                    {/* Visual Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Donut Chart */}
                      <div className="apple-card analysis-section-card flex flex-col justify-between min-h-[340px]">
                        <h3 className="m-0 text-sm text-muted font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <PieChart size={16} /> Category Breakdown
                        </h3>
                        {monthlyChartData.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-xs text-muted">
                            No spendings tracked in this cycle.
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={220}>
                              <RechartsPieChart>
                                <Pie
                                  data={monthlyChartData}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {monthlyChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                  formatter={(value) => [formatCurrency(value), 'Spent']}
                                  contentStyle={{ 
                                    background: 'var(--card-bg)', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--border)', 
                                    boxShadow: 'var(--shadow)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    color: 'var(--text-main)',
                                    padding: '8px 12px'
                                  }}
                                  itemStyle={{ color: 'var(--text-main)', fontSize: '13px' }}
                                  labelStyle={{ display: 'none' }}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                          {monthlyChartData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                              <span className="font-bold">{d.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Wealth Advice Callout */}
                      <div className="p-6 rounded-3xl flex flex-col peak-section-card" style={{ background: 'rgba(255, 149, 0, 0.08)', border: '1px solid rgba(255, 149, 0, 0.2)' }}>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--warning)', marginTop: 0 }}>
                          <Sparkles size={16} /> Strategic Wealth Advice
                        </h3>
                        <div className="flex-1 flex flex-col gap-4 text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>
                          {currentInsights.map((insight, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <span className="text-base">💡</span>
                              <span dangerouslySetInnerHTML={{ 
                                __html: escapeHTML(insight)
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                              }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Period Spends list */}
                    <div className="apple-card explorer-section-card">
                      <h3 className="m-0 text-sm text-muted font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Calendar size={16} /> Spends In This Period
                      </h3>
                      <div className="max-w-4xl mx-auto">
                        <ExpenseList 
                          expenses={currentPeriod.expenses}
                          onDeleteExpense={null} // Read only view
                          formatCurrency={formatCurrency}
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="yearly-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Selector and Total Card */}
                <div className="apple-card explorer-section-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5 w-full md:w-auto">
                      <span className="text-xs text-muted font-bold uppercase tracking-wider block">Billing Year</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <select
                          value={currentYear?.year || ''}
                          onChange={handleYearChange}
                          style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            outline: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            minWidth: '200px'
                          }}
                        >
                          {sortedYears.map(y => (
                            <option key={y.year} value={y.year}>Billing Year {y.year}</option>
                          ))}
                        </select>
                        
                        {/* Yearly Export Buttons */}
                        {currentYear && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleExportCSV(currentYear)}
                              style={{
                                background: 'var(--pill-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
                            >
                              <FileText size={14} /> Export Excel
                            </button>
                            <button
                              onClick={() => window.print()}
                              style={{
                                background: 'var(--pill-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
                            >
                              <Download size={14} /> Export PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {currentYear && (
                      <div className="text-right">
                        <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">Total Yearly Outgoings</span>
                        <span className="text-3xl font-extrabold text-danger" style={{ color: 'var(--danger)' }}>
                          -{formatCurrency(currentYear.totalSpent)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {currentYear && (
                  <>
                    {/* Visual flux chart */}
                    <div className="apple-card analysis-section-card min-h-[380px] flex flex-col">
                      <h3 className="m-0 text-sm text-muted font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                        <BarChart3 size={16} /> Monthly Expenditure Flux
                      </h3>
                      {yearlyChartData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-xs text-muted">
                          No data available for this year.
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center mt-2">
                          <ResponsiveContainer width="100%" height={260}>
                            <RechartsBarChart data={yearlyChartData}>
                              <XAxis 
                                dataKey="name" 
                                stroke="var(--text-muted)" 
                                fontSize={11}
                                fontWeight="bold"
                                tickLine={false} 
                              />
                              <YAxis 
                                stroke="var(--text-muted)" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                width={60}
                                tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                              />
                              <RechartsTooltip 
                                cursor={{ fill: 'var(--timeline-hover-bg)' }}
                                formatter={(value) => [formatCurrency(value), 'Total Outgoings']}
                                contentStyle={{ 
                                  background: 'var(--card-bg)', 
                                  borderRadius: '12px', 
                                  border: '1px solid var(--border)',
                                  boxShadow: 'var(--shadow)',
                                  backdropFilter: 'blur(20px)',
                                  WebkitBackdropFilter: 'blur(20px)',
                                  color: 'var(--text-main)',
                                  padding: '8px 12px'
                                }}
                                itemStyle={{ color: 'var(--text-main)', fontSize: '13px' }}
                                labelStyle={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 'bold' }}
                              />
                              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="var(--primary)" barSize={36} />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Category Summary List */}
                    <div className="apple-card explorer-section-card">
                      <h3 className="m-0 text-sm text-muted font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                        <PieChart size={16} /> Yearly Category Breakdown
                      </h3>
                      <div className="flex flex-col gap-4">
                        {yearlyCategoryData.map(item => (
                          <div key={item.name} className="flex flex-col gap-2 p-4 rounded-2xl border border-border" style={{ background: 'var(--list-item-bg)' }}>
                            <div className="flex items-center justify-between text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                              <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full" style={{ background: item.color }} />
                                <span>{item.name}</span>
                              </div>
                              <span>{formatCurrency(item.value)} ({item.percentage}%)</span>
                            </div>
                            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'var(--pill-bg)' }}>
                              <div 
                                className="h-2.5 rounded-full" 
                                style={{ width: `${item.percentage}%`, background: item.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
