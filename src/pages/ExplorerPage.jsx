import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, LayoutGrid, Plus, X, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExpenseList from '../components/ExpenseList';

const ExplorerPage = ({ 
  expenses, 
  categoryMap, 
  formatCurrency, 
  onDeleteExpense, 
  onAddSubCategory, 
  onRemoveSubCategory,
  theme,
  toggleTheme
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categoryMap)[0] || null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  
  // Custom modal state for subcategory deletion
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);

  const filteredExpenses = expenses.filter(e => {
    if (selectedSubCategory) return e.category === selectedCategory && e.subCategory === selectedSubCategory;
    if (selectedCategory) return e.category === selectedCategory;
    return true;
  });

  const handleCreateSub = () => {
    if (newSubName.trim() && selectedCategory) {
      onAddSubCategory(selectedCategory, newSubName.trim());
      setSelectedSubCategory(newSubName.trim());
      setNewSubName('');
      setIsAddingSub(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
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
            <h1 className="m-0 text-3xl">Spend Explorer</h1>
            <p className="text-muted text-sm">Deep dive into your outgoings.</p>
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

      <div className="flex flex-col gap-8">
        {/* Category Selection Grid */}
        <div className="apple-card analysis-section-card">
          <h2 className="text-sm font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <LayoutGrid size={16} /> Select Category
          </h2>
          <div className="flex flex-wrap gap-4">
            {Object.keys(categoryMap).map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSelectedCategory(cat); setSelectedSubCategory(null); setIsAddingSub(false); }}
                className="flex-1 min-w-[150px] p-6 rounded-2xl text-lg font-bold border transition-all"
                style={{ 
                  background: selectedCategory === cat ? 'var(--primary)' : 'var(--pill-bg)',
                  borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
                  opacity: selectedCategory === cat ? 1 : 0.75,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.opacity = 1;
                    e.currentTarget.style.background = 'var(--pill-hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.opacity = 0.75;
                    e.currentTarget.style.background = 'var(--pill-bg)';
                  }
                }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sub-Category Filter & Results */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {selectedCategory && (
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="apple-card explorer-section-card flex-1"
              >
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex items-center justify-between">
                    <h2 className="m-0">{selectedCategory} Spends</h2>
                  </div>
                  
                  {/* Sub-category pills list */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div 
                      className={`category-pill text-xs ${selectedSubCategory === null ? 'active' : ''}`}
                      onClick={() => setSelectedSubCategory(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      All {selectedCategory}
                    </div>
                    {categoryMap[selectedCategory]?.map(sub => (
                      <div 
                        key={sub} 
                        className={`category-pill text-xs ${selectedSubCategory === sub ? 'active' : ''}`}
                        onClick={() => setSelectedSubCategory(sub === selectedSubCategory ? null : sub)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px 10px 20px' }}
                      >
                        <span>{sub}</span>
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubCategoryToDelete({ category: selectedCategory, sub });
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: 0.6,
                            transition: 'all 0.2s',
                            padding: '6px',
                            margin: '-6px -10px -6px -2px',
                            borderRadius: '50%',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = 1;
                            e.currentTarget.style.background = 'rgba(255, 59, 48, 0.15)';
                            e.currentTarget.style.color = 'var(--danger)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = 0.6;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'inherit';
                          }}
                        >
                          <X size={10} />
                        </span>
                      </div>
                    ))}
                    
                    {/* Add Sub Button */}
                    {!isAddingSub && (
                      <button 
                        onClick={() => setIsAddingSub(true)} 
                        className="category-pill text-xs"
                        style={{ 
                          background: 'var(--list-item-bg)', 
                          border: '1px dashed var(--border)', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--text-muted)',
                          padding: '10px 16px',
                        }}
                      >
                        <Plus size={12} /> Add Sub
                      </button>
                    )}
                  </div>
 
                  {/* Add Sub Inline Form */}
                  <AnimatePresence>
                    {isAddingSub && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2"
                        style={{ overflow: 'hidden' }}
                      >
                        <input 
                          type="text" 
                          value={newSubName} 
                          onChange={(e) => setNewSubName(e.target.value)}
                          placeholder="New Sub-category Name"
                          style={{ maxWidth: '240px', fontSize: '14px', padding: '8px 12px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateSub();
                          }}
                        />
                        <button 
                          onClick={handleCreateSub} 
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '14px', 
                            background: 'var(--primary)', 
                            color: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                        <button 
                          onClick={() => {
                            setIsAddingSub(false);
                            setNewSubName('');
                          }} 
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '14px', 
                            background: 'transparent', 
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
 
                <div className="max-w-4xl mx-auto">
                  <ExpenseList 
                    expenses={filteredExpenses} 
                    onDeleteExpense={onDeleteExpense} 
                    formatCurrency={formatCurrency}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Premium Custom Deletion Confirmation Modal */}
      <AnimatePresence>
        {subCategoryToDelete && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="apple-card modal-content-card"
            >
              <button 
                onClick={() => setSubCategoryToDelete(null)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
              <h2 className="mb-4 m-0 pr-8" style={{ marginTop: 0 }}>Delete Sub-category?</h2>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Are you sure you want to remove the sub-category <strong>"{subCategoryToDelete.sub}"</strong> from <strong>{subCategoryToDelete.category}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setSubCategoryToDelete(null)} 
                  style={{ 
                    background: 'var(--pill-bg)', 
                    color: 'var(--text-main)', 
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontSize: '15px',
                    cursor: 'pointer',
                    border: '1px solid var(--border)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onRemoveSubCategory(subCategoryToDelete.category, subCategoryToDelete.sub);
                    if (selectedSubCategory === subCategoryToDelete.sub) {
                      setSelectedSubCategory(null);
                    }
                    setSubCategoryToDelete(null);
                  }} 
                  style={{ 
                    background: 'var(--danger)', 
                    color: 'white', 
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontSize: '15px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplorerPage;
