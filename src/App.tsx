import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Warehouse, Package, Users, Truck, Search, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { DashboardStats } from './components/DashboardStats';
import { DashboardCharts } from './components/DashboardCharts';
import { WarehouseList } from './components/WarehouseList';

function NavLink({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
      {children}
    </Link>
  );
}

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div className={`
      fixed inset-0 z-50 lg:hidden
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="absolute inset-0 bg-gray-800 bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            WMS
          </h1>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink to="/warehouses" icon={Warehouse}>Warehouses</NavLink>
          <NavLink to="/inventory" icon={Package}>Inventory</NavLink>
          <NavLink to="/staff" icon={Users}>Staff</NavLink>
          <NavLink to="/orders" icon={Truck}>Orders</NavLink>
        </nav>
      </div>
    </div>
  );
}

function TopNav() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-1">
              <button
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex-shrink-0 ml-4 lg:ml-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  WMS
                </h1>
              </div>
              
              <div className="hidden lg:block ml-10 flex-1">
                <div className="flex items-center space-x-4">
                  <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
                  <NavLink to="/warehouses" icon={Warehouse}>Warehouses</NavLink>
                  <NavLink to="/inventory" icon={Package}>Inventory</NavLink>
                  <NavLink to="/staff" icon={Users}>Staff</NavLink>
                  <NavLink to="/orders" icon={Truck}>Orders</NavLink>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className={`relative ${searchFocused ? 'w-64' : 'w-48'} transition-all duration-300 hidden sm:block`}>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">JD</span>
                </div>
                <button className="hidden sm:flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-800">
                  <span>John Doe</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}

function Dashboard() {
  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Dashboard</h2>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      <DashboardStats />
      <DashboardCharts />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/warehouses" element={<WarehouseList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;