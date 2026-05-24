import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ArrowRight, BookOpen, X } from 'lucide-react';

const ExpenseForm = ({ onAddExpense, categoryMap, onAddPrimary, onAddSubCategory }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(Object.keys(categoryMap)[0]);
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [isAddingNewPrimary, setIsAddingNewPrimary] = useState(false);
  const [newPrimaryName, setNewPrimaryName] = useState('');
  
  const [isAddingNewSub, setIsAddingNewSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubTargetPrimary, setNewSubTargetPrimary] = useState(Object.keys(categoryMap)[0]);

  // Reset subcategory when primary changes
  useEffect(() => {
    if (categoryMap[category] && categoryMap[category].length > 0) {
      setSubCategory(categoryMap[category][0]);
    } else {
      setSubCategory('');
    }
    setNewSubTargetPrimary(category); // sync the new sub target to current category
  }, [category, categoryMap]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const hasSub = categoryMap[category] && categoryMap[category].length > 0;
    if (hasSub && !subCategory) {
      return; // Required if there are subcategories
    }

    if (amount && !isNaN(amount)) {
      onAddExpense({
        id: Date.now(),
        amount: parseFloat(amount),
        category,
        subCategory: hasSub ? subCategory : '',
        description: description || (hasSub ? subCategory : category) || category,
        date
      });
      setAmount('');
      setDescription('');
    }
  };

  const handleCreatePrimary = () => {
    if (newPrimaryName.trim()) {
      onAddPrimary(newPrimaryName.trim());
      setCategory(newPrimaryName.trim());
      setNewPrimaryName('');
      setIsAddingNewPrimary(false);
    }
  };

  const handleCreateSub = () => {
    if (newSubName.trim()) {
      onAddSubCategory(newSubTargetPrimary, newSubName.trim());
      setCategory(newSubTargetPrimary);
      setSubCategory(newSubName.trim());
      setNewSubName('');
      setIsAddingNewSub(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Amount Input Block */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Amount (INR)</label>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              padding: '16px 20px', 
              background: 'var(--input-bg)', 
              border: '1px solid var(--border)',
              borderRadius: '14px',
              color: 'var(--text-main)'
            }}
            required
          />
        </div>
      </div>

      {/* Category & Sub-Category Row Side-by-Side */}
      <div className="flex gap-4">
        {/* Category Selector */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Category</label>
            <button 
              type="button" 
              onClick={() => {
                setIsAddingNewPrimary(!isAddingNewPrimary);
                setIsAddingNewSub(false);
              }}
              title={isAddingNewPrimary ? 'Cancel' : 'Add Category'}
              style={{ 
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: isAddingNewPrimary ? 'rgba(255, 59, 48, 0.1)' : 'var(--pill-bg)',
                border: '1px solid ' + (isAddingNewPrimary ? 'rgba(255, 59, 48, 0.2)' : 'var(--border)'),
                color: isAddingNewPrimary ? 'var(--danger)' : 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transform: 'none'
              }}
            >
              {isAddingNewPrimary ? <X size={10} /> : <Plus size={10} />}
            </button>
          </div>
          <AnimatePresence mode="wait">
            {isAddingNewPrimary ? (
              <motion.div key="new-p" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1">
                <input 
                  value={newPrimaryName} 
                  onChange={(e) => setNewPrimaryName(e.target.value)}
                  placeholder="Category" 
                  style={{ padding: '10px 12px', fontSize: '13px' }}
                />
                <button type="button" onClick={handleCreatePrimary} style={{ padding: '0 12px', borderRadius: '10px' }}><Check size={14}/></button>
              </motion.div>
            ) : (
              <motion.select 
                key="sel-p" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border)' }}
              >
                {Object.keys(categoryMap).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </motion.select>
            )}
          </AnimatePresence>
        </div>

        {/* Sub-Category Selector */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Sub-Category</label>
            <button 
              type="button" 
              onClick={() => {
                setIsAddingNewSub(!isAddingNewSub);
                setIsAddingNewPrimary(false);
              }}
              title={isAddingNewSub ? 'Cancel' : 'Add Sub-Category'}
              style={{ 
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: isAddingNewSub ? 'rgba(255, 59, 48, 0.1)' : 'var(--pill-bg)',
                border: '1px solid ' + (isAddingNewSub ? 'rgba(255, 59, 48, 0.2)' : 'var(--border)'),
                color: isAddingNewSub ? 'var(--danger)' : 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transform: 'none'
              }}
            >
              {isAddingNewSub ? <X size={10} /> : <Plus size={10} />}
            </button>
          </div>
          <AnimatePresence mode="wait">
            {isAddingNewSub ? (
              <motion.div key="new-s" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <input 
                    value={newSubName} 
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Sub-category" 
                    style={{ padding: '10px 12px', fontSize: '13px' }}
                  />
                  <button type="button" onClick={handleCreateSub} style={{ padding: '0 12px', borderRadius: '10px' }}><Check size={14}/></button>
                </div>
              </motion.div>
            ) : (
              <motion.select 
                key="sel-s" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                value={subCategory} 
                onChange={(e) => setSubCategory(e.target.value)}
                style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border)' }}
                disabled={!(categoryMap[category] && categoryMap[category].length > 0)}
              >
                {categoryMap[category] && categoryMap[category].length > 0 ? (
                  categoryMap[category].map(sub => <option key={sub} value={sub}>{sub}</option>)
                ) : (
                  <option value="">None</option>
                )}
              </motion.select>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Date Block */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border)' }}
          required 
        />
      </div>

      {/* Description Block */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Description</label>
        <textarea 
          placeholder="e.g. Weekly organic market run" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          style={{ 
            padding: '12px 14px', 
            fontSize: '14px', 
            borderRadius: '10px', 
            background: 'var(--input-bg)', 
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            minHeight: '80px',
            fontFamily: 'inherit',
            resize: 'vertical',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Submit Button */}
      <motion.button 
        whileTap={{ scale: 0.96 }} 
        type="submit" 
        className="mt-2" 
        style={{ 
          background: 'var(--primary)', 
          color: '#ffffff',
          borderRadius: '12px',
          padding: '14px',
          fontSize: '15px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Complete Transaction <ArrowRight size={16} />
      </motion.button>
    </form>
  );
};

export default ExpenseForm;
