import React from 'react';
import { Home, Users, Settings, ChevronLeft, ChevronRight, Package } from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange, collapsed, onToggleCollapse }) => {
    const menuItems = [
        { id: 'home', icon: Home, label: 'Home', description: 'Add Designs' },
        { id: 'customers', icon: Users, label: 'Customers', description: 'Manage Customers' },
        { id: 'designs', icon: Package, label: 'Designs', description: 'View All Designs' },
        { id: 'settings', icon: Settings, label: 'Settings', description: 'App Settings' }
    ];

    return (
        <div className={`fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-50 ${
            collapsed ? 'w-16' : 'w-64'
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                {!collapsed && (
                    <h1 className="text-xl font-bold">Invoice Manager</h1>
                )}
                <button
                    onClick={onToggleCollapse}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Menu Items */}
            <nav className="mt-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onPageChange(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-slate-800 transition-colors ${
                            currentPage === item.id ? 'bg-slate-800 border-r-2 border-blue-500' : ''
                        }`}
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        {!collapsed && (
                            <div className="ml-3">
                                <div className="font-medium">{item.label}</div>
                                <div className="text-sm text-slate-400">{item.description}</div>
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-slate-400">
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        6 days Free Trial left
                    </div>
                    <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
                        Get Premium
                    </button>
                </div>
            )}
        </div>
    );
};