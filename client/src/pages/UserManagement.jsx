import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    Shield, 
    Mail, 
    Phone, 
    Calendar,
    CheckCircle2,
    XCircle,
    UserCheck,
    UserX,
    ShieldCheck,
    Loader2,
    Clock
} from 'lucide-react';
import { authApi } from '../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await authApi.getAllUsers();
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setMessage({ type: 'error', text: 'Failed to fetch users' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await authApi.updateUser(editingUser.id, editingUser);
            setMessage({ type: 'success', text: 'User updated successfully' });
            fetchUsers();
            setShowModal(false);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update user' });
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await authApi.deleteUser(id);
                setMessage({ type: 'success', text: 'User deleted successfully' });
                fetchUsers();
            } catch (err) {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete user' });
            }
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-farm-green-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">User Management</h1>
                    <p className="text-lg text-gray-500">Oversee all farmers, buyers, and administrators</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-6 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm font-bold text-sm text-gray-700"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="farmer">Farmers</option>
                        <option value="buyer">Buyers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {message.text}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Info</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-farm-green-50 group-hover:text-farm-green-600 transition-all">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500 font-medium">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                            user.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                            user.role === 'farmer' ? 'bg-blue-50 text-blue-600' :
                                            'bg-orange-50 text-orange-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-700 font-bold flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {user.email}</p>
                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {user.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`flex items-center gap-2 text-xs font-bold ${user.paymentStatus === 'paid' ? 'text-green-600' : 'text-gray-400'}`}>
                                            {user.paymentStatus === 'paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                            {user.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingUser(user); setShowModal(true); }}
                                                className="p-2 bg-white border border-gray-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 bg-white border border-gray-200 text-red-600 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {showModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 lg:p-12 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900">Edit User</h2>
                                    <p className="text-gray-500">Update @{editingUser.username}'s information</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                        value={editingUser.name}
                                        onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Role</label>
                                        <select 
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-bold text-sm"
                                            value={editingUser.role}
                                            onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                                        >
                                            <option value="farmer">Farmer</option>
                                            <option value="buyer">Buyer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Payment Status</label>
                                        <select 
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-bold text-sm"
                                            value={editingUser.paymentStatus}
                                            onChange={e => setEditingUser({...editingUser, paymentStatus: e.target.value})}
                                        >
                                            <option value="unpaid">Unpaid</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-5 bg-farm-green-600 text-white rounded-2xl font-bold text-xl hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all transform active:scale-[0.98]"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;