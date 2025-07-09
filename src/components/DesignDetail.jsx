import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Edit3, Save, X, CheckCircle, Users, IndianRupee } from 'lucide-react';
import DesignImage from './DesignImage';
import InvoicePDFPreview from './InvoicePDFPreview';
import WhatsAppQRCode from './WhatsAppQRCode';

const DesignDetail = ({ design, onBack, onDesignUpdate }) => {
    const [editMode, setEditMode] = useState({
        name: false,
        code: false,
        category: false,
        price: false
    });
    const [editValues, setEditValues] = useState({
        name: design.design_name,
        code: design.design_code,
        category: design.category,
        price: design.price
    });
    const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showWhatsAppLogin, setShowWhatsAppLogin] = useState(false);
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [currentInvoiceData, setCurrentInvoiceData] = useState(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const result = await window.electronAPI.getCustomers();
            if (result.success) {
                setCustomers(result.data);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleEditToggle = (field) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSave = async (field) => {
        try {
            const updatedDesign = {
                ...design,
                design_name: editValues.name,
                design_code: editValues.code,
                category: editValues.category,
                price: editValues.price
            };

            const result = await window.electronAPI.updateDesign(design.id, {
                name: editValues.name,
                code: editValues.code,
                category: editValues.category,
                price: editValues.price
            });

            if (result.success) {
                setEditMode(prev => ({ ...prev, [field]: false }));
                onDesignUpdate && onDesignUpdate(updatedDesign);
                showSuccess('Design updated successfully!');
            } else {
                showSuccess('Failed to update design');
            }
        } catch (error) {
            console.error('Error updating design:', error);
            showSuccess('Error updating design');
        }
    };

    const handleWhatsAppShare = async () => {
        if (!selectedCustomer) return;

        setIsCreatingInvoice(true);
        try {
            // Step 1: Create invoice automatically
            const invoiceData = await createInvoiceForDesign(selectedCustomer);
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
            await shareInvoiceToWhatsApp(selectedCustomer, currentInvoiceData);
            
        } catch (error) {
            console.error('Error sharing invoice to WhatsApp:', error);
            showSuccess('Error sharing invoice');
        }
    };

    const closeInvoicePreview = () => {
        setShowInvoicePreview(false);
        setCurrentInvoiceData(null);
        setSelectedCustomer(null);
    };

    const createInvoiceForDesign = async (customer) => {
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
            // This would check if WhatsApp Web is connected
            // For now, we'll simulate a check - in real implementation, 
            // this would call a WhatsApp API or check local storage
            const isConnected = localStorage.getItem('whatsapp_connected') === 'true';
            
            return { connected: isConnected };
        } catch (error) {
            console.error('Error checking WhatsApp connection:', error);
            return { connected: false };
        }
    };

    const shareInvoiceToWhatsApp = async (customer, invoiceData) => {
        try {
            // Debug: Check if electronAPI is available
            console.log('Checking electronAPI availability:', !!window.electronAPI);
            console.log('shareToWhatsapp function available:', !!window.electronAPI?.shareToWhatsapp);
            
            if (!window.electronAPI || !window.electronAPI.shareToWhatsapp) {
                console.error('ElectronAPI or shareToWhatsapp not available');
                showSuccess('WhatsApp sharing not available in development mode');
                return;
            }

            const result = await window.electronAPI.shareToWhatsapp(customer, design, invoiceData);
            
            if (result.success) {
                setShowWhatsAppDialog(false);
                setSelectedCustomer(null);
                showSuccess(`Invoice ${invoiceData.invoiceNumber} created! WhatsApp opened and PDF saved. Please attach the PDF file to your WhatsApp message.`);
                
                // Update design with invoice creation info if needed
                onDesignUpdate && onDesignUpdate(design);
            } else {
                showSuccess('Failed to share invoice');
            }
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
            shareInvoiceToWhatsApp(selectedCustomer, currentInvoiceData);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3000);
    };

    const EditableField = ({ field, value, label, type = "text" }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-600">{label}</label>
                <button
                    onClick={() => editMode[field] ? handleSave(field) : handleEditToggle(field)}
                    className="text-purple-600 hover:text-purple-700 p-1 rounded-lg hover:bg-purple-50"
                >
                    {editMode[field] ? <Save size={16} /> : <Edit3 size={16} />}
                </button>
            </div>
            {editMode[field] ? (
                <div className="flex items-center space-x-2">
                    <input
                        type={type}
                        value={editValues[field]}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        autoFocus
                    />
                    <button
                        onClick={() => {
                            setEditValues(prev => ({ ...prev, [field]: value }));
                            setEditMode(prev => ({ ...prev, [field]: false }));
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="text-lg font-semibold text-gray-900">
                    {type === "number" && "₹"}{value}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Success Popup */}
                {showSuccessPopup && (
                    <div className="fixed top-6 right-6 z-50 bg-white rounded-xl shadow-xl border border-green-100 p-4 w-80 animate-fade-in">
                        <div className="flex items-start">
                            <CheckCircle className="text-green-500 mr-3 mt-0.5" size={20} />
                            <div className="flex-1">
                                <h4 className="text-gray-800 font-semibold mb-1">Success</h4>
                                <p className="text-gray-600 text-sm">{successMessage}</p>
                            </div>
                            <button onClick={() => setShowSuccessPopup(false)} className="text-gray-400 hover:text-gray-500">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button
                            onClick={onBack}
                            className="flex items-center text-gray-600 hover:text-purple-600 mr-4 p-2 rounded-lg hover:bg-purple-50"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Designs
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{design.design_name}</h1>
                            <p className="text-gray-600 mt-1">Design Code: {design.design_code}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWhatsAppDialog(true)}
                        disabled={isCreatingInvoice}
                        className={`flex items-center px-6 py-3 rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl ${
                            isCreatingInvoice 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        <MessageCircle size={20} className="mr-2" />
                        {isCreatingInvoice ? 'Creating Invoice...' : 'Share on WhatsApp'}
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Image</h2>
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                            <DesignImage
                                imagePath={design.image_path}
                                alt={design.design_name}
                                className="w-full h-full object-cover"
                                fallbackIconSize={80}
                            />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <EditableField 
                            field="name" 
                            value={design.design_name} 
                            label="Design Name"
                        />
                        <EditableField 
                            field="code" 
                            value={design.design_code} 
                            label="Design Code"
                        />
                        <EditableField 
                            field="category" 
                            value={design.category} 
                            label="Category"
                        />
                        <EditableField 
                            field="price" 
                            value={design.price} 
                            label="Price"
                            type="number"
                        />

                        {/* Additional Info */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Created</h3>
                            <div className="text-lg font-semibold text-gray-900">
                                {new Date(design.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Customer Selection Dialog */}
                {showWhatsAppDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900">Select Customer</h3>
                                    <button
                                        onClick={() => setShowWhatsAppDialog(false)}
                                        className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-600 mt-2">Choose a customer to share this design with</p>
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
                                        onClick={() => setShowWhatsAppDialog(false)}
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
                                    {/* Steps */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4">Steps to log in</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                                    1
                                                </div>
                                                <div>
                                                    <p className="text-gray-900">Open WhatsApp on your phone</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                                    2
                                                </div>
                                                <div>
                                                    <p className="text-gray-900">On Android tap Menu</p>
                                                    <p className="text-gray-500 text-sm">On iPhone tap Settings</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                                    3
                                                </div>
                                                <div>
                                                    <p className="text-gray-900">Tap Linked devices, then Link device</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                                    4
                                                </div>
                                                <div>
                                                    <p className="text-gray-900">Scan the QR code to confirm</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6">
                                            <label className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    defaultChecked
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Stay logged in on this browser</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {/* QR Code */}
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
            </div>
        </div>
    );
};

export default DesignDetail;
