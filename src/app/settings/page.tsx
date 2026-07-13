'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Sliders, Globe, User, Bell, Key, Palette,
  Save, Phone, MessageSquare, CheckCircle2, Loader2,
  AlertCircle, Send, Bot, Zap, ExternalLink, Shield,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    headless: true,
    dailyPostLimit: 10,
    minDelay: 30,
    maxDelay: 120,
    workingHours: '08:00-22:00',
    timezone: 'Asia/Shanghai',
    proxyEnabled: false,
    proxyUrl: '',
    proxyUsername: '',
    proxyPassword: '',
    personaName: 'ChuangYe',
    personaBio: 'Entrepreneur | Passive Income | AI Automation',
    notifyOnPost: true,
    notifyOnError: true,
    groqApiKey: '',
    openaiApiKey: '',
    comfyuiUrl: '',
    theme: 'dark',
    accentColor: 'cyan',
  });

  // Telegram real-user auth state
  const [tgApiId, setTgApiId] = useState('');
  const [tgApiHash, setTgApiHash] = useState('');
  const [tgPhone, setTgPhone] = useState('');
  const [tgCode, setTgCode] = useState('');
  const [tg2fa, setTg2fa] = useState('');
  const [tgBrandId, setTgBrandId] = useState('brandA');
  const [tgStep, setTgStep] = useState<'idle' | 'code_sent' | 'authenticated' | 'loading'>('idle');
  const [tgError, setTgError] = useState('');
  const [tgConnected, setTgConnected] = useState(false);

  // Groq test state
  const [groqTesting, setGroqTesting] = useState(false);
  const [groqStatus, setGroqStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem('dave-settings');
    if (saved) {
      try { setSettings(prev => ({ ...prev, ...JSON.parse(saved) })); } catch (_) {}
    }
    // Check Telegram connection status
    checkTelegramStatus();
  }, []);

  async function checkTelegramStatus() {
    try {
      const res = await fetch(`/api/telegram/auth/status?brandId=${tgBrandId}`);
      const data = await res.json();
      setTgConnected(data.connected);
      if (data.step === 'code_sent') setTgStep('code_sent');
      if (data.connected) setTgStep('authenticated');
    } catch (_) {}
  }

  async function sendTelegramCode() {
    setTgError('');
    if (!tgPhone) { setTgError('Enter your phone number (international format, e.g. +8613800138000)'); return; }
    setTgStep('loading');
    try {
      const res = await fetch('/api/telegram/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: tgBrandId, phone: tgPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setTgStep('code_sent');
    } catch (err: any) {
      setTgError(err.message);
      setTgStep('idle');
    }
  }

  async function verifyTelegramCode() {
    setTgError('');
    if (!tgCode) { setTgError('Enter the code from Telegram'); return; }
    setTgStep('loading');
    try {
      const res = await fetch('/api/telegram/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: tgBrandId, code: tgCode, password: tg2fa || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      setTgStep('authenticated');
      setTgConnected(true);
    } catch (err: any) {
      setTgError(err.message);
      setTgStep('code_sent');
    }
  }

  async function testGroqConnection() {
    if (!settings.groqApiKey) { setGroqStatus('error'); return; }
    setGroqTesting(true);
    setGroqStatus('idle');
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'passive income test', platform: 'twitter', length: 'short' }),
      });
      setGroqStatus(res.ok ? 'ok' : 'error');
    } catch (_) {
      setGroqStatus('error');
    } finally {
      setGroqTesting(false);
    }
  }

  function handleSave() {
    localStorage.setItem('dave-settings', JSON.stringify(settings));
    alert('✅ Settings saved!');
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'telegram', label: 'Telegram Login', icon: MessageSquare },
    { id: 'ai', label: 'AI / Keys', icon: Zap },
    { id: 'limits', label: 'Posting Limits', icon: Sliders },
    { id: 'proxy', label: 'Proxy', icon: Globe },
    { id: 'persona', label: 'Persona', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Configure DAVE's behaviour and integrations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium"
        >
          <Save className="w-4 h-4" />Save Settings
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="glass-card p-4 rounded-xl">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'telegram' && tgConnected && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 glass-card p-6 rounded-xl">

          {/* ── TELEGRAM LOGIN ── */}
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  Telegram Real User Login
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Log in with your phone number — works exactly like the Telegram app.
                  DAVE can then post to groups, reply to DMs, and manage channels.
                </p>
              </div>

              {/* Step 0 — API Credentials */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                  <Key className="w-4 h-4" />Step 1 — Telegram API Credentials
                </h3>
                <p className="text-xs text-gray-400">
                  Get free API credentials from{' '}
                  <a href="https://my.telegram.org/apps" target="_blank" rel="noreferrer"
                    className="text-cyan-400 underline inline-flex items-center gap-1">
                    my.telegram.org <ExternalLink className="w-3 h-3" />
                  </a>
                  {' '}→ API development tools → Create application
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">App api_id</label>
                    <input
                      type="text" value={tgApiId} onChange={e => setTgApiId(e.target.value)}
                      placeholder="12345678"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">App api_hash</label>
                    <input
                      type="password" value={tgApiHash} onChange={e => setTgApiHash(e.target.value)}
                      placeholder="abc123def456..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
                <p className="text-xs text-yellow-400/80 flex items-start gap-1">
                  <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Set these as TELEGRAM_API_ID and TELEGRAM_API_HASH in your Render environment variables.
                </p>
              </div>

              {/* Brand selector */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Which brand account?</label>
                <select
                  value={tgBrandId}
                  onChange={e => setTgBrandId(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="brandA">ChuangYe</option>
                  <option value="brandB">VelocityEdge</option>
                </select>
              </div>

              {/* Auth flow */}
              {tgStep === 'authenticated' || tgConnected ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-300">Telegram Connected ✓</p>
                    <p className="text-xs text-gray-400 mt-0.5">DAVE is logged in and can post, reply to DMs, and manage groups.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 2 — Phone Number */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />Step 2 — Your Phone Number
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="tel" value={tgPhone}
                        onChange={e => setTgPhone(e.target.value)}
                        placeholder="+8613800138000"
                        disabled={tgStep === 'code_sent'}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                      />
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={sendTelegramCode}
                        disabled={tgStep === 'loading' || tgStep === 'code_sent'}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tgStep === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Code
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Include country code, e.g. +86 for China, +1 for US
                    </p>
                  </div>

                  {/* Step 3 — Verification Code */}
                  {(tgStep === 'code_sent' || tgStep === 'loading') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Bot className="w-4 h-4 text-cyan-400" />Step 3 — Enter Code from Telegram
                      </h3>
                      <p className="text-xs text-gray-400">Telegram sent a code to your phone or another Telegram device.</p>
                      <input
                        type="text" value={tgCode}
                        onChange={e => setTgCode(e.target.value)}
                        placeholder="12345"
                        maxLength={6}
                        className="w-40 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xl tracking-widest text-center focus:outline-none focus:border-cyan-500/50"
                      />
                      {/* Optional 2FA */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">2FA Password (if enabled)</label>
                        <input
                          type="password" value={tg2fa}
                          onChange={e => setTg2fa(e.target.value)}
                          placeholder="Leave empty if no 2FA"
                          className="w-full max-w-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={verifyTelegramCode}
                        disabled={tgStep === 'loading' || !tgCode}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tgStep === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Verify & Connect
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}

              {tgError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {tgError}
                </div>
              )}
            </div>
          )}

          {/* ── AI / KEYS ── */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />AI Configuration
                </h2>
                <p className="text-sm text-gray-400 mt-1">DAVE uses Groq for free AI generation — no cost at all.</p>
              </div>

              {/* Groq (free) */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-green-300 flex items-center gap-2">
                      <Zap className="w-4 h-4" />Groq AI — FREE ✓
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Uses llama-3.3-70b-versatile. Get a free key at{' '}
                      <a href="https://console.groq.com" target="_blank" rel="noreferrer"
                        className="text-cyan-400 underline">console.groq.com</a>
                    </p>
                  </div>
                  {groqStatus === 'ok' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  {groqStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                </div>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={settings.groqApiKey}
                    onChange={e => setSettings(s => ({ ...s, groqApiKey: e.target.value }))}
                    placeholder="gsk_..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={testGroqConnection}
                    disabled={groqTesting || !settings.groqApiKey}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg text-sm hover:bg-green-500/30 disabled:opacity-50"
                  >
                    {groqTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test'}
                  </motion.button>
                </div>
                <p className="text-xs text-yellow-400/80 flex items-start gap-1">
                  <Shield className="w-3 h-3 mt-0.5" />
                  Set GROQ_API_KEY in your Render env vars — never paste keys in code.
                </p>
              </div>

              {/* OpenAI (optional) */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">OpenAI (optional, paid)</h3>
                <p className="text-xs text-gray-400">Only needed if you want GPT-4 quality over Groq's free llama-3.</p>
                <input
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={e => setSettings(s => ({ ...s, openaiApiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* ComfyUI */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">ComfyUI / Stable Diffusion (optional)</h3>
                <p className="text-xs text-gray-400">Local image generation server URL.</p>
                <input
                  type="text"
                  value={settings.comfyuiUrl}
                  onChange={e => setSettings(s => ({ ...s, comfyuiUrl: e.target.value }))}
                  placeholder="http://localhost:8188"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          )}

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />General Settings
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Timezone', key: 'timezone', placeholder: 'Asia/Shanghai' },
                  { label: 'Working Hours', key: 'workingHours', placeholder: '08:00-22:00' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                    <input
                      type="text"
                      value={(settings as any)[field.key]}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setSettings(s => ({ ...s, headless: !s.headless }))}
                  className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${settings.headless ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.headless ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
                <div>
                  <p className="text-sm text-white">Headless Browser Mode</p>
                  <p className="text-xs text-gray-400">On = invisible browser (recommended for servers)</p>
                </div>
              </div>
            </div>
          )}

          {/* ── POSTING LIMITS ── */}
          {activeTab === 'limits' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />Posting Limits
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Daily Post Limit', key: 'dailyPostLimit' },
                  { label: 'Min Delay (sec)', key: 'minDelay' },
                  { label: 'Max Delay (sec)', key: 'maxDelay' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                    <input
                      type="number"
                      value={(settings as any)[field.key]}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: parseInt(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROXY ── */}
          {activeTab === 'proxy' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />Proxy Settings
              </h2>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setSettings(s => ({ ...s, proxyEnabled: !s.proxyEnabled }))}
                  className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${settings.proxyEnabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.proxyEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
                <p className="text-sm text-white">Enable Proxy</p>
              </div>
              {settings.proxyEnabled && (
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Proxy URL', key: 'proxyUrl', placeholder: 'http://proxy:8080' },
                    { label: 'Username', key: 'proxyUsername', placeholder: 'Optional' },
                    { label: 'Password', key: 'proxyPassword', placeholder: 'Optional', type: 'password' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={(settings as any)[field.key]}
                        onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PERSONA ── */}
          {activeTab === 'persona' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />Persona Settings
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Persona Name', key: 'personaName', placeholder: 'ChuangYe' },
                  { label: 'Bio / Tagline', key: 'personaBio', placeholder: 'Entrepreneur | Passive Income | AI' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                    <input
                      type="text"
                      value={(settings as any)[field.key]}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />Notifications
              </h2>
              {[
                { label: 'Notify on successful post', key: 'notifyOnPost' },
                { label: 'Notify on errors', key: 'notifyOnError' },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <div
                    onClick={() => setSettings(s => ({ ...s, [item.key]: !(s as any)[item.key] }))}
                    className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${(settings as any)[item.key] ? 'bg-cyan-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${(settings as any)[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </div>
                  <p className="text-sm text-white">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-400" />Appearance
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Accent Color</label>
                <div className="flex gap-3">
                  {['cyan', 'blue', 'purple', 'green', 'orange'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSettings(s => ({ ...s, accentColor: color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${settings.accentColor === color ? 'scale-125 border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: { cyan: '#06b6d4', blue: '#3b82f6', purple: '#8b5cf6', green: '#22c55e', orange: '#f97316' }[color] }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
