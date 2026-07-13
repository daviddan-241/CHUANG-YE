'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  Shield,
  Clock,
  Zap,
  Bell,
  Database,
  Key,
  Sliders,
  Save,
  RefreshCw,
  User,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General
    autoPostEnabled: true,
    autoReplyEnabled: true,
    engagementBoostEnabled: true,
    dryRunMode: false,
    
    // Posting Limits
    maxPostsPerDay: 3,
    minHoursBetweenPosts: 4,
    maxAutoRepliesPerDay: 50,
    maxEngagementsPerDay: 100,
    
    // Proxy
    proxyEnabled: false,
    proxyUrl: '',
    proxyUsername: '',
    proxyPassword: '',
    
    // Persona
    activePersona: 'ChuangYe',
    
    // Notifications
    telegramAlertsEnabled: true,
    telegramChatId: '',
    emailAlertsEnabled: false,
    emailAddress: '',
    
    // API Keys
    openaiApiKey: '',
    comfyuiUrl: 'http://localhost:8188',
    
    // Appearance
    theme: 'dark',
    accentColor: 'cyan'
  });

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('dave-settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'limits', label: 'Posting Limits', icon: Sliders },
    { id: 'proxy', label: 'Proxy', icon: Globe },
    { id: 'persona', label: 'Persona', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Configure DAVE's behavior and preferences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="glass-card p-4 rounded-xl">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 glass-card p-6 rounded-xl">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">General Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Auto-Post</div>
                    <div className="text-xs text-gray-400">Automatically publish scheduled posts</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, autoPostEnabled: !s.autoPostEnabled }))}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.autoPostEnabled ? "bg-cyan-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      settings.autoPostEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Auto-Reply</div>
                    <div className="text-xs text-gray-400">Automatically respond to DMs</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, autoReplyEnabled: !s.autoReplyEnabled }))}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.autoReplyEnabled ? "bg-cyan-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      settings.autoReplyEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Engagement Boost</div>
                    <div className="text-xs text-gray-400">Automatically like, comment, and follow</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, engagementBoostEnabled: !s.engagementBoostEnabled }))}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.engagementBoostEnabled ? "bg-cyan-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      settings.engagementBoostEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Dry Run Mode</div>
                    <div className="text-xs text-gray-400">Preview actions without actually posting</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, dryRunMode: !s.dryRunMode }))}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.dryRunMode ? "bg-yellow-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      settings.dryRunMode ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posting Limits */}
          {activeTab === 'limits' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Posting Limits</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Max Posts Per Day (per platform)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.maxPostsPerDay}
                      onChange={(e) => setSettings(s => ({ ...s, maxPostsPerDay: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-white font-mono w-8 text-center">{settings.maxPostsPerDay}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Minimum Hours Between Posts
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={settings.minHoursBetweenPosts}
                      onChange={(e) => setSettings(s => ({ ...s, minHoursBetweenPosts: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-white font-mono w-8 text-center">{settings.minHoursBetweenPosts}h</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Max Auto-Replies Per Day
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={settings.maxAutoRepliesPerDay}
                      onChange={(e) => setSettings(s => ({ ...s, maxAutoRepliesPerDay: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-white font-mono w-12 text-center">{settings.maxAutoRepliesPerDay}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Max Engagements Per Day
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="50"
                      value={settings.maxEngagementsPerDay}
                      onChange={(e) => setSettings(s => ({ ...s, maxEngagementsPerDay: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-white font-mono w-12 text-center">{settings.maxEngagementsPerDay}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Proxy Settings */}
          {activeTab === 'proxy' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Proxy Settings</h2>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg mb-4">
                <div>
                  <div className="text-sm font-medium text-white">Enable Proxy</div>
                  <div className="text-xs text-gray-400">Route all traffic through proxy</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, proxyEnabled: !s.proxyEnabled }))}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    settings.proxyEnabled ? "bg-cyan-500" : "bg-white/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    settings.proxyEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              {settings.proxyEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Proxy URL (HTTP/SOCKS5)
                    </label>
                    <input
                      type="text"
                      value={settings.proxyUrl}
                      onChange={(e) => setSettings(s => ({ ...s, proxyUrl: e.target.value }))}
                      placeholder="http://proxy:port or socks5://proxy:port"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Username (optional)
                      </label>
                      <input
                        type="text"
                        value={settings.proxyUsername}
                        onChange={(e) => setSettings(s => ({ ...s, proxyUsername: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Password (optional)
                      </label>
                      <input
                        type="password"
                        value={settings.proxyPassword}
                        onChange={(e) => setSettings(s => ({ ...s, proxyPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Persona Settings */}
          {activeTab === 'persona' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Persona Selector</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSettings(s => ({ ...s, activePersona: 'ChuangYe' }))}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-left",
                    settings.activePersona === 'ChuangYe'
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="text-2xl mb-3">👔</div>
                  <h3 className="text-lg font-semibold text-white mb-2">ChuangYe (创业)</h3>
                  <p className="text-sm text-gray-400">
                    Professional strategist, data-driven, calm, authoritative. 
                    MBA INSEAD, 18+ years experience.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Professional', 'Data-driven', 'Strategic'].map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                <button
                  onClick={() => setSettings(s => ({ ...s, activePersona: 'VelocityEdge' }))}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-left",
                    settings.activePersona === 'VelocityEdge'
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="text-2xl mb-3">⚡</div>
                  <h3 className="text-lg font-semibold text-white mb-2">VelocityEdge</h3>
                  <p className="text-sm text-gray-400">
                    Energetic, motivational, direct. 
                    Aggressive growth hacker, hustle culture advocate.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Energetic', 'Motivational', 'Aggressive'].map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Telegram Alerts</div>
                    <div className="text-xs text-gray-400">Receive alerts via Telegram bot</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, telegramAlertsEnabled: !s.telegramAlertsEnabled }))}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.telegramAlertsEnabled ? "bg-cyan-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      settings.telegramAlertsEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                {settings.telegramAlertsEnabled && (
                  <div className="pl-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Telegram Chat ID
                    </label>
                    <input
                      type="text"
                      value={settings.telegramChatId}
                      onChange={(e) => setSettings(s => ({ ...s, telegramChatId: e.target.value }))}
                      placeholder="Your Telegram chat ID"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Email Alerts</div>
                    <div className="text-xs text-gray-400">Receive alerts via email</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, emailAlertsEnabled: !s.emailAlertsEnabled }))}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.emailAlertsEnabled ? "bg-cyan-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      settings.emailAlertsEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">API Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    OpenAI API Key (optional)
                  </label>
                  <input
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings(s => ({ ...s, openaiApiKey: e.target.value }))}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for AI content generation (optional)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    ComfyUI URL
                  </label>
                  <input
                    type="text"
                    value={settings.comfyuiUrl}
                    onChange={(e) => setSettings(s => ({ ...s, comfyuiUrl: e.target.value }))}
                    placeholder="http://localhost:8188"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Local ComfyUI server for image generation</p>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    {['cyan', 'purple', 'emerald', 'pink', 'orange'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(s => ({ ...s, accentColor: color }))}
                        className={cn(
                          "w-10 h-10 rounded-lg transition-all",
                          `bg-${color}-500`,
                          settings.accentColor === color && "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
