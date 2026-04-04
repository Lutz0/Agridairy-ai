import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Beef, User, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-farm-green-600 w-12 h-12 rounded-2xl text-white flex items-center justify-center mx-auto mb-4">
                        <Beef size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500">Sign in to your Tabora AgriDairy account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-farm-green-600 text-white rounded-xl font-bold text-lg hover:bg-farm-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Don't have an account? <Link to="/register" className="text-farm-green-600 font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
