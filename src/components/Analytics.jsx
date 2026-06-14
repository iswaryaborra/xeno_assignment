import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Send, 
  CheckCircle, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Users,
  Search
} from 'lucide-react';

export default function Analytics({ campaigns }) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [recipientSearch, setRecipientSearch] = useState('');

  // Find selected campaign
  const campaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  if (!campaign) {
    return <div className="text-center py-12 text-slate-400">No campaigns found. Launch a campaign to view analytics.</div>;
  }

  // Calculate percentages
  const { sent, delivered, opened, clicked, converted, revenue } = campaign.metrics;
  const deliveryPct = sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '0';
  const openPct = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0';
  const clickPct = delivered > 0 ? ((clicked / delivered) * 100).toFixed(1) : '0';
  const conversionPct = delivered > 0 ? ((converted / delivered) * 100).toFixed(1) : '0';

  // Overall calculations across all campaigns
  const aggregateStats = campaigns.reduce((acc, c) => {
    acc.sent += c.metrics.sent;
    acc.delivered += c.metrics.delivered;
    acc.opened += c.metrics.opened;
    acc.clicked += c.metrics.clicked;
    acc.converted += c.metrics.converted;
    acc.revenue += c.metrics.revenue;
    return acc;
  }, { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 });

  const aggDeliveryPct = aggregateStats.sent > 0 ? ((aggregateStats.delivered / aggregateStats.sent) * 100).toFixed(1) : '0';
  const aggOpenPct = aggregateStats.delivered > 0 ? ((aggregateStats.opened / aggregateStats.delivered) * 100).toFixed(1) : '0';
  const aggClickPct = aggregateStats.delivered > 0 ? ((aggregateStats.clicked / aggregateStats.delivered) * 100).toFixed(1) : '0';
  const aggConversionPct = aggregateStats.delivered > 0 ? ((aggregateStats.converted / aggregateStats.delivered) * 100).toFixed(1) : '0';

  // Recipient filtering
  const filteredRecipients = (campaign.recipients || [])
    .filter(r => r.name.toLowerCase().includes(recipientSearch.toLowerCase()) || 
                 r.email.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                 r.status.toLowerCase().includes(recipientSearch.toLowerCase()));

  // SVG Line Graph data points (simulate delivery spikes over 24 hours)
  const timelinePoints = [
    { hour: '0h', count: 0 },
    { hour: '1h', count: Math.round(delivered * 0.15) },
    { hour: '2h', count: Math.round(delivered * 0.45) },
    { hour: '4h', count: Math.round(delivered * 0.75) },
    { hour: '8h', count: Math.round(delivered * 0.90) },
    { hour: '12h', count: Math.round(delivered * 0.96) },
    { hour: '24h', count: delivered }
  ];

  // Draw SVG path coordinates based on points
  const drawSvgPath = () => {
    const width = 500;
    const height = 120;
    const maxVal = delivered || 100;
    
    return timelinePoints.map((pt, idx) => {
      const x = (idx / (timelinePoints.length - 1)) * (width - 40) + 20;
      const y = height - ((pt.count / maxVal) * (height - 30) + 10);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Selector and Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm gap-4">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800">Select Target Campaign:</span>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-100"
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.channel})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-1.5 font-medium">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span>Launch Date: {campaign.launchDate}</span>
        </div>
      </div>

      {/* Primary Funnel & KPIs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metric cards */}
        <div className="space-y-4 lg:col-span-1">
          {/* Delivered KPI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivery Rate</span>
              <h3 className="text-2xl font-bold font-display text-slate-800">{deliveryPct}%</h3>
              <p className="text-[10px] text-slate-500 font-medium">{delivered} of {sent} messages delivered</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Open Rate KPI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Open Rate</span>
              <h3 className="text-2xl font-bold font-display text-slate-800">{openPct}%</h3>
              <p className="text-[10px] text-slate-500 font-medium">{opened} message opens logged</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          {/* Click Rate KPI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Click Rate</span>
              <h3 className="text-2xl font-bold font-display text-slate-800">{clickPct}%</h3>
              <p className="text-[10px] text-slate-500 font-medium">{clicked} recipients tapped links</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <MousePointer className="w-5 h-5" />
            </div>
          </div>

          {/* Revenue Attribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between bg-gradient-to-br from-indigo-50/20 to-sky-50/20">
            <div className="space-y-1.5">
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Revenue Attributed</span>
              <h3 className="text-2xl font-extrabold font-display text-indigo-600">₹{revenue.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-500 font-semibold">{conversionPct}% conversion rate ({converted} buyers)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/10">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Funnel Chart Block (SVG-based Clean Funnel path) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-sm">Campaign Conversion Funnel</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Visual representation of recipient progression through conversion stages.</p>
          </div>

          {/* Funnel Graph Visualizer */}
          <div className="space-y-2.5 my-6">
            
            {/* Sent Level */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-700">
                <span>1. Messages Sent</span>
                <span>{sent} (100%)</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div className="bg-slate-400 h-full rounded-lg transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Delivered Level */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-700">
                <span>2. Delivered</span>
                <span>{delivered} ({deliveryPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-lg transition-all duration-500" style={{ width: `${deliveryPct}%` }} />
              </div>
            </div>

            {/* Opened Level */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-700">
                <span>3. Opened / Read</span>
                <span>{opened} ({openPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-lg transition-all duration-500" style={{ width: `${openPct}%` }} />
              </div>
            </div>

            {/* Clicked Level */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-700">
                <span>4. Clicked Link</span>
                <span>{clicked} ({clickPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div className="bg-sky-400 h-full rounded-lg transition-all duration-500" style={{ width: `${clickPct}%` }} />
              </div>
            </div>

            {/* Converted Level */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-700">
                <span>5. Purchase Converted</span>
                <span>{converted} ({conversionPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-lg transition-all duration-500" style={{ width: `${conversionPct}%` }} />
              </div>
            </div>

          </div>

          <div className="text-[10px] text-slate-400 italic text-center">
            *Conversion rate benchmark averages ~2.5% for retail campaigns. XENO is outperforming.
          </div>
        </div>

      </div>

      {/* Bottom section: Delivery Timeline and Recipients Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Timeline Graph */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-sm">Delivery Distribution Timeline</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tracking message delivery rates over a 24-hour log period.</p>
          </div>

          {/* Simple Responsive SVG Graph */}
          <div className="my-6">
            <svg viewBox="0 0 500 120" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Background grids */}
              <line x1="20" y1="10" x2="480" y2="10" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="20" y1="55" x2="480" y2="55" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="20" y1="100" x2="480" y2="100" stroke="#E2E8F0" strokeWidth="1" />
              
              {/* Plot area path */}
              <path d={`${drawSvgPath()} L 480 100 L 20 100 Z`} fill="url(#lineGrad)" />
              <path d={drawSvgPath()} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />

              {/* Data points */}
              {timelinePoints.map((pt, idx) => {
                const x = (idx / (timelinePoints.length - 1)) * (460) + 20;
                const y = 120 - ((pt.count / (delivered || 100)) * (90) + 20);
                return (
                  <circle key={idx} cx={x} cy={y} r="3" fill="#6366F1" stroke="white" strokeWidth="1.5" />
                );
              })}
            </svg>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-2 px-1">
              {timelinePoints.map((pt, idx) => (
                <span key={idx}>{pt.hour}</span>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-lg p-2.5">
            Bulk sent reached peak velocity at hour 2 (24 messages/hr).
          </div>
        </div>

        {/* Recipients status log table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">Recipient Action Logs</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Individual delivery statuses for the selected campaign.</p>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search recipient log..."
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:outline-none w-48 font-medium focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-y-auto max-h-[140px] border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-2.5 pl-4">Recipient</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 pr-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredRecipients.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-2.5 pl-4 font-bold text-slate-800">
                      <div>{rec.name}</div>
                      <div className="text-[9px] text-slate-400 font-normal mt-0.5">{rec.email}</div>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        rec.status === 'Converted' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        rec.status === 'Clicked' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                        rec.status === 'Opened' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-2.5 pr-4 text-right text-slate-400 font-semibold">{rec.time}</td>
                  </tr>
                ))}
                {filteredRecipients.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400 italic">No matching logs.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Aggregate Stats Section */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-4">
        <div>
          <h3 className="font-display font-bold text-white text-base">Overall Historical Rollup</h3>
          <p className="text-xs text-slate-400">Summed metrics across all campaigns executed to date.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Sent</span>
            <p className="text-lg font-bold mt-1">{aggregateStats.sent} messages</p>
          </div>
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Overall Delivery</span>
            <p className="text-lg font-bold mt-1 text-emerald-400">{aggDeliveryPct}%</p>
          </div>
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Overall Open Rate</span>
            <p className="text-lg font-bold mt-1 text-indigo-400">{aggOpenPct}%</p>
          </div>
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Overall Click Rate</span>
            <p className="text-lg font-bold mt-1 text-sky-400">{aggClickPct}%</p>
          </div>
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800/80 col-span-2 md:col-span-1">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">Total Revenue</span>
            <p className="text-lg font-extrabold mt-1 text-indigo-300">₹{aggregateStats.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
