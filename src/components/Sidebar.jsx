import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Send, 
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'segments', name: 'Segments', icon: Layers },
    { id: 'campaigns', name: 'Campaigns', icon: Send },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  const NavBtn = ({ item }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setCurrentTab(item.id)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
          isActive
            ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
            : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
        }`}
      >
        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span>{item.name}</span>
        {isActive && (
          <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 flex flex-col h-screen fixed left-0 top-0 z-30"
      style={{ background: 'linear-gradient(180deg, #1c1917 0%, #1c1917 100%)', borderRight: '1px solid #292524' }}>

      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3" style={{ borderBottom: '1px solid #292524', background: '#141110' }}>
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-teal-500/20">
          X
        </div>
        <div>
          <span className="font-display font-bold text-lg text-white tracking-wide">XENO</span>
          <span className="text-xs text-teal-400 font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">CRM</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-stone-600 uppercase px-3 mb-3 tracking-widest">
          Marketing Suite
        </div>

        {navItems.map(item => <NavBtn key={item.id} item={item} />)}

        <div className="pt-5 mt-5 space-y-1" style={{ borderTop: '1px solid #292524' }}>
          <div className="text-[10px] font-bold text-stone-600 uppercase px-3 mb-3 tracking-widest">
            Management
          </div>
          {[
            { id: 'settings', name: 'Settings', icon: Settings },
            { id: 'help', name: 'Help & Docs', icon: HelpCircle },
          ].map(item => <NavBtn key={item.id} item={item} />)}
        </div>
      </nav>

      {/* Profile Footer */}
      <div className="p-4" style={{ borderTop: '1px solid #292524', background: '#141110' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold font-display text-xs border border-teal-600/30">
            D2C
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">Urban Threads India</h4>
            <p className="text-[10px] text-stone-500 truncate">Fashion & Apparel Brand</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
