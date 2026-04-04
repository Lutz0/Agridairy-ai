import React, { useState, useEffect } from 'react';
import { marketplaceApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
    ShoppingCart, 
    Search, 
    Filter, 
    Plus, 
    ChevronRight, 
    Star,
    Tag,
    Loader2,
    ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [farmerFilter, setFarmerFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { addToCart, totalItems } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await marketplaceApi.getProducts();
                setProducts(res.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const uniqueFarmers = ['all', ...new Set(products.map(p => p.farmerName))];

    const filteredProducts = products.filter(p => {
        const matchesType = filter === 'all' || p.type === filter;
        const matchesFarmer = farmerFilter === 'all' || p.farmerName === farmerFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesFarmer && matchesSearch;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-farm-green-600" size={48} />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Tabora AgriDairy Marketplace</h1>
                    <p className="text-gray-500">Fresh dairy products direct from local farms</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {user?.role === 'farmer' && (
                        <Link to="/settings" className="flex items-center gap-2 px-6 py-3 bg-farm-green-600 text-white rounded-xl font-bold hover:bg-farm-green-700 transition-all shadow-lg shadow-green-100">
                            <Plus size={20} /> Add Product
                        </Link>
                    )}
                    <Link to="/cart" className="relative p-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 transition-all group">
                        <ShoppingBag size={24} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar max-w-full">
                        {['all', 'milk', 'cream', 'butter', 'ghee', 'mozzarella', 'feta', 'parmesan', 'cottage cheese'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all whitespace-nowrap ${
                                    filter === type 
                                    ? 'bg-farm-green-600 text-white shadow-lg shadow-green-100' 
                                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">Filter by Farmer:</span>
                    {uniqueFarmers.map(farmer => (
                        <button
                            key={farmer}
                            onClick={() => setFarmerFilter(farmer)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                farmerFilter === farmer 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                            }`}
                        >
                            {farmer === 'all' ? 'All Farmers' : farmer}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img 
                                src={product.imageUrl || 'https://images.unsplash.com/photo-1550583760-58b910dd8746?auto=format&fit=crop&w=800&q=80'} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-farm-green-700 shadow-sm border border-green-50">
                                    {product.type}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-farm-green-600 transition-colors">{product.name}</h3>
                                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                    <Star size={14} fill="currentColor" />
                                    <span>4.8</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${product.farmerName}`} alt={product.farmerName} />
                                </div>
                                <button 
                                    onClick={() => setFarmerFilter(product.farmerName)}
                                    className="text-xs text-gray-400 font-medium hover:text-farm-green-600 transition-colors"
                                >
                                    By {product.farmerName}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                <span className="text-2xl font-black text-gray-900">KSh {product.price}</span>
                                <button 
                                    onClick={() => addToCart(product)}
                                    disabled={product.quantityInStock <= 0}
                                    className="p-3 bg-farm-green-50 text-farm-green-600 rounded-xl hover:bg-farm-green-600 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-farm-green-50 disabled:hover:text-farm-green-600"
                                >
                                    <ShoppingCart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                    <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search term.</p>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
