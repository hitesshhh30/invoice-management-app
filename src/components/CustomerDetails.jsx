import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Mail, Phone, Download, Edit, Trash2, QrCode, X, CheckCircle, AlertTriangle, Search, Filter, Users } from 'lucide-react';

const CustomerDetails = ({ customer, onBack }) => {
    const [invoices, setInvoices] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'name', 'phone', 'email'
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const filterMenuRef = useRef(null);

    useEffect(() => {
        if (customer && customer.id) {
            loadCustomerInvoices();
            loadDesigns();
        } else {
            // Reset to empty arrays if no customer
            setInvoices([]);
            setDesigns([]);
        }
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
    }, [customer]);

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

    const loadCustomerInvoices = async () => {
        try {
            if (!customer || !customer.id) {
                console.warn('Customer or customer ID is not available');
                setInvoices([]);
                return;
            }
            
            const result = await window.electronAPI.getCustomerInvoices(customer.id);
            if (result && result.success) {
                setInvoices(result.data || []);
            } else {
                console.error('Error loading invoices:', result?.error || 'Unknown error');
                setInvoices([]);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
            setInvoices([]);
        }
    };

    const loadDesigns = async () => {
        try {
            const result = await window.electronAPI.getDesigns();
            if (result && result.success) {
                setDesigns(result.data || []);
            } else {
                console.error('Error loading designs:', result?.error || 'Unknown error');
                setDesigns([]);
            }
        } catch (error) {
            console.error('Error loading designs:', error);
            setDesigns([]);
        }
    };

    const handleUpdateCustomer = async (updatedData) => {
        try {
            const result = await window.electronAPI.updateCustomer(customer.id, updatedData);
            if (result.success) {
                setShowEditModal(false);
                showSuccess('Customer updated successfully');
                // Update customer data in parent component
                Object.assign(customer, updatedData);
            } else {
                console.error('Error updating customer:', result.error);
                alert('Error updating customer. Please try again.');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('Error updating customer. Please try again.');
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            const result = await window.electronAPI.deleteCustomer(customer.id);
            if (result.success) {
                setShowDeleteModal(false);
                showSuccess('Customer deleted successfully');
                setTimeout(() => {
                    onBack();
                }, 1000);
            } else {
                console.error('Error deleting customer:', result.error);
                alert('Error deleting customer. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Error deleting customer. Please try again.');
        }
    };

    const handleDeleteInvoice = async () => {
        try {
            const result = await window.electronAPI.deleteInvoice(selectedInvoice.id);
            if (result.success) {
                setShowDeleteInvoiceModal(false);
                setSelectedInvoice(null);
                showSuccess('Invoice deleted successfully');
                loadCustomerInvoices();
            } else {
                console.error('Error deleting invoice:', result.error);
                alert('Error deleting invoice. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Error deleting invoice. Please try again.');
        }
    };

    const updatePaymentStatus = async (invoiceId, isPaid) => {
        try {
            const result = await window.electronAPI.updateInvoiceStatus(invoiceId, isPaid);
            if (result.success) {
                loadCustomerInvoices();
                showSuccess(`Invoice marked as ${isPaid ? 'paid' : 'unpaid'}`);
            } else {
                console.error('Error updating payment status:', result.error);
                alert('Error updating payment status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert('Error updating payment status. Please try again.');
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3000);
    };

    // Ensure invoices is always an array before calculations
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    
    const totalPending = safeInvoices.length > 0 
        ? safeInvoices.reduce((sum, invoice) => 
            invoice.is_paid ? sum : sum + (invoice.amount || 0), 0
        ) 
        : 0;

    // Return early if customer is not available
    if (!customer) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-gray-500 text-lg">Customer not found</p>
                            <button
                                onClick={onBack}
                                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <span 
                                className="hover:text-purple-600 cursor-pointer transition-colors"
                                onClick={onBack}
                            >
                                Dashboard
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mx-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span 
                                className="hover:text-purple-600 cursor-pointer transition-colors"
                                onClick={onBack}
                            >
                                Customers
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mx-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-purple-600 font-medium">{customer?.name || 'Unknown Customer'}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Details</h1>
                        <p className="text-gray-600">View and manage customer information and invoices</p>
                    </div>
                    
                    <div className="mt-6 lg:mt-0">
                        <button
                            onClick={onBack}
                            className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 shadow-sm"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Back to Customers
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Customer Info - Top Section */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {customer?.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="ml-3">
                                        <h2 className="text-lg font-bold text-gray-900">Customer Information</h2>
                                        <p className="text-sm text-gray-600">ID: {customer?.id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                {/* Customer Details - Compact Cards */}
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                                        <div className="text-sm font-medium text-gray-900">{customer?.name || 'Not provided'}</div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                                        <div className="flex items-center">
                                            <Phone size={12} className="text-purple-500 mr-1" />
                                            <span className="text-sm text-gray-900">{customer?.phone || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                                        <div className="flex items-center">
                                            <Mail size={12} className="text-purple-500 mr-1" />
                                            <span className="text-sm text-gray-900">{customer?.email || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats - Compact Cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-lg font-bold text-purple-600">{safeInvoices.length}</p>
                                        <p className="text-xs text-gray-600">Invoices</p>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <p className="text-lg font-bold text-red-600">₹{totalPending}</p>
                                        <p className="text-xs text-gray-600">Pending</p>
                                    </div>
                                </div>

                                {/* WhatsApp Button - Compact */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => {
                                            const message = `Hi ${customer?.name || 'there'}, check out our latest jewelry designs!`;
                                            const phone = customer?.phone || '';
                                            if (phone) {
                                                const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
                                                window.open(url, '_blank');
                                            } else {
                                                alert('Phone number not available');
                                            }
                                        }}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                        disabled={!customer?.phone}
                                    >
                                        <MessageCircle size={14} className="mr-1.5" />
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer List - Bottom Section */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Users size={20} className="text-purple-600 mr-2" />
                                    <h2 className="font-semibold text-gray-800">All Customers</h2>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-medium text-purple-700">{filteredCustomers.length}</span> customers
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="p-5 border-b border-gray-200 bg-gray-50">
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
                                        filteredCustomers.map((customerItem) => (
                                            <tr key={customerItem.id} className={`hover:bg-purple-50 transition-colors cursor-pointer ${customer?.id === customerItem.id ? 'bg-purple-100' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium shadow-sm">
                                                            {customerItem.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {customerItem.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                                                                {customerItem.email ? (
                                                                    <>
                                                                        <Mail size={12} className="mr-1 text-purple-400" />
                                                                        {customerItem.email}
                                                                    </>
                                                                ) : 'No email provided'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Phone size={14} className="text-purple-500 mr-1.5" />
                                                        <div className="text-sm text-gray-900">{customerItem.phone || 'No phone'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                        {customerItem.invoice_count || 0} designs
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ₹{customerItem.pending_amount || 0}
                                                    </div>
                                                    {customerItem.pending_amount > 0 && (
                                                        <div className="text-xs text-red-500 mt-0.5">Pending</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Navigate to this customer's details
                                                                window.location.reload();
                                                            }}
                                                            className="text-purple-600 hover:text-purple-900 font-medium"
                                                        >
                                                            {customer?.id === customerItem.id ? 'Current' : 'View'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Share via WhatsApp
                                                                const message = `Hi ${customerItem.name}, check out our latest jewelry designs!`;
                                                                const url = `https://api.whatsapp.com/send?phone=${customerItem.phone}&text=${encodeURIComponent(message)}`;
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
                                                    <p className="text-sm text-gray-400">
                                                        {searchTerm 
                                                            ? `No customers match your search for "${searchTerm}"`
                                                            : "No customers available"}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">© 2025 Invoice Management App. All rights reserved.</div>
            </div>

            {/* Edit Customer Modal */}
            {showEditModal && (
                <EditCustomerModal
                    customer={customer}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdateCustomer}
                />
            )}

            {/* Delete Customer Modal */}
            {showDeleteModal && (
                <DeleteConfirmModal
                    title="Delete Customer"
                    message={`Are you sure you want to delete ${customer.name}? This action cannot be undone and will also delete all associated invoices.`}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteCustomer}
                />
            )}

            {/* Delete Invoice Modal */}
            {showDeleteInvoiceModal && selectedInvoice && (
                <DeleteConfirmModal
                    title="Delete Invoice"
                    message={`Are you sure you want to delete invoice ${selectedInvoice.invoice_number}? This action cannot be undone.`}
                    onClose={() => {
                        setShowDeleteInvoiceModal(false);
                        setSelectedInvoice(null);
                    }}
                    onConfirm={handleDeleteInvoice}
                />
            )}
        </div>
    );
};

// Edit Customer Modal Component
const EditCustomerModal = ({ customer, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
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
            onUpdate(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Edit className="text-purple-600" size={20} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold text-gray-900">Edit Customer</h3>
                            <p className="text-sm text-gray-600">Update customer information</p>
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
                    
                    <div className="mt-6 flex justify-end space-x-3">
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
                            <Edit size={18} className="mr-2" />
                            Update Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ title, message, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="text-red-600" size={20} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-600">This action cannot be undone</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-700">{message}</p>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center"
                        >
                            <Trash2 size={18} className="mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// WhatsApp QR Modal Component (keeping the existing one but updating styling)
const WhatsAppQRModal = ({ onClose, customer }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <MessageCircle className="text-green-600" size={20} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold text-gray-900">WhatsApp Integration</h3>
                            <p className="text-sm text-gray-600">Share designs directly</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start">
                            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</span>
                            <p className="text-gray-700">Open WhatsApp on your phone</p>
                        </div>
                        <div className="flex items-start">
                            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</span>
                            <p className="text-gray-700">Tap Menu ⋮ or Settings ⚙️ and select linked devices</p>
                        </div>
                        <div className="flex items-start">
                            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</span>
                            <p className="text-gray-700">Tap on "Link a Device"</p>
                        </div>
                        <div className="flex items-start">
                            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">4</span>
                            <p className="text-gray-700">Scan the QR code below</p>
                        </div>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center relative">
                            <QrCode size={64} className="text-gray-400" />
                            <div className="absolute bg-white rounded-full p-2 shadow-md">
                                <MessageCircle size={24} className="text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center bg-green-50 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">What you'll get:</h4>
                        <p className="text-sm text-gray-600">
                            Direct access to {customer.name}'s WhatsApp chat with design details ready to send.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;