'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MoreVertical,
  Edit3,
  Trash2,
  Play,
  Pause,
  Image,
  FileText
} from 'lucide-react';
import { cn, getPlatformIcon, getPlatformColor, truncateText } from '@/lib/utils';

const upcomingPosts = [
  {
    id: 1,
    platform: 'twitter',
    account: 'VelocityEdge',
    content: '🚀 The future of AI in social media is here. Autonomous agents that learn, adapt, and engage 24/7. What are your thoughts on AI managing your social presence? #AI #SocialMedia #Automation',
    scheduledAt: '2026-07-12T14:00:00',
    status: 'scheduled',
    hasImage: true
  },
  {
    id: 2,
    platform: 'instagram',
    account: 'CY_Instagram',
    content: '10 AI Tools That Will Transform Your Business in 2026 - A thread 🧵\n\nFrom content creation to customer service, AI is revolutionizing how we work.',
    scheduledAt: '2026-07-12T15:30:00',
    status: 'scheduled',
    hasImage: true
  },
  {
    id: 3,
    platform: 'telegram',
    account: 'VE_Telegram',
    content: '📊 Weekly Insights Report: AI adoption in Southeast Asian startups is up 47% this quarter. Full analysis in the channel.',
    scheduledAt: '2026-07-12T18:00:00',
    status: 'draft',
    hasImage: false
  },
  {
    id: 4,
    platform: 'twitter',
    account: 'ChuangYe',
    content: 'Just attended an incredible AI summit in Singapore. The energy and innovation here is unmatched. Key takeaways coming soon! 🇸🇬 #AISummit #Innovation',
    scheduledAt: '2026-07-13T09:00:00',
    status: 'scheduled',
    hasImage: true
  },
  {
    id: 5,
    platform: 'facebook',
    account: 'VE_Facebook',
    content: 'Excited to announce our new partnership with leading AI research labs. More details dropping tomorrow! 🤝',
    scheduledAt: '2026-07-13T12:00:00',
    status: 'pending',
    hasImage: false
  }
];

export default function UpcomingPosts() {
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20';
      case 'draft':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      case 'pending':
        return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'Overdue';
    if (diffHours < 1) return 'In <1 hour';
    if (diffHours < 24) return `In ${diffHours} hours`;
    return `In ${Math.floor(diffHours / 24)} days`;
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Upcoming Posts</h3>
          <p className="text-sm text-gray-400 mt-1">{upcomingPosts.length} posts scheduled</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-white/10 rounded-lg transition-colors">
          <Calendar className="w-4 h-4" />
          View calendar
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {upcomingPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => {
                setHoveredPost(null);
                setShowMenu(null);
              }}
              className="relative p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <div className="flex items-start gap-3">
                {/* Platform Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0",
                  "bg-white/5"
                )}>
                  {getPlatformIcon(post.platform)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-medium", getPlatformColor(post.platform))}>
                      {post.account}
                    </span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border",
                      getStatusColor(post.status)
                    )}>
                      {post.status}
                    </span>
                    {post.hasImage && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        Image
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {truncateText(post.content, 120)}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(post.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.scheduledAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <AnimatePresence>
                  {hoveredPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-1"
                    >
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <Play className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => setShowMenu(showMenu === post.id ? null : post.id)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu === post.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-4 top-full mt-1 w-40 glass-card rounded-lg shadow-xl border border-white/10 overflow-hidden z-10"
                  >
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <Edit3 className="w-4 h-4" />
                      Edit post
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <Calendar className="w-4 h-4" />
                      Reschedule
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                    <div className="border-t border-white/10" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <button className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          View all scheduled posts →
        </button>
      </div>
    </div>
  );
}
