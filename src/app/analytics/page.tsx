'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  DollarSign,
  Eye,
  Heart,
  Share2,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

const REVENUE_DATA = [
  { date: 'Mon', amount: 299 },
  { date: 'Tue', amount: 598 },
  { date: 'Wed', amount: 897 },
  { date: 'Thu', amount: 1196 },
  { date: 'Fri', amount: 1794 },
  { date: 'Sat', amount: 2093 },
  { date: 'Sun', amount: 2691 },
];

const PLATFORM_STATS = [
  { platform: 'Twitter', impressions: 45200, engagement: 4.8, followers: 1247, dms: 67, color: 'bg-blue-500' },
  { platform: 'Instagram', impressions: 32100, engagement: 5.2, followers: 892, dms: 45, color: 'bg-pink-500' },
  { platform: 'Telegram', impressions: 18900, engagement: 3.6, followers: 567, dms: 34, color: 'bg-sky-500' },
  { platform: 'Xiaohongshu', impressions: 28700, engagement: 6.1, followers: 1823, dms: 89, color: 'bg-red-500' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedBrand, setSelectedBrand] = useState('all');

  const totalRevenue = REVENUE_DATA[REVENUE_DATA.length - 1].amount;
  const totalImpressions = PLATFORM_STATS.reduce((sum, p) => sum + p.impressions, 0);
  const totalFollowers = PLATFORM_STATS.reduce((sum, p) => sum + p.followers, 0);
  const totalDMs = PLATFORM_STATS.reduce((sum, p) => sum + p.dms, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Track your performance and revenue</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Brand Selector */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white"
          >
            <option value="all">All Brands</option>
            <option value="brandA">VelocityEdge</option>
            <option value="brandB">ChuangYe</option>
          </select>
          
          {/* Time Range */}
          <div className="flex items-center gap-1 p-1 bg-white/10 rounded-lg">
            {['24h', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  timeRange === range ? "bg-white/20 text-white" : "text-gray-400"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">¥{formatNumber(totalRevenue)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            +23% vs last week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Impressions</span>
            <Eye className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400">{formatNumber(totalImpressions)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-cyan-400">
            <TrendingUp className="w-4 h-4" />
            +18% vs last week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">New Followers</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">{formatNumber(totalFollowers)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-purple-400">
            <TrendingUp className="w-4 h-4" />
            +31% vs last week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">DMs Received</span>
            <MessageSquare className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">{formatNumber(totalDMs)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-yellow-400">
            <TrendingUp className="w-4 h-4" />
            +42% vs last week
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Revenue Trend</h3>
        
        <div className="h-48 flex items-end justify-between gap-2">
          {REVENUE_DATA.map((data, index) => {
            const height = (data.amount / totalRevenue) * 100;
            return (
              <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs text-gray-400">¥{data.amount}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg"
                />
                <div className="text-xs text-gray-500">{data.date}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Platform Performance</h3>
        
        <div className="space-y-4">
          {PLATFORM_STATS.map((platform, index) => (
            <motion.div
              key={platform.platform}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
            >
              <div className={cn("w-3 h-3 rounded-full", platform.color)} />
              
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{platform.platform}</div>
                <div className="text-xs text-gray-400">{platform.engagement}% engagement rate</div>
              </div>
              
              <div className="grid grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-sm font-medium text-white">{formatNumber(platform.impressions)}</div>
                  <div className="text-[10px] text-gray-500">Impressions</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{platform.engagement}%</div>
                  <div className="text-[10px] text-gray-500">Engagement</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">+{formatNumber(platform.followers)}</div>
                  <div className="text-[10px] text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{platform.dms}</div>
                  <div className="text-[10px] text-gray-500">DMs</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Conversion Funnel</h3>
          
          <div className="space-y-4">
            {[
              { label: 'Impressions', value: totalImpressions, percent: 100 },
              { label: 'Profile Visits', value: Math.floor(totalImpressions * 0.15), percent: 15 },
              { label: 'DMs Received', value: totalDMs, percent: 5 },
              { label: 'PDF Downloads', value: Math.floor(totalDMs * 0.6), percent: 3 },
              { label: 'Payments', value: 17, percent: 1 }
            ].map((step, index) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-24 text-xs text-gray-400">{step.label}</div>
                <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.percent}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  />
                </div>
                <div className="w-20 text-right text-sm text-white">{formatNumber(step.value)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Top Performing Content</h3>
          
          <div className="space-y-3">
            {[
              { text: '🚀 5 AI tools that changed my life...', platform: 'Twitter', likes: 234 },
              { text: '💰 How I made ¥5000 in one week...', platform: 'Xiaohongshu', likes: 189 },
              { text: '📈 Passive income for beginners...', platform: 'Instagram', likes: 156 },
              { text: '🔥 The secret to automation...', platform: 'Telegram', likes: 134 }
            ].map((post, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-1 text-red-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">{post.likes}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white line-clamp-1">{post.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{post.platform}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
