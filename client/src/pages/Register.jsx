import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Beef, Mail, Lock, User, Phone, Briefcase, Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        username: '',
        email: '', 
        password: '', 
        role: 'farmer', 
        phone: '' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-farm-green-600 w-12 h-12 rounded-2xl text-white flex items-center justify-center mx-auto mb-4">
                        <Beef size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500">Join the Tabora AgriDairy network</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text" required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text" required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email" required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                    placeholder="+1..."
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">I am a...</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none appearance-none transition-all"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="farmer">Farmer</option>
                                    <option value="buyer">Buyer</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password" required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-farm-green-600 text-white rounded-xl font-bold text-lg hover:bg-farm-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-farm-green-600 font-bold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
