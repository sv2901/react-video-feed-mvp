import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, Inbox, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'discover', icon: Compass, label: 'Discover' },
  { id: 'create', icon: Plus, label: 'Create', isAction: true },
  { id: 'inbox', icon: Inbox, label: 'Inbox' },
  { id: 'profile', icon: User, label: 'Profile' }
];

export function BottomNav({ onCreateClick }) {
  const [activeTab, setActiveTab] = useState('home');

  const handleClick = (item) => {
    if (item.id === 'create') {
      onCreateClick?.();
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      data-testid="bottom-nav"
    >
      <div className="glass mx-3 mb-3 rounded-2xl px-2 py-2">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className="relative -mt-5"
                  data-testid="create-btn"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg glow-violet"
                  >
                    <Plus className="w-7 h-7 text-white" />
                  </motion.div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="flex flex-col items-center gap-0.5 px-4 py-2 relative"
                data-testid={`nav-${item.id}`}
              >
                <div className="relative">
                  <Icon className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    isActive ? "text-white" : "text-zinc-500"
                  )} />
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isActive ? "text-white" : "text-zinc-500"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
