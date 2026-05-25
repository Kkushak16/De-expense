import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Building2, 
  Wallet, 
  Globe, 
  ArrowRight, 
  User,
  CheckCircle2
} from 'lucide-react';
import Logo from '../components/Logo';

const INITIAL_SHORTCUTS = [
  {
    id: 'sc-hdfc',
    name: 'HDFC Personal Bank',
    url: 'https://netbanking.hdfc.com',
    icon: 'bank',
    category: 'Personal'
  },
  {
    id: 'sc-vanguard',
    name: 'Vanguard Portfolio',
    url: 'https://vanguard.com/login',
    icon: 'portfolio',
    category: 'Personal'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('de_expense_shortcuts');
    return saved ? JSON.parse(saved) : INITIAL_SHORTCUTS;
  });

  // Form states
  const [appName, setAppName] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('bank');
  const [selectedCategory, setSelectedCategory] = useState('Personal');

  // Sign in notification state
  const [showSignInToast, setShowSignInToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('de_expense_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleAddShortcut = (e) => {
    e.preventDefault();
    if (!appName.trim() || !redirectUrl.trim()) return;

    let formattedUrl = redirectUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newShortcut = {
      id: 'sc-' + Date.now(),
      name: appName.trim(),
      url: formattedUrl,
      icon: selectedIcon,
      category: selectedCategory
    };

    setShortcuts(prev => [...prev, newShortcut]);
    setAppName('');
    setRedirectUrl('');
  };

  const handleDeleteShortcut = (id, e) => {
    e.stopPropagation(); // Prevent opening link
    setShortcuts(prev => prev.filter(sc => sc.id !== id));
  };

  const getShortcutIcon = (iconName) => {
    switch (iconName) {
      case 'bank':
        return <Building2 size={16} />;
      case 'portfolio':
        return <TrendingUp size={16} />;
      case 'wallet':
        return <Wallet size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const handleSignIn = () => {
    setShowSignInToast(true);
    setTimeout(() => {
      setShowSignInToast(false);
    }, 3500);
  };

  return (
    <div className="animate-in fade-in duration-700" style={{ background: '#070708', minHeight: '100vh', padding: '0 20px 60px 20px', color: '#f5f5f7' }}>
      
      {/* Sign In Premium Toast */}
      <AnimatePresence>
        {showSignInToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl border"
            style={{
              background: 'rgba(28, 28, 30, 0.9)',
              borderColor: 'rgba(0, 113, 227, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              color: 'var(--text-main)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <CheckCircle2 size={18} className="text-primary" style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-bold">Authenticated via Secure Ledger Protocol.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header matching mockup */}
      <header className="flex items-center justify-between py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', maxWidth: '1000px', margin: '0 auto 60px auto' }}>
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => navigate('/')}>
          <Logo size={28} />
          <span className="text-lg font-extrabold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            De-expense
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div 
            style={{ 
              width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
            }}
            className="flex items-center justify-center hover:bg-pill-hover-bg transition-colors"
          >
            <User size={16} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Actual brand vector Logo at the center matching mockup and dashboard */}
        <div style={{
          width: '130px',
          height: '130px',
          background: '#000000',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 255, 255, 0.03)',
          marginBottom: '36px'
        }}>
          <Logo size={80} />
        </div>

        {/* Hero Copy */}
        <h1 className="text-center font-extrabold tracking-tight" style={{ fontSize: '48px', margin: '0 0 16px 0', letterSpacing: '-0.04em', color: '#ffffff' }}>
          De-expense Financial.
        </h1>
        <p className="text-center text-muted" style={{ maxWidth: '580px', fontSize: '15px', lineHeight: '1.6', margin: '0 0 40px 0', opacity: 0.85 }}>
          Precise, professional expense tracking for those who value data density and performance. Reclaim control over your capital.
        </p>

        {/* Start Tracking CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-8 py-4 text-sm font-extrabold"
          style={{
            background: '#ffffff',
            color: '#000000',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(255,255,255,0.08)',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s ease',
            marginBottom: '80px'
          }}
        >
          <span>Start tracking your expenses</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </motion.button>

        {/* Ecosystem Grid Section */}
        <section className="w-full mb-16" style={{ textAlign: 'left' }}>
          <div className="flex flex-col gap-2.5 mb-6">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-primary px-2.5 py-1 rounded bg-blue-950/40 border border-blue-900/30 uppercase" style={{ color: 'var(--primary)', background: 'rgba(0, 113, 227, 0.08)' }}>
                ECOSYSTEM
              </span>
            </div>
            <h2 className="text-2xl font-extrabold m-0 text-white" style={{ letterSpacing: '-0.02em' }}>
              Links to our other apps
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {/* Card 1: Pro Tracker */}
            <div 
              onClick={() => navigate('/explorer')}
              className="apple-card hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between"
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '4px solid var(--primary)',
                padding: '24px',
                borderRadius: '16px',
                minHeight: '160px',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div>
                <span className="text-primary block mb-3" style={{ color: 'var(--primary)' }}>
                  <TrendingUp size={20} />
                </span>
                <span className="font-bold text-base text-white block mb-1">Pro Tracker</span>
                <span className="text-xs text-muted leading-relaxed block" style={{ opacity: 0.75 }}>
                  Advanced analytics for heavy users with custom filtering.
                </span>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-[9px] font-extrabold tracking-wider text-primary uppercase" style={{ color: 'var(--primary)' }}>
                  ACTIVE
                </span>
                <ExternalLink size={14} className="text-muted" />
              </div>
            </div>

            {/* Card 2: Splitwise Bridge */}
            <div 
              onClick={() => navigate('/splitwise')}
              className="apple-card hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between"
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '4px solid var(--warning)',
                padding: '24px',
                borderRadius: '16px',
                minHeight: '160px',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div>
                <span className="text-warning block mb-3" style={{ color: 'var(--warning)' }}>
                  <Users size={20} />
                </span>
                <span className="font-bold text-base text-white block mb-1">Splitwise Bridge</span>
                <span className="text-xs text-muted leading-relaxed block" style={{ opacity: 0.75 }}>
                  Sync your shared balances automatically with one click.
                </span>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-[9px] font-extrabold tracking-wider text-warning uppercase" style={{ color: 'var(--warning)' }}>
                  POPULAR
                </span>
                <ExternalLink size={14} className="text-muted" />
              </div>
            </div>

            {/* Card 3: Report Engine */}
            <div 
              onClick={() => navigate('/reports')}
              className="apple-card hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between"
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '4px solid var(--danger)',
                padding: '24px',
                borderRadius: '16px',
                minHeight: '160px',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div>
                <span className="text-danger block mb-3" style={{ color: 'var(--danger)' }}>
                  <FileText size={20} />
                </span>
                <span className="font-bold text-base text-white block mb-1">Report Engine</span>
                <span className="text-xs text-muted leading-relaxed block" style={{ opacity: 0.75 }}>
                  Generate professional PDF and CSV tax-ready reports.
                </span>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-[9px] font-extrabold tracking-wider text-danger uppercase" style={{ color: 'var(--danger)' }}>
                  PREMIUM
                </span>
                <ExternalLink size={14} className="text-muted" />
              </div>
            </div>

            {/* Card 4: Microgrid Simulator */}
            <div 
              onClick={() => window.open('https://heti-one.vercel.app/', '_blank')}
              className="apple-card hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between"
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '4px solid #34c759',
                padding: '24px',
                borderRadius: '16px',
                minHeight: '160px',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div>
                <span className="block mb-3" style={{ color: '#34c759' }}>
                  <Globe size={20} />
                </span>
                <span className="font-bold text-base text-white block mb-1">Microgrid Simulator</span>
                <span className="text-xs text-muted leading-relaxed block" style={{ opacity: 0.75 }}>
                  High-fidelity simulation and modeling tool for microgrid control architectures and energy optimization.
                </span>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-[9px] font-extrabold tracking-wider uppercase" style={{ color: '#34c759' }}>
                  ACTIVE
                </span>
                <ExternalLink size={14} className="text-muted" />
              </div>
            </div>
          </div>
        </section>

        {/* User Customization & Shortcut Links widgets */}
        <section className="w-full flex flex-col gap-2.5 mb-16" style={{ textAlign: 'left' }}>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              USER CUSTOMIZATION
            </span>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'start'
          }}>
            
            {/* Left side: shortcut items list */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-extrabold m-0 text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Your App Links
                </h2>
                <p className="text-xs text-muted leading-relaxed m-0" style={{ opacity: 0.8 }}>
                  Personalize your workspace by adding shortcuts to the tools you use most. Manage all your financial resources from a single terminal.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {shortcuts.map(sc => (
                  <div 
                    key={sc.id}
                    onClick={() => window.open(sc.url, '_blank')}
                    className="flex items-center justify-between p-4 rounded-xl border group hover:bg-pill-hover-bg transition-all cursor-pointer"
                    style={{ 
                      background: 'rgba(255,255,255,0.01)', 
                      borderColor: 'rgba(255,255,255,0.05)',
                      position: 'relative'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center text-primary" style={{ background: 'rgba(0, 113, 227, 0.08)', color: 'var(--primary)' }}>
                        {getShortcutIcon(sc.icon)}
                      </span>
                      <div>
                        <span className="text-sm font-extrabold text-white block">{sc.name}</span>
                        <span className="text-[9px] text-muted font-bold tracking-wider uppercase block mt-1">
                          {sc.url.replace(/^https?:\/\//i, '')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>
                        {sc.category}
                      </span>
                      
                      {/* Trash Delete button */}
                      <button
                        onClick={(e) => handleDeleteShortcut(sc.id, e)}
                        className="p-1.5 hover:bg-pill-hover-bg rounded text-muted hover:text-danger border-none bg-transparent cursor-pointer flex items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Add New Shortcut form */}
            <div 
              className="apple-card"
              style={{
                background: 'rgba(255,255,255,0.01)',
                borderColor: 'rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '30px'
              }}
            >
              <h3 className="m-0 text-base font-extrabold mb-6 text-white">
                Add New Shortcut
              </h3>

              <form onSubmit={handleAddShortcut} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">APP NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. My Stock Portfolio" 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    style={{ 
                      padding: '12px 14px', fontSize: '13px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-main)', borderRadius: '10px',
                      width: '100%', boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">REDIRECT URL</label>
                  <input 
                    type="text" 
                    placeholder="https://" 
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    style={{ 
                      padding: '12px 14px', fontSize: '13px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-main)', borderRadius: '10px',
                      width: '100%', boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ICON</label>
                    <select
                      value={selectedIcon}
                      onChange={(e) => setSelectedIcon(e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '12px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="bank">Bank</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="wallet">Wallet</option>
                      <option value="globe">Globe</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">CATEGORY</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '12px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="flex items-center justify-center gap-1.5 mt-3 py-3.5 rounded-xl text-xs font-extrabold transition-all"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>REGISTER APP LINK</span>
                </button>
              </form>
            </div>
            
          </div>
        </section>

      </main>

      {/* Mockup Footer */}
      <footer className="w-full pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left select-none" style={{ borderColor: 'rgba(255,255,255,0.06)', maxWidth: '1000px', margin: '60px auto 0 auto', fontSize: '11px', color: 'var(--text-muted)' }}>
        <div>
          <span className="font-extrabold tracking-wider" style={{ color: '#ffffff' }}>DE-EXPENSE FINANCIAL</span>
          <span className="mx-2 opacity-50">•</span>
          <span>© 2024 De-expense Financial. All rights reserved.</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" className="hover:underline hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" className="hover:underline hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Support</a>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
