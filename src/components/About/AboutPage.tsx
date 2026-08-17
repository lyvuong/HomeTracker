import React from 'react';
import {
  Home,
  Code2,
  Cpu,
  ShieldCheck,
  Sparkles,
  GitBranch,
  Globe,
  Zap,
  CheckCircle2,
  Users,
  Clock,
  Database,
  ExternalLink
} from 'lucide-react';

interface AboutPageProps {
  onOpenSettings?: () => void;
  theme?: 'light' | 'dark';
}

export const AboutPage: React.FC<AboutPageProps> = ({
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const currentYear = new Date().getFullYear();

  const TECH_STACK = [
    { name: 'React 19', category: 'UI Framework', desc: 'Concurrent Rendering & Modern Hooks' },
    { name: 'Vite 8', category: 'Build Tooling', desc: 'Lightning-fast ESM Bundler & HMR' },
    { name: 'TypeScript 6', category: 'Language', desc: 'Strict End-to-End Type Safety' },
    { name: 'Tailwind CSS 4', category: 'Styling Engine', desc: 'Glassmorphic Adaptive Theme System' },
    { name: 'Cloudflare Pages', category: 'Hosting Platform', desc: 'Global Edge Network Deployment' },
    { name: 'Firebase Cloud', category: 'Sync Engine', desc: 'Firestore & Realtime Database' },
  ];

  const KEY_FEATURES = [
    {
      icon: Home,
      color: isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      title: 'Multi-Home Portfolio',
      desc: 'Track addresses, property types, square footage, and purchase dates for all family homes.'
    },
    {
      icon: Clock,
      color: isDark ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-700 bg-indigo-50 border-indigo-200',
      title: 'Maintenance History & Receipts',
      desc: 'Log maintenance, repairs, upgrades, and inspections with detailed cost breakdowns and contractors.'
    },
    {
      icon: Zap,
      color: isDark ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-200',
      title: 'Predictive Reminders',
      desc: 'Set date-based and repeat-interval service alerts so you never miss seasonal home maintenance.'
    },
    {
      icon: Users,
      color: isDark ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-purple-700 bg-purple-50 border-purple-200',
      title: 'Shared Household Sync',
      desc: 'Synchronize maintenance records across spouses and family members in real-time using custom Household Sync Codes — the same codes used in CarTracker.'
    },
    {
      icon: Database,
      color: isDark ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-cyan-700 bg-cyan-50 border-cyan-200',
      title: '100% Data Portability',
      desc: 'Export complete CSV maintenance logs for tax or resale, and backup/restore full JSON app states at any time.'
    },
    {
      icon: ShieldCheck,
      color: isDark ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-rose-700 bg-rose-50 border-rose-200',
      title: 'Offline-First Architecture',
      desc: 'Fully functional without an internet connection using local storage with automatic cloud sync on reconnect.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

      {/* Hero Brand Banner */}
      <div className={`relative overflow-hidden p-8 sm:p-10 rounded-3xl border shadow-2xl text-center sm:text-left ${
        isDark
          ? 'glass-panel border-emerald-500/20 shadow-emerald-950/30'
          : 'bg-gradient-to-br from-slate-900 to-emerald-950 text-white border-slate-800'
      }`}>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md font-mono">
                Official Release
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                v1.0.0 Stable
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight flex items-center justify-center sm:justify-start gap-3">
              <Home className="w-9 h-9 text-emerald-400" />
              <span>HomeTracker PWA</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              A modern Progressive Web Application for home maintenance lifecycle tracking, repair logging, expense analytics, and shared household management.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl text-center">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">Environment</span>
              <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5 justify-center mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cloudflare Edge
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Profile Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl border ${
            isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
          }`}>
            <Code2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Developer Information</h2>
        </div>

        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-5 ${
          isDark ? 'bg-slate-900/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-purple-600 p-1 shadow-lg shadow-emerald-500/20">
              <img
                src="/avatar.png"
                alt="Ly Vuong"
                className="w-full h-full rounded-[12px] object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center border-2 border-slate-950" title="Active Developer">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Ly Vuong</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Creator & Lead Engineer</p>
              </div>

              <a
                href="https://github.com/lyvuong/HomeTracker"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all self-center sm:self-auto ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                }`}
              >
                <GitBranch className="w-4 h-4 text-emerald-500" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Engineered with a focus on privacy, rapid performance, and intuitive user experience. Built as a companion app to CarTracker, sharing the same household model and cost ledger for a unified family expense picture.
            </p>
          </div>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl border ${
            isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Key Capabilities & Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KEY_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="glass-card p-5 rounded-3xl space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture & Tech Stack Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl border ${
            isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200'
          }`}>
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Technology Stack</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TECH_STACK.map((tech, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-1 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.name}</span>
                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                  isDark ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60' : 'text-emerald-700 bg-emerald-100 border-emerald-200'
                }`}>
                  {tech.category}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Copyright */}
      <div className="glass-panel p-6 rounded-3xl text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>HomeTracker Progressive Web Application</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          © {currentYear} Ly Vuong. All rights reserved. Open source under MIT license.
        </p>
      </div>

    </div>
  );
};

export default AboutPage;
