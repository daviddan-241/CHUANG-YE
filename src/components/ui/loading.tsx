'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={cn("text-cyan-400", sizes[size])} />
      </motion.div>
      {text && (
        <p className="text-sm text-gray-400">{text}</p>
      )}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
          DAVE Social AI
        </h1>
        <p className="mt-2 text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="glass-card p-6 rounded-xl animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-white/10 rounded w-1/2 mb-3"></div>
      <div className="h-3 bg-white/10 rounded w-2/3"></div>
    </div>
  );
}
