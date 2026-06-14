import React, { useState } from 'react';
import {
  Settings,
  Key,
  Bell,
  Palette,
  Link2,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Globe,
  Mail,
  MessageSquare,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  AlertCircle,
  User,
  Building2,
  Zap
} from 'lucide-react';

const SettingSection = ({ icon: Icon, title, description, children, accent = 'indigo' }) => (
  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
    <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3`}>
      <div className={`w-8 h-8 rounded-lg bg-${accent}-50 border border-${accent}-100 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${accent}-600`} />
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

const FieldRow = ({ label, hint, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
    <div className="sm:w-48 shrink-0">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      {hint && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{hint}</p>}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const Toggle = ({ enabled, onChange, label }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
      enabled
        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
        : 'bg-slate-50 border-slate-200 text-slate-500'
    }`}
  >
    {enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
    {label || (enabled ? 'Enabled' : 'Disabled')}
  </button>
);

const SecretInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  // Brand Settings
  const [brandName, setBrandName] = useState('Urban Threads India');
  const [brandIndustry, setBrandIndustry] = useState('Fashion & Apparel');
  const [brandWebsite, setBrandWebsite] = useState('https://urbanthreads.in');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // API Keys
  const [whatsappKey, setWhatsappKey] = useState('');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [smsApiKey, setSmsApiKey] = useState('');

  // Notifications
  const [notifCampaign, setNotifCampaign] = useState(true);
  const [notifSegment, setNotifSegment] = useState(true);
  const [notifImport, setNotifImport] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [emailReports, setEmailReports] = useState(true);

  // Channels
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Privacy
  const [dataRetention, setDataRetention] = useState('365');
  const [gdprMode, setGdprMode] = useState(true);
  const [auditLog, setAuditLog] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-500" />
            App Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure your workspace, integrations, and notification preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            saved
              ? 'bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-md hover:shadow-indigo-200'
          }`}
        >
          {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Brand & Workspace */}
      <SettingSection
        icon={Building2}
        title="Brand & Workspace"
        description="Your brand identity and regional settings"
        accent="indigo"
      >
        <FieldRow label="Brand Name" hint="Displayed throughout your workspace">
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </FieldRow>
        <FieldRow label="Industry Vertical" hint="Used to personalise AI suggestions">
          <select
            value={brandIndustry}
            onChange={(e) => setBrandIndustry(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          >
            {['Fashion & Apparel', 'Electronics', 'Grocery & FMCG', 'Beauty & Skincare', 'Home & Furniture', 'Health & Fitness', 'Jewellery', 'Other'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Website URL">
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              value={brandWebsite}
              onChange={(e) => setBrandWebsite(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </FieldRow>
        <FieldRow label="Timezone" hint="Used for campaign scheduling">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          >
            {['Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </FieldRow>
      </SettingSection>

      {/* Channel API Keys */}
      <SettingSection
        icon={Key}
        title="API Keys & Channel Credentials"
        description="Securely connect your messaging channels"
        accent="violet"
      >
        <FieldRow label="WhatsApp Cloud API" hint="Meta Business Platform token">
          <SecretInput value={whatsappKey} onChange={setWhatsappKey} placeholder="EAAxxxxx..." />
        </FieldRow>
        <FieldRow label="Email API Key" hint="SendGrid / Mailchimp / SES key">
          <SecretInput value={emailApiKey} onChange={setEmailApiKey} placeholder="SG.xxxxxxxxx..." />
        </FieldRow>
        <FieldRow label="SMS / Exotel Key" hint="For transactional SMS campaigns">
          <SecretInput value={smsApiKey} onChange={setSmsApiKey} placeholder="sk_live_..." />
        </FieldRow>
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>API keys are encrypted at rest and never logged in plain text. Rotate keys periodically for best security.</span>
        </div>
      </SettingSection>

      {/* Active Channels */}
      <SettingSection
        icon={Zap}
        title="Channel Configuration"
        description="Enable or disable outreach channels for campaigns"
        accent="sky"
      >
        {[
          { label: 'WhatsApp', desc: 'Business messaging via Meta Cloud API', icon: MessageSquare, enabled: whatsappEnabled, toggle: setWhatsappEnabled, color: 'emerald' },
          { label: 'Email', desc: 'Transactional & promotional emails', icon: Mail, enabled: emailEnabled, toggle: setEmailEnabled, color: 'blue' },
          { label: 'SMS', desc: 'Text message campaigns (requires key)', icon: Smartphone, enabled: smsEnabled, toggle: setSmsEnabled, color: 'amber' },
          { label: 'Push Notifications', desc: 'Browser & mobile push (beta)', icon: Bell, enabled: pushEnabled, toggle: setPushEnabled, color: 'violet' },
        ].map(({ label, desc, icon: Icon, enabled, toggle, color }) => (
          <div key={label} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${enabled ? `bg-${color}-50/30 border-${color}-100` : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${enabled ? `bg-${color}-100` : 'bg-slate-200'}`}>
                <Icon className={`w-4 h-4 ${enabled ? `text-${color}-600` : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{label}</p>
                <p className="text-[10px] text-slate-400">{desc}</p>
              </div>
            </div>
            <Toggle enabled={enabled} onChange={toggle} />
          </div>
        ))}
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        icon={Bell}
        title="Notification Preferences"
        description="Control which in-app events trigger notifications"
        accent="amber"
      >
        {[
          { label: 'Campaign delivery reports', enabled: notifCampaign, toggle: setNotifCampaign },
          { label: 'Segment creation events', enabled: notifSegment, toggle: setNotifSegment },
          { label: 'CSV import completions', enabled: notifImport, toggle: setNotifImport },
          { label: 'Weekly digest email', enabled: notifDigest, toggle: setNotifDigest },
          { label: 'Monthly analytics report email', enabled: emailReports, toggle: setEmailReports },
        ].map(({ label, enabled, toggle }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-slate-700 font-medium">{label}</span>
            <Toggle enabled={enabled} onChange={toggle} />
          </div>
        ))}
      </SettingSection>

      {/* Privacy & Compliance */}
      <SettingSection
        icon={Shield}
        title="Privacy & Compliance"
        description="Data governance and regulatory settings"
        accent="rose"
      >
        <FieldRow label="Data Retention" hint="How long customer records are stored (days)">
          <select
            value={dataRetention}
            onChange={(e) => setDataRetention(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          >
            {[['90', '90 days'], ['180', '180 days'], ['365', '1 year (default)'], ['730', '2 years'], ['0', 'Indefinite']].map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </FieldRow>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">GDPR / DPDP Compliance Mode</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Adds consent flags and right-to-erasure workflows</p>
          </div>
          <Toggle enabled={gdprMode} onChange={setGdprMode} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Audit Log</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Track all admin actions and data exports</p>
          </div>
          <Toggle enabled={auditLog} onChange={setAuditLog} />
        </div>
      </SettingSection>

      {/* Danger Zone */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800">Reset All Demo Data</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Restore customers, segments and campaigns to initial state.</p>
          </div>
          <button
            onClick={() => alert('Demo data reset is disabled in this environment.')}
            className="px-4 py-2 border border-rose-300 text-rose-600 bg-white hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
          >
            Reset Data
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800">Export All Customer Data</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Download a full GDPR data export as CSV.</p>
          </div>
          <button
            onClick={() => alert('Full export triggered. You will receive an email with the download link.')}
            className="px-4 py-2 border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
