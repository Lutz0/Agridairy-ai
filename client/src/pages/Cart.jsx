import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart as useCartContext } from '../context/CartContext';
import { marketplaceApi } from '../services/api';
import { 
    Trash2, 
    Plus, 
    Minus, 
    ShoppingBag, 
    ArrowRight, 
    CheckCircle2, 
    CreditCard,
    ShieldCheck,
    Truck,
    Loader2,
    Smartphone,
    Banknote
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const { 
        cart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        totalPrice 
    } = useCartContext();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [mpesaNumber, setMpesaNumber] = useState('');
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (paymentMethod === 'mpesa' && !mpesaNumber) {
            return alert('Please enter your M-Pesa number');
        }

        setLoading(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: totalPrice,
                paymentMethod,
                mpesaNumber
            };
            await marketplaceApi.createOrder(orderData);
            setOrderSuccess(true);
            clearCart();
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-in fade-in duration-500">
                <div className="bg-farm-green-50 text-farm-green-600 p-8 rounded-full mb-8 animate-bounce">
                    <CheckCircle2 size={64} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4">Order Successful!</h1>
                <p className="text-xl text-gray-500 max-w-md mb-8 leading-relaxed">
                    Thank you for your purchase. Your order has been placed successfully using 
                    <span className="font-bold text-farm-green-600"> {paymentMethod.toUpperCase()}</span>.
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-12 w-full max-w-sm">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="font-bold text-gray-900 capitalize">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-bold text-blue-600">Processing</span>
                    </div>
                </div>
                <Link to="/dashboard" className="px-10 py-5 bg-farm-green-600 text-white rounded-2xl font-bold text-lg hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all flex items-center gap-3">
                    Go to Dashboard <ArrowRight size={24} />
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="bg-gray-50 text-gray-300 p-8 rounded-full mb-8">
                    <ShoppingBag size={64} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h1>
                <p className="text-lg text-gray-500 max-w-sm mb-12">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Link to="/marketplace" className="px-10 py-5 bg-farm-green-600 text-white rounded-2xl font-bold text-lg hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all flex items-center gap-3">
                    Explore Marketplace <ArrowRight size={24} />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Shopping Cart</h1>
                    <p className="text-lg text-gray-500">Review and checkout your items</p>
                </div>
                <button onClick={clearCart} className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-2">
                    <Trash2 size={18} /> Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-all">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50">
                                <img 
                                    src={item.imageUrl || 'https://images.unsplash.com/photo-1550583760-58b910dd8746?auto=format&fit=crop&w=800&q=80'} 
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-400 font-medium mb-2 uppercase tracking-widest">{item.type}</p>
                                <p className="text-xs text-gray-400">Sold by {item.farmerName}</p>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-2 hover:bg-white hover:text-farm-green-600 rounded-xl transition-all shadow-sm"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-black text-lg text-gray-900">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-2 hover:bg-white hover:text-farm-green-600 rounded-xl transition-all shadow-sm"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="text-right flex flex-col gap-2">
                                <span className="text-2xl font-black text-gray-900">KSh {(item.price * item.quantity).toFixed(2)}</span>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm sticky top-24">
                        <h3 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h3>
                        <div className="space-y-6 pb-8 border-b border-gray-50">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Subtotal ({totalItems} items)</span>
                                <span className="text-gray-900 font-bold">KSh {totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Shipping</span>
                                <span className="text-farm-green-600 font-bold">FREE</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Tax (Estimated)</span>
                                <span className="text-gray-900 font-bold">KSh 0.00</span>
                            </div>
                        </div>
                        <div className="py-8 flex justify-between items-center mb-8">
                            <span className="text-xl font-bold text-gray-900">Total Price</span>
                            <span className="text-4xl font-black text-farm-green-600">KSh {totalPrice.toFixed(2)}</span>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-8 space-y-4">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Payment Method</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setPaymentMethod('mpesa')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'mpesa' ? 'border-farm-green-600 bg-green-50 text-farm-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                >
                                    <Smartphone size={24} />
                                    <span className="text-[10px] font-bold">M-Pesa</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'card' ? 'border-farm-green-600 bg-green-50 text-farm-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                >
                                    <CreditCard size={24} />
                                    <span className="text-[10px] font-bold">Card</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'cash' ? 'border-farm-green-600 bg-green-50 text-farm-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                >
                                    <Banknote size={24} />
                                    <span className="text-[10px] font-bold">Cash</span>
                                </button>
                            </div>
                            
                            {paymentMethod === 'mpesa' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">M-Pesa Number</label>
                                    <input 
                                        type="tel"
                                        placeholder="2547XXXXXXXX"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none font-medium"
                                        value={mpesaNumber}
                                        onChange={e => setMpesaNumber(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full py-5 bg-farm-green-600 text-white rounded-2xl font-bold text-xl hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    {paymentMethod === 'mpesa' && <Smartphone size={24} />}
                                    {paymentMethod === 'card' && <CreditCard size={24} />}
                                    {paymentMethod === 'cash' && <Banknote size={24} />}
                                    {paymentMethod === 'mpesa' ? 'Lipa na M-Pesa' : 
                                     paymentMethod === 'card' ? 'Pay with Card' : 
                                     'Pay on Delivery (Cash)'}
                                </>
                            )}
                        </button>
                        
                        <div className="mt-12 space-y-6">
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={20} /></div>
                                <span>Secure payment powered by AI</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Truck size={20} /></div>
                                <span>Direct farm-to-door delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
