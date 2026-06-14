import React, { useState } from 'react';
import { Bell, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';

export default function Topbar({ currentTab }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Marketing Overview';
      case 'customers': return 'Customers Directory';
      case 'segments': return 'Audience Segmentation';
      case 'campaigns': return 'Campaign Orchestra';
      case 'analytics': return 'Performance Analytics';
      case 'settings': return 'App Settings';
      case 'help': return 'Help & Docs';
      default: return 'XENO CRM';
    }
  };

  const notifications = [
    { id: 1, text: "Campaign 'Diwali Festive Sneaker Drop' is 87% delivered.", time: "10 mins ago" },
    { id: 2, text: "AI generated a new high-value segment suggestions.", time: "1 hour ago" },
    { id: 3, text: "Successfully imported 25 new shoppers from CSV upload.", time: "3 hours ago" }
  ];

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20 transition-all duration-200">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold font-display text-slate-800 tracking-tight leading-none">
          {getHeaderTitle()}
        </h2>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <CheckCircle2 className="w-3 h-3" />
          <span>Active Connection</span>
        </span>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Quick AI Tip */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 bg-stone-50 border border-stone-100 rounded-full px-3 py-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Tip: WhatsApp delivery is peak between 6 PM to 8 PM.</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative border border-slate-200/50"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200/80 p-4 animate-fade-in z-50">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h4 className="font-semibold text-sm text-slate-800">Notifications</h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="text-xs border-b border-slate-50 pb-2 last:border-none last:pb-0">
                    <p className="text-slate-700 leading-relaxed">{notif.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <span className="w-px h-6 bg-slate-200" />

        {/* User Info */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity group">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-slate-900/10">
            IS
          </div>
          <div className="text-left hidden md:block">
            <h4 className="text-xs font-semibold text-stone-700 group-hover:text-teal-600 transition-colors">Iswarya B</h4>
            <p className="text-[10px] text-slate-400">Marketing Lead</p>
          </div>
          {/* <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> */}
        </div>
      </div>
    </header>
  );
}
