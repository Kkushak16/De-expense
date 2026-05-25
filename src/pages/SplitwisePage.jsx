import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Users, Check, Trash2, TrendingUp, TrendingDown, 
  Sun, Moon, Bell, Calendar, X, AlertCircle, Sparkles, FolderPlus,
  X as CloseIcon
} from 'lucide-react';
import logo from '../assets/logo.png';
import {
  Search, Lock, Briefcase, PieChart, Shield, ChevronRight, Home, Utensils, Plane, UserMinus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_GROUPS = [];

const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.08);
    
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.12);
    
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.28);
    osc2.stop(ctx.currentTime + 0.28);
  } catch (e) {
    console.error('Synthesiser sound trigger failed', e);
  }
};

const SplitwisePage = ({ formatCurrency, theme, toggleTheme }) => {
  const navigate = useNavigate();

  // Load groups from local storage
  const [groups, setGroups] = useState(() => {
    const savedGroups = localStorage.getItem('wallet_splitwise_groups');
    if (savedGroups) return JSON.parse(savedGroups);
    return [];
  });

  const [activeGroupId, setActiveGroupId] = useState(() => {
    const saved = localStorage.getItem('wallet_splitwise_active_group_id');
    return saved || '';
  });

  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('wallet_splitwise_bills');
    return saved ? JSON.parse(saved) : [];
  });

  // Active Group derivation
  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === activeGroupId) || groups[0] || { id: 'g1', name: 'Tokyo Trip 2024', friends: [], icon: 'plane' };
  }, [groups, activeGroupId]);

  const friends = activeGroup.friends;

  // Reminders state
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('wallet_splitwise_reminders');
    return saved ? JSON.parse(saved) : {};
  });

  // You Owe Reminders custom states
  const [youOweReminders, setYouOweReminders] = useState(() => {
    const saved = localStorage.getItem('wallet_splitwise_you_owe_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wallet_splitwise_you_owe_reminders', JSON.stringify(youOweReminders));
  }, [youOweReminders]);

  const [showYouOweDrawer, setShowYouOweDrawer] = useState(false);
  const [youOweName, setYouOweName] = useState('');
  const [youOweAmount, setYouOweAmount] = useState('');
  const [youOweDueDate, setYouOweDueDate] = useState('');

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [newFriendName, setNewFriendName] = useState('');
  const [addingFriendToGroup, setAddingFriendToGroup] = useState(null);

  // Group creation states
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  // New state for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteGroups, setSelectedDeleteGroups] = useState([]);
  
  // Splitting architecture: 'equal' or 'manual'
  const [splitArchitecture, setSplitArchitecture] = useState('equal');
  const [manualShares, setManualShares] = useState({});

  // Synchronize manual shares with amount or friends updates
  useEffect(() => {
    if (splitArchitecture === 'manual' && amount) {
      const numParticipants = friends.length + 1; // friends + You
      const equalShare = (parseFloat(amount) / numParticipants).toFixed(2);
      const initial = {};
      initial['You'] = equalShare;
      friends.forEach(f => {
        initial[f] = equalShare;
      });
      setManualShares(initial);
    }
  }, [amount, friends, splitArchitecture]);

  const handleShareChange = (name, value) => {
    setManualShares(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manualSharesSum = useMemo(() => {
    if (splitArchitecture !== 'manual') return 0;
    return Object.values(manualShares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [manualShares, splitArchitecture]);

  const manualSplitError = useMemo(() => {
    if (splitArchitecture !== 'manual' || !amount) return null;
    const totalSum = manualSharesSum;
    const billAmt = parseFloat(amount) || 0;
    const diff = totalSum - billAmt;
    if (Math.abs(diff) < 0.02) return null; // allow micro rounding diffs
    
    if (diff < 0) {
      return `The specified shares sum to ₹${totalSum.toFixed(2)}, which is ₹${Math.abs(diff).toFixed(2)} LESS than the total bill of ₹${billAmt.toFixed(2)}.`;
    } else {
      return `The specified shares sum to ₹${totalSum.toFixed(2)}, which is ₹${diff.toFixed(2)} MORE than the total bill of ₹${billAmt.toFixed(2)}.`;
    }
  }, [splitArchitecture, amount, manualSharesSum]);

  // Interactive Live Breakdown paid state tracking
  const [livePaidStatus, setLivePaidStatus] = useState(() => {
    const saved = localStorage.getItem('wallet_splitwise_live_paid_status');
    return saved ? JSON.parse(saved) : {};
  });



  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('wallet_splitwise_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('wallet_splitwise_active_group_id', activeGroupId);
  }, [activeGroupId]);

  useEffect(() => {
    localStorage.setItem('wallet_splitwise_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('wallet_splitwise_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('wallet_splitwise_live_paid_status', JSON.stringify(livePaidStatus));
  }, [livePaidStatus]);

  // Filter bills scoped to active group
  const activeGroupBills = useMemo(() => {
    return bills.filter(b => b.groupId === activeGroupId || (!b.groupId && activeGroupId === 'g1'));
  }, [bills, activeGroupId]);

  // Add a new friend to any group
  const handleAddFriend = (groupId, nameVal) => {
    const cleanName = nameVal.trim();
    if (cleanName && cleanName !== 'You') {
      setGroups(prev => prev.map(g => {
        if (g.id === groupId) {
          if (g.friends.includes(cleanName)) return g;
          return { ...g, friends: [...g.friends, cleanName] };
        }
        return g;
      }));
      setNewFriendName('');
      setAddingFriendToGroup(null);
    }
  };

  // Remove a friend from the active group
  const handleRemoveFriend = (name) => {
    if (window.confirm(`Are you sure you want to remove ${name}? All active splits involving them will remain but they cannot participate in new splits.`)) {
      setGroups(prev => prev.map(g => {
        if (g.id === activeGroupId) {
          return { ...g, friends: g.friends.filter(f => f !== name) };
        }
        return g;
      }));
    }
  };

  // Create a new friends group circle matching visual design
  const handleAddGroup = (e) => {
    e.preventDefault();
    const cleanName = newGroupName.trim();
    if (cleanName && !groups.some(g => g.name.toLowerCase() === cleanName.toLowerCase())) {
      const icons = ['plane', 'home', 'utensils'];
      const randomIcon = icons[groups.length % icons.length];
      const newGroup = {
        id: 'g_' + Date.now(),
        name: cleanName,
        friends: [],
        icon: randomIcon
      };
      setGroups(prev => [...prev, newGroup]);
      setActiveGroupId(newGroup.id);
      setNewGroupName('');
      setIsAddingGroup(false);
    }
  };

  // Delete a friends group
  const handleDeleteGroup = (id) => {
    if (groups.length <= 1) {
      alert("You must have at least one friends group circle!");
      return;
    }
    const groupToDelete = groups.find(g => g.id === id);
    if (window.confirm(`Are you sure you want to delete the group "${groupToDelete?.name}"? All bills associated with this group will also be deleted.`)) {
      const updatedGroups = groups.filter(g => g.id !== id);
      setGroups(updatedGroups);
      
      // Filter out bills associated with this group
      setBills(prev => prev.filter(b => b.groupId !== id && (id !== 'g1' || b.groupId)));
      
      // Switch active group to the first remaining group
      setActiveGroupId(updatedGroups[0].id);
    }
  };

  const handleToggleSelectDeleteGroup = (id) => {
    setSelectedDeleteGroups(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleConfirmDeleteGroups = () => {
    if (selectedDeleteGroups.length === 0) return;
    
    if (selectedDeleteGroups.length === groups.length) {
      alert("You must have at least one friends group circle!");
      return;
    }

    const groupNames = groups
      .filter(g => selectedDeleteGroups.includes(g.id))
      .map(g => g.name)
      .join(', ');

    if (window.confirm(`Are you sure you want to delete the following groups: ${groupNames}? All associated bills will also be deleted.`)) {
      const remainingGroups = groups.filter(g => !selectedDeleteGroups.includes(g.id));
      setGroups(remainingGroups);
      
      // Filter out bills associated with these groups
      setBills(prev => prev.filter(b => !selectedDeleteGroups.includes(b.groupId)));
      
      // If the current active group was deleted, switch to the first remaining group
      if (selectedDeleteGroups.includes(activeGroupId)) {
        setActiveGroupId(remainingGroups[0].id);
      }
      
      setSelectedDeleteGroups([]);
      setShowDeleteModal(false);
    }
  };

  // Add group bill
  const handleAddBill = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
    
    const participantsList = ['You', ...friends];
    if (participantsList.length < 2) {
      alert('A split requires at least 1 friend in the group!');
      return;
    }

    const billDesc = description.trim() || 'Group Expense';
    
    // Parse manual shares if manually split is active
    let shares = null;
    if (splitArchitecture === 'manual') {
      shares = {};
      participantsList.forEach(p => {
        shares[p] = parseFloat(manualShares[p]) || 0;
      });
    }

    const newBill = {
      id: Date.now(),
      groupId: activeGroupId,
      description: billDesc,
      amount: parseFloat(amount),
      paidBy: 'You',
      participants: participantsList,
      shares: shares,
      date: date || new Date().toISOString().split('T')[0],
      settled: false
    };

    setBills(prev => [newBill, ...prev]);
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Delete bill
  const handleDeleteBill = (id) => {
    if (window.confirm('Are you sure you want to delete this split record?')) {
      setBills(prev => prev.filter(b => b.id !== id));
    }
  };

  // Settle single participant's share status
  const handleToggleFriendPaid = (friendName) => {
    playSuccessSound();
    setLivePaidStatus(prev => {
      const key = `${activeGroupId}_${friendName}`;
      return {
        ...prev,
        [key]: !prev[key]
      };
    });
  };

  // Settle all mutual balances between You and a specific friend in the active group
  const handleSettleUp = (friendName) => {
    if (window.confirm(`Mark all mutual splits with ${friendName} in "${activeGroup.name}" as Settled?`)) {
      const updated = bills.map(b => {
        const isGroupBill = b.groupId === activeGroupId || (!b.groupId && activeGroupId === 'g1');
        const involvesBoth = b.participants.includes('You') && b.participants.includes(friendName);
        if (isGroupBill && involvesBoth) {
          return { ...b, settled: true };
        }
        return b;
      });
      setBills(updated);

      // Force paid status to true
      setLivePaidStatus(prev => ({
        ...prev,
        [`${activeGroupId}_${friendName}`]: true
      }));

      // Clear reminders
      if (reminders[friendName]) {
        const updatedReminders = { ...reminders };
        delete updatedReminders[friendName];
        setReminders(updatedReminders);
      }
    }
  };

  // Debts and balances calculations scoped to the active group
  const netBalances = useMemo(() => {
    const balances = {};
    friends.forEach(f => { balances[f] = 0; });

    activeGroupBills.forEach(bill => {
      if (bill.settled) return;

      if (bill.paidBy === 'You') {
        bill.participants.forEach(p => {
          if (p !== 'You' && balances[p] !== undefined) {
            const share = bill.shares ? (parseFloat(bill.shares[p]) || 0) : (bill.amount / bill.participants.length);
            balances[p] += share;
          }
        });
      } else {
        if (bill.participants.includes('You') && balances[bill.paidBy] !== undefined) {
          const share = bill.shares ? (parseFloat(bill.shares['You']) || 0) : (bill.amount / bill.participants.length);
          balances[bill.paidBy] -= share;
        }
      }
    });

    return balances;
  }, [friends, activeGroupBills, activeGroupId]);

  // Receivables & Payables breakdown
  const receivables = useMemo(() => {
    return Object.entries(netBalances)
      .filter(([_, bal]) => bal > 0)
      .map(([name, bal]) => ({ name, balance: bal }));
  }, [netBalances]);

  const payables = useMemo(() => {
    return Object.entries(netBalances)
      .filter(([_, bal]) => bal < 0)
      .map(([name, bal]) => ({ name, balance: Math.abs(bal) }));
  }, [netBalances]);

  const totalYouAreOwed = useMemo(() => {
    return receivables.reduce((sum, item) => sum + item.balance, 0);
  }, [receivables]);

  const totalYouOwe = useMemo(() => {
    return payables.reduce((sum, item) => sum + item.balance, 0);
  }, [payables]);

  const netOverallBalance = totalYouAreOwed - totalYouOwe;

  // Derive dynamic group balance for active list items
  const getGroupBalance = (grpId) => {
    const grpBills = bills.filter(b => b.groupId === grpId || (!b.groupId && grpId === 'g1'));
    const grpFriends = groups.find(g => g.id === grpId)?.friends || [];
    
    let balance = 0;
    grpBills.forEach(b => {
      if (b.settled) return;
      if (b.paidBy === 'You') {
        b.participants.forEach(p => {
          if (p !== 'You' && grpFriends.includes(p)) {
            const share = b.shares ? (parseFloat(b.shares[p]) || 0) : (b.amount / b.participants.length);
            balance += share;
          }
        });
      } else {
        if (b.participants.includes('You')) {
          const share = b.shares ? (parseFloat(b.shares['You']) || 0) : (b.amount / b.participants.length);
          balance -= share;
        }
      }
    });
    return balance;
  };

  // Group list icon mapper
  const renderGroupIcon = (iconName) => {
    if (iconName === 'plane') return <Plane size={16} />;
    if (iconName === 'home') return <Home size={16} />;
    if (iconName === 'utensils') return <Utensils size={16} />;
    return <Briefcase size={16} />;
  };

  // Live Breakdown parameters matching live breakdown cards
  const liveBreakdown = useMemo(() => {
    if (friends.length === 0) return { members: [], total: 0, paidCount: 0, progress: 100 };
    
    const lastActiveBill = activeGroupBills.find(b => !b.settled);
    
    let totalValue = 0;
    let paidCount = 0;

    const members = friends.map(f => {
      let share = 0;
      if (lastActiveBill) {
        if (lastActiveBill.participants.includes(f)) {
          share = lastActiveBill.shares ? (parseFloat(lastActiveBill.shares[f]) || 0) : (lastActiveBill.amount / lastActiveBill.participants.length);
        }
      } else {
        share = totalYouAreOwed / friends.length || 0;
      }
      const paidKey = `${activeGroupId}_${f}`;
      const isPaid = livePaidStatus[paidKey] === true || (netBalances[f] !== undefined && netBalances[f] <= 0);

      totalValue += share;
      if (isPaid) paidCount++;

      return {
        name: f,
        share,
        isPaid
      };
    });

    const progress = totalValue > 0 ? (paidCount / friends.length) * 100 : 100;
    const remaining = totalValue * (1 - (paidCount / friends.length));

    return {
      members,
      total: remaining,
      paidCount,
      progress
    };
  }, [friends, activeGroupBills, totalYouAreOwed, livePaidStatus, activeGroupId]);

  return (
    <div 
      className="min-h-screen font-sans" 
      style={{ background: 'var(--bg)', color: 'var(--text-main)', margin: 0, padding: 0 }}
    >
      {/* 0. INJECT DIRECT CSS OVERRIDES FOR GLOBAL BUTTONS */}
      <style>{`
        .noir-btn-white {
          background: var(--text-main) !important;
          color: var(--bg) !important;
          border: none !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .noir-btn-white:hover {
          opacity: 0.9;
          transform: none !important;
        }
        .noir-btn-grey {
          background: var(--pill-bg) !important;
          border: 1px solid var(--border) !important;
          color: #ff3b30 !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .noir-btn-grey:hover {
          background: var(--pill-hover-bg) !important;
          transform: none !important;
        }
        .noir-split-pill {
          background: var(--pill-bg) !important;
          border: 1px solid var(--border) !important;
          color: var(--text-muted) !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .noir-split-pill.active {
          background: rgba(0, 113, 227, 0.1) !important;
          color: var(--primary) !important;
          border-color: var(--primary) !important;
          transform: none !important;
        }
        .noir-paid-btn {
          background: rgba(40, 205, 65, 0.08) !important;
          border: 1px solid rgba(40, 205, 65, 0.15) !important;
          color: var(--success) !important;
          box-shadow: none !important;
          transform: none !important;
          font-weight: 800 !important;
        }
        .noir-unpaid-btn {
          background: transparent !important;
          border: 1px solid var(--border) !important;
          color: var(--text-muted) !important;
          box-shadow: none !important;
          transform: none !important;
          font-weight: 800 !important;
        }
        .noir-unpaid-btn:hover {
          color: var(--text-main) !important;
          border-color: var(--text-main) !important;
        }
        .noir-btn-add-friend {
          background: transparent !important;
          border: 1px dashed var(--border) !important;
          color: var(--text-muted) !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .noir-btn-add-friend:hover {
          color: var(--text-main) !important;
          border-color: var(--text-main) !important;
          transform: none !important;
        }
      `}</style>

      <main className="splitwise-main">
        
        {/* Top Back Link & Header Row aligned flush above Net Balance */}
        <div className="mb-9">
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'transparent', border: 'none', color: '#888888', padding: 0, 
              fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', 
              cursor: 'pointer', marginBottom: '12px', fontWeight: 'bold', transform: 'none'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#888888'; }}
          >
            <ChevronLeft size={12} /> Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold m-0 tracking-tight" style={{ letterSpacing: '-0.035em', color: 'var(--text-main)' }}>
              Splitwise
            </h1>
            
            {/* Top Actions Icons */}
            <div className="flex items-center gap-4">
              <Search size={18} className="text-slate-400 cursor-pointer hover:text-slate-100" />
              <Bell size={18} className="text-slate-400 cursor-pointer hover:text-slate-100" />
              <button 
                onClick={toggleTheme} 
                style={{ 
                  background: 'var(--pill-bg)', color: 'var(--text-main)', padding: '9px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)', cursor: 'pointer', transform: 'none'
                }}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Alerts Banner */}
        <AnimatePresence>
          {activeGroupBills.length > 0 && totalYouOwe > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 rounded-2xl flex justify-between items-center"
              style={{ background: 'rgba(255, 149, 0, 0.06)', border: '1px solid rgba(255, 149, 0, 0.15)' }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={16} className="text-warning" style={{ color: 'var(--warning)' }} />
                <span className="text-xs font-semibold text-slate-300">
                  You scheduled payback reminders in this circle. A total of <strong>{formatCurrency(totalYouOwe)}</strong> remains outstanding.
                </span>
              </div>
              <button 
                onClick={() => handleSettleUp(friends[0])}
                className="text-[10px] font-extrabold px-3 py-1.5 rounded-lg bg-warning text-black cursor-pointer border-none"
                style={{ background: 'var(--warning)', transform: 'none' }}
              >
                Settle up now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Three Large Metrics Cards matching reference mockup */}
        <section 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '20px', 
            marginBottom: '40px' 
          }}
        >
          
          {/* Card 1: Net Balance */}
          <div className="apple-card balance-section-card">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
              Net Balance
            </span>
            <h2 className="text-3xl font-extrabold m-0 flex items-center" style={{ letterSpacing: '-0.035em', color: 'var(--text-main)' }}>
              {netOverallBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netOverallBalance))}
            </h2>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#0072ff] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0072ff]"></span>
              Overall positive standing
            </div>
          </div>

          {/* Card 2: You Are Owed with Blue/Cyan Gradient */}
          <div className="apple-card analysis-section-card">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
              You Are Owed
            </span>
            <h2 
              className="text-3xl font-extrabold m-0" 
              style={{ 
                letterSpacing: '-0.035em',
                background: 'linear-gradient(135deg, #00d2ff 0%, #0072ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {formatCurrency(totalYouAreOwed)}
            </h2>
            <div className="mt-3 flex items-center gap-2">
              {receivables.length > 0 ? (
                <>
                  <div className="flex -space-x-1.5">
                    {receivables.slice(0, 3).map(r => (
                      <span 
                        key={r.name}
                        title={`${r.name} owes you`}
                        className="w-4 h-4 rounded-full border border-black text-[7px] flex items-center justify-center font-bold"
                        style={{ background: 'var(--pill-bg)', color: 'var(--text-main)' }}
                      >
                        {r.name[0]}
                      </span>
                    ))}
                    {receivables.length > 3 && (
                      <span className="w-4 h-4 rounded-full bg-slate-800 border border-black text-[7px] flex items-center justify-center font-bold text-white">
                        +{receivables.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    from {receivables.length} member{receivables.length > 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-slate-500 font-semibold">
                  from 0 members
                </span>
              )}
            </div>
          </div>

          {/* Card 3: You Owe in Peach/Pink Color - Clickable to open custom reminders panel */}
          <div 
            className="apple-card outgoings-section-card cursor-pointer hover:scale-[1.02] transition-all duration-200"
            onClick={() => setShowYouOweDrawer(true)}
            title="Click to manage custom Owe reminders"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  You Owe
                </span>
                <h2 className="text-3xl font-extrabold m-0 text-[#ff9b9b]" style={{ letterSpacing: '-0.035em' }}>
                  {formatCurrency(totalYouOwe + youOweReminders.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0))}
                </h2>
              </div>
              {youOweReminders.length > 0 && (
                <span className="text-[8px] font-extrabold bg-rose-950/60 text-[#ff9b9b] border border-rose-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {youOweReminders.length} Active
                </span>
              )}
            </div>
            <div className="mt-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {payables.length} standard settles & {youOweReminders.length} custom reminders
            </div>
          </div>
        </section>

        {/* 4. Groups Title Row */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h2 className="text-xl font-extrabold m-0" style={{ color: 'var(--text-main)' }}>Groups</h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Manage shared expenses within circles</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="noir-btn-grey text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} /> Delete
              </button>
              <button 
                onClick={() => setIsAddingGroup(!isAddingGroup)}
                className="noir-btn-white text-xs font-bold px-4 py-2.5 rounded-xl text-black cursor-pointer flex items-center gap-1.5"
                style={{ fontWeight: '800' }}
              >
                <Plus size={13} /> Create Group
              </button>
            </div>
          </div>

          {/* Add Group Drawer Form */}
          <AnimatePresence>
            {isAddingGroup && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                onSubmit={handleAddGroup}
                className="flex gap-2 overflow-hidden mt-4 p-4 rounded-xl border"
                style={{ background: 'var(--list-item-bg)', borderColor: 'var(--border)' }}
              >
                <input
                  type="text"
                  placeholder="Group Name (e.g. Skyline Loft, Office Lunch)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{ padding: '10px 14px', fontSize: '13px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '10px', width: '100%' }}
                  autoFocus
                  required
                />
                <button type="submit" className="noir-btn-white px-4 font-extrabold rounded-lg cursor-pointer">
                  Create
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </section>

        {/* 5. Groups Grid Column Row matching mockup layout exactly */}
        <section 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px', 
            marginBottom: '40px' 
          }}
        >
          {groups.length === 0 ? (
            <div className="col-span-full apple-card flex flex-col items-center justify-center text-center py-10" style={{ background: 'var(--list-item-bg)', borderColor: 'var(--border)', minHeight: '180px' }}>
              <Users size={32} className="text-slate-500 mb-3 opacity-60" />
              <h3 className="text-sm font-bold m-0 mb-1" style={{ color: 'var(--text-main)' }}>No Groups Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs m-0">Create your first friends group circle above to start splitting expenses offline.</p>
            </div>
          ) : (
            groups.map(group => {
              const isSelected = activeGroupId === group.id;
              const balanceVal = getGroupBalance(group.id);
              const isOwed = balanceVal >= 0;

              return (
              <div 
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className="apple-card explorer-section-card cursor-pointer group flex flex-col justify-between"
                style={{ 
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 113, 227, 0.15)' : 'none'
                }}
              >
                <div>
                  {/* Top Row: Circular Icon & Members Tag */}
                  <div className="flex justify-between items-center mb-5">
                    <span 
                      style={{ 
                        width: '32px', height: '32px', borderRadius: '10px', 
                        background: 'var(--pill-bg)', border: '1px solid var(--border)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isSelected ? '#a350f0' : 'var(--text-muted)'
                      }}
                    >
                      {renderGroupIcon(group.icon)}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', background: 'var(--pill-bg)',
                      color: 'var(--text-muted)', fontSize: '8px', fontWeight: '800', textTransform: 'uppercase'
                    }}>
                      {group.friends.length} MEMBERS
                    </span>
                  </div>

                  {/* Title & Chevron */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-main)' }}><span className="premium-group-name">{group.name}</span></h3>
                    <ChevronRight size={14} className="text-slate-600" />
                  </div>
                </div>

                {/* Subtext: YOUR BALANCE */}
                <div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Your Balance
                  </span>
                  <div className="text-base font-extrabold" style={{ color: balanceVal === 0 ? 'var(--text-main)' : isOwed ? 'var(--success)' : 'var(--danger)' }}>
                    {balanceVal === 0 ? '₹0' : (isOwed ? '+' : '-') + formatCurrency(Math.abs(balanceVal))}
                  </div>
                </div>

                {/* Active Group Expanded Friends List underneath */}
                {isSelected && (
                  <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-col gap-3.5 mb-4">
                      {group.friends.map(name => (
                        <div key={name} className="flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <span style={{
                              width: '22px', height: '22px', borderRadius: '50%', background: 'var(--pill-bg)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold', color: 'var(--text-muted)'
                            }}>
                              {name[0]}
                            </span>
                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{name}</span>
                          </div>
                          
                          {/* Remove Friend Action */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveFriend(name); }}
                            className="p-1 hover:bg-[#1a1a1a] rounded text-slate-500 hover:text-red-400 cursor-pointer border-none bg-transparent"
                            style={{ transform: 'none', background: 'transparent' }}
                          >
                            <UserMinus size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Dashed Add Friend Button inside Group Card */}
                    {addingFriendToGroup === group.id ? (
                      <form 
                        onSubmit={(e) => { e.preventDefault(); handleAddFriend(group.id, newFriendName); }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex gap-1.5 mt-2"
                      >
                        <input
                          type="text"
                          placeholder="Friend's Name"
                          value={newFriendName}
                          onChange={(e) => setNewFriendName(e.target.value)}
                          style={{ padding: '6px 10px', fontSize: '11px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '8px', width: '100%' }}
                          autoFocus
                          required
                        />
                        <button type="submit" className="noir-btn-white px-2 h-auto text-xs font-extrabold rounded-lg cursor-pointer">
                          Add
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddingFriendToGroup(group.id); }}
                        className="noir-btn-add-friend w-full text-center text-[10px] font-bold py-2 border border-dashed rounded-xl cursor-pointer transition-colors"
                      >
                        + Add Friend
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
          )}
        </section>

        {/* 6. Form & Live Breakdown split-screen side-by-side Row */}
        <section 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '28px', 
            marginBottom: '40px' 
          }}
        >
          
          {/* Add Group Expense Form (Left Column) */}
          <div className="apple-card transaction-section-card">
            <div className="flex items-center gap-3.5 mb-6">
              <span 
                style={{ 
                  width: '38px', height: '38px', borderRadius: '12px', 
                  background: 'rgba(163, 80, 240, 0.08)', border: '1px solid rgba(163, 80, 240, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a350f0'
                }}
              >
                <Lock size={16} />
              </span>
              <div>
                <h3 className="text-base font-extrabold m-0" style={{ color: 'var(--text-main)' }}>Add Group Expense</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Instant reconciliation for elite circles</p>
              </div>
            </div>

            <form onSubmit={handleAddBill} className="flex flex-col gap-5">
              
              {/* Row 1: Amount & Date side-by-side */}
              <div className="flex gap-4">
                <div className="flex-grow flex flex-col gap-1.5" style={{ flexBasis: '50%' }}>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span className="absolute left-4 top-[17px] text-slate-500 text-sm font-bold">₹</span>
                    <input 
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ 
                        padding: '16px 16px 16px 28px', fontSize: '15px', fontWeight: 'bold',
                        background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '12px',
                        width: '100%', boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="flex-grow flex flex-col gap-1.5" style={{ flexBasis: '50%' }}>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ 
                      padding: '16px', fontSize: '14px',
                      background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '12px',
                      width: '100%', boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Expense Description</label>
                <input 
                  type="text"
                  placeholder="e.g. Tokyo Bullet Train Pass"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ 
                    padding: '16px', fontSize: '14px',
                    background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '12px',
                    width: '100%', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Target Group Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Group</label>
                <select
                  value={activeGroupId}
                  onChange={(e) => setActiveGroupId(e.target.value)}
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    padding: '16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              {/* Splitting Architecture Pills */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Splitting Architecture</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitArchitecture('equal')}
                    className={`noir-split-pill flex-grow text-xs font-bold py-3.5 rounded-xl border cursor-pointer transition-all ${splitArchitecture === 'equal' ? 'active' : ''}`}
                    style={{ flexBasis: '50%' }}
                  >
                    Split Equally
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitArchitecture('manual')}
                    className={`noir-split-pill flex-grow text-xs font-bold py-3.5 rounded-xl border cursor-pointer transition-all ${splitArchitecture === 'manual' ? 'active' : ''}`}
                    style={{ flexBasis: '50%' }}
                  >
                    Manually Split
                  </button>
                </div>
              </div>

              {/* Manual Split Inputs Section */}
              {splitArchitecture === 'manual' && (
                <div className="flex flex-col gap-3 mt-4 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-200" style={{ background: 'var(--list-item-bg)', borderColor: 'var(--border)' }}>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Specify Individual Shares (Total Bill: {formatCurrency(parseFloat(amount) || 0)})</span>
                  <div className="flex flex-col gap-2">
                    {['You', ...friends].map(name => (
                      <div key={name} className="flex justify-between items-center gap-3">
                        <span className="text-xs font-bold text-slate-300">{name}</span>
                        <div style={{ position: 'relative', width: '130px' }}>
                          <span className="absolute left-3 top-[10px] text-slate-500 text-[10px] font-bold">₹</span>
                          <input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={manualShares[name] || ''}
                            onChange={(e) => handleShareChange(name, e.target.value)}
                            style={{
                              padding: '8px 8px 8px 20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-main)',
                              borderRadius: '8px',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Warning if the manual shares sum doesn't equal amount */}
                  {amount && (
                    manualSplitError ? (
                      <div className="text-[10px] text-rose-400 font-bold flex flex-col gap-1 mt-2 p-3 rounded-lg border border-rose-950/50" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <AlertCircle size={12} />
                          <span>Splitting Error</span>
                        </div>
                        <span className="text-[9px] font-semibold text-rose-300/90 leading-relaxed mt-0.5">
                          {manualSplitError} Please adjust the shares to finalize this bill.
                        </span>
                      </div>
                    ) : (
                      <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1.5 mt-2">
                        <Check size={11} /> Sum matches total amount perfectly!
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Finalize Button */}
              <button 
                type="submit" 
                disabled={splitArchitecture === 'manual' && manualSplitError !== null}
                className={`noir-btn-white mt-2 text-sm font-extrabold py-4 rounded-xl w-full text-center transition-all ${
                  (splitArchitecture === 'manual' && manualSplitError !== null) 
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' 
                    : 'text-black cursor-pointer'
                }`}
                style={{ 
                  fontWeight: '800',
                  background: (splitArchitecture === 'manual' && manualSplitError !== null) ? '#222222' : '#ffffff',
                  color: (splitArchitecture === 'manual' && manualSplitError !== null) ? '#555555' : '#000000',
                  border: 'none'
                }}
              >
                Finalize Expense
              </button>
            </form>
          </div>

          {/* Live Breakdown Card (Right Column) */}
          <div className="apple-card analysis-section-card flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Live Breakdown
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 113, 227, 0.08)',
                  color: 'var(--primary)', fontSize: '8px', fontWeight: '800', textTransform: 'uppercase'
                }}>
                  {friends.filter(f => !livePaidStatus[`${activeGroupId}_${f}`]).length} PENDING
                </span>
              </div>

              {/* Members paid list */}
              {friends.length === 0 ? (
                <div className="text-xs text-slate-500 py-10 text-center">
                  Add friends to calculate splitting breakdowns.
                </div>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  {/* You Row */}
                  <div className="flex justify-between items-center p-3 rounded-xl border border-dashed" style={{ background: 'var(--list-item-bg)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2.5">
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '50%', background: 'var(--pill-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-main)'
                      }}>
                        YO
                      </span>
                      <div>
                        <span className="text-xs font-bold block" style={{ color: 'var(--text-main)' }}>You</span>
                        <span className="text-[9px] text-slate-500 font-bold">Payer / Paid Share</span>
                      </div>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      marginRight: '6px'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Friends Rows with click action */}
                  {liveBreakdown.members.map(member => (
                    <div 
                      key={member.name} 
                      className="flex justify-between items-center p-3 rounded-xl border transition-all"
                      style={{ 
                        background: 'var(--list-item-bg)', 
                        borderColor: member.isPaid ? 'var(--border)' : 'rgba(255, 69, 58, 0.2)'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span style={{
                          width: '26px', height: '26px', borderRadius: '50%', background: 'var(--pill-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)'
                        }}>
                          {member.name[0]}
                        </span>
                        <div>
                          <span className="text-xs font-bold block" style={{ color: 'var(--text-main)' }}>{member.name}</span>
                          <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                            {formatCurrency(member.share)} share
                          </span>
                        </div>
                      </div>
                      
                      {/* Active PAID/UNPAID toggle - Displays a beautiful green checkmark tick once paid */}
                      {member.isPaid ? (
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          marginRight: '4px'
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            handleToggleFriendPaid(member.name);
                          }}
                          className="noir-unpaid-btn cursor-pointer px-3 py-1.5 border text-[9px] font-extrabold uppercase rounded-lg transition-all"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          UNPAID
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live progress section */}
            <div className="pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-end mb-2.5">
                <div>
                  <h2 className="text-2xl font-extrabold m-0" style={{ color: 'var(--text-main)' }}>
                    {formatCurrency(liveBreakdown.total)}
                  </h2>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                    PROGRESS remaining
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  {Math.round(liveBreakdown.progress)}% Settled
                </span>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${liveBreakdown.progress}%` }}
                ></div>
              </div>
            </div>

          </div>

        </section>

        {/* 7. Split Ledger History */}
        <section className="apple-card explorer-section-card mt-10">
          <h3 className="m-0 text-base font-extrabold mb-5" style={{ color: 'var(--text-main)' }}>Split Ledger History ({activeGroup.name})</h3>
          
          {activeGroupBills.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <span className="text-xs font-bold block">No split bills logged yet in this group</span>
              <p className="text-[11px] max-w-[240px] mx-auto m-0 mt-1">Submit group expenses above to generate ledger statements.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[360px] overflow-y-auto pr-1">
              {activeGroupBills.map(bill => (
                <div 
                  key={bill.id}
                  className="p-4 rounded-2xl border flex flex-col gap-2 transition-all"
                  style={{ 
                    background: 'var(--list-item-bg)', 
                    borderColor: 'var(--border)',
                    opacity: bill.settled ? 0.6 : 1,
                    borderLeft: '4px solid ' + (bill.settled ? 'var(--border)' : bill.paidBy === 'You' ? 'var(--success)' : 'var(--danger)'),
                    position: 'relative'
                  }}
                >
                  <div className="flex justify-between items-start pr-8">
                    <div style={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                      <span className="text-sm font-extrabold block" style={{ color: 'var(--text-main)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{bill.description}</span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                        Paid by {bill.paidBy} • {bill.shares ? 'Manually Split' : `Split Equally among ${bill.participants.join(', ')}`}
                      </span>
                      {bill.shares && (
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {Object.entries(bill.shares).map(([name, val]) => (
                            <span key={name} style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--pill-bg)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-muted)',
                              fontSize: '8px',
                              fontWeight: 'bold'
                            }}>
                              {name}: {formatCurrency(val)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold block" style={{ color: 'var(--text-main)' }}>
                        {formatCurrency(bill.amount)}
                      </span>
                      {bill.settled ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-0.5 justify-end mt-1">
                          <Check size={10} /> Settled
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#a350f0] block mt-1">
                          Active Split
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Absolute Ledger deletion button with propagation guards */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteBill(bill.id);
                    }}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '18px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '6px',
                      zIndex: 50,
                      pointerEvents: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease',
                      transform: 'none'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Group Deletion Premium Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ 
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border p-6 flex flex-col gap-5 overflow-hidden"
              style={{ 
                background: 'var(--card-bg)',
                borderColor: 'var(--border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Trash2 size={18} className="text-[#ff3b30]" />
                  <h3 className="text-base font-extrabold m-0" style={{ color: 'var(--text-main)' }}>Delete Groups</h3>
                </div>
                <button 
                  onClick={() => {
                    setSelectedDeleteGroups([]);
                    setShowDeleteModal(false);
                  }}
                  className="p-1 rounded-full hover:bg-[#1a1a1a] text-slate-400 hover:text-slate-100 cursor-pointer border-none bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-400 m-0">
                Select one or more groups to delete. This action will permanently remove all associated split bills and data.
              </p>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {groups.map(group => {
                  const isChecked = selectedDeleteGroups.includes(group.id);
                  return (
                    <div 
                      key={group.id}
                      onClick={() => handleToggleSelectDeleteGroup(group.id)}
                      className="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer"
                      style={{ 
                        background: isChecked ? 'rgba(255, 59, 48, 0.08)' : 'var(--list-item-bg)',
                        borderColor: isChecked ? 'var(--danger)' : 'var(--border)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ 
                          width: '26px', height: '26px', borderRadius: '8px', 
                          background: 'var(--pill-bg)', border: '1px solid var(--border)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)'
                        }}>
                          {renderGroupIcon(group.icon)}
                        </span>
                        <div>
                          <span className="text-xs font-bold block" style={{ color: 'var(--text-main)' }}>{group.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{group.friends.length} friends</span>
                        </div>
                      </div>

                      <div 
                        className="w-5 h-5 rounded-md border flex items-center justify-center transition-all"
                        style={{ 
                          background: isChecked ? '#ff3b30' : 'transparent',
                          borderColor: isChecked ? '#ff3b30' : '#333333'
                        }}
                      >
                        {isChecked && <Check size={12} className="text-white font-extrabold" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeleteGroups([]);
                    setShowDeleteModal(false);
                  }}
                  className="flex-grow text-xs font-bold py-3 rounded-xl border border-[#333333] hover:bg-[#111111] text-slate-300 cursor-pointer text-center bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteGroups}
                  disabled={selectedDeleteGroups.length === 0}
                  className="flex-grow text-xs font-extrabold py-3 rounded-xl cursor-pointer text-center"
                  style={{ 
                    background: selectedDeleteGroups.length > 0 ? '#ff3b30' : '#222222',
                    color: selectedDeleteGroups.length > 0 ? '#ffffff' : '#666666',
                    border: 'none',
                    cursor: selectedDeleteGroups.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  {selectedDeleteGroups.length > 1 
                    ? `Delete ${selectedDeleteGroups.length} Groups` 
                    : selectedDeleteGroups.length === 1 
                      ? 'Delete Group' 
                      : 'Delete Selected'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Owe Reminders Drawer Overlay */}
      {showYouOweDrawer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-end animate-in fade-in duration-300"
          style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowYouOweDrawer(false)}
        >
          <div 
            className="w-full max-w-md h-full flex flex-col justify-between border-l animate-in slide-in-from-right duration-300"
            style={{ 
              background: 'var(--card-bg)',
              borderColor: 'var(--border)',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-lg font-extrabold m-0" style={{ color: 'var(--text-main)' }}>You Owe Reminders</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                  Manage custom schedules and payment dates
                </span>
              </div>
              <button 
                onClick={() => setShowYouOweDrawer(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border text-slate-400 hover:text-white transition-colors"
                style={{ background: 'var(--pill-bg)', borderColor: 'var(--border)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Add New Reminder Form */}
              <div className="p-5 rounded-2xl border flex flex-col gap-4" style={{ background: 'rgba(255, 59, 48, 0.03)', borderColor: 'rgba(255, 59, 48, 0.15)' }}>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                  Create Owe Reminder
                </span>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!youOweName.trim() || !youOweAmount || !youOweDueDate) return;
                    
                    const newRem = {
                      id: 'yor_' + Date.now(),
                      name: youOweName.trim(),
                      amount: parseFloat(youOweAmount),
                      dueDate: youOweDueDate,
                      createdDate: new Date().toISOString().split('T')[0]
                    };
                    
                    setYouOweReminders(prev => [newRem, ...prev]);
                    setYouOweName('');
                    setYouOweAmount('');
                    setYouOweDueDate('');
                    playSuccessSound();
                  }}
                  className="flex flex-col gap-3"
                >
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Name of Person</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Elena (Landlord) or Rahul" 
                      value={youOweName}
                      onChange={(e) => setYouOweName(e.target.value)}
                      style={{ 
                        padding: '12px 14px', fontSize: '13px',
                        background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '10px',
                        width: '100%', boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  {/* Amount and Due Date Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Amount Owed</label>
                      <div style={{ position: 'relative' }}>
                        <span className="absolute left-3 top-[10px] text-slate-500 text-[10px] font-bold">₹</span>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          value={youOweAmount}
                          onChange={(e) => setYouOweAmount(e.target.value)}
                          style={{ 
                            padding: '10px 10px 10px 22px', fontSize: '13px',
                            background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '10px',
                            width: '100%', boxSizing: 'border-box', fontWeight: 'bold'
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Due Date</label>
                      <input 
                        type="date" 
                        value={youOweDueDate}
                        onChange={(e) => setYouOweDueDate(e.target.value)}
                        style={{ 
                          padding: '10px', fontSize: '13px',
                          background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '10px',
                          width: '100%', boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="noir-btn-white mt-2 py-3 rounded-xl text-xs font-bold text-black cursor-pointer text-center w-full"
                  >
                    Save & Set Reminder
                  </button>
                </form>
              </div>

              {/* Active Reminders List */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Active Reminders ({youOweReminders.length})
                </span>

                {youOweReminders.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-[#1f1f1f] text-center">
                    <span className="text-xs text-slate-500 block">No custom owe reminders active.</span>
                    <span className="text-[10px] text-slate-600 block mt-1">Use the form above to add a due date payment task.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {youOweReminders.map(rem => {
                      const isOverdue = new Date(rem.dueDate) < new Date(new Date().toISOString().split('T')[0]);
                      return (
                        <div 
                          key={rem.id}
                          className="p-4 rounded-xl border flex justify-between items-center transition-all"
                          style={{ 
                            background: 'var(--list-item-bg)',
                            borderColor: isOverdue ? 'rgba(255, 59, 48, 0.25)' : 'var(--border)'
                          }}
                        >
                          <div className="flex flex-col gap-1" style={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-100" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{rem.name}</span>
                              {isOverdue && (
                                <span className="text-[8px] font-extrabold text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-900/50 uppercase">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-medium">
                              Due: {new Date(rem.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-rose-400">
                              {formatCurrency(rem.amount)}
                            </span>
                            <button
                              onClick={() => {
                                setYouOweReminders(prev => prev.filter(r => r.id !== rem.id));
                              }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#1f1f1f] text-slate-500 hover:text-rose-400 transition-colors"
                              style={{ background: 'var(--pill-bg)', borderColor: 'var(--border)' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-between items-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <span className="text-[10px] text-slate-500 font-bold">
                Total Custom Owed
              </span>
              <span className="text-base font-extrabold text-rose-400">
                {formatCurrency(youOweReminders.reduce((sum, r) => sum + r.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitwisePage;
