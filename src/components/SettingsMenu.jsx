import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Info, HelpCircle, BookOpen, Linkedin, ExternalLink } from 'lucide-react';

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="apple-card modal-content-card"
    >
      <button 
        onClick={onClose}
        className="modal-close-btn"
      >
        <X size={20} />
      </button>
      <h2 className="mb-6 m-0 pr-8" style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </motion.div>
  </div>
);

const SettingsMenu = ({ userName, setUserName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'name', 'overview', 'tutorial', 'about'
  const [tempName, setTempName] = useState(userName);
  const [tutorialStep, setTutorialStep] = useState(0);

  const handleOpenModal = (modalName) => {
    setActiveModal(modalName);
    setIsMenuOpen(false);
    if (modalName === 'tutorial') {
      setTutorialStep(0);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      handleCloseModal();
    }
  };

  return (
    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
      <AnimatePresence mode="wait">
        {!isMenuOpen && (
          <motion.button 
            key="menu-toggle-btn"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => setIsMenuOpen(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-main)',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <Menu size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed-overlay" 
            onClick={() => setIsMenuOpen(false)} 
          />
        )}
        {isMenuOpen && (
          <motion.div 
            key="settings-dropdown-box"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="apple-card settings-dropdown"
            style={{ transformOrigin: 'top right' }}
          >
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="m-0 text-lg font-bold">Settings</h3>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <button onClick={() => handleOpenModal('name')} className="settings-item-btn">
                <User size={18} style={{ color: 'var(--primary)' }} /> Change Name
              </button>
              <button onClick={() => handleOpenModal('overview')} className="settings-item-btn">
                <Info size={18} style={{ color: 'var(--primary)' }} /> Overview
              </button>
              <button onClick={() => handleOpenModal('tutorial')} className="settings-item-btn">
                <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Tutorial
              </button>
              <button onClick={() => handleOpenModal('about')} className="settings-item-btn">
                <HelpCircle size={18} style={{ color: 'var(--primary)' }} /> About
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'name' && (
          <Modal title="Change Name" onClose={handleCloseModal}>
            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              <input 
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)} 
                placeholder="Your Name"
                autoFocus
                required
              />
              <button type="submit" style={{ background: 'var(--primary)' }}>Save Changes</button>
            </form>
          </Modal>
        )}

        {activeModal === 'overview' && (
          <Modal title="App Overview" onClose={handleCloseModal}>
            <div className="text-sm text-muted leading-relaxed flex flex-col gap-4" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
              <p>Welcome to Aura Finance! Aura is a premium, strategic personal wealth suite designed with a focused aesthetic to help you track, split, and optimize capital on device.</p>
              
              <div className="flex flex-col gap-3.5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>1. Core Capital Dashboard</h4>
                  <p className="m-0 text-xs">Track available balance, aggregate monthly/yearly outgoings, and detect peak spending days instantly using our responsive metrics block.</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>2. Dynamic Transaction Engine</h4>
                  <p className="m-0 text-xs">Register outgoings across main categories (Food, Education, etc.). Manage primary and sub-categories on the fly with real-time field validation.</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>3. Recharts Spending Analysis</h4>
                  <p className="m-0 text-xs">Visualize expenditure distributions using an interactive, custom-colored radial chart that supports direct drill-down navigation.</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>4. Spend Explorer & Archive</h4>
                  <p className="m-0 text-xs">Browse transactional timelines grouped as accordions. Review validation states (Approved/Pending), filter history, and delete mistakes.</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>5. Automated Income Scheduler</h4>
                  <p className="m-0 text-xs">Establish automated cash streams. Auto-increase your balance at standard monthly cycles or customized daily interval timers.</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>6. Splitwise Shared Ledger</h4>
                  <p className="m-0 text-xs">Create isolated circles (trips, loft splits), divide bills equally or manually, track net balances, set payment due reminders, and trigger premium audio feedback.</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>7. Security Hardening & PWA</h4>
                  <p className="m-0 text-xs">Hardened against XSS attacks via text encoding wrappers, restricted using strict client-side Content Security Policies, and offline-enabled for edge-to-edge standalone mobile layouts.</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'tutorial' && (
          <Modal title="Interactive Tutorial" onClose={handleCloseModal}>
            <div className="text-sm text-muted leading-relaxed flex flex-col gap-5">
              
              {/* Tutorial Step Cards */}
              <div style={{ minHeight: '160px' }}>
                <AnimatePresence mode="wait">
                  {tutorialStep === 0 && (
                    <motion.div 
                      key="step-0"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                        Step 1 of 5 • INITIAL BALANCES
                      </span>
                      <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-main)' }}>
                        Top Up Your Wallet
                      </h4>
                      <p className="text-xs leading-relaxed m-0 mt-1">
                        Let's configure your capital. **Click the green "+ Add money" button** in the top action bar to open the balance configuration sheet and enter your current available cash balance.
                      </p>
                    </motion.div>
                  )}
                  
                  {tutorialStep === 1 && (
                    <motion.div 
                      key="step-1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                        Step 2 of 5 • EXPENDITURES
                      </span>
                      <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-main)' }}>
                        Log Your Outgoings
                      </h4>
                      <p className="text-xs leading-relaxed m-0 mt-1">
                        Subtract cash. **Scroll to the "New Transaction" panel, enter an amount, choose a primary category, and click "Add Transaction"** to log the expense, update your balance, and feed the spending charts.
                      </p>
                    </motion.div>
                  )}
                  
                  {tutorialStep === 2 && (
                    <motion.div 
                      key="step-2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                        Step 3 of 5 • INCOME STREAMS
                      </span>
                      <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-main)' }}>
                        Automate Recurring Revenue
                      </h4>
                      <p className="text-xs leading-relaxed m-0 mt-1">
                        Build recurring streams. **Click "+ Add money" again, select "Every Month" or "Custom timer" from the schedule selector, and submit** to establish automatic, recurring balance increases.
                      </p>
                    </motion.div>
                  )}
                  
                  {tutorialStep === 3 && (
                    <motion.div 
                      key="step-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                        Step 4 of 5 • SHARED SPLITS
                      </span>
                      <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-main)' }}>
                        Split with Friend Circles
                      </h4>
                      <p className="text-xs leading-relaxed m-0 mt-1">
                        Collaborate with members. **Click the "Splitwise" button in the header, click "Create Group", add friends, and submit shared bills** to calculate who owes who, set due dates, and track payback progress.
                      </p>
                    </motion.div>
                  )}
                  
                  {tutorialStep === 4 && (
                    <motion.div 
                      key="step-4"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                        Step 5 of 5 • EXPLORATION
                      </span>
                      <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-main)' }}>
                        Audit Ledger Archives
                      </h4>
                      <p className="text-xs leading-relaxed m-0 mt-1">
                        Conduct deep audits. **Expand category accordions in the "Spend Explorer" at the bottom or click "Reports" in the header** to check validation status, filter timelines, and delete mistaken entries.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mb-1 select-none">
                {[0, 1, 2, 3, 4].map(idx => (
                  <span 
                    key={idx}
                    onClick={() => setTutorialStep(idx)}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: tutorialStep === idx ? 'var(--primary)' : 'var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  />
                ))}
              </div>

              {/* Navigation Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transform: 'none',
                    opacity: 1
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  Skip Tutorial
                </button>

                <div className="flex gap-2">
                  {tutorialStep > 0 && (
                    <button
                      onClick={() => setTutorialStep(prev => prev - 1)}
                      style={{
                        background: 'var(--pill-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: '12px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transform: 'none',
                        opacity: 1
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
                    >
                      Back
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      if (tutorialStep < 4) {
                        setTutorialStep(prev => prev + 1);
                      } else {
                        handleCloseModal();
                      }
                    }}
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      fontSize: '12px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transform: 'none',
                      opacity: 1
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {tutorialStep === 4 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>

            </div>
          </Modal>
        )}

        {activeModal === 'about' && (
          <Modal title="About" onClose={handleCloseModal}>
            <div className="text-sm text-muted leading-relaxed flex flex-col gap-4">
              <div>
                <strong className="text-base text-main block mb-1">Aura Finance v1.0</strong>
                <p className="m-0 text-xs opacity-70 font-medium">A premium expense tracking application built for personal strategic wealth management.</p>
              </div>
              
              <div className="border-t border-border pt-4 mt-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Created By</span>
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border" style={{ background: 'var(--list-item-bg)' }}>
                  <span className="text-sm font-extrabold text-main">Kushak Dohare</span>
                  <a 
                    href="https://www.linkedin.com/in/kushak-dohare-25b0a8362/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline select-none"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}
                  >
                    <Linkedin size={14} />
                    <span>LinkedIn</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsMenu;
