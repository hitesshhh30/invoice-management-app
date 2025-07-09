import React, { useState } from 'react';
import { Home, Users, Settings, ChevronLeft, ChevronRight, Package, FileText, ShoppingBag, Landmark, Share2, Wrench, CreditCard, Plus, Menu, Activity, PieChart } from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange, collapsed, onToggleCollapse }) => {
    const [hoveredMenu, setHoveredMenu] = useState(null);

    const menuItems = [
        { id: 'home', icon: Home, label: 'Dashboard', description: 'Overview' },
        { id: 'customers', icon: Users, label: 'Parties', description: 'Customers & Vendors' },
        { id: 'items', icon: Package, label: 'Items', description: 'Products & Services' },
        { id: 'designs', icon: FileText, label: 'Designs', description: 'View All Designs' },
        { id: 'sale', icon: ShoppingBag, label: 'Sales', description: 'Invoices & Orders' },
        { id: 'purchase', icon: ShoppingBag, label: 'Purchase', description: 'Bills & Payments' },
        { id: 'cash', icon: Landmark, label: 'Banking', description: 'Cash & Bank' },
        { id: 'reports', icon: PieChart, label: 'Reports', description: 'Business Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings', description: 'App Settings' }
    ];

    // Secondary menu items at bottom
    const secondaryMenuItems = [
        { id: 'help', icon: Share2, label: 'Help & Support' },
        { id: 'tools', icon: Wrench, label: 'Business Tools' }
    ];

    return (
        <div 
            className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}
        >
            {/* Header */}
            <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-5' : 'justify-between px-5 py-4'} border-b border-[#2a3448]`}>
                {!collapsed ? (
                    <div className="flex items-center">
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <FileText size={18} className="text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-white">Vyapar App</h1>
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <FileText size={20} className="text-white" />
                    </div>
                )}
                
                {!collapsed && (
                    <button
                        onClick={onToggleCollapse}
                        className="p-1.5 hover:bg-[#2a3448] rounded-md transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-400" />
                    </button>
                )}
            </div>

            {/* Collapse Toggle Button (when collapsed) */}
            {collapsed && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={onToggleCollapse}
                        className="w-9 h-9 bg-[#2a3448] rounded-md flex items-center justify-center hover:bg-[#344058] transition-colors"
                    >
                        <Menu size={18} className="text-gray-400" />
                    </button>
                </div>
            )}

            {/* Quick Action Button */}
            {collapsed ? (
                <div className="flex justify-center mt-5 mb-2">
                    <button className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-md flex items-center justify-center transition-colors shadow-md">
                        <Plus size={20} className="text-white" />
                    </button>
                </div>
            ) : (
                <div className="px-4 py-3">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-md flex items-center justify-center transition-colors shadow-sm font-medium">
                        <Plus size={17} className="mr-1.5" /> Create New
                    </button>
                </div>
            )}

            {/* Menu Items */}
            <nav className="mt-3 overflow-y-auto flex-grow pt-1 px-2">
                <div className={`${!collapsed ? 'px-2 py-1' : ''}`}>
                    {!collapsed && <p className="text-[11px] uppercase font-medium text-gray-500 mb-2 ml-1">MAIN MENU</p>}
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
                            onMouseEnter={() => setHoveredMenu(item.id)}
                            onMouseLeave={() => setHoveredMenu(null)}
                            className={`w-full flex items-center rounded-md mb-1.5 ${
                                collapsed 
                                    ? 'justify-center h-10 relative group'
                                    : 'px-3 py-2 text-left'
                            } transition-all ${
                                currentPage === item.id 
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                                    : 'hover:bg-[#2a3448] text-gray-300'
                            }`}
                        >
                            <item.icon 
                                size={collapsed ? 18 : 17} 
                                strokeWidth={1.75}
                                className={`flex-shrink-0 ${
                                    currentPage === item.id || hoveredMenu === item.id
                                        ? 'text-white' 
                                        : 'text-gray-400'
                                }`} 
                            />
                            
                            {!collapsed && (
                                <div className="ml-3 text-sm">
                                    <div className={`font-medium ${
                                        currentPage === item.id ? 'text-white' : 'text-gray-300'
                                    }`}>{item.label}</div>
                                    <div className="text-[11px] text-gray-400">{item.description}</div>
                                </div>
                            )}
                            
                            {/* Tooltip for collapsed mode */}
                            {collapsed && (
                                <div className="absolute left-full ml-2 w-auto p-2 rounded-md bg-[#1e2532] shadow-lg border border-[#2a3448] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 text-left">
                                    <div className="font-medium text-sm text-white">{item.label}</div>
                                    <div className="text-[11px] text-gray-400">{item.description}</div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                
                {/* Secondary Menu */}
                {!collapsed && (
                    <div className="px-2 pt-4 pb-2">
                        <p className="text-[11px] uppercase font-medium text-gray-500 mb-2 ml-1">OTHER</p>
                        {secondaryMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className="w-full flex items-center px-3 py-2 text-left hover:bg-[#2a3448] rounded-md mb-1.5 transition-colors"
                            >
                                <item.icon size={17} strokeWidth={1.75} className="flex-shrink-0 text-gray-400" />
                                <div className="ml-3 font-medium text-sm text-gray-300">{item.label}</div>
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Show icons for secondary menu when collapsed */}
                {collapsed && (
                    <div className="px-1.5 pt-4 pb-2">
                        {secondaryMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className="w-full flex items-center justify-center h-10 hover:bg-[#2a3448] rounded-md mb-1.5 transition-colors group relative"
                            >
                                <item.icon size={18} strokeWidth={1.75} className="text-gray-400" />
                                
                                {/* Tooltip for collapsed mode */}
                                <div className="absolute left-full ml-2 p-2 rounded-md bg-[#1e2532] shadow-lg border border-[#2a3448] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                                    <div className="text-sm font-medium text-white">{item.label}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer */}
            <div className={`mt-auto ${collapsed ? 'px-1.5 pb-3 pt-1' : 'px-4 pb-4 pt-2'}`}>
                <div className={`${!collapsed ? 'border-t border-[#2a3448] pt-3' : ''}`}>
                    {collapsed ? (
                        <div className="flex justify-center">
                            <div className="w-10 h-10 bg-[#2a3448] rounded-md flex items-center justify-center group relative">
                                <Activity size={16} className="text-yellow-400" />
                                
                                {/* Tooltip for trial status when collapsed */}
                                <div className="absolute left-full ml-2 p-2 rounded-md bg-[#1e2532] shadow-lg border border-[#2a3448] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                                    <div className="text-xs font-medium text-white">7 days trial left</div>
                                    <div className="w-full bg-[#344058] rounded-full h-1.5 mt-1.5">
                                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-[#2a3448] p-3 rounded-md mb-2.5">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs font-medium text-gray-300">7 days Free Trial left</div>
                                    <div className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded">30%</div>
                                </div>
                                <div className="w-full bg-[#344058] rounded-full h-1.5">
                                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            <button className="mt-1 w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:from-yellow-600 hover:to-amber-600 transition-colors flex items-center justify-center shadow-sm">
                                <CreditCard size={14} className="mr-1.5" />
                                Upgrade to Premium
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;