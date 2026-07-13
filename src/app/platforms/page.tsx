'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Shield,
  Key,
  Fingerprint
} from 'lucide-react';
import { cn, getPlatformIcon, getPlatformColor, getStatusColor, getStatusBg } from '@/lib/utils';

interface Platform {
  id: string;
  name: string;
  platform: string;
  username: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastActive: string;
  avatar: string;
  sessionValid: boolean;
  fingerprint: string;
  proxy: string | null;
}

const platforms: Platform[] = [
  {
    id: '1',
    name: 'VelocityEdge',
    platform: 'twitter',
    username: '@VelocityEdge',
    status: 'connected',
    lastActive: '2 minutes ago',
    avatar: '🐦',
    sessionValid: true,
    fingerprint: 'Chrome 120 / Windows 10',
    proxy: null
  },
  {
    id: '2',
    name: 'ChuangYe',
    platform: 'twitter',
    username: '@ChuangYe_AI',
    status: 'connected',
    lastActive: '15 minutes ago',
    avatar: '🐦',
    sessionValid: true,
    fingerprint: 'Firefox 121 / macOS',
    proxy: 'US-Proxy-1'
  },
  {
    id: '3',
    name: 'VE_Telegram',
    platform: 'telegram',
    username: '@VE_Official',
    status: 'connected',
    lastActive: '1 hour ago',
    avatar: '✈️',
    sessionValid: true,
    fingerprint: 'Chrome 120 / Linux',
    proxy: null
  },
  {
    id: '4',
    name: 'CY_Instagram',
    platform: 'instagram',
    username: 'chuangye.official',
    status: 'pending',
    lastActive: 'Never',
    avatar: '📸',
    sessionValid: false,
    fingerprint: 'Safari 17 / macOS',
    proxy: 'SG-Proxy-1'
  },
  {
    id: '5',
    name: 'VE_Facebook',
    platform: 'facebook',
    username: 'VelocityEdge',
    status: 'disconnected',
    lastActive: '3 days ago',
    avatar: '👤',
    sessionValid: false,
    fingerprint: 'Chrome 120 / Windows 10',
    proxy: null
  },
  {
    id: '6',
    name: 'CY_Xiaohongshu',
    platform: 'xiaohongshu',
    username: '创业笔记',
    status: 'error',
    lastActive: '2 hours ago',
    avatar: '📕',
    sessionValid: false,
    fingerprint: 'Chrome 120 / Windows 10',
    proxy: 'CN-Proxy-1'
  }
];

const platformOptions = [
  { id: 'twitter', name: 'Twitter / X', icon: '🐦', color: 'from-blue-500 to-blue-600' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'from-sky-500 to-sky-600' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: 'from-blue-600 to-blue-700' },
  { id: 'xiaohongshu', name: 'Xiaohongshu (RED)', icon: '📕', color: 'from-red-500 to-red-600' },
  { id: 'wechat', name: 'WeChat', icon: '💬', color: 'from-green-500 to-green-600' },
  { id: 'douyin', name: 'Douyin (TikTok)', icon: '🎵', color: 'from-violet-500 to-violet-600' },
];

export default function PlatformsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platforms</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your connected social media accounts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          Add Platform
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Platforms', value: platforms.length, icon: Globe, color: 'text-cyan-400' },
          { label: 'Connected', value: platforms.filter(p => p.status === 'connected').length, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Pending', value: platforms.filter(p => p.status === 'pending').length, icon: Clock, color: 'text-yellow-400' },
          { label: 'Errors', value: platforms.filter(p => p.status === 'error').length, icon: AlertCircle, color: 'text-red-400' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{stat.label}</span>
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className={cn(
              "glass-card p-5 rounded-xl cursor-pointer transition-all hover:border-cyan-500/30",
              platform.status === 'connected' && "border-emerald-500/20"
            )}
            onClick={() => {
              setSelectedPlatform(platform);
              setShowDetails(true);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{platform.avatar}</div>
                <div>
                  <h3 className="font-semibold text-white">{platform.name}</h3>
                  <p className="text-sm text-gray-400">{platform.username}</p>
                </div>
              </div>
              <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full border", getStatusBg(platform.status))}>
                {getStatusIcon(platform.status)}
                <span className={cn("text-xs font-medium", getStatusColor(platform.status))}>
                  {platform.status.charAt(0).toUpperCase() + platform.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Platform</span>
                <span className={cn("font-medium", getPlatformColor(platform.platform))}>
                  {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last Active</span>
                <span className="text-white">{platform.lastActive}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Fingerprint</span>
                <span className="text-gray-300 text-xs truncate max-w-[120px]">{platform.fingerprint}</span>
              </div>

              {platform.proxy && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Proxy</span>
                  <span className="text-cyan-400">{platform.proxy}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </motion.div>
        ))}

        {/* Add Platform Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + platforms.length * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="glass-card p-5 rounded-xl border-dashed border-2 border-white/20 hover:border-cyan-500/50 transition-colors flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-white">Add New Platform</span>
          <span className="text-xs text-gray-400 mt-1">Connect another account</span>
        </motion.button>
      </div>

      {/* Add Platform Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Add Platform</h2>
                <p className="text-sm text-gray-400 mt-1">Connect a new social media account</p>
              </div>
              
              <div className="p-6 space-y-3">
                {platformOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{option.name}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Details Modal */}
      <AnimatePresence>
        {showDetails && selectedPlatform && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{selectedPlatform.avatar}</div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedPlatform.name}</h2>
                      <p className="text-sm text-gray-400">{selectedPlatform.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Status</span>
                  </div>
                  <div className={cn("flex items-center gap-2", getStatusColor(selectedPlatform.status))}>
                    {getStatusIcon(selectedPlatform.status)}
                    <span className="text-sm font-medium">
                      {selectedPlatform.status.charAt(0).toUpperCase() + selectedPlatform.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Last Active</span>
                  </div>
                  <span className="text-sm text-white">{selectedPlatform.lastActive}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Fingerprint</span>
                  </div>
                  <span className="text-sm text-white">{selectedPlatform.fingerprint}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Session Valid</span>
                  </div>
                  <span className={cn("text-sm font-medium", selectedPlatform.sessionValid ? 'text-emerald-400' : 'text-red-400')}>
                    {selectedPlatform.sessionValid ? 'Yes' : 'No'}
                  </span>
                </div>

                {selectedPlatform.proxy && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Proxy</span>
                    </div>
                    <span className="text-sm text-cyan-400">{selectedPlatform.proxy}</span>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 flex items-center gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Session
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
