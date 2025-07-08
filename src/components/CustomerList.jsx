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
            const customerData = await window.electronAPI.getCustomers();
            setCustomers(customerData);
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleAddCustomer = async (customerData) => {
        try {
            await window.electronAPI.addCustomer(customerData);
            loadCustomers();
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding customer:', error);
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
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
                    <p className="text-gray-600">Manage your customer database</p>
                </div>
                <div className="flex space-x-3">
                    <label className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center">
                        <Upload size={20} className="mr-2" />
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
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter size={20} className="mr-2" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Designs Shared
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pending Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {customer.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {customer.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{customer.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {customer.invoice_count || 0} designs
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ₹{customer.pending_amount || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onCustomerSelect(customer)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View
                                        </button>
                                        <button className="text-green-600 hover:text-green-900">
                                            <MessageCircle size={16} />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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