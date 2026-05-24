import React, { useState } from 'react';
import { IndianRupee, Clock, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const BalanceForm = ({ 
  onSetBalance, 
  isAddingMode = false, 
  scheduledAdditions = [], 
  onDeleteScheduledAddition 
}) => {
  const [amount, setAmount] = useState('');
  const [scheduleType, setScheduleType] = useState('one-time');
  const [customDays, setCustomDays] = useState('30');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      const schedule = scheduleType !== 'one-time' ? {
        interval: scheduleType,
        days: scheduleType === 'days' ? parseInt(customDays) || 30 : 30
      } : null;
      
      onSetBalance(parseFloat(amount), schedule);
      setAmount('');
      setScheduleType('one-time');
    }
  };

  const formatScheduleText = (item) => {
    if (item.interval === 'month') return 'Monthly auto-addition';
    return `Auto-addition every ${item.days} days`;
  };

  return (
    <div className="apple-card" style={{ marginBottom: isAddingMode ? 0 : '24px' }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-muted mb-2.5 block text-xs font-bold uppercase tracking-widest">
            {isAddingMode ? 'Amount to Add' : 'Initial Wallet Balance'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" style={{ display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={18} />
            </span>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-12"
              style={{ paddingLeft: '44px' }}
              autoFocus={isAddingMode}
              required
            />
          </div>
        </div>

        {isAddingMode && (
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-dashed" style={{ background: 'rgba(255, 255, 255, 0.01)', borderColor: 'var(--border)' }}>
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} className="text-primary" /> Auto-Increase Schedule Timer
              </label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                style={{
                  background: '#090909',
                  border: '1px solid #1a1a1a',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="one-time">One-time addition (Now only)</option>
                <option value="month">Every Month (Recurring Income)</option>
                <option value="days">Custom timer (Certain number of days)</option>
              </select>
            </div>

            {scheduleType === 'days' && (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200">
                <label className="text-muted text-[9px] font-bold uppercase tracking-wider">Number of Days between additions</label>
                <input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  style={{
                    background: '#090909',
                    border: '1px solid #1a1a1a',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: 'white'
                  }}
                  required
                />
              </div>
            )}
          </div>
        )}

        <motion.button 
          whileTap={{ scale: 0.96 }}
          type="submit"
          style={{ background: isAddingMode ? 'var(--success)' : 'var(--primary)', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}
        >
          {isAddingMode ? 'Add & Configure Balance' : 'Start Strategic Tracking'}
        </motion.button>
      </form>

      {/* Render list of active balance addition timers */}
      {isAddingMode && scheduledAdditions.length > 0 && (
        <div className="mt-6 pt-5 border-t border-border">
          <span className="text-muted text-[10px] font-bold uppercase tracking-widest block mb-3.5">
            Active Balance Increase Timers ({scheduledAdditions.length})
          </span>
          <div className="flex flex-col gap-3">
            {scheduledAdditions.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3.5 rounded-xl border border-border"
                style={{ background: 'var(--list-item-bg)' }}
              >
                <div className="flex items-center gap-3">
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(40, 205, 65, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)'
                  }}>
                    <Calendar size={13} />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">₹{item.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-muted font-semibold block mt-0.5">{formatScheduleText(item)}</span>
                    <span className="text-[9px] text-[#0071e3] font-bold block mt-1">
                      Next addition: {new Date(item.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteScheduledAddition(item.id)}
                  className="p-2 hover:bg-pill-hover-bg rounded text-muted hover:text-danger cursor-pointer border-none bg-transparent"
                  style={{ background: 'transparent', transform: 'none' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceForm;
