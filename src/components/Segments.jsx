import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Layers, 
  Check, 
  Users, 
  Calendar,
  Clock,
  Play,
  X
} from 'lucide-react';
import { parseSegmentPrompt } from '../utils/aiSimulator';

export default function Segments({ customers, segments, setSegments, initialOpenBuilder = false, prepopulatedSegmentPrompt = '', onClearPrompt }) {
  const [showBuilder, setShowBuilder] = useState(initialOpenBuilder);
  const [segmentName, setSegmentName] = useState('');
  const [rules, setRules] = useState([
    { field: 'totalSpend', operator: '>', value: '10000' }
  ]);
  const [logic, setLogic] = useState('AND'); // AND / OR
  
  // AI Segment Assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiWorking, setAiWorking] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  // Sync state if initialOpenBuilder or prompt changes
  useEffect(() => {
    if (initialOpenBuilder) {
      setShowBuilder(true);
    }
  }, [initialOpenBuilder]);

  useEffect(() => {
    if (prepopulatedSegmentPrompt) {
      setShowBuilder(true);
      setAiPrompt(prepopulatedSegmentPrompt);
      const parsed = parseSegmentPrompt(prepopulatedSegmentPrompt);
      setRules(parsed.rules);
      setLogic(parsed.logic);
      setAiMessage(parsed.explanation);
      setSegmentName('AI Generated Segment');
      if (onClearPrompt) onClearPrompt();
    }
  }, [prepopulatedSegmentPrompt]);

  // Evaluator function to perform REAL live preview calculations against the 50 customers!
  const calculateSegmentSize = (currentRules, currentLogic) => {
    if (currentRules.length === 0) return 0;
    
    return customers.filter(cust => {
      const matchResults = currentRules.map(rule => {
        const { field, operator, value } = rule;
        let custValue;
        
        // Map fields
        if (field === 'totalSpend') custValue = cust.totalSpend;
        else if (field === 'totalOrders') custValue = cust.totalOrders;
        else if (field === 'city') custValue = cust.city;
        else if (field === 'lastPurchase') {
          // Calculate days ago
          const diffTime = Math.abs(new Date(2026, 5, 14) - new Date(cust.lastPurchaseDate)); // Reference date June 14, 2026
          custValue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else if (field === 'productCategory') {
          // Checks if customer bought items from this category
          const categories = cust.orders.flatMap(o => o.items.map(item => item.category));
          return categories.includes(value);
        }

        const numVal = parseFloat(value);
        const numCustVal = parseFloat(custValue);

        // Evaluate standard operators
        switch (operator) {
          case '>':
            return numCustVal > numVal;
          case '<':
            return numCustVal < numVal;
          case '>=':
            return numCustVal >= numVal;
          case '<=':
            return numCustVal <= numVal;
          case '=':
            return String(custValue).toLowerCase() === String(value).toLowerCase();
          default:
            return false;
        }
      });

      if (currentLogic === 'AND') {
        return matchResults.every(result => result === true);
      } else {
        return matchResults.some(result => result === true);
      }
    }).length;
  };

  const segmentSize = calculateSegmentSize(rules, logic);

  // Add a new empty rule
  const handleAddRule = () => {
    setRules([...rules, { field: 'totalSpend', operator: '>', value: '5000' }]);
  };

  // Update a rule row
  const handleUpdateRule = (index, key, value) => {
    const updatedRules = [...rules];
    updatedRules[index][key] = value;
    
    // Automatically set sensible operators when field changes
    if (key === 'field') {
      if (value === 'city' || value === 'productCategory') {
        updatedRules[index].operator = '=';
        updatedRules[index].value = value === 'city' ? 'Bangalore' : 'Apparel';
      } else {
        updatedRules[index].operator = '>';
        updatedRules[index].value = value === 'lastPurchase' ? '60' : '5000';
      }
    }

    setRules(updatedRules);
  };

  // Remove a rule row
  const handleRemoveRule = (index) => {
    if (rules.length === 1) return;
    setRules(rules.filter((_, idx) => idx !== index));
  };

  // Submit AI Prompt -> simulates parsing
  const handleAiBuild = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiWorking(true);
    setAiMessage('');

    setTimeout(() => {
      const parsed = parseSegmentPrompt(aiPrompt);
      setRules(parsed.rules);
      setLogic(parsed.logic);
      setAiMessage(parsed.explanation);
      setAiWorking(false);
    }, 1000);
  };

  // Save Segment
  const handleSaveSegment = () => {
    if (!segmentName.trim()) {
      alert("Please provide a name for this segment.");
      return;
    }

    const newSegment = {
      id: `seg-${segments.length + 1}`,
      name: segmentName,
      size: segmentSize,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: 'Never used',
      rules: [...rules],
      logic
    };

    setSegments([newSegment, ...segments]);
    setShowBuilder(false);
    setSegmentName('');
    setRules([{ field: 'totalSpend', operator: '>', value: '10000' }]);
    setAiPrompt('');
    setAiMessage('');
    alert(`Success! Segment "${segmentName}" created with ${segmentSize} shoppers.`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Page Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mt-1">Manage and build rules-based customer groups for your campaigns.</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Segment</span>
        </button>
      </div>

      {/* Segments Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((seg) => (
          <div 
            key={seg.id} 
            className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300/60 transition-all duration-300 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-full px-2.5 py-0.5">
                  <Users className="w-3 h-3 text-indigo-500" />
                  <span>{seg.size} Customers</span>
                </div>
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                  {seg.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">ID: {seg.id}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created {seg.createdDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Used {seg.lastUsed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Segment Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-[640px] max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="font-display font-bold text-slate-800 text-sm">New Segment Studio</h3>
              </div>
              <button 
                onClick={() => { setShowBuilder(false); setAiPrompt(''); setAiMessage(''); }}
                className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Prompter */}
            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3 relative">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>AI Segment Copilot</span>
              </div>
              <form onSubmit={handleAiBuild} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Customers in Bangalore who bought Skincare in the last 60 days"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                />
                <button
                  type="submit"
                  disabled={aiWorking}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                >
                  {aiWorking ? 'Analyzing...' : 'Generate Rules'}
                </button>
              </form>
              {aiMessage && (
                <div className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100/50 rounded px-2.5 py-1.5 animate-fade-in">
                  {aiMessage}
                </div>
              )}
            </div>

            {/* Manual Segment Rules Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800">Segmentation Logic</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Combine filters with:</span>
                    <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/50">
                      <button 
                        type="button" 
                        onClick={() => setLogic('AND')}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${logic === 'AND' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      >
                        AND
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setLogic('OR')}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${logic === 'OR' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      >
                        OR
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Enter segment name..."
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Rules rows */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-xs">
                    {/* Field select */}
                    <select
                      value={rule.field}
                      onChange={(e) => handleUpdateRule(idx, 'field', e.target.value)}
                      className="bg-white border border-slate-200 rounded p-1.5 focus:outline-none flex-1 font-semibold text-slate-700"
                    >
                      <option value="totalSpend">Total Spend (₹)</option>
                      <option value="lastPurchase">Last Purchase (Days Ago)</option>
                      <option value="city">Shopper City</option>
                      <option value="productCategory">Bought Category</option>
                      <option value="totalOrders">Total Orders</option>
                    </select>

                    {/* Operator select (Hidden or shown depending on field type) */}
                    {['totalSpend', 'lastPurchase', 'totalOrders'].includes(rule.field) ? (
                      <select
                        value={rule.operator}
                        onChange={(e) => handleUpdateRule(idx, 'operator', e.target.value)}
                        className="bg-white border border-slate-200 rounded p-1.5 focus:outline-none w-14 font-semibold text-slate-700"
                      >
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value="=">=</option>
                        <option value=">=">&gt;=</option>
                        <option value="<=">&lt;=</option>
                      </select>
                    ) : (
                      <span className="text-slate-400 font-semibold px-2">is equal to</span>
                    )}

                    {/* Value Input */}
                    {rule.field === 'city' ? (
                      <select
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(idx, 'value', e.target.value)}
                        className="bg-white border border-slate-200 rounded p-1.5 focus:outline-none flex-1 font-semibold text-slate-700"
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Chennai">Chennai</option>
                      </select>
                    ) : rule.field === 'productCategory' ? (
                      <select
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(idx, 'value', e.target.value)}
                        className="bg-white border border-slate-200 rounded p-1.5 focus:outline-none flex-1 font-semibold text-slate-700"
                      >
                        <option value="Apparel">Apparel</option>
                        <option value="Footwear">Footwear</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Skincare">Skincare</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(idx, 'value', e.target.value)}
                        className="bg-white border border-slate-200 rounded p-1.5 focus:outline-none flex-1 font-semibold text-slate-700"
                      />
                    )}

                    {/* Remove rule */}
                    <button
                      type="button"
                      disabled={rules.length === 1}
                      onClick={() => handleRemoveRule(idx)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-35"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add rule button */}
              <button
                type="button"
                onClick={handleAddRule}
                className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Filter Rule</span>
              </button>
            </div>

            {/* Live Size Preview Box */}
            <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between text-white border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Live Preview Match</span>
                <p className="text-xs font-medium text-slate-300">
                  This segment contains <strong className="text-indigo-400 text-sm font-bold">{segmentSize} customers</strong>
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-display animate-pulse">
                ✓
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => { setShowBuilder(false); setAiPrompt(''); setAiMessage(''); }}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveSegment}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-indigo-600/10 transition-all"
              >
                Save Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
