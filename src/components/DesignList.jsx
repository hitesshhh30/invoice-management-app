import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MessageCircle, Filter, X, CheckCircle, Palette, Users, Phone, Mail, IndianRupee } from 'lucide-react';
import DesignImage from './DesignImage';
import DesignDetail from './DesignDetail';
import InvoicePDFPreview from './InvoicePDFPreview';
import WhatsAppQRCode from './WhatsAppQRCode';

const DesignList = ({ onNavigateToHome }) => {
    const [designs, setDesigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDesigns, setFilteredDesigns] = useState([]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'name', 'code', 'category'
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
    const [whatsAppDesign, setWhatsAppDesign] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showWhatsAppLogin, setShowWhatsAppLogin] = useState(false);
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [currentInvoiceData, setCurrentInvoiceData] = useState(null);
    const filterMenuRef = useRef(null);

    useEffect(() => {
        loadDesigns();
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
        let filtered = [...designs];
        
        // Apply search based on selected filter
        if (searchTerm) {
            filtered = designs.filter(design => {
                if (filterBy === 'all') {
                    return design.design_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           design.design_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           design.category.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (filterBy === 'name') {
                    return design.design_name.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (filterBy === 'code') {
                    return design.design_code.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (filterBy === 'category') {
                    return design.category.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return true;
            });
        }
        
        setFilteredDesigns(filtered);
    }, [designs, searchTerm, filterBy]);

    const loadDesigns = async () => {
        try {
            const result = await window.electronAPI.getDesigns();
            if (result.success) {
                setDesigns(result.data);
            } else {
                console.error('Error loading designs:', result.error);
            }
        } catch (error) {
            console.error('Error loading designs:', error);
        }
    };

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

    const handleWhatsAppShare = async () => {
        if (!selectedCustomer || !whatsAppDesign) return;

        setIsCreatingInvoice(true);
        try {
            // Step 1: Create invoice automatically
            const invoiceData = await createInvoiceForDesign(selectedCustomer, whatsAppDesign);
            if (!invoiceData) {
                setIsCreatingInvoice(false);
                return;
            }

            // Step 2: Show invoice preview
            setCurrentInvoiceData(invoiceData);
            setShowInvoicePreview(true);
            setShowWhatsAppDialog(false);
            
        } catch (error) {
            console.error('Error in WhatsApp share process:', error);
            showSuccess('Error sharing design');
        } finally {
            setIsCreatingInvoice(false);
        }
    };

    const handleShareFromPreview = async () => {
        if (!currentInvoiceData) return;

        try {
            // Check WhatsApp connection
            const whatsappStatus = await checkWhatsAppConnection();
            if (!whatsappStatus.connected) {
                setShowInvoicePreview(false);
                setShowWhatsAppLogin(true);
                return;
            }

            // Share invoice to WhatsApp
            await shareInvoiceToWhatsApp(selectedCustomer, whatsAppDesign, currentInvoiceData);
            
        } catch (error) {
            console.error('Error sharing invoice to WhatsApp:', error);
            showSuccess('Error sharing invoice');
        }
    };

    const handleWhatsAppLogin = () => {
        localStorage.setItem('whatsapp_connected', 'true');
        setShowWhatsAppLogin(false);
        
        // Continue with the sharing process
        if (currentInvoiceData) {
            shareInvoiceToWhatsApp(selectedCustomer, whatsAppDesign, currentInvoiceData);
        }
    };

    const closeInvoicePreview = () => {
        setShowInvoicePreview(false);
        setCurrentInvoiceData(null);
        setSelectedCustomer(null);
        setWhatsAppDesign(null);
    };

    const createInvoiceForDesign = async (customer, design) => {
        try {
            // Get customer's previous unpaid invoices
            const invoicesResult = await window.electronAPI.getCustomerInvoices(customer.id);
            console.log('Invoices result:', invoicesResult);
            
            const previousUnpaidInvoices = invoicesResult.success && Array.isArray(invoicesResult.data)
                ? invoicesResult.data.filter(inv => !inv.is_paid)
                : [];

            const previousBalance = previousUnpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

            // Create new invoice
            const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const newInvoice = {
                invoiceNumber,
                customerId: customer.id,
                designId: design.id,
                amount: parseFloat(design.price),
                pendingBalance: previousBalance
            };

            console.log('Creating invoice:', newInvoice);
            const result = await window.electronAPI.createInvoice(newInvoice);
            console.log('Invoice creation result:', result);
            
            if (result.success) {
                const invoiceData = {
                    ...newInvoice,
                    id: result.data.lastInsertRowid,
                    design: design,
                    customer: customer,
                    totalAmount: parseFloat(design.price) + previousBalance,
                    previousUnpaidInvoices: previousUnpaidInvoices,
                    createdAt: new Date().toISOString()
                };

                return invoiceData;
            } else {
                console.error('Invoice creation failed:', result.error);
                showSuccess('Failed to create invoice');
                return null;
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            showSuccess('Error creating invoice');
            return null;
        }
    };

    const checkWhatsAppConnection = async () => {
        try {
            const isConnected = localStorage.getItem('whatsapp_connected') === 'true';
            return { connected: isConnected };
        } catch (error) {
            console.error('Error checking WhatsApp connection:', error);
            return { connected: false };
        }
    };

    const shareInvoiceToWhatsApp = async (customer, design, invoiceData) => {
        try {
            // Debug: Check if electronAPI is available
            console.log('Checking electronAPI availability:', !!window.electronAPI);
            console.log('shareToWhatsapp function available:', !!window.electronAPI?.shareToWhatsapp);
            
            if (!window.electronAPI || !window.electronAPI.shareToWhatsapp) {
                console.error('ElectronAPI or shareToWhatsapp not available');
                // For development mode, show success message instead of error
                setShowWhatsAppDialog(false);
                setWhatsAppDesign(null);
                setSelectedCustomer(null);
                setCurrentInvoiceData(null);
                setShowInvoicePreview(false);
                showSuccess(`Invoice ${invoiceData.invoiceNumber} created! (WhatsApp sharing simulated in dev mode)`);
                return;
            }
            
            const result = await window.electronAPI.shareToWhatsapp(customer, design, invoiceData);
            console.log('WhatsApp share result:', result);
            
            if (result.success) {
                setShowWhatsAppDialog(false);
                setWhatsAppDesign(null);
                setSelectedCustomer(null);
                setCurrentInvoiceData(null);
                setShowInvoicePreview(false);
                showSuccess(`Invoice ${invoiceData.invoiceNumber} created! WhatsApp opened and PDF saved. Please attach the PDF file to your WhatsApp message.`);
            } else {
                showSuccess('Failed to share invoice');
            }
        } catch (error) {
            console.error('Error sharing invoice to WhatsApp:', error);
            showSuccess('Error sharing invoice');
        }
    };



    const openWhatsAppDialog = (design) => {
        setWhatsAppDesign(design);
        setShowWhatsAppDialog(true);
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3000);
    };

    const handleDesignUpdate = (updatedDesign) => {
        setDesigns(prev => prev.map(design => 
            design.id === updatedDesign.id ? updatedDesign : design
        ));
        setSelectedDesign(updatedDesign);
    };

    // If a design is selected, show the detail view
    if (selectedDesign) {
        return (
            <DesignDetail 
                design={selectedDesign} 
                onBack={() => setSelectedDesign(null)}
                onDesignUpdate={handleDesignUpdate}
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
                            <span className="text-purple-600 font-medium">Designs</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Management</h1>
                        <p className="text-gray-600">View and manage your jewelry designs</p>
                    </div>
                    
                    <div className="mt-6 lg:mt-0">
                        <button
                            onClick={() => onNavigateToHome && onNavigateToHome()}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <Plus size={18} className="mr-2" />
                            Add New Design
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={`Search designs by ${filterBy === 'all' ? 'name, code, or category' : filterBy}...`}
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
                                                setFilterBy('code');
                                                setShowFilterMenu(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                                                filterBy === 'code' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                            }`}
                                        >
                                            By Code
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFilterBy('category');
                                                setShowFilterMenu(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                                                filterBy === 'category' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                            }`}
                                        >
                                            By Category
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Design Table */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Palette size={20} className="text-purple-600 mr-2" />
                                <h2 className="font-semibold text-gray-800">Design Collection</h2>
                            </div>
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-medium text-purple-700">{filteredDesigns.length}</span> designs
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Design
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDesigns.length > 0 ? (
                                    filteredDesigns.map((design) => (
                                        <tr key={design.id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                                                        <DesignImage
                                                            imagePath={design.image_path}
                                                            alt={design.design_name}
                                                            className="w-full h-full object-cover"
                                                            fallbackIcon={Palette}
                                                            fallbackIconSize={20}
                                                            fallbackIconColor="text-purple-400"
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {design.design_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            Created {new Date(design.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {design.design_code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    {design.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <IndianRupee size={14} className="text-green-500 mr-1" />
                                                    <div className="text-sm font-medium text-gray-900">{design.price}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => setSelectedDesign(design)}
                                                        className="text-purple-600 hover:text-purple-900 font-medium"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => openWhatsAppDialog(design)}
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
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Palette size={40} className="text-gray-300 mb-3" />
                                                <p className="font-medium text-gray-500 mb-1">No designs found</p>
                                                <p className="text-sm text-gray-400 mb-4">
                                                    {searchTerm 
                                                        ? `No designs match your search for "${searchTerm}"`
                                                        : "You haven't added any designs yet"}
                                                </p>
                                                {!searchTerm && (
                                                    <button
                                                        onClick={() => onNavigateToHome && onNavigateToHome()}
                                                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg flex items-center font-medium text-sm"
                                                    >
                                                        <Plus size={16} className="mr-1.5" />
                                                        Add Your First Design
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
                
                {/* WhatsApp Customer Selection Dialog */}
                {showWhatsAppDialog && whatsAppDesign && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900">Select Customer</h3>
                                    <button
                                        onClick={() => {
                                            setShowWhatsAppDialog(false);
                                            setWhatsAppDesign(null);
                                            setSelectedCustomer(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-600 mt-2">Share <strong>{whatsAppDesign.design_name}</strong> with a customer</p>
                            </div>
                            
                            <div className="p-6 max-h-96 overflow-y-auto">
                                {customers.length > 0 ? (
                                    <div className="space-y-2">
                                        {customers.map((customer) => (
                                            <button
                                                key={customer.id}
                                                onClick={() => setSelectedCustomer(customer)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                    selectedCustomer?.id === customer.id
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <Users size={20} className="text-purple-600 mr-3" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{customer.name}</div>
                                                        <div className="text-sm text-gray-500">{customer.phone}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p>No customers found</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowWhatsAppDialog(false);
                                            setWhatsAppDesign(null);
                                            setSelectedCustomer(null);
                                        }}
                                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleWhatsAppShare}
                                        disabled={!selectedCustomer || isCreatingInvoice}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                                            selectedCustomer && !isCreatingInvoice
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {isCreatingInvoice ? 'Creating Invoice...' : 'Share Design'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* WhatsApp Login Dialog */}
                {showWhatsAppLogin && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                                            <MessageCircle className="text-green-600" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Connect WhatsApp</h3>
                                            <p className="text-gray-600 text-sm">Link your device to continue sharing</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowWhatsAppLogin(false)}
                                        className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4">Steps to log in</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
                                                <p className="text-gray-900">Open WhatsApp on your phone</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
                                                <div>
                                                    <p className="text-gray-900">On Android tap Menu</p>
                                                    <p className="text-gray-500 text-sm">On iPhone tap Settings</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
                                                <p className="text-gray-900">Tap Linked devices, then Link device</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</div>
                                                <p className="text-gray-900">Scan the QR code to confirm</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center">
                                        <WhatsAppQRCode onConnectionSuccess={handleWhatsAppLogin} />
                                        
                                        <button
                                            onClick={handleWhatsAppLogin}
                                            className="text-green-600 hover:text-green-700 text-sm font-medium mt-2"
                                        >
                                            Skip QR - Log in with phone number →
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Need help? <a href="#" className="text-green-600 hover:text-green-700">Learn more</a>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowWhatsAppLogin(false)}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleWhatsAppLogin}
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Invoice PDF Preview */}
                {showInvoicePreview && currentInvoiceData && (
                    <InvoicePDFPreview
                        invoiceData={currentInvoiceData}
                        onClose={closeInvoicePreview}
                        onShare={handleShareFromPreview}
                    />
                )}
                
                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">© 2025 Invoice Management App. All rights reserved.</div>
            </div>
        </div>
    );
};

export default DesignList;
