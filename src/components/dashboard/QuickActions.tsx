'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Image,
  FileText,
  Calendar,
  RefreshCw,
  Globe,
  Zap,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    id: 'generate',
    title: 'Generate Post',
    description: 'Create AI-powered content',
    icon: FileText,
    color: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/25'
  },
  {
    id: 'image',
    title: 'Create Image',
    description: 'Generate or edit images',
    icon: Image,
    color: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/25'
  },
  {
    id: 'schedule',
    title: 'Schedule Post',
    description: 'Plan your content',
    icon: Calendar,
    color: 'from-orange-500 to-red-500',
    glow: 'shadow-orange-500/25'
  },
  {
    id: 'engage',
    title: 'Engage Now',
    description: 'Boost engagement',
    icon: Zap,
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/25'
  },
  {
    id: 'platforms',
    title: 'Connect Platform',
    description: 'Add new account',
    icon: Globe,
    color: 'from-blue-500 to-indigo-500',
    glow: 'shadow-blue-500/25'
  },
  {
    id: 'export',
    title: 'Export Data',
    description: 'Download reports',
    icon: Download,
    color: 'from-pink-500 to-rose-500',
    glow: 'shadow-pink-500/25'
  }
];

export default function QuickActions() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div className="glass-card p-6 rounded-xl h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <p className="text-sm text-gray-400 mt-1">Common tasks and shortcuts</p>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === action.id;
          
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={cn(
                "relative p-4 rounded-xl border border-white/10 transition-all duration-300 text-left group overflow-hidden",
                isHovered
                  ? "border-white/20 bg-white/5"
                  : "hover:border-white/20 hover:bg-white/5"
              )}
            >
              {/* Background gradient on hover */}
              <motion.div
                className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300", action.color)}
                animate={{ opacity: isHovered ? 0.1 : 0 }}
              />
              
              <div className="relative z-10">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300",
                  `bg-gradient-to-br ${action.color}`,
                  isHovered && `shadow-lg ${action.glow}`
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <h4 className="text-sm font-medium text-white mb-1">{action.title}</h4>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Pro tip */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-cyan-400">Pro Tip</p>
            <p className="text-xs text-gray-400 mt-1">
              Use the DAVE Assistant to generate content with natural language commands like "Create a post about AI trends"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
