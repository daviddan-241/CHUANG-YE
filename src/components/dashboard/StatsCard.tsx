'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  change: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  glow: string;
}

export default function StatsCard({
  title,
  value,
  suffix = '',
  change,
  trend,
  icon: Icon,
  color,
  glow
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn("glass-card p-6 rounded-xl relative overflow-hidden group cursor-pointer")}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        `bg-gradient-to-br ${color}`
      )} style={{ opacity: 0.05 }} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">{title}</span>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            `bg-gradient-to-br ${color}`
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex items-end gap-2">
          <div className="text-3xl font-bold text-white">
            {suffix ? `${value}${suffix}` : formatNumber(value)}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium mb-1",
            trend === 'up' ? 'text-emerald-400' : 'text-red-400'
          )}>
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(change)}%
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">vs last period</div>
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
    </motion.div>
  );
}
