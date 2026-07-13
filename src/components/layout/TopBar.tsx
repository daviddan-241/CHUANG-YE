'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  StopCircle,
  ChevronDown,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { cn, getStatusColor, getPlatformIcon } from '@/lib/utils';

const accounts = [
  { id: '1', name: 'VelocityEdge', platform: 'twitter', status: 'connected' },
  { id: '2', name: 'ChuangYe', platform: 'twitter', status: 'connected' },
  { id: '3', name: 'VE_Telegram', platform: 'telegram', status: 'running' },
  { id: '4', name: 'CY_Instagram', platform: 'instagram', status: 'pending' },
];

export default function TopBar() {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'New reply from @techinnovator', time: '2m ago', read: false },
    { id: 2, text: 'Post scheduled for 3:00 PM', time: '15m ago', read: false },
    { id: 3, text: 'Instagram session refreshed', time: '1h ago', read: true },
  ];

  return (
    <header className="h-16 glass-card border-b border-white/10 flex items-center justify-between px-6">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts, platforms, or commands..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
        </div>
      </div>

      {/* Center Section - Account Selector */}
      <div className="relative">
        <button
          onClick={() => setShowAccountDropdown(!showAccountDropdown)}
          className="flex items-center gap-3 px-4 py-2 glass-card hover:bg-white/10 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPlatformIcon(selectedAccount.platform)}</span>
            <div className="text-left">
              <div className="text-sm font-medium text-white">{selectedAccount.name}</div>
              <div className="text-xs text-gray-400">{selectedAccount.platform}</div>
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showAccountDropdown && "rotate-180")} />
        </button>

        <AnimatePresence>
          {showAccountDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-64 glass-card rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50"
            >
              <div className="p-3 border-b border-white/10">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Accounts</div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowAccountDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors",
                      selectedAccount.id === account.id && "bg-white/5"
                    )}
                  >
                    <span className="text-lg">{getPlatformIcon(account.platform)}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">{account.name}</div>
                      <div className="text-xs text-gray-400">{account.platform}</div>
                    </div>
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(account.status))} />
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 hover:bg-white/10 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Account
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Manual Post Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          Manual Post
        </motion.button>

        {/* Emergency Stop */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
        >
          <StopCircle className="w-4 h-4" />
          Emergency Stop
        </motion.button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 glass-card rounded-lg">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Running</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full mt-2 right-0 w-72 glass-card rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-white/10">
                  <div className="text-sm font-medium text-white">Notifications</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5",
                        !notif.read && "bg-white/5"
                      )}
                    >
                      <div className="text-sm text-white">{notif.text}</div>
                      <div className="text-xs text-gray-400 mt-1">{notif.time}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/10">
                  <button className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full" />
        </button>

        {/* User Menu */}
        <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
