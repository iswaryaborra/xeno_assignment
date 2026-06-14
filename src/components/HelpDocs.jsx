import React, { useState } from 'react';
import {
  HelpCircle,
  Book,
  Zap,
  Upload,
  Users,
  Send,
  BarChart3,
  Layers,
  Bot,
  ChevronRight,
  ExternalLink,
  FileText,
  Search,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  PlayCircle,
  Terminal,
  Star
} from 'lucide-react';

const FAQS = [
  {
    q: 'How do I import customers from a CSV file?',
    a: 'Go to the Customers tab and click "Import CSV" button in the top-right. Upload any .csv file with columns: Name, Email, Phone, City, and Spend. The system will automatically parse and add those records to your directory.'
  },
  {
    q: 'How does segment building work?',
    a: 'In the Segments tab, click "Build Segment". You can add filters like city, spend range, tags, or last purchase date. Combine multiple conditions with AND/OR logic. The AI builder can also auto-suggest rules from plain English prompts.'
  },
  {
    q: 'How do I create and send a campaign?',
    a: 'Open the Campaigns tab and click "New Campaign". Follow the 3-step wizard: choose a segment, pick a channel (WhatsApp / Email / SMS), write your message using AI suggestions, and hit Launch.'
  },
  {
    q: 'What does the AI Assistant do?',
    a: 'The AI Chat Widget (bottom-right bubble) lets you describe what you want in plain English. You can say "Create a segment of VIP Mumbai customers" and the AI will set up the segment builder for you automatically.'
  },
  {
    q: 'Where do I connect my WhatsApp / Email API keys?',
    a: 'Go to Settings → API Keys & Channel Credentials and paste in your WhatsApp Cloud API token, Email provider key (SendGrid, etc.), or SMS key. All keys are encrypted at rest.'
  },
  {
    q: 'How is the Delivery Rate calculated in Analytics?',
    a: 'Delivery Rate = (successfully delivered messages / total messages sent) × 100. A message is marked delivered when the channel API returns a 200 OK or delivery receipt.'
  }
];

const GUIDES = [
  {
    icon: Users,
    color: 'indigo',
    title: 'Getting Started: Customer Directory',
    description: 'Import, organise, and filter your customer base. Understand tags, segmentation signals, and purchase history.',
    steps: ['Open the Customers tab', 'Click Import CSV to upload your customer list', 'Use filters (City, Tags) to explore your data', 'Click any row to open the Customer Profile drawer'],
    badge: 'Start here'
  },
  {
    icon: Layers,
    color: 'violet',
    title: 'Building Smart Segments',
    description: 'Use rule-based conditions or AI prompts to group customers by behaviour, spend, and location.',
    steps: ['Open Segments → Build Segment', 'Add filter rules (e.g., City = Mumbai, Spend > ₹5000)', 'Preview the matched customer count', 'Save and name your segment for use in campaigns'],
    badge: 'Popular'
  },
  {
    icon: Send,
    color: 'sky',
    title: 'Launching Your First Campaign',
    description: 'Target a segment with a personalised WhatsApp, Email, or SMS message in 3 easy steps.',
    steps: ['Open Campaigns → New Campaign', 'Select a target segment from the dropdown', 'Choose your channel and write your message', 'Preview and click Launch Campaign'],
    badge: null
  },
  {
    icon: Bot,
    color: 'emerald',
    title: 'Using the AI Copilot',
    description: 'The built-in AI assistant can auto-build segments, draft campaign copy, and surface insights from your data.',
    steps: ['Click the chat bubble in the bottom-right', 'Type a plain-English instruction (e.g. "Find lapsed VIP customers")', 'The AI will auto-populate the segment or campaign builder', 'Review, edit, and save the result'],
    badge: 'AI-powered'
  },
  {
    icon: BarChart3,
    color: 'amber',
    title: 'Reading Analytics Reports',
    description: 'Understand delivery rates, open rates, revenue attributed, and campaign ROI across all channels.',
    steps: ['Open the Analytics tab', 'Use the date range picker to filter by period', 'Compare campaigns side-by-side in the table', 'Hover chart elements for detailed tooltips'],
    badge: null
  },
  {
    icon: Upload,
    color: 'rose',
    title: 'CSV Import Format Guide',
    description: 'Learn the exact column format XENO CRM expects when importing customer records.',
    steps: ['Your CSV header row must include: Name, Email, Phone, City, Spend', 'Phone numbers can be with or without country code', 'Spend should be a plain number (no ₹ or commas)', 'Optional columns: Tags (comma-separated), Channel'],
    badge: null
  }
];

