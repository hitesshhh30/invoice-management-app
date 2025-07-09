import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageCircle, Edit, Trash2, Upload, Filter } from 'lucide-react';

const CustomerList = ({ onCustomerSelect }) => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState([]);

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        setFilteredCustomers(
            customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [customers, searchTerm]);

    const loadCustomers = async () => {
        try {
            const result = await window.electronAPI.getCustomers();
            if (result.success) {
                setCustomers(result.data);
            } else {
                console.error('Error loading customers:', result.error);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleAddCustomer = async (customerData) => {
        try {
            const result = await window.electronAPI.addCustomer(customerData);
            if (result.success) {
                loadCustomers();
                setShowAddModal(false);
            } else {
                console.error('Error adding customer:', result.error);
                alert('Error adding customer. Please try again.');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Error adding customer. Please try again.');
        }
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Handle CSV upload logic
            console.log('CSV file selected:', file);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header with breadcrumb */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="hover:text-blue-500 cursor-pointer">Dashboard</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-blue-500">Customers</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
                    <p className="text-gray-600 text-sm mt-1">View and manage your customer database</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <label className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer flex items-center shadow-sm">
                        <Upload size={18} className="mr-1.5 text-gray-500" />
                        Import CSV
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleCSVUpload}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} className="mr-1.5" />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search customers by name, phone or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 shadow-sm"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="text-gray-400" size={18} />
                        </div>
                    </div>
                    
                    <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-md transition-colors">
                        <Filter size={18} className="mr-1.5" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 py-3 px-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">Customer List</h2>
                        <div className="text-sm text-gray-600">
                            Showing {filteredCustomers.length} customers
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Designs Shared
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Pending Amount
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => onCustomerSelect(customer)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium shadow-sm">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {customer.email || 'No email provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <div className="text-sm text-gray-900">{customer.phone || 'No phone'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {customer.invoice_count || 0} designs
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ₹{customer.pending_amount || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCustomerSelect(customer);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    className="text-green-600 hover:text-green-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                                <button 
                                                    className="text-gray-600 hover:text-gray-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-gray-500 text-lg font-medium">No customers found</p>
                                            <p className="text-gray-400 text-sm mt-1">Add a new customer to get started</p>
                                            <button 
                                                onClick={() => setShowAddModal(true)}
                                                className="mt-4 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                                            >
                                                <Plus size={16} className="mr-1.5" />
                                                Add Customer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <AddCustomerModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddCustomer}
                />
            )}
        </div>
    );
};

// Add Customer Modal Component
const AddCustomerModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: '', phone: '', email: '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Add Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerList;