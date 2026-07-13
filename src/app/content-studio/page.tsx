'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Sparkles,
  Image,
  Calendar,
  Send,
  Save,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Clock,
  Hash,
  Smile,
  Type,
  Target,
  Wand2,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2
} from 'lucide-react';
import { cn, getPlatformIcon, getPlatformColor } from '@/lib/utils';

const platforms = [
  { id: 'twitter', name: 'Twitter / X', limit: 280, icon: '🐦' },
  { id: 'instagram', name: 'Instagram', limit: 2200, icon: '📸' },
  { id: 'telegram', name: 'Telegram', limit: 4096, icon: '✈️' },
  { id: 'facebook', name: 'Facebook', limit: 63206, icon: '👤' },
  { id: 'xiaohongshu', name: 'Xiaohongshu', limit: 1000, icon: '📕' },
  { id: 'linkedin', name: 'LinkedIn', limit: 3000, icon: '💼' },
];

const styles = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'casual', label: 'Casual', icon: '😊' },
  { id: 'engaging', label: 'Engaging', icon: '🔥' },
  { id: 'informative', label: 'Informative', icon: '📊' },
  { id: 'motivational', label: 'Motivational', icon: '💪' },
];

export default function ContentStudioPage() {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generateImage, setGenerateImage] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setGeneratedContent('');
    setHashtags([]);
    setImagePrompt('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate content based on topic and style
      const content = generateMockContent(topic, selectedStyle, selectedPlatform.id);
      setGeneratedContent(content.text);
      setHashtags(content.hashtags);
      setImagePrompt(content.imagePrompt);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (topic: string, style: string, platform: string) => {
    const styleOpeners: Record<string, string> = {
      professional: `As someone with over 18 years of experience in the field, I've been closely following the developments in ${topic}. Here are my key insights:`,
      casual: `Hey everyone! 👋 Been diving deep into ${topic} lately and had to share what I found. This is actually pretty cool!`,
      engaging: `🚀 ${topic} is absolutely transforming the game right now! Here's what you need to know to stay ahead of the curve:`,
      informative: `📊 New research on ${topic} reveals some surprising trends. Let me break down the key data points for you:`,
      motivational: `💪 Mastering ${topic} isn't just about knowledge—it's about mindset. Here's how to approach it like a champion:`,
    };

    const opener = styleOpeners[style] || styleOpeners.professional;
    
    const body = `
• Innovation in ${topic} is accelerating at unprecedented rates
• Early adopters are seeing 3-5x better results than competitors
• The key is to start small, measure everything, and iterate quickly
• Building a strong foundation now will pay dividends for years to come

What's your experience with ${topic}? I'd love to hear your perspective in the comments below! 👇`;

    const hashtags = [
      `#${topic.replace(/\s+/g, '')}`,
      '#Innovation',
      '#Growth',
      '#Success',
      '#Leadership',
      '#Future',
      '#Technology',
      '#AI',
    ];

    return {
      text: `${opener}\n\n${body}`,
      hashtags: hashtags.slice(0, 5),
      imagePrompt: `Professional business scene related to ${topic}, modern office, high quality, 8K photography`,
    };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = generatedContent.length;
  const charLimit = selectedPlatform.limit;
  const charPercentage = (charCount / charLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Studio</h1>
          <p className="text-sm text-gray-400 mt-1">Generate AI-powered content for your social media</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              showPreview
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Generation Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Platform Selector */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Platform</h3>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                    selectedPlatform.id === platform.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <span>{platform.icon}</span>
                  <span className="truncate">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Writing Style</h3>
            <div className="space-y-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    selectedStyle === style.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <span className="text-lg">{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Topic / Idea</h3>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should the post be about? e.g., 'AI automation in social media marketing'"
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none transition-all"
            />
          </div>

          {/* Options */}
          <div className="glass-card p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Include Hashtags</span>
              </div>
              <button className="w-10 h-6 bg-cyan-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Include Emojis</span>
              </div>
              <button className="w-10 h-6 bg-cyan-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Generate Image</span>
              </div>
              <button
                onClick={() => setGenerateImage(!generateImage)}
                className={cn(
                  "w-10 h-6 rounded-full relative transition-colors",
                  generateImage ? "bg-cyan-500" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  generateImage ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all",
              topic.trim() && !isGenerating
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25"
                : "bg-white/10 text-gray-400 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Content
              </>
            )}
          </motion.button>
        </div>

        {/* Right Panel - Generated Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Generated Content */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Generated Content</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!generatedContent}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  disabled={!generatedContent}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  Save Draft
                </button>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-spin">
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">Generating content...</p>
                <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>

                {/* Character Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {charCount} / {charLimit} characters
                    </span>
                  </div>
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        charPercentage > 90 ? "bg-red-400" : charPercentage > 70 ? "bg-yellow-400" : "bg-emerald-400"
                      )}
                      style={{ width: `${Math.min(charPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Hashtags */}
                {hashtags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Prompt */}
                {imagePrompt && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Image Prompt</h4>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400">{imagePrompt}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
                  >
                    <Send className="w-4 h-4" />
                    Post Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-sm text-gray-400">Enter a topic and click Generate</p>
                <p className="text-xs text-gray-500 mt-1">AI will create engaging content for your selected platform</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <AnimatePresence>
            {showPreview && generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                <div className="p-4 bg-white rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Your Account</div>
                      <div className="text-xs text-gray-500">@yourhandle • Just now</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap mb-4">{generatedContent}</p>
                  <div className="flex items-center gap-6 text-gray-500">
                    <button className="flex items-center gap-1 text-xs hover:text-blue-500 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      0
                    </button>
                    <button className="flex items-center gap-1 text-xs hover:text-green-500 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      0
                    </button>
                    <button className="flex items-center gap-1 text-xs hover:text-red-500 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      0
                    </button>
                    <button className="flex items-center gap-1 text-xs hover:text-blue-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
