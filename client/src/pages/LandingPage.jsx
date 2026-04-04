import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Beef, 
    ArrowRight, 
    ShieldCheck, 
    Zap, 
    BarChart3, 
    ShoppingCart,
    Github,
    Twitter,
    Linkedin,
    CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
    const { user } = useAuth();

    const features = [
        {
            title: "AI Health Monitoring",
            description: "Real-time vital signs tracking and predictive risk assessment for your livestock.",
            icon: <ShieldCheck className="text-farm-green-600" size={24} />,
        },
        {
            title: "Production Analytics",
            description: "Deep insights into milk production trends and quality metrics with interactive charts.",
            icon: <BarChart3 className="text-farm-green-600" size={24} />,
        },
        {
            title: "Smart Marketplace",
            description: "A direct-to-consumer marketplace for dairy products with built-in inventory management.",
            icon: <ShoppingCart className="text-farm-green-600" size={24} />,
        },
        {
            title: "Real-time Alerts",
            description: "Instant notifications for health risks, behavior patterns, and production anomalies.",
            icon: <Zap className="text-farm-green-600" size={24} />,
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="bg-farm-green-600 p-1.5 rounded-lg text-white">
                                <Beef size={24} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">Tabora AgriDairy</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                            <a href="#features" className="hover:text-farm-green-600 transition-colors">Features</a>
                            <a href="#pricing" className="hover:text-farm-green-600 transition-colors">Pricing</a>
                            <Link to="/marketplace" className="hover:text-farm-green-600 transition-colors">Marketplace</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link to="/dashboard" className="px-5 py-2.5 bg-farm-green-600 text-white rounded-xl font-bold text-sm hover:bg-farm-green-700 transition-all">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">Login</Link>
                                    <Link to="/register" className="px-5 py-2.5 bg-farm-green-600 text-white rounded-xl font-bold text-sm hover:bg-farm-green-700 shadow-lg shadow-green-100 transition-all">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="flex-1 text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-farm-green-50 text-farm-green-700 rounded-full text-sm font-bold animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-farm-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-farm-green-500"></span>
                            </span>
                            Smart Livestock Management
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1]">
                            The Future of <span className="text-farm-green-600">Dairy Farming</span> is Here.
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Tabora AgriDairy helps farmers monitor livestock health, track milk production, and manage direct-to-consumer sales in one intelligent platform.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-farm-green-600 text-white rounded-2xl font-bold text-lg hover:bg-farm-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2 group">
                                Start Monitoring <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/marketplace" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
                                Explore Marketplace
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                            <img 
                                src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                                alt="Cattle Monitoring"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50 -z-0"></div>
                        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-0"></div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold text-farm-green-600 uppercase tracking-widest mb-4">Core Modules</h2>
                        <h3 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Built for Modern Farming</h3>
                        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
                            Comprehensive tools designed to increase efficiency, ensure animal welfare, and maximize production quality through data-driven decisions.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="p-3 bg-green-50 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing / Benefits Banner */}
            <section id="pricing" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-farm-green-600 rounded-[3rem] p-8 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
                        <div className="relative z-10 text-center lg:text-left flex-1">
                            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-8">
                                One Simple Plan for Every Farm Size.
                            </h2>
                            <ul className="space-y-4 mb-10">
                                {["Unlimited cattle tracking", "AI Health risk assessment", "Milk quality analytics", "Marketplace listing fees included"].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-white/90 font-medium">
                                        <CheckCircle2 size={20} className="text-green-200" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-farm-green-700 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
                                Get Started Free <ArrowRight size={20} />
                            </Link>
                        </div>
                        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center flex-shrink-0 w-full lg:w-80">
                            <span className="text-green-100 text-sm font-bold uppercase tracking-widest">Monthly</span>
                            <div className="flex items-center justify-center gap-1 mt-2 mb-4">
                                <span className="text-white text-4xl lg:text-6xl font-black">KSh 4,900</span>
                            </div>
                            <p className="text-white/60 text-sm font-medium mb-8">No hidden fees. Cancel anytime.</p>
                        </div>
                        {/* Decorative background shapes */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full -z-0"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full -z-0"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-100 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-farm-green-600 p-1.5 rounded-lg text-white">
                                    <Beef size={24} />
                                </div>
                                <span className="font-bold text-xl tracking-tight text-gray-900">Tabora AgriDairy</span>
                            </div>
                            <p className="text-gray-500 max-w-xs mb-8">
                                Revolutionizing the dairy industry through data, artificial intelligence, and direct commerce.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-farm-green-600 hover:border-green-100 transition-all shadow-sm">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-farm-green-600 hover:border-green-100 transition-all shadow-sm">
                                    <Linkedin size={20} />
                                </a>
                                <a href="#" className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-farm-green-600 hover:border-green-100 transition-all shadow-sm">
                                    <Github size={20} />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-gray-500 font-medium">
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Marketplace</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Releases</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-gray-500 font-medium">
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Support</h4>
                            <ul className="space-y-4 text-sm text-gray-500 font-medium">
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">API Status</a></li>
                                <li><a href="#" className="hover:text-farm-green-600 transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                        <p>© 2026 Tabora AgriDairy. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-600 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
