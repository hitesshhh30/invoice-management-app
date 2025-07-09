import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, CheckCircle, AlertCircle, Eye, Trash2, FileText, Calendar, User, CreditCard, IndianRupee } from 'lucide-react';
import InvoiceDetail from './InvoiceDetail';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'paid', 'unpaid', 'customer', 'design'
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const filterMenuRef = useRef(null);

    useEffect(() => {
        loadInvoices();

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
        let filtered = [...invoices];
        
        // Apply status filter first
        if (filterBy === 'paid') {
            filtered = filtered.filter(invoice => invoice.is_paid);
        } else if (filterBy === 'unpaid') {
            filtered = filtered.filter(invoice => !invoice.is_paid);
        }
        
        // Apply search based on selected filter
        if (searchTerm) {
            filtered = filtered.filter(invoice => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    invoice.invoice_number.toLowerCase().includes(searchLower) ||
                    invoice.customer_name.toLowerCase().includes(searchLower) ||
                    invoice.design_name.toLowerCase().includes(searchLower) ||
                    invoice.design_code.toLowerCase().includes(searchLower)
                );
            });
        }
        
        setFilteredInvoices(filtered);
    }, [invoices, searchTerm, filterBy]);

    const loadInvoices = async () => {
        try {
            const result = await window.electronAPI.getAllInvoices();
            if (result.success) {
                setInvoices(result.data);
            } else {
                console.error('Error loading invoices:', result.error);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
        }
    };

    const handleDeleteInvoice = async () => {
        if (!invoiceToDelete) return;

        try {
            // Note: You might need to add this API endpoint
            const result = await window.electronAPI.deleteInvoice(invoiceToDelete.id);
            
            if (result.success) {
                setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceToDelete.id));
                showSuccess('Invoice deleted successfully!');
            } else {
                showSuccess('Failed to delete invoice');
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            showSuccess('Error deleting invoice');
        } finally {
            setShowDeleteDialog(false);
            setInvoiceToDelete(null);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3000);
    };

    const getStatusBadge = (isPaid) => {
        if (isPaid) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    <CheckCircle size={12} className="mr-1" />
                    Paid
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    <AlertCircle size={12} className="mr-1" />
                    Unpaid
                </span>
            );
        }
    };

    const filterOptions = [
        { value: 'all', label: 'All Invoices' },
        { value: 'paid', label: 'Paid Only' },
        { value: 'unpaid', label: 'Unpaid Only' }
    ];

    // If an invoice is selected, show the detail view
    if (selectedInvoice) {
        return (
            <InvoiceDetail 
                invoice={selectedInvoice} 
                onBack={() => setSelectedInvoice(null)}
                onInvoiceUpdate={(updatedInvoice) => {
                    setInvoices(prev => prev.map(invoice => 
                        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
                    ));
                    setSelectedInvoice(updatedInvoice);
                }}
            />
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
                            <span className="text-purple-600 font-medium">Invoices</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Management</h1>
                        <p className="text-gray-600">View and manage all generated invoices</p>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="relative" ref={filterMenuRef}>
                                <button
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                    className="flex items-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <Filter size={18} className="mr-2 text-gray-600" />
                                    <span className="text-gray-700 font-medium">
                                        {filterOptions.find(opt => opt.value === filterBy)?.label}
                                    </span>
                                </button>
                                
                                {showFilterMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setFilterBy(option.value);
                                                    setShowFilterMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                                                    filterBy === option.value 
                                                        ? 'bg-purple-50 text-purple-700 font-medium' 
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FileText size={20} className="text-purple-600 mr-2" />
                                <h2 className="font-semibold text-gray-800">Invoice Collection</h2>
                            </div>
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-medium text-purple-700">{filteredInvoices.length}</span> invoices
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Invoice
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Design
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                                        <FileText className="text-purple-600" size={16} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {invoice.invoice_number}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {new Date(invoice.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="text-gray-400 mr-2" size={16} />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.customer_name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invoice.design_name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    Code: {invoice.design_code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <IndianRupee size={14} className="text-green-500 mr-1" />
                                                    <div className="text-sm font-medium text-gray-900">{invoice.amount}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(invoice.is_paid)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => setSelectedInvoice(invoice)}
                                                        className="text-purple-600 hover:text-purple-900 font-medium"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setInvoiceToDelete(invoice);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <FileText className="text-gray-300 mb-4" size={48} />
                                                <p className="font-medium text-gray-500 mb-1">No invoices found</p>
                                                <p className="text-sm text-gray-400">
                                                    {searchTerm 
                                                        ? `No invoices match your search for "${searchTerm}"`
                                                        : "No invoices have been generated yet"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteDialog && invoiceToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                        <AlertCircle className="text-red-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delete Invoice</h3>
                                        <p className="text-gray-600 text-sm">This action cannot be undone</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-6">
                                    Are you sure you want to delete invoice <strong>{invoiceToDelete.invoice_number}</strong>?
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteDialog(false);
                                            setInvoiceToDelete(null);
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteInvoice}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">© 2025 Invoice Management App. All rights reserved.</div>
            </div>
        </div>
    );
};

export default InvoiceList;
