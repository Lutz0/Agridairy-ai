import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, marketplaceApi } from '../services/api';
import { 
    User, 
    Mail, 
    Phone, 
    Lock, 
    ShoppingBag, 
    Plus, 
    Edit2, 
    Trash2, 
    Save, 
    CheckCircle2, 
    Briefcase,
    Camera,
    Smartphone,
    Loader2
} from 'lucide-react';

const Settings = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [products, setProducts] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: '', type: 'milk', price: '', quantityInStock: '', description: '', imageUrl: '' });
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', username: '', email: '', phone: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const CATEGORIES = ['milk', 'cream', 'butter', 'ghee', 'mozzarella', 'feta', 'parmesan', 'cottage cheese'];

    useEffect(() => {
        if (user) {
            setProfileData({ 
                name: user.name, 
                username: user.username, 
                email: user.email, 
                phone: user.phone || '' 
            });
            if (user.role === 'farmer') fetchFarmerProducts();
        }
    }, [user]);

    const fetchFarmerProducts = async () => {
        try {
            const res = await marketplaceApi.getProducts();
            // Since we're filtering on frontend, ensure we only see our own
            const farmerProducts = res.data.filter(p => p.farmerId === user.id);
            setProducts(farmerProducts);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleCategoryAction = (category) => {
        const existing = products.find(p => p.type === category);
        if (existing) {
            setEditingProduct(existing);
            setNewProduct(existing);
        } else {
            setEditingProduct(null);
            setNewProduct({ name: category.charAt(0).toUpperCase() + category.slice(1), type: category, price: '', quantityInStock: '', description: '', imageUrl: '' });
        }
        setShowProductModal(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.updateProfile(profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.changePassword(passwordData);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingProduct) {
                await marketplaceApi.updateProduct(editingProduct.id, newProduct);
            } else {
                await marketplaceApi.createProduct(newProduct);
            }
            fetchFarmerProducts();
            setShowProductModal(false);
            setEditingProduct(null);
            setNewProduct({ name: '', type: 'milk', price: '', quantityInStock: '', description: '', imageUrl: '' });
        } catch (err) {
            alert('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingImage(true);
        try {
            const res = await marketplaceApi.uploadImage(formData);
            setNewProduct({ ...newProduct, imageUrl: res.data.imageUrl });
            setMessage({ type: 'success', text: 'Image uploaded successfully!' });
        } catch (err) {
            console.error('Upload error:', err.response?.data || err.message);
            alert(`Failed to upload image: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await marketplaceApi.deleteProduct(id);
                fetchFarmerProducts();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const handleMpesaPayment = async (e) => {
        e.preventDefault();
        if (!mpesaNumber) return alert('Please enter your M-Pesa number');
        
        setPaymentLoading(true);
        try {
            await authApi.payAccessFee({ 
                phoneNumber: mpesaNumber,
                amount: 1000 // Standard access fee
            });
            setMessage({ type: 'success', text: 'M-Pesa STK Push sent! Please check your phone.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to initiate M-Pesa payment' });
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Profile Header */}
            <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gray-100 border-4 border-white shadow-xl overflow-hidden">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=16a34a&color=fff&size=200`} 
                            alt={user?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-farm-green-600 transition-all scale-0 group-hover:scale-100 origin-center duration-300">
                        <Camera size={20} />
                    </button>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-farm-green-700 text-xs font-bold mb-4 uppercase tracking-widest">
                        {user?.role} Account
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">{user?.name}</h1>
                    <p className="text-gray-500 font-medium mb-8">{user?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-farm-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            Profile Settings
                        </button>
                        {user?.role === 'farmer' && (
                            <button 
                                onClick={() => setActiveTab('products')}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-farm-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                Manage Inventory
                            </button>
                        )}
                        {user?.role === 'farmer' && (
                            <button 
                                onClick={() => setActiveTab('payment')}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'payment' ? 'bg-farm-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                M-Pesa Payment
                            </button>
                        )}
                        <button 
                            onClick={logout}
                            className="px-6 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {activeTab === 'profile' ? (
                    <>
                        {/* Profile Settings */}
                        <div className="lg:col-span-2 bg-white p-8 lg:p-12 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <User className="text-farm-green-600" /> Account Information
                            </h2>
                            {message.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
                                    {message.text}
                                </div>
                            )}
                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="text" required
                                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                                value={profileData.name}
                                                onChange={e => setProfileData({...profileData, name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="tel"
                                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                                value={profileData.phone}
                                                onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Username (Static)</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="text" disabled
                                                className="w-full pl-11 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl cursor-not-allowed font-medium"
                                                value={profileData.username}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 opacity-60">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Email Address (Static)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="email" disabled
                                                className="w-full pl-11 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl cursor-not-allowed font-medium"
                                                value={profileData.email}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    type="submit" disabled={loading}
                                    className="px-10 py-4 bg-farm-green-600 text-white rounded-2xl font-bold text-lg hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all transform active:scale-[0.98] flex items-center gap-3 disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Update Profile</>}
                                </button>
                            </form>
                        </div>

                        {/* Password Settings */}
                        <div className="lg:col-span-1 bg-white p-8 lg:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <Lock className="text-farm-green-600" /> Security
                            </h2>
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Current Password</label>
                                    <input 
                                        type="password" required
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">New Password</label>
                                    <input 
                                        type="password" required
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    />
                                </div>
                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </>
                ) : activeTab === 'products' ? (
                    /* Product Management (Farmer Only) */
                    <div className="lg:col-span-3 bg-white p-8 lg:p-12 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                <ShoppingBag className="text-farm-green-600" /> Marketplace Inventory
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {CATEGORIES.map((category) => {
                                const product = products.find(p => p.type === category);
                                return (
                                    <div key={category} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col">
                                        <div className="relative h-40 rounded-2xl overflow-hidden mb-6 bg-gray-200">
                                            {product?.imageUrl ? (
                                                <img 
                                                    src={product.imageUrl} 
                                                    alt={category}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ShoppingBag size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-farm-green-700 shadow-sm">
                                                    {category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">{category}</h3>
                                            {product ? (
                                                <div className="space-y-1 text-sm text-gray-500 font-medium">
                                                    <p className="text-farm-green-600 font-black text-lg">KSh {product.price}</p>
                                                    <p>Stock: {product.quantityInStock}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No stock listed</p>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleCategoryAction(category)}
                                            className={`mt-6 w-full py-3 rounded-xl font-bold text-sm transition-all ${product ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-farm-green-600 text-white hover:bg-farm-green-700 shadow-lg shadow-green-100'}`}
                                        >
                                            {product ? 'Edit Stock' : 'Add Stock'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Optional M-Pesa Payment Tab */
                    <div className="lg:col-span-3 bg-white p-8 lg:p-12 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                        <div className="max-w-2xl mx-auto text-center space-y-6">
                            <div className="bg-farm-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-farm-green-600">
                                <Smartphone size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900">Optional System Support</h2>
                            <p className="text-gray-500 text-lg">
                                Support the Tabora AgriDairy platform development by paying a one-time optional access fee. 
                                This does not restrict your current access—you can continue using all features freely.
                            </p>
                            
                            {message.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleMpesaPayment} className="space-y-6 mt-10">
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">M-Pesa Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input 
                                            type="tel" required placeholder="2547XXXXXXXX"
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-bold text-lg"
                                            value={mpesaNumber}
                                            onChange={e => setMpesaNumber(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 italic">Fee: KSh 1,000</p>
                                </div>
                                <button 
                                    type="submit" disabled={paymentLoading}
                                    className="w-full py-5 bg-farm-green-600 text-white rounded-2xl font-bold text-xl hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {paymentLoading ? <Loader2 className="animate-spin" /> : 'Pay via M-Pesa'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="p-8 lg:p-12">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <Plus size={32} className="rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-8">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Product Category</label>
                                    <input 
                                        type="text" disabled
                                        className="w-full px-6 py-4 bg-gray-100 border border-gray-100 rounded-2xl cursor-not-allowed font-bold capitalize text-farm-green-700"
                                        value={newProduct.type}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Display Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Price (KSh)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">KSh</span>
                                            <input 
                                                type="number" step="0.01" required
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                                value={newProduct.price}
                                                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Stock Level</label>
                                        <input 
                                            type="number" required
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                                            value={newProduct.quantityInStock}
                                            onChange={e => setNewProduct({...newProduct, quantityInStock: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Description</label>
                                    <textarea 
                                        rows="3"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium resize-none"
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Product Image</label>
                                    <div className="flex items-center gap-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                        <div className="w-24 h-24 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                            {newProduct.imageUrl ? (
                                                <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Camera size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden" 
                                                id="product-image-upload"
                                            />
                                            <label 
                                                htmlFor="product-image-upload"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-all shadow-sm"
                                            >
                                                {uploadingImage ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                                {newProduct.imageUrl ? 'Change Image' : 'Upload Image'}
                                            </label>
                                            <p className="text-[10px] text-gray-400 mt-2">JPG, PNG or WebP. Max 5MB.</p>
                                        </div>
                                    </div>
                                    {/* Keep the manual URL input just in case */}
                                    <input 
                                        type="url"
                                        placeholder="Or paste an image URL"
                                        className="w-full px-6 py-3 mt-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium text-sm"
                                        value={newProduct.imageUrl}
                                        onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 pt-4">
                                    <button 
                                        type="submit" disabled={loading}
                                        className="w-full py-5 bg-farm-green-600 text-white rounded-2xl font-bold text-xl hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={24} /> {editingProduct ? 'Update Product' : 'List Product'}</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
