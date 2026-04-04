import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Milk, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  HeartPulse
} from 'lucide-react';
import { dashboardApi } from '../services/api';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const cardStats = [
    { label: 'Total Cattle', value: stats?.totalCattle || 0, icon: <Users className="text-blue-600" />, change: '+2.5%' },
    { label: 'Daily Milk (L)', value: stats?.dailyMilk || 0, icon: <Milk className="text-farm-green-600" />, change: '+4.2%' },
    { label: 'Risk Alerts', value: stats?.recentActivity.filter(a => a.type === 'health' && (a.detail === 'sick' || a.detail === 'critical')).length || 0, icon: <AlertTriangle className="text-red-600" />, change: '-1' },
    { label: 'Avg Production', value: '22.4L', icon: <TrendingUp className="text-purple-600" />, change: '+0.8%' },
  ];

  const pieData = stats?.healthDistribution.map(item => ({
    name: item.healthStatus.charAt(0).toUpperCase() + item.healthStatus.slice(1),
    value: item.count
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Farm Overview</h1>
        <p className="text-gray-500">Real-time monitoring and AI insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {stat.change} <ArrowUpRight size={14} className="ml-1" />
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Milk Production Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mon', value: 2400 },
                { name: 'Tue', value: 1398 },
                { name: 'Wed', value: 9800 },
                { name: 'Thu', value: 3908 },
                { name: 'Fri', value: 4800 },
                { name: 'Sat', value: 3800 },
                { name: 'Sun', value: 4300 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Health Distribution</h3>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold">{stats?.totalCattle}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
        <div className="space-y-6">
          {stats?.recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-lg ${
                activity.type === 'milk' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {activity.type === 'milk' ? <Milk size={18} /> : <HeartPulse size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {activity.type === 'milk' ? `Milk Recorded: ${activity.detail}L` : `Health Status: ${activity.detail}`}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock size={12} /> Cattle Tag: {activity.tagId} • {new Date(activity.time).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
