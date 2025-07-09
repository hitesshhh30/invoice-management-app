import React, { useState } from 'react';
import { Home, Users, FileText, ChevronLeft, ChevronRight, Menu, Diamond, Plus } from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange, collapsed, onToggleCollapse }) => {
    const [hoveredMenu, setHoveredMenu] = useState(null);

    const menuItems = [
        { id: 'home', icon: Home, label: 'Dashboard', description: 'Overview' },
        { id: 'customers', icon: Users, label: 'Customers', description: 'Customer Management' },
        { id: 'designs', icon: Diamond, label: 'Designs', description: 'Jewelry Designs' },
        { id: 'invoices', icon: FileText, label: 'Invoices', description: 'Invoice Management' }
    ];

    return (
        <div 
            className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}
            style={{ backgroundColor: '#ffffff', color: '#333333', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
        >
            {/* Header */}
            <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-5' : 'justify-between px-5 py-4'} border-b border-gray-200`}>
                {!collapsed ? (
                    <div className="flex items-center">
                        <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <Diamond size={18} className="text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-gray-800">Invoice Management</h1>
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <Diamond size={20} className="text-white" />
                    </div>
                )}
                
                {!collapsed && (
                    <button
                        onClick={onToggleCollapse}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-500" />
                    </button>
                )}
            </div>

            {/* Collapse Toggle Button (when collapsed) */}
            {collapsed && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={onToggleCollapse}
                        className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <Menu size={18} className="text-gray-500" />
                    </button>
                </div>
            )}

            {/* Quick Action Button */}
            {collapsed ? (
                <div className="flex justify-center mt-5 mb-2">
                    <button className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-md flex items-center justify-center transition-colors shadow-md">
                        <Plus size={20} className="text-white" />
                    </button>
                </div>
            ) : (
                <div className="px-4 py-3">
                    <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2.5 px-4 rounded-md flex items-center justify-center transition-colors shadow-sm font-medium">
                        <Plus size={17} className="mr-1.5" /> Create New
                    </button>
                </div>
            )}

            {/* Menu Items */}
            <nav className="mt-3 overflow-y-auto flex-grow pt-1 px-2">
                <div className={`${!collapsed ? 'px-2 py-1' : ''}`}>
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
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <item.icon 
                                size={collapsed ? 18 : 17} 
                                strokeWidth={1.75}
                                className={`flex-shrink-0 ${
                                    currentPage === item.id || hoveredMenu === item.id
                                        ? 'text-white' 
                                        : 'text-gray-500'
                                }`} 
                            />
                            
                            {!collapsed && (
                                <div className="ml-3 text-sm">
                                    <div className={`font-medium ${
                                        currentPage === item.id ? 'text-white' : 'text-gray-700'
                                    }`}>{item.label}</div>
                                    <div className="text-[11px] text-gray-500">{item.description}</div>
                                </div>
                            )}
                            
                            {/* Tooltip for collapsed mode */}
                            {collapsed && (
                                <div className="absolute left-full ml-2 w-auto p-2 rounded-md bg-white shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 text-left">
                                    <div className="font-medium text-sm text-gray-800">{item.label}</div>
                                    <div className="text-[11px] text-gray-500">{item.description}</div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;