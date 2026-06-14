import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  Smartphone,
  Eye, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Rocket, 
  Plus, 
  HelpCircle,
  X
} from 'lucide-react';
import { generateMessageCopy, getSendTimeSuggestion } from '../utils/aiSimulator';

export default function Campaigns({ campaigns, setCampaigns, segments, initialOpenWizard = false, prepopulatedCampaignDraft = null, onClearDraft }) {
  const [showWizard, setShowWizard] = useState(initialOpenWizard);
  const [step, setStep] = useState(1);
  
  // New Campaign Form State
  const [campName, setCampName] = useState('');
  const [selectedSegment, setSelectedSegment] = useState(segments[0] || null);
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');
  const [messageText, setMessageText] = useState('');
  const [aiIntent, setAiIntent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Sync state if initialOpenWizard or draft changes
  useEffect(() => {
    if (initialOpenWizard) {
      setShowWizard(true);
    }
  }, [initialOpenWizard]);

  useEffect(() => {
    if (prepopulatedCampaignDraft) {
      setShowWizard(true);
      setStep(3); // Start directly at Step 3: Compose Message
      setCampName(prepopulatedCampaignDraft.name || 'AI Generated Campaign');
      setSelectedChannel(prepopulatedCampaignDraft.channel || 'WhatsApp');
      setMessageText(prepopulatedCampaignDraft.template || '');
      if (onClearDraft) onClearDraft();
    }
  }, [prepopulatedCampaignDraft]);

  // Handle Channel select
  const channels = [
    { name: 'WhatsApp', icon: MessageCircle, description: 'Direct messaging, rich media, and 98% open rates.', color: 'emerald' },
    { name: 'SMS', icon: Smartphone, description: 'Universal compatibility, offline delivery, fast read time.', color: 'sky' },
    { name: 'Email', icon: Mail, description: 'Rich layouts, customized newsletters, long-form copy.', color: 'indigo' },
    { name: 'RCS', icon: MessageSquare, description: 'Next-gen SMS with branding and interactive buttons.', color: 'pink' }
  ];

  // Auto load default message copy when channel changes
  useEffect(() => {
    const defaultIntent = 'general promo greeting discount';
    setMessageText(generateMessageCopy(defaultIntent, selectedChannel));
  }, [selectedChannel]);

  // Insert placeholder token at current selection
  const insertToken = (token) => {
    setMessageText(prev => prev + ` {{${token}}}`);
  };

  // Run AI Copy composer simulation
  const handleAiCompose = (e) => {
    e.preventDefault();
    if (!aiIntent.trim()) return;

    setAiLoading(true);
    setTimeout(() => {
      const generated = generateMessageCopy(aiIntent, selectedChannel);
      setMessageText(generated);
      setAiLoading(false);
    }, 1200);
  };

  // Run launching sequence
  const handleLaunchCampaign = () => {
    const segmentObj = segments.find(s => s.name === selectedSegment.name) || { size: 100 };
    const newCamp = {
      id: `camp-${campaigns.length + 1}`,
      name: campName || `${selectedChannel} Blast ${new Date().toLocaleDateString()}`,
      segment: selectedSegment.name,
      channel: selectedChannel,
      status: 'Sent',
      launchDate: new Date().toISOString().split('T')[0],
      metrics: {
        audienceSize: segmentObj.size,
        sent: segmentObj.size,
        delivered: Math.round(segmentObj.size * 0.98),
        opened: Math.round(segmentObj.size * 0.75),
        clicked: Math.round(segmentObj.size * 0.35),
        converted: Math.round(segmentObj.size * 0.08),
        revenue: Math.round(segmentObj.size * 0.08 * 3500) // simulated revenue
      },
      messageCopy: messageText,
      recipients: [
        { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', status: 'Converted', time: 'Just Now' }
      ]
    };

    setCampaigns([newCamp, ...campaigns]);
    setStep(5);
  };

  // Reset Wizard form
  const handleReset = () => {
    setShowWizard(false);
    setStep(1);
    setCampName('');
    setSelectedSegment(segments[0] || null);
    setSelectedChannel('WhatsApp');
    setAiIntent('');
  };

  // Pre-formatted message rendering for live device visualizer (replacing variable tokens with mockup customer data)
  const renderMessagePreview = () => {
    return messageText
      .replace(/{{first_name}}/g, 'Aarav')
      .replace(/{{last_order_date}}/g, '2026-05-15');
  };

  const timeSuggestion = selectedSegment ? getSendTimeSuggestion(selectedSegment.name) : null;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Campaign List Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mt-1">Orchestrate channels and execute targeted multi-touch D2C reach campaigns.</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Directory Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Campaign Info</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Target Audience</th>
                <th className="p-4">Sent Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <h4 className="font-bold text-slate-800 text-xs">{camp.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{camp.id}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-semibold text-[10px] ${
                      camp.channel === 'WhatsApp' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      camp.channel === 'Email' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      camp.channel === 'SMS' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                      'bg-pink-50 text-pink-700 border border-pink-100'
                    }`}>
                      {camp.channel}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{camp.segment}</td>
                  <td className="p-4 text-slate-500 font-normal">{camp.launchDate}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      camp.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      camp.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right font-bold text-slate-900">
                    ₹{camp.metrics.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Campaign Flow Wizard (Multi-step Overlay Modal) */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-[760px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between space-y-6">
            
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Campaign Orchestra Studio</h3>
                {step < 5 && (
                  <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">Step {step} of 4: Progressing Workflow</p>
                )}
              </div>
              {step < 5 && (
                <button 
                  onClick={handleReset}
                  className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Wizard Body Steps */}
            <div className="flex-1">
              
              {/* Step 1: Pick Segment & Name */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">1. Name your campaign</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Diwali Sneaker VIP Drop"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">2. Select Target Segment</label>
                    <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-1">
                      {segments.map((seg) => (
                        <div 
                          key={seg.id}
                          onClick={() => setSelectedSegment(seg)}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            selectedSegment?.id === seg.id 
                              ? 'border-indigo-600 bg-indigo-50/20' 
                              : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Layers className="w-4.5 h-4.5 text-indigo-500" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{seg.name}</h4>
                              <p className="text-[10px] text-slate-400">Created on {seg.createdDate}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                            {seg.size} Shoppers
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Channel */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <label className="text-xs font-bold text-slate-800 block">Select Marketing Channel</label>
                  <div className="grid grid-cols-2 gap-4">
                    {channels.map((chan) => {
                      const Icon = chan.icon;
                      const isSelected = selectedChannel === chan.name;
                      return (
                        <div
                          key={chan.name}
                          onClick={() => setSelectedChannel(chan.name)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50/10 shadow-md' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm`}>
                              <Icon className="w-5 h-5 text-indigo-500" />
                            </div>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{chan.name}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{chan.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Compose Message & Previews */}
              {step === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                  {/* Composer */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Compose Message Template</label>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => insertToken('first_name')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold border border-slate-200/50"
                        >
                          + First Name
                        </button>
                        <button 
                          onClick={() => insertToken('last_order_date')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold border border-slate-200/50"
                        >
                          + Last Purchase Date
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={5}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />

                    {/* AI Message Copywriter */}
                    <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl space-y-2 relative">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>AI Message Generator</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. discount offer for lapsed sneakers shoppers"
                          value={aiIntent}
                          onChange={(e) => setAiIntent(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAiCompose}
                          disabled={aiLoading}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        >
                          {aiLoading ? 'Composing...' : 'Draft'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Device Visual Mockup preview */}
                  <div className="space-y-2 flex flex-col justify-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Device Preview</span>
                    </span>

                    {/* Render visual phone or mail frame */}
                    {selectedChannel === 'WhatsApp' ? (
                      <div className="w-full h-[220px] rounded-2xl bg-teal-950 border-4 border-slate-700 p-3 flex flex-col relative overflow-hidden">
                        {/* Device header */}
                        <div className="h-6 bg-slate-900 absolute top-0 left-0 right-0 flex items-center justify-between px-3 text-[8px] text-slate-500">
                          <span>09:41</span>
                          <span className="font-semibold text-[7px] text-emerald-400">● WhatsApp Web</span>
                        </div>
                        {/* Chat area */}
                        <div className="flex-1 mt-4 flex items-end justify-start pr-12 overflow-y-auto">
                          <div className="bg-[#DCF8C6] border border-[#d2f0bd] p-2.5 rounded-xl rounded-bl-none text-[10px] text-slate-800 font-medium whitespace-pre-wrap leading-relaxed shadow-sm w-full relative">
                            {renderMessagePreview()}
                            <span className="text-[7px] text-slate-400 float-right mt-1.5 ml-2">09:41 AM ✓✓</span>
                          </div>
                        </div>
                      </div>
                    ) : selectedChannel === 'SMS' ? (
                      <div className="w-full h-[220px] rounded-2xl bg-slate-800 border-4 border-slate-700 p-3 flex flex-col relative overflow-hidden">
                        {/* Device header */}
                        <div className="h-6 bg-slate-900 absolute top-0 left-0 right-0 flex items-center justify-between px-3 text-[8px] text-slate-500">
                          <span>09:41</span>
                          <span>SMS Service</span>
                        </div>
                        {/* Chat area */}
                        <div className="flex-1 mt-4 flex items-end justify-start pr-12 overflow-y-auto">
                          <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl rounded-bl-none text-[10px] text-slate-800 font-medium whitespace-pre-wrap leading-relaxed shadow-sm w-full">
                            {renderMessagePreview()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Email client visualizer
                      <div className="w-full h-[220px] rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col relative overflow-hidden">
                        {/* Mail Header */}
                        <div className="bg-slate-50 border-b border-slate-100 p-3 text-[10px] space-y-1">
                          <div className="flex justify-between text-[8px] text-slate-400 mb-1">
                            <span>Inbox - Outlook</span>
                            <span>09:41 AM</span>
                          </div>
                          <div><span className="text-slate-400">From:</span> contact@xeno.shop</div>
                          <div><span className="text-slate-400">To:</span> aarav.sharma@example.com</div>
                        </div>
                        {/* Mail Body */}
                        <div className="flex-1 p-4 overflow-y-auto text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                          {renderMessagePreview()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review and Send */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Campaign Target Segment</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedSegment?.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Target Audience Size</span>
                      <p className="font-bold text-indigo-600 mt-0.5">{selectedSegment?.size} Customers</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Marketing Channel</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedChannel}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Estimated Reach</span>
                      <p className="font-bold text-slate-800 mt-0.5">~98.5% (Deliverability Index)</p>
                    </div>
                  </div>

                  {/* AI Smart Send Time */}
                  {timeSuggestion && (
                    <div className="bg-indigo-50 border border-indigo-100/70 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
                        <Clock className="w-4.5 h-4.5" />
                        <span>AI Smart Send-Time Suggestion</span>
                      </div>
                      <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                        Recommended: <strong className="text-indigo-600 underline font-bold">{timeSuggestion.time}</strong>. {timeSuggestion.reason}
                      </p>
                    </div>
                  )}

                  {/* Preview snippet */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Template Draft Copy</span>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed font-medium max-h-[100px] overflow-y-auto">
                      {messageText}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {step === 5 && (
                <div className="py-12 text-center space-y-4 animate-fade-in flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border-2 border-emerald-100 shadow-md animate-bounce">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-slate-800 text-lg">Campaign Launched!</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-[360px] mx-auto">
                      Your template broadcast has been scheduled and sent to the messaging engine queue. Live conversion data will sync in 5-10 minutes.
                    </p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
                  >
                    Return to campaigns list
                  </button>
                </div>
              )}

            </div>

            {/* Wizard Navigation Footer */}
            {step < 5 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-35"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && !campName.trim()) {
                        alert("Please provide a name for this campaign.");
                        return;
                      }
                      setStep(step + 1);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchCampaign}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/10 hover:shadow-lg"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Launch Campaign Now</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
