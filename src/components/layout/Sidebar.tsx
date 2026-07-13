'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  PenTool,
  Image,
  Calendar,
  BarChart3,
  Brain,
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: 'Command Center',
    icon: LayoutDashboard,
    href: '/',
    color: 'text-cyan-400',
    glow: 'glow-cyan'
  },
  {
    title: 'Platforms',
    icon: Globe,
    href: '/platforms',
    color: 'text-blue-400',
    glow: 'glow-purple'
  },
  {
    title: 'Content Studio',
    icon: PenTool,
    href: '/content-studio',
    color: 'text-purple-400',
    glow: 'glow-purple'
  },
  {
    title: 'Image Lab',
    icon: Image,
    href: '/image-lab',
    color: 'text-pink-400',
    glow: 'glow-purple'
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-emerald-400',
    glow: 'glow-emerald'
  },
  {
    title: 'Memory',
    icon: Brain,
    href: '/memory',
    color: 'text-violet-400',
    glow: 'glow-purple'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-400',
    glow: ''
  },
  {
    title: 'Logs',
    icon: Terminal,
    href: '/logs',
    color: 'text-green-400',
    glow: 'glow-emerald'
  }
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen glass-card border-r border-white/10 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Bot className="w-10 h-10 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  DAVE
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Social AI</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Bot className="w-8 h-8 text-cyan-400 mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-r-full"
                  style={{ boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}
                />
              )}
              
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? item.color : "")} />
              
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && hoveredItem === item.href && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50"
                >
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-white/10" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-3 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-gray-300">System Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400">All systems operational</span>
              </div>
              <div className="mt-2 text-[10px] text-gray-500">
                Uptime: 99.9% • Next cycle: 5m
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex justify-center"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
