'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Eye,
  Clock,
  Calendar,
  Zap,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Image,
  FileText,
  Globe
} from 'lucide-react';
import { cn, formatNumber, getStatusColor, getPlatformIcon, getPlatformColor } from '@/lib/utils';
import StatsCard from './StatsCard';
import EngagementChart from './EngagementChart';
import UpcomingPosts from './UpcomingPosts';
import QuickActions from './QuickActions';

const stats: Array<{
  title: string;
  value: number;
  suffix?: string;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  glow: string;
}> = [
  {
    title: 'Total Impressions',
    value: 45200,
    change: 12.5,
    trend: 'up',
    icon: Eye,
    color: 'from-cyan-500 to-blue-500',
    glow: 'glow-cyan'
  },
  {
    title: 'Engagement Rate',
    value: 4.8,
    suffix: '%',
    change: 2.1,
    trend: 'up',
    icon: Heart,
    color: 'from-purple-500 to-pink-500',
    glow: 'glow-purple'
  },
  {
    title: 'Followers Growth',
    value: 1247,
    change: 8.3,
    trend: 'up',
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
    glow: 'glow-emerald'
  },
  {
    title: 'Posts This Week',
    value: 34,
    change: -2.1,
    trend: 'down',
    icon: FileText,
    color: 'from-orange-500 to-red-500',
    glow: 'glow-purple'
  }
];

const recentActivity = [
  {
    id: 1,
    platform: 'twitter',
    action: 'Posted thread about AI automation',
    time: '2 min ago',
    engagement: { likes: 45, retweets: 12, replies: 8 }
  },
  {
    id: 2,
    platform: 'instagram',
    action: 'Shared carousel: 10 AI Tools',
    time: '15 min ago',
    engagement: { likes: 234, comments: 45, saves: 67 }
  },
  {
    id: 3,
    platform: 'telegram',
    action: 'Sent weekly digest to channel',
    time: '1 hour ago',
    engagement: { views: 1247, forwards: 89 }
  },
  {
    id: 4,
    platform: 'twitter',
    action: 'Replied to 5 mentions',
    time: '2 hours ago',
    engagement: { likes: 23, replies: 15 }
  }
];

export default function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back! Here's what's happening with your accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 glass-card rounded-lg">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  selectedTimeRange === range
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <EngagementChart />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <QuickActions />
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <UpcomingPosts />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                  "bg-white/5"
                )}>
                  {getPlatformIcon(activity.platform)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", getPlatformColor(activity.platform))}>
                      {activity.platform.charAt(0).toUpperCase() + activity.platform.slice(1)}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-white mt-1">{activity.action}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {Object.entries(activity.engagement).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="capitalize">{key}:</span>
                        <span className="text-white">{formatNumber(value as number)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">System Status</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">All systems operational</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Playwright Engine', status: 'Running', uptime: '99.9%' },
            { label: 'Queue Manager', status: 'Active', uptime: '100%' },
            { label: 'Image Generator', status: 'Ready', uptime: '98.5%' },
            { label: 'Session Manager', status: 'Connected', uptime: '99.7%' }
          ].map((system, index) => (
            <div key={system.label} className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{system.label}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  system.status === 'Running' || system.status === 'Active' || system.status === 'Connected'
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-cyan-400/10 text-cyan-400"
                )}>
                  {system.status}
                </span>
              </div>
              <div className="text-lg font-semibold text-white">{system.uptime}</div>
              <div className="text-[10px] text-gray-500">Uptime</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
