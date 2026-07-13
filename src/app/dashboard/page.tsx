'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Play,
  Pause,
  RefreshCw,
  Zap,
  TrendingUp,
  Users,
  MessageSquare,
  DollarSign,
  Activity,
  Globe,
  Image,
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Heart,
  Share2,
  Send,
  Terminal,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { cn, formatNumber, getStatusColor } from '@/lib/utils';

interface BrandStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  currentTask: string | null;
  lastRun: string | null;
  platforms: string[];
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: Array<{
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    message: string;
  }>;
}

export default function DashboardPage() {
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [brands, setBrands] = useState<BrandStatus[]>([
    { id: 'brandA', name: 'VelocityEdge', status: 'stopped', currentTask: null, lastRun: null, platforms: ['twitter', 'instagram', 'telegram'] },
    { id: 'brandB', name: 'ChuangYe', status: 'stopped', currentTask: null, lastRun: null, platforms: ['xiaohongshu', 'wechat', 'douyin'] }
  ]);
  const [health, setHealth] = useState<SystemHealth>({ overall: 'healthy', services: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalImpressions: 0,
    totalDMs: 0,
    totalConversions: 0,
    totalRevenue: 0
  });

  // Simulate stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalPosts: prev.totalPosts + Math.floor(Math.random() * 2),
        totalImpressions: prev.totalImpressions + Math.floor(Math.random() * 1000),
        totalDMs: prev.totalDMs + Math.floor(Math.random() * 3),
        totalConversions: prev.totalConversions + (Math.random() > 0.9 ? 1 : 0),
        totalRevenue: prev.totalRevenue + (Math.random() > 0.9 ? Math.floor(Math.random() * 500) : 0)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoPilot = async () => {
    setIsLoading(true);
    
    try {
      const action = isAutoPilot ? 'stop-all' : 'start-all';
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        setIsAutoPilot(!isAutoPilot);
        addLog(isAutoPilot ? '🛑 Auto-pilot stopped' : '🚀 Auto-pilot started');
        
        // Update brand statuses
        setBrands(prev => prev.map(brand => ({
          ...brand,
          status: isAutoPilot ? 'stopped' : 'running'
        })));
      }
    } catch (error) {
      addLog('❌ Failed to toggle auto-pilot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCycle = async (brandId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-cycle', brandId })
      });
      
      if (response.ok) {
        addLog(`🔄 Running automation cycle for ${brandId}`);
        
        // Update brand status
        setBrands(prev => prev.map(brand => 
          brand.id === brandId 
            ? { ...brand, status: 'running', currentTask: 'running cycle' }
            : brand
        ));
        
        // Simulate completion after 5 seconds
        setTimeout(() => {
          setBrands(prev => prev.map(brand => 
            brand.id === brandId 
              ? { ...brand, status: 'running', currentTask: null, lastRun: new Date().toISOString() }
              : brand
          ));
          addLog(`✅ Cycle complete for ${brandId}`);
        }, 5000);
      }
    } catch (error) {
      addLog(`❌ Failed to run cycle for ${brandId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyStop = async () => {
    if (!confirm('Are you sure you want to stop all automation?')) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop-all' })
      });
      
      if (response.ok) {
        setIsAutoPilot(false);
        setBrands(prev => prev.map(brand => ({ ...brand, status: 'stopped', currentTask: null })));
        addLog('🛑 EMERGENCY STOP - All automation halted');
      }
    } catch (error) {
      addLog('❌ Emergency stop failed');
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">DAVE Command Center</h1>
          <p className="text-gray-400 mt-1">Autonomous Virtual Engagement Engine</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dry Run Toggle */}
          <button
            onClick={() => setIsDryRun(!isDryRun)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isDryRun
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-white/10 text-gray-400 hover:text-white"
            )}
          >
            <Eye className="w-4 h-4" />
            {isDryRun ? 'Dry Run ON' : 'Dry Run OFF'}
          </button>
          
          {/* Emergency Stop */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEmergencyStop}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            EMERGENCY STOP
          </motion.button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auto-Pilot Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Auto-Pilot</h3>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-400">
                {isAutoPilot ? 'DAVE is running autonomously' : 'DAVE is in manual mode'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isAutoPilot ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  isAutoPilot ? "text-emerald-400" : "text-gray-500"
                )}>
                  {isAutoPilot ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleAutoPilot}
              disabled={isLoading}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                isAutoPilot
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isAutoPilot ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          
          <div className="text-xs text-gray-500">
            When enabled, DAVE will automatically generate content, create images, post, engage, and handle DMs without human intervention.
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{formatNumber(stats.totalPosts)}</div>
              <div className="text-xs text-gray-400">Posts Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{formatNumber(stats.totalImpressions)}</div>
              <div className="text-xs text-gray-400">Impressions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{formatNumber(stats.totalDMs)}</div>
              <div className="text-xs text-gray-400">DMs Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">¥{formatNumber(stats.totalRevenue)}</div>
              <div className="text-xs text-gray-400">Revenue</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Brand Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map((brand, index) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    brand.status === 'running' ? "bg-emerald-400 animate-pulse" :
                    brand.status === 'error' ? "bg-red-400" : "bg-gray-500"
                  )} />
                  <span className={cn(
                    "text-sm",
                    brand.status === 'running' ? "text-emerald-400" :
                    brand.status === 'error' ? "text-red-400" : "text-gray-500"
                  )}>
                    {brand.status === 'running' ? 'Running' :
                     brand.status === 'error' ? 'Error' : 'Stopped'}
                  </span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRunCycle(brand.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </motion.button>
            </div>
            
            {brand.currentTask && (
              <div className="mb-4 p-2 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-cyan-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {brand.currentTask}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {brand.platforms.map(platform => (
                <span
                  key={platform}
                  className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full"
                >
                  {platform}
                </span>
              ))}
            </div>
            
            {brand.lastRun && (
              <div className="mt-3 text-xs text-gray-500">
                Last run: {new Date(brand.lastRun).toLocaleString()}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Live Activity Feed
          </h3>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
        
        <div className="h-48 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No activity yet. Start auto-pilot to see live logs.
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={cn(
                  "py-1",
                  log.includes('✅') ? 'text-emerald-400' :
                  log.includes('❌') ? 'text-red-400' :
                  log.includes('⚠️') ? 'text-yellow-400' :
                  log.includes('🚀') ? 'text-cyan-400' :
                  'text-gray-400'
                )}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          System Health
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Database', status: 'healthy', icon: '💾' },
            { name: 'Playwright', status: 'healthy', icon: '🎭' },
            { name: 'ComfyUI', status: 'degraded', icon: '🎨' },
            { name: 'Scheduler', status: 'healthy', icon: '⏰' }
          ].map(service => (
            <div
              key={service.name}
              className={cn(
                "p-3 rounded-lg border",
                service.status === 'healthy' ? 'bg-emerald-500/10 border-emerald-500/20' :
                service.status === 'degraded' ? 'bg-yellow-500/10 border-yellow-500/20' :
                'bg-red-500/10 border-red-500/20'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{service.icon}</span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  service.status === 'healthy' ? 'bg-emerald-400' :
                  service.status === 'degraded' ? 'bg-yellow-400' :
                  'bg-red-400'
                )} />
              </div>
              <div className="text-sm font-medium text-white">{service.name}</div>
              <div className={cn(
                "text-xs capitalize",
                service.status === 'healthy' ? 'text-emerald-400' :
                service.status === 'degraded' ? 'text-yellow-400' :
                'text-red-400'
              )}>
                {service.status}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
