import React, { useState, useEffect } from 'react';
import { 
    Package, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Download, 
    ArrowRight,
    Search,
    ShoppingBag,
    CreditCard,
    Smartphone,
    Banknote,
    FileText,
    ExternalLink
} from 'lucide-react';
import { marketplaceApi } from '../services/api';
import { Link } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedCorder] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await marketplaceApi.getOrders();
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = (order) => {
        setSelectedCorder(order);
        setShowInvoice(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'paid': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">My Purchases</h1>
                    <p className="text-lg text-gray-500">Track your orders and download invoices</p>
                </div>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                    {['all', 'pending', 'paid', 'completed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                                filter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center space-y-6">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">Start exploring the marketplace to find fresh dairy products from local farmers.</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-4 bg-farm-green-600 text-white rounded-2xl font-bold hover:bg-farm-green-700 transition-all shadow-lg shadow-green-100">
                        Shop Now <ArrowRight size={20} />
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            {/* Order Header */}
                            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-6 bg-gray-50/30">
                                <div className="flex flex-wrap gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                        <p className="font-black text-gray-900">#AD-{order.id.toString().padStart(5, '0')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Placed</p>
                                        <p className="font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                                        <p className="font-black text-farm-green-600 text-lg">KSh {order.totalAmount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</p>
                                        <div className="flex items-center gap-2 font-bold text-gray-700 capitalize">
                                            {order.payment_method === 'mpesa' ? <Smartphone size={14} /> : order.payment_method === 'card' ? <CreditCard size={14} /> : <Banknote size={14} />}
                                            {order.payment_method}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <button 
                                        onClick={() => handleViewInvoice(order)}
                                        className="p-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                                        title="View Invoice"
                                    >
                                        <FileText size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-8 space-y-6">
                                {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={item.imageUrl || 'https://images.unsplash.com/photo-1550583760-58b910dd8746?auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity} × KSh {item.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900">KSh {(item.quantity * item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Track Status Footer */}
                            {order.status === 'pending' && order.payment_method === 'mpesa' && (
                                <div className="p-6 bg-yellow-50/50 border-t border-yellow-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-yellow-700 text-sm font-bold">
                                        <Clock className="animate-pulse" size={18} />
                                        Awaiting M-Pesa payment confirmation...
                                    </div>
                                    <button 
                                        onClick={() => fetchOrders()}
                                        className="px-4 py-2 bg-white border border-yellow-200 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-100 transition-all"
                                    >
                                        Check Status
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoice && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="p-8 lg:p-12 space-y-8">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-farm-green-600 p-1.5 rounded-lg text-white">
                                            <Package size={20} />
                                        </div>
                                        <span className="font-bold text-xl tracking-tight text-gray-900">Tabora AgriDairy</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Official Invoice</p>
                                </div>
                                <button onClick={() => setShowInvoice(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-y border-gray-100 py-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billed To</p>
                                    <p className="font-bold text-gray-900">Customer #{selectedOrder.buyerId}</p>
                                    <p className="text-sm text-gray-500">Tabora AgriDairy Network</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Details</p>
                                    <p className="font-bold text-gray-900">#AD-{selectedOrder.id.toString().padStart(5, '0')}</p>
                                    <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="pb-4">Product</th>
                                        <th className="pb-4 text-center">Qty</th>
                                        <th className="pb-4 text-right">Price</th>
                                        <th className="pb-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="py-4 font-bold text-gray-900">{item.name}</td>
                                            <td className="py-4 text-center font-medium text-gray-500">{item.quantity}</td>
                                            <td className="py-4 text-right font-medium text-gray-500">KSh {item.price}</td>
                                            <td className="py-4 text-right font-black text-gray-900">KSh {(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Invoice Summary */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Payment Method</span>
                                    <span className="font-bold text-gray-900 capitalize">{selectedOrder.payment_method}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Payment Status</span>
                                    <span className={`font-black uppercase tracking-wider ${
                                        selectedOrder.status === 'completed' || selectedOrder.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                {selectedOrder.status === 'completed' && selectedOrder.payment_method === 'cash' && (
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 text-xs font-bold">
                                        <CheckCircle2 size={18} />
                                        Cash on Delivery Invoice - Fully Completed
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">Grand Total</span>
                                    <span className="text-3xl font-black text-farm-green-600">KSh {selectedOrder.totalAmount}</span>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button 
                                    onClick={() => window.print()}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} /> Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;