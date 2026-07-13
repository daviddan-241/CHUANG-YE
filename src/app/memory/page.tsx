'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Search,
  Tag,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryItem {
  id: string;
  category: string;
  key: string;
  value: string;
  context?: string;
  createdAt: Date;
}

const SAMPLE_MEMORY: MemoryItem[] = [
  {
    id: '1',
    category: 'style',
    key: 'Writing Tone',
    value: 'Professional, data-driven, authoritative. Use numbers and statistics.',
    context: 'Learned from 50+ posts',
    createdAt: new Date()
  },
  {
    id: '2',
    category: 'style',
    key: 'Emoji Usage',
    value: 'Max 3 emojis per post. Prefer: 🚀 💰 📈 🔥 💡',
    context: 'Based on engagement analysis',
    createdAt: new Date()
  },
  {
    id: '3',
    category: 'topics',
    key: 'Best Performing Topics',
    value: 'AI automation, passive income, cross-border ecommerce, remote work',
    context: 'Top 4 topics by engagement',
    createdAt: new Date()
  },
  {
    id: '4',
    category: 'avoid',
    key: 'Topics to Avoid',
    value: 'Politics, religion, controversial social issues, competitor bashing',
    context: 'Risk management',
    createdAt: new Date()
  },
  {
    id: '5',
    category: 'preferences',
    key: 'CTA Style',
    value: 'Use action-oriented CTAs: "DM \'1\'", "Comment \'START\'", "Link in bio"',
    context: 'Highest conversion rate',
    createdAt: new Date()
  },
  {
    id: '6',
    category: 'preferences',
    key: 'Posting Times',
    value: 'Twitter: 8AM, 12PM, 6PM EST\nInstagram: 7AM, 11AM, 7PM EST\nRED: 9AM, 1PM, 8PM CST',
    context: 'Optimal engagement windows',
    createdAt: new Date()
  }
];

export default function MemoryPage() {
  const [memory, setMemory] = useState<MemoryItem[]>(SAMPLE_MEMORY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemory, setNewMemory] = useState({ category: 'style', key: '', value: '', context: '' });

  const categories = ['all', 'style', 'topics', 'avoid', 'preferences'];

  const filteredMemory = memory.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.key.toLowerCase().includes(query) || item.value.toLowerCase().includes(query);
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'style': return '✍️';
      case 'topics': return '📋';
      case 'avoid': return '⚠️';
      case 'preferences': return '⚙️';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'style': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'topics': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'avoid': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'preferences': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleSave = (id: string) => {
    setEditingId(null);
    // Save to API/localStorage
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this memory item?')) {
      setMemory(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleAdd = () => {
    const item: MemoryItem = {
      id: Date.now().toString(),
      ...newMemory,
      createdAt: new Date()
    };
    setMemory(prev => [...prev, item]);
    setShowAddModal(false);
    setNewMemory({ category: 'style', key: '', value: '', context: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Memory
          </h1>
          <p className="text-sm text-gray-400 mt-1">DAVE's learned preferences and patterns</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.filter(c => c !== 'all').map(category => {
          const count = memory.filter(m => m.category === category).length;
          return (
            <div
              key={category}
              className={cn("glass-card p-4 rounded-xl border", getCategoryColor(category))}
            >
              <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
              <div className="text-lg font-bold text-white">{count}</div>
              <div className="text-xs text-gray-400 capitalize">{category}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memory..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                  selectedCategory === category
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory List */}
      <div className="space-y-4">
        {filteredMemory.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 rounded-xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getCategoryIcon(item.category)}</span>
                <div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] border",
                    getCategoryColor(item.category)
                  )}>
                    {item.category}
                  </span>
                  <h3 className="text-sm font-medium text-white mt-1">{item.key}</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {editingId === item.id ? (
                  <>
                    <button
                      onClick={() => handleSave(item.id)}
                      className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {editingId === item.id ? (
              <textarea
                defaultValue={item.value}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.value}</p>
            )}
            
            {item.context && (
              <div className="mt-3 text-xs text-gray-500">
                💡 {item.context}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card w-full max-w-md rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Add Memory</h2>
              <p className="text-sm text-gray-400 mt-1">Teach DAVE something new</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <select
                  value={newMemory.category}
                  onChange={e => setNewMemory(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="style">Style</option>
                  <option value="topics">Topics</option>
                  <option value="avoid">Avoid</option>
                  <option value="preferences">Preferences</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Key</label>
                <input
                  type="text"
                  value={newMemory.key}
                  onChange={e => setNewMemory(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., Writing Tone"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Value</label>
                <textarea
                  value={newMemory.value}
                  onChange={e => setNewMemory(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter the memory content..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Context (optional)</label>
                <input
                  type="text"
                  value={newMemory.context}
                  onChange={e => setNewMemory(prev => ({ ...prev, context: e.target.value }))}
                  placeholder="e.g., Based on engagement data"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={handleAdd}
                disabled={!newMemory.key || !newMemory.value}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Add Memory
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
