import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './Topbar';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Segments from './components/Segments';
import Campaigns from './components/Campaigns';
import Analytics from './components/Analytics';
import AiWidget from './components/AiWidget';
import Settings from './components/Settings';
import HelpDocs from './components/HelpDocs';

// API service layer
import { customersApi, segmentsApi, campaignsApi, analyticsApi, aiApi, checkBackend } from './services/api';

// Fallback to dummy data when backend is offline
import { CUSTOMERS, PREBUILT_SEGMENTS, INITIAL_CAMPAIGNS } from './data/dummyData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Backend connectivity flag
  const [backendOnline, setBackendOnline] = useState(null); // null = checking

  // Shared Database States (loaded from API or fallback to mock)
  const [customers, setCustomers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Routing States
  const [initialOpenWizard, setInitialOpenWizard] = useState(false);
  const [initialOpenBuilder, setInitialOpenBuilder] = useState(false);
  const [initialOpenImport, setInitialOpenImport] = useState(false);

  // AI Chat Copilot pre-fill parameters
  const [prepopulatedSegmentPrompt, setPrepopulatedSegmentPrompt] = useState('');
  const [prepopulatedCampaignDraft, setPrepopulatedCampaignDraft] = useState(null);

  // ─── Check backend + load data ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const health = await checkBackend();
      const isOnline = !!health;
      setBackendOnline(isOnline);

      if (isOnline) {
        // Load from real backend
        const [customersRes, segmentsRes, campaignsRes] = await Promise.all([
          customersApi.getAll({ limit: '500' }),
          segmentsApi.getAll(),
          campaignsApi.getAll(),
        ]);

        setCustomers(customersRes.customers || customersRes);
        setSegments(segmentsRes);
        setCampaigns(campaignsRes);
      } else {
        // Fall back to mock data
        console.warn('[App] Backend offline — using mock data');
        setCustomers(CUSTOMERS);
        setSegments(PREBUILT_SEGMENTS);
        setCampaigns(INITIAL_CAMPAIGNS);
      }
    } catch (err) {
      console.error('[App] Data load error:', err);
      setBackendOnline(false);
      setCustomers(CUSTOMERS);
      setSegments(PREBUILT_SEGMENTS);
      setCampaigns(INITIAL_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Reload campaigns (after launch for analytics refresh) ─────────────────
  const reloadCampaigns = async () => {
    if (!backendOnline) return;
    try {
      const fresh = await campaignsApi.getAll();
      setCampaigns(fresh);
    } catch {
      // silent
    }
  };

  // ─── Navigation ────────────────────────────────────────────────────────────
  const handleNavigate = (tab, params = {}) => {
    setCurrentTab(tab);
    setInitialOpenWizard(!!params.startNewCampaign);
    setInitialOpenBuilder(!!params.openBuilder);
    setInitialOpenImport(!!params.openImport);

    if (!params.prepopulated) {
      setPrepopulatedSegmentPrompt('');
      setPrepopulatedCampaignDraft(null);
    }
  };

  // ─── AI widget action trigger ───────────────────────────────────────────────
  const handleTriggerAiAction = (action) => {
    if (action.type === 'create_segment') {
      setPrepopulatedSegmentPrompt(action.prompt);
      handleNavigate('segments', { openBuilder: true, prepopulated: true });
    } else if (action.type === 'create_campaign') {
      setPrepopulatedCampaignDraft({
        name: action.name,
        channel: action.channel,
        template: action.template,
      });
      handleNavigate('campaigns', { startNewCampaign: true, prepopulated: true });
    }
  };

  // ─── Backend status banner ─────────────────────────────────────────────────
  const StatusBanner = () => {
    if (backendOnline === null) return null;
    if (backendOnline) return null; // Online — no banner needed
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Running in offline mode — using mock data. Start the backend on port 3001 to enable persistence.</span>
      </div>
    );
  };

  // ─── Tab content renderer ──────────────────────────────────────────────────
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading from database...</span>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            customers={customers}
            campaigns={campaigns}
            onNavigate={handleNavigate}
            backendOnline={backendOnline}
          />
        );
      case 'customers':
        return (
          <Customers
            customers={customers}
            setCustomers={setCustomers}
            initialOpenImport={initialOpenImport}
            backendOnline={backendOnline}
            onReload={loadData}
          />
        );
      case 'segments':
        return (
          <Segments
            customers={customers}
            segments={segments}
            setSegments={setSegments}
            initialOpenBuilder={initialOpenBuilder}
            prepopulatedSegmentPrompt={prepopulatedSegmentPrompt}
            onClearPrompt={() => setPrepopulatedSegmentPrompt('')}
            backendOnline={backendOnline}
          />
        );
      case 'campaigns':
        return (
          <Campaigns
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            segments={segments}
            initialOpenWizard={initialOpenWizard}
            prepopulatedCampaignDraft={prepopulatedCampaignDraft}
            onClearDraft={() => setPrepopulatedCampaignDraft(null)}
            backendOnline={backendOnline}
            onReloadCampaigns={reloadCampaigns}
          />
        );
      case 'analytics':
        return (
          <Analytics
            campaigns={campaigns}
            backendOnline={backendOnline}
            analyticsApi={analyticsApi}
          />
        );
      case 'settings':
        return <Settings />;
      case 'help':
        return <HelpDocs />;
      default:
        return (
          <div className="text-center py-12 text-slate-400">Route not found.</div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => handleNavigate(tab)}
      />

      {/* Main Workspace Wrapper */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Topbar branding and profile */}
        <Topbar currentTab={currentTab} backendOnline={backendOnline} />

        {/* Offline mode banner */}
        <div className="mt-16">
          <StatusBanner />
        </div>

        {/* Workspace Body Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* AI Assistant Chat Widget */}
      <AiWidget
        customers={customers}
        onTriggerAction={handleTriggerAiAction}
        backendOnline={backendOnline}
        aiApi={aiApi}
      />
    </div>
  );
}
