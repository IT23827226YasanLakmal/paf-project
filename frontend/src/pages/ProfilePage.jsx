import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  User, Mail, Shield, Key, Camera, CheckCircle2,
  Pencil, Save, X, Bell, Palette, AlertTriangle,
} from 'lucide-react';

/* ── helpers ── */
const roleBadge = (role) => {
  const map = {
    USER:             { label: 'Standard User',     bg: 'bg-blue-500/10',   text: 'text-blue-500'   },
    ADMIN:            { label: 'Administrator',      bg: 'bg-red-500/10',    text: 'text-red-500'    },
    FACILITY_MANAGER: { label: 'Facility Manager',   bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    BOOKING_OFFICER:  { label: 'Booking Officer',    bg: 'bg-amber-500/10',  text: 'text-amber-500'  },
    TECHNICIAN:       { label: 'Technician',         bg: 'bg-violet-500/10',  text: 'text-violet-500' },
  };
  return map[role] || { label: role, bg: 'bg-muted-fill', text: 'text-secondary' };
};

/* ── Section card wrapper ── */
const Card = ({ title, subtitle, icon: Icon, children }) => (
  <div className="bg-surface rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
    <div className="flex items-center gap-3 px-6 py-4 bg-surface" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="w-8 h-8 bg-accent-subtle rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-accent" strokeWidth={1.8} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-6 py-5 bg-surface">{children}</div>
  </div>
);

/* ── Field row ── */
const Field = ({ label, value, editing, name, onChange, type = 'text', readOnly = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 py-3 last:border-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
    <span className="text-xs font-semibold text-muted uppercase tracking-wider w-28 flex-shrink-0">{label}</span>
    {editing && !readOnly ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 text-sm text-primary bg-raised border border-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent transition-all"
      />
    ) : (
      <span className="flex-1 text-sm text-secondary font-medium">{value || '—'}</span>
    )}
  </div>
);

/* ── Password field ── */
const PwField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 py-3 last:border-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
    <span className="text-xs font-semibold text-muted uppercase tracking-wider w-36 flex-shrink-0">{label}</span>
    <input
      type="password"
      name={name}
      value={value}
      onChange={onChange}
      placeholder="••••••••"
      className="flex-1 text-sm text-primary bg-raised border border-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent transition-all"
    />
  </div>
);

/* ── Toggle row ── */
const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 last:border-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
    <div>
      <p className="text-sm font-medium text-primary">{label}</p>
      <p className="text-xs text-muted mt-0.5">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
        checked ? 'bg-accent' : 'bg-muted-fill'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  </div>
);

/* ═══════════════════════════════════════ */
const ProfilePage = () => {
  const { user } = useAuthStore();
  const badge = roleBadge(user?.role);

  const [editing, setEditing]       = useState(false);
  const [saved, setSaved]           = useState(false);
  const [formData, setFormData]     = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwData, setPwData]         = useState({ current: '', newPw: '', confirm: '' });
  const [notifs, setNotifs]         = useState({ email: true, booking: true, alerts: false });

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwChange = (e) => setPwData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const toggleNotif = (key) => setNotifs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || '', email: user?.email || '' });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Profile Settings</h1>
          <p className="text-sm text-secondary mt-1">Manage your account information and preferences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-semibold text-emerald-500">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            Changes saved
          </div>
        )}
      </div>

      {/* ── Hero avatar card ── */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`}
              alt="Avatar"
              className="w-full h-full object-cover bg-white"
            />
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent hover-bg-accent rounded-xl flex items-center justify-center shadow-md transition-colors cursor-pointer border border-transparent">
            <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </button>
        </div>

        {/* Info */}
        <div className="text-white min-w-0">
          <h2 className="text-xl font-bold leading-tight">{user?.name}</h2>
          <p className="text-white/60 text-sm mt-0.5">{user?.email || 'No email set'}</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-white text-xs font-medium rounded-lg">
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* ── Personal info ── */}
      <Card title="Personal Information" subtitle="Update your name and contact details" icon={User}>
        <Field label="Full Name"  value={formData.name}       editing={editing} name="name"  onChange={handleChange} />
        <Field label="Email"      value={formData.email}      editing={editing} name="email" onChange={handleChange} type="email" />
        <Field label="Role"       value={badge.label}         editing={false}   readOnly />
        <Field label="Member ID"  value={`#${String(user?.id || 0).padStart(5, '0')}`} editing={false} readOnly />

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" strokeWidth={2} /> Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-raised hover:bg-muted-fill text-secondary text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-raised hover:bg-muted-fill text-secondary hover:text-primary text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Edit Profile
            </button>
          )}
        </div>
      </Card>

      {/* ── Password ── */}
      <Card title="Change Password" subtitle="Keep your account secure with a strong password" icon={Key}>
        <PwField label="Current Password" name="current" value={pwData.current} onChange={handlePwChange} />
        <PwField label="New Password"     name="newPw"   value={pwData.newPw}   onChange={handlePwChange} />
        <PwField label="Confirm New"      name="confirm" value={pwData.confirm}  onChange={handlePwChange} />

        <div className="mt-5 pt-4 flex items-center gap-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            disabled={!pwData.current || !pwData.newPw || pwData.newPw !== pwData.confirm}
          >
            <Shield className="w-3.5 h-3.5" strokeWidth={2} /> Update Password
          </button>
          {pwData.newPw && pwData.confirm && pwData.newPw !== pwData.confirm && (
            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} /> Passwords don't match
            </span>
          )}
        </div>
      </Card>

    </div>
  );
};

export default ProfilePage;
