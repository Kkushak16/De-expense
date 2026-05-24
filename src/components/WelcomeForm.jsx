import React, { useState } from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

const WelcomeForm = ({ onSetName }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSetName(name.trim());
    }
  };

  return (
    <div className="apple-card" style={{ marginBottom: '24px' }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-muted mb-2 block text-sm font-semibold">
            What should we call you?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-12"
              autoFocus
              required
            />
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          type="submit"
          style={{ background: 'var(--primary)' }}
        >
          Continue
        </motion.button>
      </form>
    </div>
  );
};

export default WelcomeForm;
