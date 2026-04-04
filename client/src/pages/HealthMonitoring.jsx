import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { healthApi, cattleApi } from '../services/api';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const HealthMonitoring = () => {
  const [summary, setSummary] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const [summaryRes, alertsRes] = await Promise.all([
        healthApi.getSummary(),
        healthApi.getAlerts()
      ]);
      setSummary(summaryRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Error fetching health data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tag ID', 'Name', 'Status', 'Risk Score', 'Temp', 'Heart Rate', 'Activity', 'Pattern'];
    const csvData = alerts.map(a => [
      a.tagId, a.name, a.healthStatus, a.aiHealthRisk, 
      a.temperature, a.heartRate, a.activity, a.aiBehaviorPattern
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + csvData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health_alerts_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading...</div>;

  const totalCattle = summary.reduce((acc, curr) => acc + curr.count, 0);
  const criticalCount = alerts.filter(a => a.healthStatus === 'critical').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Health Monitoring</h1>
          <p className="text-gray-500">Real-time vital signs and predictive risk analysis</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all"
        >
          <Download size={18} /> Export Reports
        </button>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24} /></div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Healthy</span>
           </div>
           <p className="text-3xl font-bold text-gray-900">{summary.find(s => s.healthStatus === 'healthy')?.count || 0}</p>
           <p className="text-sm text-gray-500 mt-1">Cattle are optimal</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><AlertTriangle size={24} /></div>
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">At Risk</span>
           </div>
           <p className="text-3xl font-bold text-gray-900">{summary.find(s => s.healthStatus === 'sick')?.count || 0}</p>
           <p className="text-sm text-gray-500 mt-1">Requiring attention</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Activity size={24} /></div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Critical</span>
           </div>
           <p className="text-3xl font-bold text-gray-900">{criticalCount}</p>
           <p className="text-sm text-gray-500 mt-1">Immediate action needed</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={24} /></div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Recovering</span>
           </div>
           <p className="text-3xl font-bold text-gray-900">{summary.find(s => s.healthStatus === 'recovering')?.count || 0}</p>
           <p className="text-sm text-gray-500 mt-1">Improving status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BrainCircuit size={20} className="text-purple-600" />
            AI Risk Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="healthStatus" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {summary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Alerts Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-600" />
              Critical AI Alerts
            </h3>
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {alerts.length} Active Alerts
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-red-50/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-2xl h-fit ${alert.healthStatus === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      <HeartPulse size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900">{alert.tagId} - {alert.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          alert.healthStatus === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alert.healthStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">AI Detection: {alert.aiBehaviorPattern}</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Thermometer size={14} className="text-orange-500" />
                          <span>{alert.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Activity size={14} className="text-red-500" />
                          <span>{alert.heartRate} BPM</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-bold">
                          <BrainCircuit size={14} className="text-purple-500" />
                          <span>{(alert.aiHealthRisk * 100).toFixed(0)}% Risk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoring;
