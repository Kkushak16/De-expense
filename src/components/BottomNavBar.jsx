import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Compass, Users, Sparkles, History } from 'lucide-react';

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <Wallet size={20} /> },
    { path: '/explorer', label: 'Explorer', icon: <Compass size={20} /> },
    { path: '/splitwise', label: 'Splitwise', icon: <Users size={20} /> },
    { path: '/reports', label: 'Reports', icon: <Sparkles size={20} /> },
    { path: '/balance-history', label: 'History', icon: <History size={20} /> }
  ];

  return (
    <div className="bottom-nav-bar">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="bottom-nav-item"
            style={{
              color: isActive ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'col', alignItems: 'center', justifyContent: 'center' }}>
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="bottom-nav-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavBar;