const SHORTCUTS = [
  { label: 'Import CSV', path: 'customers → Import CSV', keys: null },
  { label: 'New Campaign', path: 'campaigns → New Campaign', keys: null },
  { label: 'Build Segment', path: 'segments → Build Segment', keys: null },
  { label: 'Open AI Chat', path: 'Click the 💬 bubble (bottom-right)', keys: null },
];

export default function HelpDocsPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [openGuide, setOpenGuide] = useState(null);

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGuides = GUIDES.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-3">
            <Book className="w-5 h-5 text-indigo-200" />
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Help Center</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">How can we help?</h1>
          <p className="text-indigo-200 text-sm mb-5 max-w-lg">
            Browse guides, FAQs, and workflow walkthroughs for XENO CRM — your intelligent D2C marketing workspace.
          </p>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-indigo-300 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search guides and FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-indigo-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur transition-all"
            />
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl" />
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: PlayCircle, label: 'Getting Started', color: 'indigo' },
          { icon: FileText, label: 'CSV Format Guide', color: 'emerald' },
          { icon: Terminal, label: 'API Reference', color: 'violet' },
          { icon: MessageSquare, label: 'Contact Support', color: 'sky' },
        ].map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className={`flex flex-col items-center gap-2 p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-${color}-300 hover:bg-${color}-50/30 transition-all group shadow-sm`}
            onClick={() => setSearch(label === 'Getting Started' ? 'getting started' : label === 'CSV Format Guide' ? 'CSV' : '')}
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 border border-${color}-100 flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">{label}</span>
          </button>
        ))}
      </div>

      {/* Step-by-step Guides */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Step-by-Step Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide, i) => {
            const Icon = guide.icon;
            const isOpen = openGuide === i;
            return (
              <div
                key={i}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${isOpen ? `border-${guide.color}-300` : 'border-slate-200/60 hover:border-slate-300'}`}
              >
                <button
                  onClick={() => setOpenGuide(isOpen ? null : i)}
                  className="w-full p-5 flex items-start gap-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-${guide.color}-50 border border-${guide.color}-100 flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 text-${guide.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-800">{guide.title}</p>
                      {guide.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-${guide.color}-50 text-${guide.color}-700 border border-${guide.color}-100`}>
                          {guide.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{guide.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 mt-0.5 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`border-t border-${guide.color}-100 bg-${guide.color}-50/20 px-5 py-4`}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Steps</p>
                    <ol className="space-y-2">
                      {guide.steps.map((step, si) => (
                        <li key={si} className="flex items-start gap-3 text-xs text-slate-700">
                          <span className={`w-5 h-5 rounded-full bg-${guide.color}-100 text-${guide.color}-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5`}>
                            {si + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="flex items-center gap-1.5 mt-4 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      You've got this! This workflow usually takes under 2 minutes.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {filteredGuides.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">No guides match your search.</div>
        )}
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          Frequently Asked Questions
        </h2>
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredFaqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/60 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-800 pr-4">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed bg-indigo-50/20 border-t border-indigo-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">No FAQs match your search.</div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <h3 className="text-sm font-bold mb-1">Quick Reference</h3>
        <p className="text-xs text-slate-400 mb-5">Common actions and where to find them</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHORTCUTS.map(({ label, path }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-xs font-semibold text-white">{label}</span>
              <span className="text-[10px] text-slate-400 font-mono">{path}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-500">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Still stuck? Ping the AI Copilot — it can navigate the app for you.</span>
        </div>
      </div>
    </div>
  );
}
