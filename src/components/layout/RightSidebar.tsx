'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Send,
  Bot,
  User,
  Image,
  FileText,
  Calendar,
  BarChart3,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const activityFeed = [
  {
    id: 1,
    action: 'Posted to Twitter',
    account: 'VelocityEdge',
    time: '2 min ago',
    status: 'success',
    icon: '🐦'
  },
  {
    id: 2,
    action: 'Liked 3 posts',
    account: 'ChuangYe',
    time: '5 min ago',
    status: 'success',
    icon: '❤️'
  },
  {
    id: 3,
    action: 'Generated image',
    account: 'System',
    time: '12 min ago',
    status: 'success',
    icon: '🎨'
  },
  {
    id: 4,
    action: 'Reply queued',
    account: 'VE_Telegram',
    time: '18 min ago',
    status: 'pending',
    icon: '💬'
  },
  {
    id: 5,
    action: 'Session refreshed',
    account: 'CY_Instagram',
    time: '25 min ago',
    status: 'success',
    icon: '🔄'
  },
  {
    id: 6,
    action: 'Follow request',
    account: 'VelocityEdge',
    time: '32 min ago',
    status: 'success',
    icon: '👥'
  },
];

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function RightSidebar() {
  const [activeTab, setActiveTab] = useState<'activity' | 'assistant'>('activity');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm DAVE, your autonomous social media assistant. How can I help you today? You can ask me to:\n\n• Generate a post about any topic\n• Schedule content\n• Analyze engagement\n• Create images\n• Manage accounts",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickCommands = [
    { icon: FileText, label: 'Generate post', command: 'Generate a post about AI trends' },
    { icon: Image, label: 'Create image', command: 'Create a professional image' },
    { icon: Calendar, label: 'Schedule', command: 'Show my schedule' },
    { icon: BarChart3, label: 'Analytics', command: 'Show engagement stats' },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('generate') || lowerInput.includes('post')) {
        response = "I'll generate a post for you! Here's a draft:\n\n🚀 Just explored the latest developments in autonomous AI agents. The future of social media management is here — intelligent, adaptive, and working 24/7.\n\nKey insights:\n• AI-driven content creation\n• Human-like engagement patterns\n• Multi-platform orchestration\n\nWhat are your thoughts on AI managing social presence?\n\n#AI #SocialMedia #Automation #FutureTech\n\nWould you like me to schedule this post or create an image for it?";
      } else if (lowerInput.includes('image') || lowerInput.includes('photo')) {
        response = "I can generate images for you! Please provide:\n\n1. **Subject**: What should be in the image?\n2. **Style**: Professional, casual, lifestyle, etc.\n3. **Platform**: Twitter, Instagram, etc.\n\nOr I can auto-generate based on your latest post content. Want me to do that?";
      } else if (lowerInput.includes('schedule') || lowerInput.includes('calendar')) {
        response = "📅 **Today's Schedule:**\n\n• 2:00 PM - Twitter post (VelocityEdge)\n• 3:30 PM - Instagram story (CY_Instagram)\n• 5:00 PM - Telegram group message\n• 8:00 PM - Engagement boost session\n\n**Tomorrow:**\n• 9:00 AM - Morning motivation post\n• 12:00 PM - LinkedIn article\n• 6:00 PM - Evening recap\n\nWant to add, remove, or reschedule anything?";
      } else if (lowerInput.includes('analytic') || lowerInput.includes('stats') || lowerInput.includes('engagement')) {
        response = "📊 **Engagement Summary (Last 7 Days):**\n\n🐦 **Twitter:**\n• Impressions: 12.4K (+18%)\n• Likes: 847 (+23%)\n• Retweets: 156 (+31%)\n• Followers: +89\n\n📸 **Instagram:**\n• Reach: 8.2K\n• Saves: 234\n• Profile visits: 1.1K\n\n✈️ **Telegram:**\n• New members: +45\n• Messages: 1,247\n\nTop performing post: \"The future of autonomous AI...\" (4.2K impressions)\n\nWant me to create more content like your top posts?";
      } else {
        response = "I understand you're asking about \"" + input + "\". Let me help you with that!\n\nI can:\n• Draft content on this topic\n• Research current trends\n• Create an image\n• Schedule a post\n\nWhat would you like me to do first?";
      }

      const assistantMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="w-96 glass-card border-l border-white/10 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
              activeTab === 'activity'
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className="w-4 h-4" />
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
              activeTab === 'assistant'
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Bot className="w-4 h-4" />
            DAVE Assistant
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'activity' ? (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-4 space-y-3"
            >
              {activityFeed.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{item.action}</span>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        item.status === 'success' ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
                      )} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{item.account}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <button className="w-full flex items-center justify-center gap-2 py-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Load more
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {/* Quick Commands */}
              <div className="p-3 border-b border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  {quickCommands.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.label}
                        onClick={() => {
                          setInput(cmd.command);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Icon className="w-3 h-3" />
                        {cmd.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      message.type === 'user'
                        ? "bg-gradient-to-br from-cyan-500 to-blue-500"
                        : "bg-gradient-to-br from-purple-500 to-pink-500"
                    )}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-xl px-4 py-3",
                      message.type === 'user'
                        ? "bg-cyan-500/20 border border-cyan-500/30"
                        : "bg-white/10 border border-white/10"
                    )}>
                      <div className="text-sm text-white whitespace-pre-wrap">{message.content}</div>
                      <div className="text-[10px] text-gray-500 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                        <span className="text-sm text-gray-400">DAVE is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask DAVE anything..."
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
