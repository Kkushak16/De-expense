import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronRight } from 'lucide-react';

const ExpenseList = ({ expenses, onDeleteExpense, formatCurrency }) => {
  return (
    <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence mode="popLayout">
        {expenses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-muted italic text-sm"
          >
            No matching transactions.
          </motion.div>
        ) : (
          expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => (
            <motion.div 
              key={expense.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--list-item-bg)', border: '1px solid var(--border)' }}
            >
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{expense.description}</span>
                <div className="flex items-center gap-1 text-[10px] text-muted font-bold uppercase tracking-wider mt-1">
                  <span>{expense.category}</span>
                  <ChevronRight size={10} />
                  <span className="text-primary">{expense.subCategory}</span>
                  <span className="mx-1 opacity-50">•</span>
                  <span>{new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm">
                  -{formatCurrency(expense.amount)}
                </span>
                <motion.button 
                  whileHover={{ color: 'var(--danger)', scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteExpense(expense.id)}
                  style={{ background: 'transparent', padding: '4px', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseList;
