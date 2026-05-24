import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Landmark, Check } from 'lucide-react';
import { generateSavingsInsights } from '../utils/reportUtils';

const escapeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const ReportPopup = ({ 
  period, // { id, label, year, isYearly, expenses, totalSpent }
  formatCurrency, 
  onClose 
}) => {
  if (!period) return null;

  const insights = generateSavingsInsights(period.expenses, period.totalSpent);

  // Group by category for visualization
  const categoryTotals = {};
  period.expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="apple-card modal-content-card max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        style={{ padding: '32px' }}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl text-primary" style={{ background: 'rgba(0, 113, 227, 0.1)' }}>
              {period.isYearly ? <Landmark size={24} /> : <Sparkles size={24} />}
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block">
                {period.isYearly ? 'Year-End Wealth Report' : 'Month-End Financial Report'}
              </span>
              <h2 className="m-0 text-2xl font-extrabold mt-0.5" style={{ color: 'var(--text-main)' }}>
                {period.isYearly ? `Billing Year ${period.year} Completed!` : `Billing Cycle Completed!`}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="modal-close-btn"
            style={{ top: '32px', right: '32px' }}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-muted text-sm mb-6 m-0 border-b border-border pb-4">
          Below is your detailed financial summary and strategic advice for: <strong style={{ color: 'var(--text-main)' }}>{period.label}</strong>.
        </p>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-2xl border border-border" style={{ background: 'var(--list-item-bg)' }}>
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">Total Expenditure</span>
            <span className="text-2xl font-extrabold text-danger" style={{ color: 'var(--danger)' }}>-{formatCurrency(period.totalSpent)}</span>
          </div>
          <div className="p-5 rounded-2xl border border-border" style={{ background: 'var(--list-item-bg)' }}>
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">Active Categories</span>
            <span className="text-2xl font-extrabold" style={{ color: 'var(--text-main)' }}>{sortedCategories.length} Categories</span>
          </div>
        </div>

        {/* Distribution */}
        <div className="mb-6">
          <h3 className="text-sm text-muted font-bold uppercase tracking-wider mb-3">Expense Distribution</h3>
          {sortedCategories.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted border border-dashed border-border rounded-xl">
              No transactions recorded in this period.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedCategories.map(([category, amount]) => {
                const percentage = period.totalSpent > 0 ? ((amount / period.totalSpent) * 100).toFixed(0) : 0;
                return (
                  <div key={category} className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border" style={{ background: 'var(--list-item-bg)' }}>
                    <div className="flex justify-between text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                      <span>{category}</span>
                      <span>{formatCurrency(amount)} ({percentage}%)</span>
                    </div>
                    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--pill-bg)' }}>
                      <div 
                        className="h-2 rounded-full" 
                        style={{ width: `${percentage}%`, background: 'var(--primary)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart Insights */}
        <div className="p-6 rounded-2xl mb-8" style={{ background: 'rgba(255, 149, 0, 0.08)', border: '1px solid rgba(255, 149, 0, 0.2)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--warning)', marginTop: 0 }}>
            <Sparkles size={16} /> Strategic Wealth Advice
          </h3>
          <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>
            {insights.map((insight, idx) => (
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

        {/* Close button */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button 
            onClick={onClose} 
            className="flex items-center gap-2"
            style={{ 
              background: 'var(--primary)', 
              color: '#ffffff', 
              borderRadius: '12px',
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <Check size={18} /> Acknowledge & Archive
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportPopup;
