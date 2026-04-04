import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  LayoutDashboard, 
  Milk, 
  Beef, 
  HeartPulse, 
  Menu, 
  ChevronLeft,
  Settings,
  Bell,
  ShoppingCart,
  LogOut,
  User,
  Users,
  ShoppingBag,
  Package
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['farmer', 'admin'] },
    { name: 'Milk Yard', path: '/milk-yard', icon: <Milk size={20} />, roles: ['farmer', 'admin'] },
    { name: 'Cattle', path: '/cattle', icon: <Beef size={20} />, roles: ['farmer', 'admin'] },
    { name: 'Health', path: '/health', icon: <HeartPulse size={20} />, roles: ['farmer', 'admin'] },
    { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag size={20} /> },
    { name: 'My Orders', path: '/orders', icon: <Package size={20} />, roles: ['buyer', 'admin'] },
    { name: 'Users', path: '/users', icon: <Users size={20} />, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col sticky top-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-farm-green-600 p-1.5 rounded-lg text-white">
              <Beef size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-800">Tabora AgriDairy</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-6 py-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-farm-green-600 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-farm-green-600 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-farm-green-50 text-farm-green-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className={collapsed ? 'mx-auto' : ''}>{item.icon}</span>
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className={`flex flex-col gap-1 ${collapsed ? 'items-center' : ''}`}>
           <NavLink to="/cart" className={({ isActive }) => `relative flex items-center gap-4 px-3 py-3 rounded-lg transition-colors w-full ${isActive ? 'bg-farm-green-50 text-farm-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <ShoppingCart size={20} />
              {!collapsed && <span>Cart</span>}
              {totalItems > 0 && (
                <span className={`absolute ${collapsed ? 'top-1 right-1' : 'right-3'} bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white`}>
                  {totalItems}
                </span>
              )}
           </NavLink>
           <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors w-full ${isActive ? 'bg-farm-green-50 text-farm-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Settings size={20} />
              {!collapsed && <span>Settings</span>}
           </NavLink>
           <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 w-full transition-colors font-medium mt-2"
           >
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
           </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
