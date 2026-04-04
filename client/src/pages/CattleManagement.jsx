import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  MapPin, 
  Scale, 
  Calendar,
  AlertCircle,
  Stethoscope,
  History,
  X,
  PlusCircle
} from 'lucide-react';
import { cattleApi, healthApi } from '../services/api';

const CattleManagement = () => {
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [newHealthRecord, setNewHealthRecord] = useState({
    recordType: 'checkup',
    description: '',
    weight: '',
    cost: '',
    nextFollowUp: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tagId: '',
    name: '',
    breed: 'Holstein',
    age: '',
    weight: '',
    healthStatus: 'healthy',
    location: '',
    temperature: 38.5,
    heartRate: 65,
    activity: 'grazing',
    milkProduction: 0,
    aiHealthRisk: 0.05,
    aiBehaviorPattern: 'Normal'
  });

  const breeds = [
    'Holstein', 'Jersey', 'Angus', 'Hereford', 'Brown Swiss', 
    'Guernsey', 'Ayrshire', 'Simmental', 'Limousin', 'Charolais',
    'Brahman', 'Gelbvieh'
  ];

  useEffect(() => {
    fetchCattle();
  }, []);

  const fetchCattle = async () => {
    try {
      const res = await cattleApi.getAll();
      setCattle(res.data);
    } catch (err) {
      console.error('Error fetching cattle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await cattleApi.update(editingId, formData);
      } else {
        await cattleApi.create(formData);
      }
      fetchCattle();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving cattle');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cattle?')) {
      try {
        await cattleApi.delete(id);
        fetchCattle();
      } catch (err) {
        console.error('Error deleting cattle:', err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      tagId: '', name: '', breed: 'Holstein', age: '', weight: '',
      healthStatus: 'healthy', location: '', temperature: 38.5,
      heartRate: 65, activity: 'grazing', milkProduction: 0,
      aiHealthRisk: 0.05, aiBehaviorPattern: 'Normal'
    });
  };

  const handleOpenHealthHistory = async (cattle) => {
    setSelectedCattle(cattle);
    setShowHealthModal(true);
    try {
      const res = await healthApi.getHistoryByCattle(cattle.id);
      setHealthHistory(res.data);
    } catch (err) {
      console.error('Error fetching health history:', err);
    }
  };

  const handleAddHealthRecord = async (e) => {
    e.preventDefault();
    try {
      await healthApi.createRecord({
        ...newHealthRecord,
        cattleId: selectedCattle.id,
        tagId: selectedCattle.tagId
      });
      // Refresh history
      const res = await healthApi.getHistoryByCattle(selectedCattle.id);
      setHealthHistory(res.data);
      setNewHealthRecord({ recordType: 'checkup', description: '', cost: '', nextFollowUp: '' });
    } catch (err) {
      alert('Error adding health record');
    }
  };

  const filteredCattle = cattle.filter(c => 
    c.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      healthy: 'bg-green-100 text-green-700',
      sick: 'bg-yellow-100 text-yellow-700',
      critical: 'bg-red-100 text-red-700',
      recovering: 'bg-blue-100 text-blue-700'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getRiskScoreBadge = (score) => {
    const color = score > 0.7 ? 'text-red-600 bg-red-50' : score > 0.4 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
    return (
      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${color}`}>
        {(score * 100).toFixed(0)}%
      </span>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cattle Management</h1>
          <p className="text-gray-500">Inventory and lifecycle management</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-farm-green-600 text-white rounded-xl hover:bg-farm-green-700 font-medium shadow-sm transition-all"
        >
          <Plus size={18} /> Add Cattle
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Tag ID or Name..." 
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCattle.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all ${
              item.activity === 'grazing' ? 'ring-2 ring-green-100' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-2xl ${item.activity === 'grazing' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  <MapPin size={20} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenHealthHistory(item)} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Health History"><History size={16} /></button>
                  <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.tagId}</span>
                  {getStatusBadge(item.healthStatus)}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.name || 'Unnamed Cattle'}</h3>
                <p className="text-sm text-gray-500">{item.breed}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} />
                  <span className="text-sm">{item.age} Years</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Scale size={14} />
                  <span className="text-sm">{item.weight} kg</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={14} className={item.aiHealthRisk > 0.5 ? 'text-red-500' : 'text-green-500'} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">AI Risk Score</span>
                </div>
                {getRiskScoreBadge(item.aiHealthRisk)}
              </div>
            </div>
            
            {item.activity === 'grazing' && (
              <div className="px-6 py-2 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest text-center">
                Currently Grazing
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cattle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit Cattle' : 'Add New Cattle'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tag ID</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={formData.tagId}
                    onChange={e => setFormData({...formData, tagId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Breed</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none appearance-none"
                    value={formData.breed}
                    onChange={e => setFormData({...formData, breed: e.target.value})}
                  >
                    {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                      value={formData.age}
                      onChange={e => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weight (kg)</label>
                    <input 
                      type="number" step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Health Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={formData.healthStatus}
                    onChange={e => setFormData({...formData, healthStatus: e.target.value})}
                  >
                    <option value="healthy">Healthy</option>
                    <option value="sick">Sick</option>
                    <option value="critical">Critical</option>
                    <option value="recovering">Recovering</option>
                  </select>
                </div>
                {formData.healthStatus === 'sick' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Temperature (°C)</label>
                    <input 
                      type="number" step="0.1" required
                      className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      value={formData.temperature}
                      onChange={e => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Activity</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none appearance-none"
                    value={formData.activity}
                    onChange={e => setFormData({...formData, activity: e.target.value})}
                  >
                    <option value="grazing">Grazing</option>
                    <option value="resting">Resting</option>
                    <option value="moving">Moving</option>
                    <option value="feeding">Feeding</option>
                  </select>
                </div>
                <div className="col-span-2">
                   <button 
                    type="submit" 
                    className="w-full py-4 bg-farm-green-600 text-white rounded-xl font-bold text-lg hover:bg-farm-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-[0.98]"
                  >
                    {editingId ? 'Update Cattle' : 'Save Cattle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Health History Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Health History</h2>
                  <p className="text-sm text-gray-500">{selectedCattle?.tagId} - {selectedCattle?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowHealthModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add New Record Form */}
              <div className="lg:col-span-1 space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <PlusCircle size={20} className="text-farm-green-600" />
                  Add Health Record
                </h3>
                <form onSubmit={handleAddHealthRecord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Record Type</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                      value={newHealthRecord.recordType}
                      onChange={e => setNewHealthRecord({...newHealthRecord, recordType: e.target.value})}
                    >
                      <option value="checkup">General Checkup</option>
                      <option value="vet_visit">Vet Visit</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="treatment">Treatment</option>
                      <option value="weight_check">Weight Check</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weight (kg)</label>
                      <input 
                        type="number" step="0.1"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                        placeholder="Current weight"
                        value={newHealthRecord.weight}
                        onChange={e => setNewHealthRecord({...newHealthRecord, weight: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cost (KSh)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                        value={newHealthRecord.cost}
                        onChange={e => setNewHealthRecord({...newHealthRecord, cost: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea 
                      required rows="3"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm resize-none"
                      placeholder="Symptoms, findings, or treatment details..."
                      value={newHealthRecord.description}
                      onChange={e => setNewHealthRecord({...newHealthRecord, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Follow Up</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                      value={newHealthRecord.nextFollowUp}
                      onChange={e => setNewHealthRecord({...newHealthRecord, nextFollowUp: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-farm-green-600 text-white rounded-xl font-bold text-sm hover:bg-farm-green-700 transition-all shadow-sm"
                  >
                    Save Health Record
                  </button>
                </form>
              </div>

              {/* Records Timeline */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <History size={20} className="text-blue-600" />
                  Past Records
                </h3>
                {healthHistory.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No health records found for this cattle.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {healthHistory.map((record) => (
                      <div key={record.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            record.recordType === 'vet_visit' ? 'bg-red-50 text-red-600' :
                            record.recordType === 'vaccination' ? 'bg-blue-50 text-blue-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {record.recordType.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(record.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{record.description}</p>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-xs font-medium">
                          <span className="text-gray-500">Weight: <span className="text-gray-900">{record.weight ? `${record.weight} kg` : 'N/A'}</span></span>
                          <span className="text-gray-500">Cost: <span className="text-gray-900">KSh {record.cost}</span></span>
                          {record.nextFollowUp && (
                            <span className="text-orange-600">Follow-up: {new Date(record.nextFollowUp).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CattleManagement;
