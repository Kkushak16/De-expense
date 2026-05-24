import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, ResponsiveContainer, Cell, Tooltip
} from 'recharts';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#0071e3', '#ff3b30', '#34c759', '#ff9500', '#5856d6', '#ff2d55', '#af52de', '#5ac8fa'];

const ExpenseChart = ({ expenses, formatCurrency, onDrillDown }) => {
  const [drillDownCategory, setDrillDownCategory] = useState(null);

  const primaryData = useMemo(() => {
    return expenses.reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) existing.value += curr.amount;
      else acc.push({ name: curr.category, value: curr.amount });
      return acc;
    }, []);
  }, [expenses]);

  const subData = useMemo(() => {
    if (!drillDownCategory) return [];
    return expenses
      .filter(e => e.category === drillDownCategory)
      .reduce((acc, curr) => {
        const name = curr.subCategory || 'General';
        const existing = acc.find(item => item.name === name);
        if (existing) existing.value += curr.amount;
        else acc.push({ name, value: curr.amount });
        return acc;
      }, []);
  }, [expenses, drillDownCategory]);

  const displayData = drillDownCategory ? subData : primaryData;

  const totalSpent = useMemo(() => {
    return displayData.reduce((sum, item) => sum + item.value, 0);
  }, [displayData]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted py-20 text-center">
        <p>No data available for analysis.</p>
      </div>
    );
  }

  // Format compact amount for the center of the donut (e.g. 12.4k instead of 12,402)
  const formatCompact = (val) => {
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(1)}k`;
    }
    return `₹${val.toFixed(0)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic Back or Sub-Label header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest m-0">
          {drillDownCategory ? `Breakdown: ${drillDownCategory}` : 'Monthly allocation by category'}
        </h4>
        {drillDownCategory && (
          <button 
            onClick={() => setDrillDownCategory(null)}
            className="flex items-center gap-1 text-[10px] p-1 px-3 h-auto"
            style={{ background: 'var(--pill-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '6px' }}
          >
            <ChevronLeft size={12} /> Back
          </button>
        )}
      </div>
      
      {/* Redesigned Donut Chart & Side-aligned vertical legend */}
      <div className="flex flex-col md:flex-row items-center gap-6" style={{ minHeight: '230px' }}>
        
        {/* Left Side: Donut Pie Chart with absolutely centered Total */}
        <div style={{ position: 'relative', width: '220px', height: '220px', flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                onClick={(data) => {
                  if (!drillDownCategory) {
                    setDrillDownCategory(data.name);
                    if (onDrillDown) onDrillDown(data.name);
                  }
                }}
                style={{ cursor: !drillDownCategory ? 'pointer' : 'default', outline: 'none' }}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
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
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Total Label inside Donut Hole */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</span>
            <h3 style={{ margin: '1px 0 0 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {formatCompact(totalSpent)}
            </h3>
          </div>
        </div>

        {/* Right Side: Clean vertical lists with colored circles and details */}
        <div className="flex flex-col gap-4" style={{ flex: 1, width: '100%' }}>
          {displayData.map((entry, index) => {
            const percentage = totalSpent > 0 ? ((entry.value / totalSpent) * 100).toFixed(0) : 0;
            return (
              <div 
                key={entry.name} 
                className="flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--pill-bg)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => {
                  if (!drillDownCategory) {
                    setDrillDownCategory(entry.name);
                    if (onDrillDown) onDrillDown(entry.name);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Colored circle */}
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold block" style={{ color: 'var(--text-main)' }}>{entry.name}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-xs font-bold block" style={{ color: 'var(--text-main)' }}>{formatCurrency(entry.value)}</span>
                  <span className="text-[10px] text-muted font-bold block">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ExpenseChart;
