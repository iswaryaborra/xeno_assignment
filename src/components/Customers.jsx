import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  X, 
  Calendar, 
  ShoppingBag, 
  MessageSquare,
  Upload,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function Customers({ customers, setCustomers, initialOpenImport = false, backendOnline = false, onReload }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortField, setSortField] = useState('totalSpend');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showImportModal, setShowImportModal] = useState(initialOpenImport);
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { success: bool, message: string }
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialOpenImport) setShowImportModal(true);
  }, [initialOpenImport]);

  const cities = ['All', ...new Set(customers.map(c => c.city))];
  const allTags = ['All', ...new Set(customers.flatMap(c => c.tags))];

  // ─── CSV Parser ────────────────────────────────────────────────
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    return lines.slice(1).map((line) => {
      const cols = [];
      let cur = '', inQ = false;
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      cols.push(cur.trim());
      const row = {};
      headers.forEach((h, i) => { row[h] = (cols[i] || '').replace(/^"|"$/g, ''); });
      return row;
    }).filter(r => r.name || r.email);
  };

  const rowToCustomer = (row, index) => {
    const get = (...keys) => keys.map(k => row[k]).find(v => v) || '';
    const spendRaw = parseFloat(get('spend', 'totalspend', 'total_spend', 'amount') || '0');
    const tagsRaw = get('tags', 'tag');
    const today = new Date().toISOString().split('T')[0];
    return {
      id: `CUST-CSV-${Date.now()}-${index}`,
      name: get('name', 'fullname', 'full name') || 'Unknown',
      email: get('email', 'email address') || '',
      phone: get('phone', 'mobile', 'contact') || '',
      city: get('city', 'location', 'region') || 'Unknown',
      totalOrders: parseInt(get('orders', 'totalorders', 'order count') || '1', 10),
      totalSpend: isNaN(spendRaw) ? 0 : spendRaw,
      lastPurchaseDate: get('lastpurchasedate', 'last_purchase', 'date') || today,
      tags: tagsRaw ? ['CSV Import', ...tagsRaw.split(';').map(t => t.trim()).filter(Boolean)] : ['CSV Import'],
      channelPreference: get('channel', 'channelpreference') || 'WhatsApp',
      campaigns: [],
      orders: []
    };
  };

  // ─── File Selection ─────────────────────────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setImportResult({ success: false, message: 'Please select a valid .csv file.' });
      return;
    }
    setCsvFile(file);
    setImportResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // ─── Import Handler ─────────────────────────────────────────────
  const handleImportCSV = (e) => {
    e.preventDefault();
    if (!csvFile) {
      setImportResult({ success: false, message: 'Please choose a CSV file first.' });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);

        let newShoppers;
        if (rows.length > 0) {
          newShoppers = rows.map((row, i) => rowToCustomer(row, i));
        } else {
          newShoppers = [
            rowToCustomer({ name: 'Amit Patel (Demo)', email: 'amit@example.com', phone: '+91 95000 12345', city: 'Mumbai', spend: '11200' }, 0),
            rowToCustomer({ name: 'Shalini Nair (Demo)', email: 'shalini@example.com', phone: '+91 97000 67890', city: 'Bangalore', spend: '8500' }, 1),
          ];
        }

        if (backendOnline) {
          // Persist to database
          const { customersApi } = await import('../services/api');
          const result = await customersApi.bulkImport(newShoppers.map(s => ({
            name: s.name,
            email: s.email,
            phone: s.phone,
            city: s.city,
            totalOrders: s.totalOrders,
            totalSpend: s.totalSpend,
            lastPurchaseDate: s.lastPurchaseDate,
            tags: s.tags,
            channelPreference: s.channelPreference,
          })));

          setIsImporting(false);
          setImportResult({
            success: true,
            message: `${result.imported} customer${result.imported !== 1 ? 's' : ''} imported to database! (${result.skipped} skipped)`
          });

          // Reload from DB
          if (onReload) setTimeout(onReload, 500);
        } else {
          // Offline: update in-memory only
          setCustomers(prev => [...newShoppers, ...prev]);
          setIsImporting(false);
          setImportResult({
            success: true,
            message: `${newShoppers.length} customer${newShoppers.length !== 1 ? 's' : ''} imported from "${csvFile.name}" (offline mode — not persisted)`
          });
        }

        setTimeout(() => {
          setShowImportModal(false);
          setCsvFile(null);
          setImportResult(null);
        }, 1800);

      } catch (err) {
        setIsImporting(false);
        setImportResult({ success: false, message: `Import error: ${err.message}` });
      }
    };

    reader.onerror = () => {
      setIsImporting(false);
      setImportResult({ success: false, message: 'Could not read the file. Please try again.' });
    };

    reader.readAsText(csvFile);
  };

  const closeModal = () => {
    setShowImportModal(false);
    setCsvFile(null);
    setImportResult(null);
  };

  // ─── Sort ───────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredCustomers = customers
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.phone.includes(searchTerm);
      const matchCity = selectedCity === 'All' || c.city === selectedCity;
      const matchTag = selectedTag === 'All' || c.tags.includes(selectedTag);
      return matchSearch && matchCity && matchTag;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'lastPurchaseDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const tagColor = (tag) => {
    if (tag === 'VIP') return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (tag.includes('Lapsed')) return 'bg-rose-50 text-rose-600 border border-rose-200';
    if (tag === 'New Joiners') return 'bg-teal-50 text-teal-700 border border-teal-200';
    if (tag === 'CSV Import') return 'bg-sky-50 text-sky-600 border border-sky-200';
    return 'bg-stone-100 text-stone-600 border border-stone-200';
  };

  return (
    <div className="space-y-5 animate-fade-in relative">

      {/* ── Filter Bar ─────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer">
              <option value="All">All Cities</option>
              {cities.filter(c => c !== 'All').map(city => <option key={city}>{city}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer">
              <option value="All">All Tags</option>
              {allTags.filter(t => t !== 'All').map(tag => <option key={tag}>{tag}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setShowImportModal(true); setImportResult(null); setCsvFile(null); }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:shadow-md hover:shadow-teal-200"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* ── Customer Table ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Shopper Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">City</th>
                <th className="p-4 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('totalOrders')}>
                  <div className="flex items-center gap-1"><span>Orders</span><ArrowUpDown className="w-3 h-3 text-stone-400" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('totalSpend')}>
                  <div className="flex items-center gap-1"><span>Total Spend</span><ArrowUpDown className="w-3 h-3 text-stone-400" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('lastPurchaseDate')}>
                  <div className="flex items-center gap-1"><span>Last Purchase</span><ArrowUpDown className="w-3 h-3 text-stone-400" /></div>
                </th>
                <th className="p-4">Tags</th>
                <th className="p-4 pr-6 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} onClick={() => setSelectedCustomer(cust)}
                  className="hover:bg-amber-50/40 transition-all cursor-pointer group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-[10px] border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        {cust.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800 text-xs">{cust.name}</h4>
                        <span className="text-[10px] text-stone-400 font-semibold">{cust.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-stone-500 font-normal">
                    <div>{cust.email}</div>
                    <div className="text-[10px] mt-0.5">{cust.phone}</div>
                  </td>
                  <td className="p-4">{cust.city}</td>
                  <td className="p-4 font-semibold text-stone-800">{cust.totalOrders}</td>
                  <td className="p-4 font-bold text-stone-900">₹{cust.totalSpend.toLocaleString()}</td>
                  <td className="p-4 text-stone-500 font-normal">{cust.lastPurchaseDate}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {cust.tags.map(tag => (
                        <span key={tag} className={`px-2 py-0.5 rounded text-[9px] font-bold ${tagColor(tag)}`}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-stone-400 text-xs">No customers found matching the search criteria.</div>
          )}
        </div>
      </div>

      {/* ── CSV Import Modal — rendered via portal to escape overflow container ── */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-[480px] overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-sm">Import Customer Directory</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">Upload a .csv file to add customers in bulk</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportCSV} className="p-6 space-y-4">

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-teal-400 bg-teal-50'
                    : csvFile
                    ? 'border-teal-400 bg-teal-50/40'
                    : 'border-stone-200 hover:border-teal-300 hover:bg-stone-50'
                }`}
              >
                {/* Hidden real file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />

                <div className="space-y-2 pointer-events-none">
                  <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center transition-colors ${csvFile ? 'bg-teal-100' : 'bg-stone-100'}`}>
                    <Upload className={`w-6 h-6 transition-colors ${csvFile ? 'text-teal-600' : 'text-stone-400'}`} />
                  </div>
                  {csvFile ? (
                    <div>
                      <p className="text-sm font-bold text-teal-700">{csvFile.name}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">{(csvFile.size / 1024).toFixed(1)} KB · Ready to import</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-stone-700">Drop your CSV here, or click to browse</p>
                      <p className="text-[11px] text-stone-400 mt-1">Columns: Name, Email, Phone, City, Spend</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column guide */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[10px] text-amber-700 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold mb-0.5">Expected CSV columns (header row required):</p>
                  <p className="font-mono">Name, Email, Phone, City, Spend, Tags (optional)</p>
                </div>
              </div>

              {/* Result banner */}
              {importResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border ${
                  importResult.success
                    ? 'bg-teal-50 border-teal-200 text-teal-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  {importResult.success
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                    : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {importResult.message}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl text-xs font-semibold transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !csvFile}
                  className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:shadow-teal-200"
                >
                  {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isImporting ? 'Importing...' : 'Begin Import'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Customer Profile Drawer ─────────────────────────── */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-stone-900/20 z-40" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed top-0 right-0 h-screen w-[420px] bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold font-display text-sm shadow-md shadow-teal-600/20">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-stone-800 text-sm">{selectedCustomer.name}</h3>
                  <span className="text-[10px] text-stone-400 font-semibold">{selectedCustomer.id}</span>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Shopper Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Shopper Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px]">Email Address</span>
                    <p className="font-semibold text-stone-800 truncate mt-0.5">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px]">Phone Number</span>
                    <p className="font-semibold text-stone-800 mt-0.5">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px]">Location City</span>
                    <p className="font-semibold text-stone-800 mt-0.5">{selectedCustomer.city}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px]">Channel Preference</span>
                    <p className="font-semibold text-teal-600 mt-0.5 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{selectedCustomer.channelPreference}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Active Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCustomer.tags.map(tag => (
                    <span key={tag} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${tagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Campaign History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Campaign History</h4>
                <div className="space-y-2">
                  {selectedCustomer.campaigns.length > 0 ? (
                    selectedCustomer.campaigns.map(camp => (
                      <div key={camp} className="flex items-center justify-between p-2.5 bg-teal-50/30 border border-teal-100 rounded-lg text-xs font-semibold text-stone-700">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                          <span>{camp}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100">Sent</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">No campaigns associated yet.</p>
                  )}
                </div>
              </div>

              {/* Purchase Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Purchase History</h4>
                <div className="relative border-l border-stone-200 pl-4 ml-2 space-y-4">
                  {selectedCustomer.orders.map((order) => (
                    <div key={order.id} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white ring-4 ring-teal-50" />
                      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3.5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800 text-[11px]">{order.id}</span>
                          <span className="font-bold text-stone-900 text-[11px]">₹{order.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Ordered on {order.date}</span>
                        </div>
                        <div className="border-t border-stone-100 pt-2 mt-1 space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-stone-600 flex items-center gap-1 font-medium">
                                <ShoppingBag className="w-3 h-3 text-stone-400" />
                                <span>{item.name}</span>
                              </span>
                              <span className="text-stone-400 font-semibold px-1 rounded bg-stone-100">{item.category}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50 text-center text-[10px] text-stone-400">
              Customer record · {selectedCustomer.id}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
