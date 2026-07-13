'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Upload,
  Wand2,
  RefreshCw,
  Download,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Camera,
  Palette,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const IMAGE_TYPES = [
  { id: 'lifestyle', label: 'Lifestyle', icon: '📸', description: 'Professional lifestyle photos' },
  { id: 'payment', label: 'Payment', icon: '💰', description: 'Payment screenshots' },
  { id: 'carousel', label: 'Carousel', icon: '🎠', description: 'Social media carousel backgrounds' },
  { id: 'whiteboard', label: 'Whiteboard', icon: '📋', description: 'Flowcharts and diagrams' },
  { id: 'analytics', label: 'Analytics', icon: '📊', description: 'Dashboard screenshots' }
];

export default function ImageLabPage() {
  const [selectedType, setSelectedType] = useState('lifestyle');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      setGeneratedImages(prev => [
        ...prev,
        `/media/${selectedType}/placeholder_${Date.now()}.svg`
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const getAutoPrompt = () => {
    const prompts: Record<string, string> = {
      lifestyle: 'Asian professional working on laptop in modern coffee shop, natural lighting, Canon EOS R5, 8K',
      payment: 'Smartphone showing WeChat Pay success, green checkmark, amount ¥999, blurred desk background',
      carousel: 'Minimalist gradient background, teal to purple, subtle geometric shapes, modern design',
      whiteboard: 'Hand-drawn flowchart on whiteboard, colorful markers, 3-step process, realistic shadows',
      analytics: 'Computer screen showing analytics dashboard, green upward arrow, modern UI, 8K'
    };
    return prompts[selectedType] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Image className="w-6 h-6 text-pink-400" />
            Image Lab
          </h1>
          <p className="text-sm text-gray-400 mt-1">Generate realistic images with AI</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
            <Upload className="w-4 h-4" />
            Upload Reference
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-4">
          {/* Image Type */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Image Type</h3>
            <div className="space-y-2">
              {IMAGE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    selectedType === type.id
                      ? "bg-white/10 border border-white/20"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{type.label}</div>
                    <div className="text-xs text-gray-400">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="glass-card p-5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">Prompt</h3>
              <button
                onClick={() => setPrompt(getAutoPrompt())}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Auto-fill
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all",
              !isGenerating
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/25"
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
                Generate Image
              </>
            )}
          </motion.button>
        </div>

        {/* Right Panel - Generated Images */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Generated Images</h3>
              <span className="text-sm text-gray-400">{generatedImages.length} images</span>
            </div>
            
            {generatedImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-sm text-gray-400">No images generated yet</p>
                <p className="text-xs text-gray-500 mt-1">Select a type and click Generate</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group aspect-square bg-white/5 rounded-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      {IMAGE_TYPES.find(t => t.id === selectedType)?.icon}
                    </div>
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                        <Copy className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Reference Photos */}
          <div className="glass-card p-6 rounded-xl mt-4">
            <h3 className="text-lg font-semibold text-white mb-4">Reference Photos</h3>
            
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center"
                >
                  <Camera className="w-6 h-6 text-gray-500" />
                </div>
              ))}
              <button className="w-20 h-20 rounded-xl bg-white/5 border-2 border-dashed border-cyan-500/30 flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-2xl text-cyan-400">+</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Upload 5 reference photos for face consistency (IP-Adapter)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
