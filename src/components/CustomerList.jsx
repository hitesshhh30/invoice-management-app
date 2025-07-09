import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MessageCircle, Upload, Filter, X, CheckCircle, Users, FileText, Phone, Mail } from 'lucide-react';
import { importCSV, importExcel } from '../utils/file-importer';

const CustomerList = ({ onCustomerSelect }) => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'name', 'phone', 'email'
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [importedData, setImportedData] = useState([]);
    const filterMenuRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadCustomers();

        // Close filter menu when clicking outside
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let filtered = [...customers];
        
        // Apply search based on selected filter
        if (searchTerm) {
            filtered = customers.filter(customer => {
                if (filterBy === 'all') {
                    return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm) ||
                           (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
                } else if (filterBy === 'name') {
                    return customer.name.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (filterBy === 'phone') {
                    return customer.phone.includes(searchTerm);
                } else if (filterBy === 'email') {
                    return customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return true;
            });
        }
        
        setFilteredCustomers(filtered);
    }, [customers, searchTerm, filterBy]);

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
                showSuccess('Customer added successfully');
            } else {
                console.error('Error adding customer:', result.error);
                alert('Error adding customer. Please try again.');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Error adding customer. Please try again.');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            let data;
            if (file.name.endsWith('.csv')) {
                data = await importCSV(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                data = await importExcel(file);
            } else {
                throw new Error('Unsupported file format');
            }
            
            setImportedData(data);
            setShowImportModal(true);
        } catch (error) {
            console.error('Error importing file:', error);
            alert('Error importing file. Please check the format and try again.');
        }
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImportCustomers = async (selectedCustomers) => {
        if (!selectedCustomers || selectedCustomers.length === 0) return;
        
        let successCount = 0;
        let errorCount = 0;
        
        // Show a loading state or disable the button during import
        
        for (const customer of selectedCustomers) {
            try {
                const result = await window.electronAPI.addCustomer(customer);
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    console.error('Error importing customer:', result.error);
                }
            } catch (error) {
                errorCount++;
                console.error('Error importing customer:', error);
            }
        }
        
        await loadCustomers();
        setShowImportModal(false);
        setImportedData([]);
        showSuccess(`${successCount} customer${successCount !== 1 ? 's' : ''} imported successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Success Popup */}
                {showSuccessPopup && (
                    <div className="fixed top-6 right-6 z-50 bg-white rounded-xl shadow-xl border border-green-100 p-4 w-80 animate-fade-in">
                        <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                                <CheckCircle className="text-green-500" size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-gray-800 font-semibold mb-1">Success</h4>
                                <p className="text-gray-600 text-sm">{successMessage}</p>
                            </div>
                            <button 
                                onClick={() => setShowSuccessPopup(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header with breadcrumb */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span className="hover:text-purple-600 cursor-pointer transition-colors">Dashboard</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mx-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-purple-600 font-medium">Customers</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
                        <p className="text-gray-600">View and manage your customer database</p>
                    </div>
                    
                    <div className="mt-6 lg:mt-0 flex space-x-4">
                        <label className="cursor-pointer">
                            <div className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 shadow-sm">
                                <Upload size={18} className="mr-2 text-purple-600" />
                                Import Customers
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Customer
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={`Search customers by ${filterBy === 'all' ? 'name, phone, or email' : filterBy}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="text-purple-500" size={20} />
                            </div>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        
                        <div className="relative" ref={filterMenuRef}>
                            <button 
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="flex items-center bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                            >
                                <Filter size={18} className="mr-2 text-purple-600" />
                                Filter by: {filterBy === 'all' ? 'All' : filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}
                            </button>
                            
                            {showFilterMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-30 animate-fade-in">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setFilterBy('all');
                                                setShowFilterMenu(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                                                filterBy === 'all' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                            }`}
                                        >
                                            All Fields
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFilterBy('name');
                                                setShowFilterMenu(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                                                filterBy === 'name' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                            }`}
                                        >
                                            By Name
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFilterBy('phone');
                                                setShowFilterMenu(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                                                filterBy === 'phone' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                            }`}
                                        >
                                            By Phone
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFilterBy('email');
                                                setShowFilterMenu(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                                                filterBy === 'email' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                            }`}
                                        >
                                            By Email
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Table */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Users size={20} className="text-purple-600 mr-2" />
                                <h2 className="font-semibold text-gray-800">Customer List</h2>
                            </div>
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-medium text-purple-700">{filteredCustomers.length}</span> customers
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Designs Shared
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Pending Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-purple-50 transition-colors cursor-pointer" onClick={() => onCustomerSelect(customer)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium shadow-sm">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                                                            {customer.email ? (
                                                                <>
                                                                    <Mail size={12} className="mr-1 text-purple-400" />
                                                                    {customer.email}
                                                                </>
                                                            ) : 'No email provided'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Phone size={14} className="text-purple-500 mr-1.5" />
                                                    <div className="text-sm text-gray-900">{customer.phone || 'No phone'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    {customer.invoice_count || 0} designs
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    ₹{customer.pending_amount || 0}
                                                </div>
                                                {customer.pending_amount > 0 && (
                                                    <div className="text-xs text-red-500 mt-0.5">Pending</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onCustomerSelect(customer);
                                                        }}
                                                        className="text-purple-600 hover:text-purple-900 font-medium"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Share via WhatsApp
                                                            const message = `Hi ${customer.name}, check out our latest jewelry designs!`;
                                                            const url = `https://api.whatsapp.com/send?phone=${customer.phone}&text=${encodeURIComponent(message)}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Users size={40} className="text-gray-300 mb-3" />
                                                <p className="font-medium text-gray-500 mb-1">No customers found</p>
                                                <p className="text-sm text-gray-400 mb-4">
                                                    {searchTerm 
                                                        ? `No customers match your search for "${searchTerm}"`
                                                        : "You haven't added any customers yet"}
                                                </p>
                                                {!searchTerm && (
                                                    <button
                                                        onClick={() => setShowAddModal(true)}
                                                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg flex items-center font-medium text-sm"
                                                    >
                                                        <Plus size={16} className="mr-1.5" />
                                                        Add Your First Customer
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">© 2025 Invoice Management App. All rights reserved.</div>
            </div>
            
            {/* Add Customer Modal */}
            {showAddModal && (
                <AddCustomerModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddCustomer}
                />
            )}
            
            {/* Import Customers Modal */}
            {showImportModal && importedData.length > 0 && (
                <ImportCustomersModal
                    onClose={() => {
                        setShowImportModal(false);
                        setImportedData([]);
                    }}
                    onImport={handleImportCustomers}
                    customers={importedData}
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
        email: '',
    });
    
    const [formErrors, setFormErrors] = useState({
        name: '',
        phone: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear errors when typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', phone: '' };
        
        if (!formData.name.trim()) {
            newErrors.name = 'Customer name is required';
            isValid = false;
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
            isValid = false;
        }
        
        setFormErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onAdd(formData);
        }
    };
    
    const handleReset = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
        });
        setFormErrors({
            name: '',
            phone: ''
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Users className="text-purple-600" size={20} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold text-gray-900">Add New Customer</h3>
                            <p className="text-sm text-gray-600">Enter customer details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Customer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border-2 ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm transition-all duration-200`}
                                placeholder="Enter customer name"
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full pl-10 px-4 py-3 border-2 ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm transition-all duration-200`}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            {formErrors.phone && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm transition-all duration-200"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-purple-600 hover:text-purple-700 flex items-center font-medium text-sm"
                        >
                            Reset Form
                        </button>
                        
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Customer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Import Customers Modal Component
const ImportCustomersModal = ({ onClose, onImport, customers }) => {
    const [selectedCustomers, setSelectedCustomers] = useState(customers.map(() => true));
    
    const toggleAllCustomers = (isSelected) => {
        setSelectedCustomers(selectedCustomers.map(() => isSelected));
    };
    
    const toggleCustomer = (index) => {
        const newSelectedCustomers = [...selectedCustomers];
        newSelectedCustomers[index] = !newSelectedCustomers[index];
        setSelectedCustomers(newSelectedCustomers);
    };
    
    const handleImport = () => {
        // Filter only selected customers
        const customersToImport = customers.filter((_, index) => selectedCustomers[index]);
        onImport(customersToImport);
    };
    
    const selectedCount = selectedCustomers.filter(Boolean).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <FileText className="text-purple-600" size={20} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold text-gray-900">Import Customers</h3>
                            <p className="text-sm text-gray-600">Review data before importing</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="mb-4 bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800">
                        <p>Found <strong>{customers.length}</strong> customers in your file. Select the customers you want to import.</p>
                    </div>
                    
                    <div className="mb-3 flex justify-between items-center">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="select-all"
                                checked={selectedCustomers.every(Boolean)}
                                onChange={(e) => toggleAllCustomers(e.target.checked)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-700">
                                Select All
                            </label>
                        </div>
                        <div className="text-sm text-gray-500">
                            Selected: <span className="font-semibold text-purple-700">{selectedCount}</span> of {customers.length}
                        </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-2 py-3 w-10"></th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers.map((customer, index) => (
                                    <tr key={index} className={`${selectedCustomers[index] ? 'bg-purple-50' : ''} hover:bg-gray-50`}>
                                        <td className="px-2 py-3 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedCustomers[index]} 
                                                onChange={() => toggleCustomer(index)}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.phone}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.email || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={selectedCount === 0}
                            className={`${
                                selectedCount === 0 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                            } text-white px-8 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center`}
                        >
                            <Upload size={18} className="mr-2" />
                            Import {selectedCount} Customer{selectedCount !== 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;