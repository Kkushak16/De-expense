import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowDownLeft, Calendar, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BalanceHistoryPage = ({ history, formatCurrency, theme, toggleTheme }) => {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-10">
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
            <h1 className="m-0 text-3xl">Balance History</h1>
            <p className="text-muted text-sm">Tracking all cash inflows.</p>
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

      <div className="apple-card">
        {history.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p>No deposit history found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-5 rounded-2xl"
                style={{ 
                  background: theme === 'dark' ? 'rgba(40, 205, 65, 0.05)' : 'rgba(40, 205, 65, 0.08)', 
                  border: '1px solid rgba(40, 205, 65, 0.15)' 
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl text-success" style={{ background: 'rgba(40, 205, 65, 0.1)' }}>
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <div className="font-bold">Money Added</div>
                    <div className="text-xs text-muted font-bold uppercase tracking-wider">
                      {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-success">
                  +{formatCurrency(entry.amount)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceHistoryPage;
