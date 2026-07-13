'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  RefreshCw,
  Download,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  platform?: string;
  details?: string;
  status: 'success' | 'failed' | 'pending' | 'warning' | 'info';
}

const SAMPLE_LOGS: LogEntry[] = [
  { id: '1', timestamp: new Date(), action: 'post', platform: 'twitter', details: 'Posted: "🚀 AI tools that changed my life..."', status: 'success' },
  { id: '2', timestamp: new Date(Date.now() - 60000), action: 'engagement', platform: 'twitter', details: 'Liked 5 posts', status: 'success' },
  { id: '3', timestamp: new Date(Date.now() - 120000), action: 'dm', platform: 'instagram', details: 'Auto-reply sent to @user123', status: 'success' },
  { id: '4', timestamp: new Date(Date.now() - 180000), action: 'image_generation', details: 'Generated lifestyle image', status: 'success' },
  { id: '5', timestamp: new Date(Date.now() - 240000), action: 'login', platform: 'xiaohongshu', details: 'Session refreshed', status: 'warning' },
  { id: '6', timestamp: new Date(Date.now() - 300000), action: 'post', platform: 'telegram', details: 'Failed to post: Connection timeout', status: 'failed' },
  { id: '7', timestamp: new Date(Date.now() - 360000), action: 'scheduler', details: 'Cron job triggered: content-generation', status: 'info' },
  { id: '8', timestamp: new Date(Date.now() - 420000), action: 'health_check', details: 'All systems operational', status: 'success' },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Simulate new logs
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const interval = setInterval(() => {
      const actions = ['post', 'engagement', 'dm', 'image_generation', 'scheduler', 'health_check'];
      const platforms = ['twitter', 'instagram', 'telegram', 'xiaohongshu', null];
      const statuses: Array<'success' | 'failed' | 'pending' | 'warning'> = ['success', 'success', 'success', 'success', 'failed', 'warning'];
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: actions[Math.floor(Math.random() * actions.length)],
        platform: platforms[Math.floor(Math.random() * platforms.length)] || undefined,
        details: 'New activity logged...',
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
      
      setLogs(prev => [newLog, ...prev].slice(0, 500));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.status !== filter) return false;
    if (searchQuery && !log.details?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-cyan-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/10';
      case 'failed': return 'bg-red-500/10';
      case 'warning': return 'bg-yellow-500/10';
      case 'pending': return 'bg-cyan-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'post': return 'POST';
      case 'engagement': return 'ENGAGE';
      case 'dm': return 'DM';
      case 'image_generation': return 'IMAGE';
      case 'login': return 'LOGIN';
      case 'scheduler': return 'CRON';
      case 'health_check': return 'HEALTH';
      default: return action.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            Activity Logs
          </h1>
          <p className="text-sm text-gray-400 mt-1">Real-time activity monitoring</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              isAutoRefresh
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/10 text-gray-400"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isAutoRefresh && "animate-spin")} />
            {isAutoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            {['all', 'success', 'failed', 'warning', 'pending'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                  filter === status
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: logs.length, color: 'text-white' },
          { label: 'Success', value: logs.filter(l => l.status === 'success').length, color: 'text-emerald-400' },
          { label: 'Failed', value: logs.filter(l => l.status === 'failed').length, color: 'text-red-400' },
          { label: 'Warnings', value: logs.filter(l => l.status === 'warning').length, color: 'text-yellow-400' }
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 rounded-xl text-center">
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Logs List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live
          </div>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No logs found
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors",
                  index === 0 && "bg-white/5"
                )}
              >
                {/* Status Icon */}
                <div className="mt-0.5">
                  {getStatusIcon(log.status)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium",
                      log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      log.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      log.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    )}>
                      {getActionLabel(log.action)}
                    </span>
                    {log.platform && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300">
                        {log.platform}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{log.details}</p>
                </div>
                
                {/* Timestamp */}
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {log.timestamp.toLocaleTimeString()}
                </div>
              </motion.div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
