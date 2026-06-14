import React, { useState } from 'react';
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

// Initial dummy data
import { CUSTOMERS, PREBUILT_SEGMENTS, INITIAL_CAMPAIGNS } from './data/dummyData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Shared Database States
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [segments, setSegments] = useState(PREBUILT_SEGMENTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);

  // Quick Action Routing States (to pass down direct actions)
  const [initialOpenWizard, setInitialOpenWizard] = useState(false);
  const [initialOpenBuilder, setInitialOpenBuilder] = useState(false);
  const [initialOpenImport, setInitialOpenImport] = useState(false);

  // AI Chat Copilot pre-fill parameters
  const [prepopulatedSegmentPrompt, setPrepopulatedSegmentPrompt] = useState('');
  const [prepopulatedCampaignDraft, setPrepopulatedCampaignDraft] = useState(null);

  // Handle routing navigation from dashboard or shortcuts
  const handleNavigate = (tab, params = {}) => {
    setCurrentTab(tab);
    setInitialOpenWizard(!!params.startNewCampaign);
    setInitialOpenBuilder(!!params.openBuilder);
    setInitialOpenImport(!!params.openImport);
    
    // Clear out prompt parameters if navigating normally
    if (!params.prepopulated) {
      setPrepopulatedSegmentPrompt('');
      setPrepopulatedCampaignDraft(null);
    }
  };

  // Handle trigger actions from AI Chat Assistant
  const handleTriggerAiAction = (action) => {
    if (action.type === 'create_segment') {
      setPrepopulatedSegmentPrompt(action.prompt);
      handleNavigate('segments', { openBuilder: true, prepopulated: true });
    } else if (action.type === 'create_campaign') {
      setPrepopulatedCampaignDraft({
        name: action.name,
        channel: action.channel,
        template: action.template
      });
      handleNavigate('campaigns', { startNewCampaign: true, prepopulated: true });
    }
  };

  // Render Active Tab Content
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            customers={customers} 
            campaigns={campaigns} 
            onNavigate={handleNavigate} 
          />
        );
      case 'customers':
        return (
          <Customers 
            customers={customers} 
            setCustomers={setCustomers} 
            initialOpenImport={initialOpenImport} 
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
          />
        );
      case 'analytics':
        return (
          <Analytics 
            campaigns={campaigns} 
          />
        );
      case 'settings':
        return <Settings />;
      case 'help':
        return <HelpDocs />;
      default:
        return (
          <div className="text-center py-12 text-slate-400">
            Route not found.
          </div>
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
        <Topbar currentTab={currentTab} />

        {/* Workspace Body Content */}
        <main className="flex-1 p-8 mt-16 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* AI Assistant Chat Widget */}
      <AiWidget 
        customers={customers} 
        onTriggerAction={handleTriggerAiAction} 
      />
    </div>
  );
}
