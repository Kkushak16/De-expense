import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Linkedin, ExternalLink, Smartphone, CheckCircle2, X, Share, PlusSquare } from 'lucide-react';

const Footer = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showGenericModal, setShowGenericModal] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone mode (PWA installed)
    const checkStandalone = window.navigator.standalone === true || 
                            window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(checkStandalone);

    // 2. Detect if device is iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(checkIOS);

    // 3. Listen for browser install prompt (Chrome/Android/Edge)
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Listen for PWA installation completion
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Trigger native Chrome/Android install dialogue
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      });
    } else if (isIOS) {
      // Show elegant Apple-style installation sheet
      setShowIOSModal(true);
    } else {
      // Show generic PWA setup info modal for other devices
      setShowGenericModal(true);
    }
  };

  return (
    <footer className="w-full mt-10 mb-6 flex flex-col items-center gap-5 pb-8 select-none">
      
      {/* 1. Dynamic PWA Download/Status Button */}
      <div className="flex flex-col items-center gap-2.5 w-full" style={{ maxWidth: '400px', width: '100%' }}>
        {isStandalone ? (
          <div 
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border w-full text-xs font-bold transition-all"
            style={{
              background: 'rgba(40, 205, 65, 0.08)',
              borderColor: 'rgba(40, 205, 65, 0.25)',
              color: 'var(--success)'
            }}
          >
            <CheckCircle2 size={16} />
            <span>✓ Offline App Active & Secured</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstallClick}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border w-full text-xs font-extrabold transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--primary), #0051a8)',
                borderColor: 'rgba(0, 113, 227, 0.3)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(0, 113, 227, 0.15)',
                cursor: 'pointer'
              }}
            >
              <Smartphone size={15} />
              <span>Install Web App (Offline Mode)</span>
              <Download size={14} className="animate-bounce" style={{ animationDuration: '2s' }} />
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="/de-expense.apk"
              download="de-expense.apk"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border w-full text-xs font-extrabold transition-all"
              style={{
                background: 'var(--pill-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow)',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pill-hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pill-bg)'; }}
            >
              <Smartphone size={15} style={{ color: 'var(--primary)' }} />
              <span>Download Android App (APK)</span>
              <Download size={14} style={{ color: 'var(--text-muted)' }} />
            </motion.a>
          </div>
        )}
        <p className="text-muted text-center leading-relaxed" style={{ fontSize: '10px', maxWidth: '300px', width: '100%' }}>
          {isStandalone 
            ? "Running directly on your device. Works completely offline with cached assets." 
            : "Install as a native application for offline ledger tracking and swift launch."}
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: '64px', height: '1px', background: 'var(--border)' }} />

      {/* 2. Sleek Creator and LinkedIn Recognition */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-muted font-medium" style={{ fontSize: '11px' }}>
          Created by <strong className="text-main font-bold">Kushak Dohare</strong>
        </span>
        <a 
          href="https://www.linkedin.com/in/kushak-dohare-25b0a8362/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border font-bold text-muted transition-all select-none"
          style={{ 
            textDecoration: 'none', 
            color: 'var(--text-muted)', 
            fontSize: '10px',
            background: 'var(--pill-bg)'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.background = 'var(--pill-hover-bg)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'var(--pill-bg)';
          }}
        >
          <Linkedin size={12} style={{ color: 'var(--primary)' }} />
          <span>Connect on LinkedIn</span>
          <ExternalLink size={8} />
        </a>
      </div>

      {/* 3. High-fidelity iOS Share/Install Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed-overlay modal-overlay" onClick={() => setShowIOSModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="apple-card modal-content-card"
              style={{ maxWidth: '380px', width: '90%', padding: '28px', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowIOSModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-2xl flex items-center justify-center mb-4" style={{ width: '48px', height: '48px', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)' }}>
                  <Smartphone size={24} />
                </div>
                
                <h3 className="text-base font-extrabold mb-1" style={{ color: 'var(--text-main)', margin: 0 }}>
                  Install on iOS Device
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Safari does not support direct automated installs. Follow these quick steps to run offline on your Home Screen:
                </p>

                <div className="flex flex-col gap-4 w-full" style={{ textAlign: 'left' }}>
                  {/* Step 1 */}
                  <div className="flex gap-3 p-3 rounded-xl border border-border" style={{ alignItems: 'flex-start', background: 'var(--list-item-bg)' }}>
                    <span className="rounded-lg text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ width: '24px', height: '24px', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)', flexShrink: 0 }}>
                      1
                    </span>
                    <div>
                      <span className="text-xs font-bold text-main block">Tap the Share Icon</span>
                      <span className="text-muted block mt-0.5" style={{ fontSize: '11px' }}>
                        Tap the Safari browser share button <Share size={14} className="inline mx-0.5 text-primary" style={{ verticalAlign: 'middle', color: 'var(--primary)' }} /> in the bottom navigation toolbar.
                      </span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3 p-3 rounded-xl border border-border" style={{ alignItems: 'flex-start', background: 'var(--list-item-bg)' }}>
                    <span className="rounded-lg text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ width: '24px', height: '24px', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)', flexShrink: 0 }}>
                      2
                    </span>
                    <div>
                      <span className="text-xs font-bold text-main block">Select 'Add to Home Screen'</span>
                      <span className="text-muted block mt-0.5" style={{ fontSize: '11px' }}>
                        Scroll down the sharing sheet list and select <strong className="text-main font-bold">Add to Home Screen <PlusSquare size={13} className="inline mx-0.5 text-primary" style={{ verticalAlign: 'middle', color: 'var(--primary)' }} /></strong>.
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3 p-3 rounded-xl border border-border" style={{ alignItems: 'flex-start', background: 'var(--list-item-bg)' }}>
                    <span className="rounded-lg text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ width: '24px', height: '24px', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)', flexShrink: 0 }}>
                      3
                    </span>
                    <div>
                      <span className="text-xs font-bold text-main block">Launch Offline Mode</span>
                      <span className="text-muted block mt-0.5" style={{ fontSize: '11px' }}>
                        Open <strong className="text-main">De-expense</strong> from your mobile Home Screen. It will now load standalone without browser headers!
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowIOSModal(false)}
                  className="w-full mt-6 py-2.5 rounded-xl text-xs font-bold"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. High-fidelity Generic PWA Modal */}
      <AnimatePresence>
        {showGenericModal && (
          <div className="fixed-overlay modal-overlay" onClick={() => setShowGenericModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="apple-card modal-content-card"
              style={{ maxWidth: '380px', width: '90%', padding: '28px', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowGenericModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-2xl flex items-center justify-center mb-4" style={{ width: '48px', height: '48px', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)' }}>
                  <Smartphone size={24} />
                </div>
                
                <h3 className="text-base font-extrabold mb-1" style={{ color: 'var(--text-main)', margin: 0 }}>
                  Install Web App
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  Install this app on your mobile device or desktop browser to launch with a single click and run 100% offline.
                </p>

                <div className="flex flex-col gap-4 w-full" style={{ textAlign: 'left' }}>
                  {/* Chrome/Android */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border" style={{ background: 'var(--list-item-bg)' }}>
                    <div className="text-xs text-muted leading-relaxed">
                      <strong className="text-xs text-main block mb-1">On Google Chrome / Edge:</strong>
                      Click the <strong className="text-main font-bold">Install</strong> icon in the address bar, or open the browser menu and select <strong className="text-main font-bold">Install App</strong>.
                    </div>
                  </div>

                  {/* Safari */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border" style={{ background: 'var(--list-item-bg)' }}>
                    <div className="text-xs text-muted leading-relaxed">
                      <strong className="text-xs text-main block mb-1">On Mobile Devices:</strong>
                      Open this URL in <strong className="text-main font-bold">Safari (iOS)</strong> or <strong className="text-main font-bold">Chrome (Android)</strong> on your mobile phone, and select <strong className="text-main font-bold">Add to Home Screen</strong> from the menu options.
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowGenericModal(false)}
                  className="w-full mt-6 py-2.5 rounded-xl text-xs font-bold"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
};

export default Footer;
