import React, { useState, useEffect } from 'react';
import { 
  Milk, 
  Download, 
  Plus, 
  TrendingUp, 
  Thermometer, 
  Droplets,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { milkApi } from '../services/api';

const MilkYard = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    tagId: '',
    quantity: '',
    quality: 'excellent',
    temperature: '',
    location: 'Main Parlor'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, summaryRes] = await Promise.all([
          milkApi.getAll(),
          milkApi.getSummary()
        ]);
        setRecords(recordsRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error('Error fetching milk data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    const headers = ['ID', 'Tag ID', 'Quantity (L)', 'Quality', 'Temp (°C)', 'Timestamp', 'Location'];
    const csvData = records.map(r => [
      r.id, r.tagId, r.quantity, r.quality, r.temperature, 
      new Date(r.timestamp).toLocaleString(), r.location
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + csvData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `milk_records_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await milkApi.create(newRecord);
      const res = await milkApi.getAll();
      setRecords(res.data);
      setShowAddModal(false);
      setNewRecord({ tagId: '', quantity: '', quality: 'excellent', temperature: '', location: 'Main Parlor' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding record');
    }
  };

  const getQualityBadge = (quality) => {
    const styles = {
      excellent: 'bg-green-100 text-green-700',
      good: 'bg-blue-100 text-blue-700',
      fair: 'bg-yellow-100 text-yellow-700',
      poor: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[quality]}`}>
        {quality}
      </span>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Milk Yard</h1>
          <p className="text-gray-500">Production tracking and quality control</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-farm-green-600 text-white rounded-xl hover:bg-farm-green-700 font-medium shadow-sm transition-all"
          >
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Droplets size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Daily Production</p>
            <p className="text-2xl font-bold text-gray-900">{summary[0]?.totalQuantity || 0} L</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Thermometer size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Temperature</p>
            <p className="text-2xl font-bold text-gray-900">{parseFloat(summary[0]?.avgTemp || 0).toFixed(1)} °C</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Weekly Growth</p>
            <p className="text-2xl font-bold text-gray-900">+12.4%</p>
          </div>
        </div>
      </div>

      {/* Production Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-600" />
          Production Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.map(s => ({ ...s, date: new Date(s.date).toLocaleDateString() })).reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalQuantity" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800">Production History</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Tag ID..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Cattle Tag</th>
                <th className="px-6 py-4 font-semibold">Quantity (L)</th>
                <th className="px-6 py-4 font-semibold">Quality</th>
                <th className="px-6 py-4 font-semibold">Temp</th>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{record.tagId}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{record.quantity} L</td>
                  <td className="px-6 py-4">{getQualityBadge(record.quality)}</td>
                  <td className="px-6 py-4 text-gray-600">{record.temperature}°C</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{record.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Milk Record</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleAddRecord} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cattle Tag ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. C-001"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                      value={newRecord.tagId}
                      onChange={e => setNewRecord({...newRecord, tagId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity (L)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                      value={newRecord.quantity}
                      onChange={e => setNewRecord({...newRecord, quantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temperature (°C)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      placeholder="38.5"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                      value={newRecord.temperature}
                      onChange={e => setNewRecord({...newRecord, temperature: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quality</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none appearance-none"
                      value={newRecord.quality}
                      onChange={e => setNewRecord({...newRecord, quality: e.target.value})}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                    <input 
                      type="text" 
                      placeholder="Main Parlor"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                      value={newRecord.location}
                      onChange={e => setNewRecord({...newRecord, location: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-4 bg-farm-green-600 text-white rounded-xl font-bold text-lg hover:bg-farm-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-[0.98]"
                >
                  Save Record
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilkYard;
