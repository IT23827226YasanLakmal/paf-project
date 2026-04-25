import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  User, Shield, Bell, Palette, Settings, Building,
  Key, Check, ArrowRight, Lock, Laptop, Globe,
  HelpCircle, Sparkles, Sliders
} from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);

  const isAdmin = ['ADMIN', 'FACILITY_MANAGER'].includes(user?.role);

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  if (isAdmin) {
    tabs.push({ id: 'campus', label: 'Campus Rules', icon: Building });
  }

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Language</label>
                <select className="w-full text-sm text-primary bg-raised border border-subtle rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent">
                  <option className="bg-surface text-primary">English (US)</option>
                  <option className="bg-surface text-primary">English (UK)</option>
                  <option className="bg-surface text-primary">Spanish</option>
                  <option className="bg-surface text-primary">Sinhala</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Timezone</label>
                <select className="w-full text-sm text-primary bg-raised border border-subtle rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent">
                  <option className="bg-surface text-primary">GMT +05:30 (Sri Lanka)</option>
                  <option className="bg-surface text-primary">UTC +00:00</option>
                  <option className="bg-surface text-primary">EST (New York)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Organization / Campus</label>
              <input type="text" value="Main University Campus" disabled className="w-full text-sm text-secondary bg-muted-fill border border-subtle rounded-xl px-3 py-2.5 cursor-not-allowed" />
            </div>

            <div className="flex items-center justify-end mt-4">
              <button onClick={handleSave} className="px-4 py-2 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer">
                Save Preferences
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>Security & Authentication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-raised rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <Lock className="text-muted w-5 h-5" />
                  <div>
                    <h4 className="text-sm font-semibold text-primary">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-muted">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-accent hover:underline cursor-pointer">Enable</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-raised rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <Key className="text-muted w-5 h-5" />
                  <div>
                    <h4 className="text-sm font-semibold text-primary">Password Update</h4>
                    <p className="text-xs text-muted">Last changed: 30 days ago</p>
                  </div>
                </div>
                <button onClick={() => window.location.href='/app/profile'} className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer">
                  Change <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>Platform Notifications</h3>
            <div className="space-y-3">
              {[
                { label: 'Booking confirmations', desc: 'Notify me when an admin approves or rejects my request.' },
                { label: 'Upcoming reservation alerts', desc: 'Notify me 1 hour before a reservation starts.' },
                { label: 'Maintenance windows', desc: 'Notify me when university assets go out of order.' }
              ].map((item, index) => (
                <div key={index} className="flex items-start justify-between py-2 last:border-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <h4 className="text-sm font-medium text-primary">{item.label}</h4>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-accent border-subtle focus:ring-accent bg-raised cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>Appearance Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => { if(darkMode) toggleDarkMode(); }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${!darkMode ? 'border-accent bg-accent-subtle' : 'border-subtle bg-surface hover:border-muted'}`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="text-muted w-5 h-5" />
                  <span className="text-sm font-semibold text-primary">Light Mode</span>
                </div>
                {!darkMode && <Check className="w-4 h-4 text-accent" />}
              </button>

              <button
                onClick={() => { if(!darkMode) toggleDarkMode(); }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${darkMode ? 'border-accent bg-accent-subtle' : 'border-subtle bg-surface hover:border-muted'}`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="text-muted w-5 h-5" />
                  <span className="text-sm font-semibold text-primary">Dark Mode</span>
                </div>
                {darkMode && <Check className="w-4 h-4 text-accent" />}
              </button>
            </div>
          </div>
        );

      case 'campus':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>Campus Administration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Max Booking Duration (Hours)</label>
                <input type="number" defaultValue={4} className="text-sm text-primary bg-raised border border-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Advance Booking Limit (Days)</label>
                <input type="number" defaultValue={30} className="text-sm text-primary bg-raised border border-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleSave} className="px-4 py-2 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl shadow-sm cursor-pointer">
                Save Campus Policies
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2.5">
            <Settings className="w-8 h-8 text-accent animate-pulse" />
            System Settings
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">{user?.role}</span>
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-semibold text-emerald-500 animate-fade-in">
          <Check className="w-4 h-4" strokeWidth={2} />
          Settings saved successfully.
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]" style={{ border: '1px solid var(--border-subtle)' }}>
        {/* Tabs sidebar */}
        <div className="w-full md:w-56 bg-raised p-3 space-y-1" style={{ borderRight: '1px solid var(--border-subtle)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left
                  ${activeTab === tab.id
                    ? 'bg-accent-subtle text-accent'
                    : 'text-muted hover:text-primary hover:bg-raised'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6 bg-surface">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
