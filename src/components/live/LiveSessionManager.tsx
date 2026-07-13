'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Globe,
  MessageSquare,
  Camera,
  Play,
  Pause,
  RefreshCw,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  UserPlus,
  Search,
  MoreVertical,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Settings,
  Terminal,
  Eye,
  MousePointer,
  Keyboard,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveSession {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  status: 'connected' | 'disconnected' | 'loading' | 'posting' | 'engaging';
  avatar: string;
  followers: number;
  posts: number;
  lastAction: string;
  isActive: boolean;
  screenshot?: string;
}

interface LiveAction {
  id: string;
  timestamp: Date;
  platform: string;
  action: string;
  details: string;
  status: 'running' | 'success' | 'failed';
}

const PLATFORMS: LiveSession[] = [
  { id: 'twitter-1', platform: 'twitter', username: '@ChuangYe_AI', displayName: 'ChuangYe', status: 'connected', avatar: '🐦', followers: 12847, posts: 342, lastAction: 'Posted thread', isActive: true },
  { id: 'instagram-1', platform: 'instagram', username: 'chuangye.official', displayName: 'ChuangYe', status: 'connected', avatar: '📸', followers: 8923, posts: 156, lastAction: 'Liked 5 posts', isActive: true },
  { id: 'telegram-1', platform: 'telegram', username: '@ChuangYe_Group', displayName: 'ChuangYe Community', status: 'connected', avatar: '✈️', followers: 3421, posts: 89, lastAction: 'Sent message', isActive: true },
  { id: 'xiaohongshu-1', platform: 'xiaohongshu', username: '创业笔记', displayName: 'ChuangYe', status: 'connected', avatar: '📕', followers: 15678, posts: 234, lastAction: 'Posted note', isActive: true },
  { id: 'douyin-1', platform: 'douyin', username: 'chuangye_ai', displayName: 'ChuangYe', status: 'loading', avatar: '🎵', followers: 6789, posts: 67, lastAction: 'Generating video', isActive: false },
  { id: 'wechat-1', platform: 'wechat', username: 'ChuangYe_Official', displayName: 'ChuangYe', status: 'disconnected', avatar: '💬', followers: 2345, posts: 45, lastAction: 'Session expired', isActive: false },
];

