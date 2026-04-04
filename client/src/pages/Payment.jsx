import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { 
    CreditCard, 
    CheckCircle2, 
    Smartphone, 
    Loader2, 
    Beef,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

const Payment = () => {
    const { user, logout } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Initiate Mpesa STK Push
            await api.post('/payments/mpesa', { 
                phoneNumber, 
                amount: 1000 // Fixed access fee
            });
            
            // For this demo, we'll simulate a success response after the STK push is sent
            // In a real app, you'd wait for a websocket or poll the status
            alert('STK Push sent to your phone! Please enter your PIN. Simulating success for this demo...');
            
            await api.post('/payments/simulate-success');
            
            setSuccess(true);
            setTimeout(() => {
                // Logout to force token refresh with updated paymentStatus
                logout();
                navigate('/login');
            }, 3000);
        } catch (err) {
            alert(err.response?.data?.error || 'Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-500">
                    <div className="bg-farm-green-50 text-farm-green-600 p-8 rounded-full w-fit mx-auto mb-8 animate-bounce">
                        <CheckCircle2 size={64} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Payment Received!</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your premium farmer access has been activated. Please log in again to access all features.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-farm-green-600 font-bold">
                        <Loader2 className="animate-spin" size={20} />
                        Redirecting to login...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                {/* Info Side */}
                <div className="flex-1 bg-farm-green-600 p-12 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="bg-white/20 p-3 rounded-2xl w-fit mb-8">
                            <Beef size={32} />
                        </div>
                        <h2 className="text-4xl font-black mb-6 leading-tight">Activate Your Farmer Dashboard</h2>
                        <p className="text-white/80 text-lg mb-10">
                            Get full access to AI health monitoring, production analytics, and marketplace management tools.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Unlimited Cattle Tracking",
                                "AI Risk Assessments",
                                "Marketplace Inventory Management",
                                "Direct Buyer Messaging"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-medium">
                                    <CheckCircle2 size={20} className="text-green-200" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Abstract shapes */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full"></div>
                    <div className="absolute -top-20 -left-20 w-48 h-48 bg-black/10 rounded-full"></div>
                </div>

                {/* Form Side */}
                <div className="flex-1 p-12 flex flex-col justify-center">
                    <div className="mb-10">
                        <span className="text-farm-green-600 font-bold uppercase tracking-widest text-xs">One-time Fee</span>
                        <h3 className="text-3xl font-black text-gray-900 mt-2">KSh 1,000</h3>
                        <p className="text-gray-500 mt-2">Secure checkout via M-Pesa</p>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">M-Pesa Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="tel" required
                                    placeholder="2547XXXXXXXX"
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-5 bg-farm-green-600 text-white rounded-2xl font-bold text-xl hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Smartphone size={24} /> Pay with M-Pesa</>}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-gray-50 flex items-center gap-4 text-gray-400">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-medium">Secured by Safaricom Lipa na M-Pesa</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
