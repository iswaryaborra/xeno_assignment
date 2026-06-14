import React from 'react';
import { 
  Users, 
  Send, 
  CheckCircle, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  UserPlus
} from 'lucide-react';

export default function Dashboard({ customers, campaigns, onNavigate }) {
  // Compute Stats dynamically from data
  const totalCustomers = customers.length;
  
  // Calculate messages sent today (mock live count + finished campaigns)
  const sentToday = campaigns
    .filter(c => c.launchDate === '2026-06-14')
    .reduce((sum, c) => sum + c.metrics.sent, 0) + 1240; // mock constant + active drop

  const activeCampaigns = campaigns.filter(c => c.status === 'In Progress' || c.status === 'Scheduled').length;
  
  // Overall Delivery Rate calculation
  const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.sent, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.metrics.delivered, 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Actions Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-950/15 gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Intelligent Reach Workspace</span>
          </h3>
          <p className="text-slate-400 text-xs">AI-native tools are active. Engage, segment, and draft with suggestions.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('campaigns', { startNewCampaign: true })}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
          <button
            onClick={() => onNavigate('segments', { openBuilder: true })}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:text-white"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Create Segment</span>
          </button>
          <button
            onClick={() => onNavigate('customers', { openImport: true })}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:text-white"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Import Customers</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300/60 group">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Customers</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-colors group-hover:bg-indigo-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="text-3xl font-bold font-display text-slate-800">{totalCustomers}</h2>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12% vs last month</span>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300/60 group">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Campaigns</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center transition-colors group-hover:bg-sky-100">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="text-3xl font-bold font-display text-slate-800">{activeCampaigns}</h2>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <span>Diwali Sneaker Drop is live</span>
            </div>
          </div>
        </div>

        {/* Messages Sent Today */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300/60 group">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Sent Today</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-colors group-hover:bg-amber-100">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="text-3xl font-bold font-display text-slate-800">{sentToday.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+24.5% daily pace</span>
            </div>
          </div>
        </div>

        {/* Overall Delivery Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300/60 group">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Delivery Rate</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="text-3xl font-bold font-display text-slate-800">{deliveryRate}%</h2>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <span>Industry benchmark exceeded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-base">Recent Campaigns Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Summary metrics of your latest marketing activations.</p>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <span>View Detailed Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Campaign Name</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Audience Size</th>
                <th className="p-4">Sent</th>
                <th className="p-4">Delivered</th>
                <th className="p-4">Open Rate</th>
                <th className="p-4">Click Rate</th>
                <th className="p-4 pr-6 text-right">Revenue Attributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {campaigns.map((camp) => {
                const openRate = ((camp.metrics.opened / camp.metrics.delivered) * 100).toFixed(1);
                const clickRate = ((camp.metrics.clicked / camp.metrics.delivered) * 100).toFixed(1);
                
                return (
                  <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800">{camp.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-semibold text-[10px] ${
                        camp.channel === 'WhatsApp' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        camp.channel === 'Email' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        'bg-sky-50 text-sky-700 border border-sky-100'
                      }`}>
                        {camp.channel}
                      </span>
                    </td>
                    <td className="p-4">{camp.metrics.audienceSize}</td>
                    <td className="p-4">{camp.metrics.sent}</td>
                    <td className="p-4">{camp.metrics.delivered}</td>
                    <td className="p-4">{openRate}%</td>
                    <td className="p-4">{clickRate}%</td>
                    <td className="p-4 pr-6 text-right font-bold text-indigo-600">
                      ₹{camp.metrics.revenue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