export default function LiveSessionManager() {
  const [sessions, setSessions] = useState<LiveSession[]>(PLATFORMS);
  const [activeSession, setActiveSession] = useState<LiveSession>(PLATFORMS[0]);
  const [liveActions, setLiveActions] = useState<LiveAction[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Simulate live actions
  useEffect(() => {
    const actions = [
      'Liked post by @user123',
      'Replied to comment',
      'Followed @newaccount',
      'Viewed 5 posts in feed',
      'Saved post to bookmarks',
      'Shared story',
      'DM reply sent',
      'Group message posted',
      'Image generated',
      'Content scheduled'
    ];

    const interval = setInterval(() => {
      const session = sessions[Math.floor(Math.random() * sessions.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      const newAction: LiveAction = {
        id: Date.now().toString(),
        timestamp: new Date(),
        platform: session.platform,
        action: action.split(' ')[0],
        details: action,
        status: Math.random() > 0.1 ? 'success' : 'failed'
      };
      
      setLiveActions(prev => [newAction, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(interval);
  }, [sessions]);

  // Simulate mouse movement in preview
  useEffect(() => {
    const interval = setInterval(() => {
      setMousePosition({
        x: Math.random() * 800,
        y: Math.random() * 600
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCommand = async () => {
    if (!commandInput.trim()) return;
    
    const newAction: LiveAction = {
      id: Date.now().toString(),
      timestamp: new Date(),
      platform: activeSession.platform,
      action: 'command',
      details: commandInput,
      status: 'running'
    };
    
    setLiveActions(prev => [newAction, ...prev]);
    setCommandInput('');
    
    // Simulate processing
    setTimeout(() => {
      setLiveActions(prev => prev.map(a => 
        a.id === newAction.id ? { ...a, status: 'success' } : a
      ));
    }, 2000);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'from-blue-500 to-blue-600';
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'telegram': return 'from-sky-500 to-sky-600';
      case 'xiaohongshu': return 'from-red-500 to-red-600';
      case 'douyin': return 'from-violet-500 to-violet-600';
      case 'wechat': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-400';
      case 'loading': return 'bg-yellow-400 animate-pulse';
      case 'posting': return 'bg-cyan-400 animate-pulse';
      case 'engaging': return 'bg-purple-400 animate-pulse';
      case 'disconnected': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={cn("flex flex-col h-screen bg-[#0a0a0f]", isFullscreen && "fixed inset-0 z-50")}>
      {/* Top Bar - Session Switcher */}
      <div className="h-14 glass-card border-b border-white/10 flex items-center px-4 gap-2 overflow-x-auto">
        {sessions.map(session => (
          <motion.button
            key={session.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSession(session)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap",
              activeSession.id === session.id
                ? "bg-white/10 border border-white/20"
                : "hover:bg-white/5"
            )}
          >
            <span className="text-lg">{session.avatar}</span>
            <span className="text-white font-medium">{session.displayName}</span>
            <div className={cn("w-2 h-2 rounded-full", getStatusColor(session.status))} />
          </motion.button>
        ))}
        
        <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors ml-auto">
          <Plus className="w-4 h-4" />
          <span className="text-xs">Add Account</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Live Preview */}
        <div className="flex-1 flex flex-col">
          {/* Preview Header */}
          <div className="h-10 glass-card border-b border-white/10 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", getStatusColor(activeSession.status))} />
              <span className="text-sm text-white font-medium">{activeSession.username}</span>
              <span className="text-xs text-gray-400 capitalize">{activeSession.platform}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-gray-400" /> : <Maximize2 className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
          </div>
          
          {/* Live Browser Preview */}
          <div ref={previewRef} className="flex-1 relative bg-[#111] overflow-hidden">
            {/* Simulated Browser Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-white">
                {/* Platform-specific UI simulation */}
                {activeSession.platform === 'twitter' && (
                  <div className="p-4 bg-black text-white h-full">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
                      <div>
                        <div className="font-bold text-sm">ChuangYe</div>
                        <div className="text-gray-500 text-xs">@ChuangYe_AI</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="pb-4 border-b border-gray-800">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-800" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm">User {i}</span>
                                <span className="text-gray-500 text-xs">@user{i} · {i}h</span>
                              </div>
                              <p className="text-sm text-gray-300">
                                Just discovered this amazing AI tool for content creation! 🚀 
                                The future is here. #AI #Automation
                              </p>
                              <div className="flex items-center gap-6 mt-3 text-gray-500">
                                <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-xs">{Math.floor(Math.random() * 50)}</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
                                  <RefreshCw className="w-4 h-4" />
                                  <span className="text-xs">{Math.floor(Math.random() * 100)}</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-xs">{Math.floor(Math.random() * 500)}</span>
                                </button>
                                <button className="hover:text-cyan-400 transition-colors">
                                  <Bookmark className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeSession.platform === 'telegram' && (
                  <div className="flex h-full">
                    {/* Chat list */}
                    <div className="w-64 bg-[#17212b] border-r border-[#0e1621]">
                      <div className="p-3 border-b border-[#0e1621]">
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#242f3d] rounded-lg">
                          <Search className="w-4 h-4 text-gray-400" />
                          <input placeholder="Search" className="bg-transparent text-sm text-white outline-none flex-1" />
                        </div>
                      </div>
                      <div className="overflow-y-auto">
                        {['ChuangYe Community', 'AI Entrepreneurs', 'Passive Income Tips', 'Digital Nomads'].map((chat, i) => (
                          <div key={i} className={cn("flex items-center gap-3 px-3 py-3 hover:bg-[#202b36] cursor-pointer", i === 0 && "bg-[#2b5278]")}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                              {chat[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white truncate">{chat}</span>
                                <span className="text-xs text-gray-400">2m</span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">New message...</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Chat content */}
                    <div className="flex-1 flex flex-col bg-[#0e1621]">
                      <div className="h-14 bg-[#17212b] flex items-center justify-between px-4 border-b border-[#0e1621]">
                        <div>
                          <div className="text-sm font-medium text-white">ChuangYe Community</div>
                          <div className="text-xs text-gray-400">3,421 members</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-[#202b36] rounded-lg">
                            <Search className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-[#202b36] rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {[
                          { user: 'Member 1', text: '刚加入，求带 🙏', time: '10:23 AM' },
                          { user: 'ChuangYe', text: '欢迎！请查看置顶消息获取免费资料 📚', time: '10:25 AM', isMe: true },
                          { user: 'Member 2', text: '太棒了！已关注', time: '10:26 AM' },
                          { user: 'Member 3', text: '这个群太有价值了！', time: '10:28 AM' },
                        ].map((msg, i) => (
                          <div key={i} className={cn("flex", msg.isMe ? "justify-end" : "justify-start")}>
                            <div className={cn(
                              "max-w-xs px-4 py-2 rounded-xl text-sm",
                              msg.isMe 
                                ? "bg-[#2b5278] text-white rounded-br-none"
                                : "bg-[#182533] text-white rounded-bl-none"
                            )}>
                              {!msg.isMe && <div className="text-xs text-cyan-400 mb-1">{msg.user}</div>}
                              <p>{msg.text}</p>
                              <div className="text-[10px] text-gray-400 mt-1 text-right">{msg.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 bg-[#17212b] border-t border-[#0e1621]">
                        <div className="flex items-center gap-2">
                          <input 
                            placeholder="Message..." 
                            className="flex-1 px-4 py-2 bg-[#242f3d] rounded-lg text-sm text-white outline-none"
                          />
                          <button className="p-2 bg-[#2b5278] rounded-lg hover:bg-[#3a6b9f]">
                            <Send className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!['twitter', 'telegram'].includes(activeSession.platform) && (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{activeSession.avatar}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{activeSession.displayName}</h3>
                      <p className="text-gray-400 text-sm">{activeSession.username}</p>
                      <div className="mt-4 flex items-center gap-4 justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{activeSession.followers.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{activeSession.posts}</div>
                          <div className="text-xs text-gray-400">Posts</div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 justify-center">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(activeSession.status))} />
                        <span className="text-sm text-gray-400 capitalize">{activeSession.status}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mouse Cursor */}
            <motion.div
              className="absolute pointer-events-none z-50"
              animate={{ x: mousePosition.x, y: mousePosition.y }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            >
              <MousePointer className="w-4 h-4 text-white drop-shadow-lg" />
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Controls & Actions */}
        <div className="w-96 flex flex-col glass-card border-l border-white/10">
          {/* Session Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl">
                {activeSession.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-white">{activeSession.displayName}</h3>
                <p className="text-sm text-gray-400">{activeSession.username}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-sm font-bold text-white">{activeSession.followers.toLocaleString()}</div>
                <div className="text-[10px] text-gray-400">Followers</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-sm font-bold text-white">{activeSession.posts}</div>
                <div className="text-[10px] text-gray-400">Posts</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-sm font-bold text-emerald-400">98%</div>
                <div className="text-[10px] text-gray-400">Health</div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="p-4 border-b border-white/10">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Send, label: 'Post Now', color: 'text-cyan-400' },
                { icon: Heart, label: 'Auto-Like', color: 'text-red-400' },
                { icon: UserPlus, label: 'Auto-Follow', color: 'text-purple-400' },
                { icon: MessageCircle, label: 'Auto-Reply', color: 'text-green-400' },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button key={action.label} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <Icon className={cn("w-4 h-4", action.color)} />
                    <span className="text-xs text-white">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Command Input */}
          <div className="p-4 border-b border-white/10">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Command</h4>
            <div className="flex gap-2">
              <input
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
                placeholder="Type a command..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button 
                onClick={handleCommand}
                className="px-3 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          
          {/* Live Actions Feed */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Actions</h4>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-400">Live</span>
              </div>
            </div>
            
            <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
              {liveActions.map(action => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-gray-600">{action.timestamp.toLocaleTimeString()}</span>
                  <span className={cn(
                    action.status === 'success' ? 'text-emerald-400' :
                    action.status === 'failed' ? 'text-red-400' :
                    'text-yellow-400'
                  )}>
                    {action.status === 'success' ? '✓' : action.status === 'failed' ? '✗' : '⟳'}
                  </span>
                  <span className="text-gray-300">{action.details}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
