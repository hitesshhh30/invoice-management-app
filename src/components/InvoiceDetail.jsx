import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, MessageCircle, Calendar, User, CreditCard, Package, CheckCircle, X, Edit3, Save } from 'lucide-react';
import DesignImage from './DesignImage';

const InvoiceDetail = ({ invoice, onBack, onInvoiceUpdate }) => {
    const [invoiceData, setInvoiceData] = useState(invoice);
    const [customerData, setCustomerData] = useState(null);
    const [designData, setDesignData] = useState(null);
    const [previousInvoices, setPreviousInvoices] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editingStatus, setEditingStatus] = useState(false);

    useEffect(() => {
        loadInvoiceDetails();
    }, [invoice]);

    const loadInvoiceDetails = async () => {
        try {
            // Load customer details
            const customersResult = await window.electronAPI.getCustomers();
            if (customersResult.success) {
                const customer = customersResult.data.find(c => c.id === invoice.customer_id);
                setCustomerData(customer);
            }

            // Load design details
            const designsResult = await window.electronAPI.getDesigns();
            if (designsResult.success) {
                const design = designsResult.data.find(d => d.id === invoice.design_id);
                setDesignData(design);
            }

            // Load previous invoices for this customer
            const invoicesResult = await window.electronAPI.getCustomerInvoices(invoice.customer_id);
            if (invoicesResult.success) {
                const previousUnpaid = invoicesResult.data.filter(inv => 
                    inv.id !== invoice.id && 
                    !inv.is_paid &&
                    new Date(inv.created_at) < new Date(invoice.created_at)
                );
                setPreviousInvoices(previousUnpaid);
            }
        } catch (error) {
            console.error('Error loading invoice details:', error);
        }
    };

    const togglePaymentStatus = async () => {
        try {
            const newStatus = !invoiceData.is_paid;
            const result = await window.electronAPI.updateInvoiceStatus(invoiceData.id, newStatus);
            
            if (result.success) {
                const updatedInvoice = { ...invoiceData, is_paid: newStatus };
                setInvoiceData(updatedInvoice);
                onInvoiceUpdate(updatedInvoice);
                showSuccess(`Invoice marked as ${newStatus ? 'paid' : 'unpaid'}`);
            }
        } catch (error) {
            console.error('Error updating invoice status:', error);
            showSuccess('Error updating invoice status');
        }
        setEditingStatus(false);
    };

    const generatePDF = async () => {
        try {
            if (!customerData || !designData) {
                showSuccess('Invoice details not fully loaded');
                return;
            }

            // Calculate totals
            const previousBalance = previousInvoices.reduce((sum, inv) => sum + inv.amount, 0);
            const totalAmount = invoiceData.amount + previousBalance;

            // Create PDF data structure
            const pdfData = {
                invoice: invoiceData,
                customer: customerData,
                design: designData,
                previousInvoices: previousInvoices,
                previousBalance: previousBalance,
                totalAmount: totalAmount,
                createdDate: new Date(invoiceData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            };

            // For now, we'll show an alert. Later this would generate actual PDF
            console.log('PDF Data:', pdfData);
            showSuccess('PDF generation will be implemented soon');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            showSuccess('Error generating PDF');
        }
    };

    const shareToWhatsApp = async () => {
        try {
            if (!customerData || !designData) {
                showSuccess('Invoice details not fully loaded');
                return;
            }

            const result = await window.electronAPI.shareToWhatsapp(customerData, designData, invoiceData);
            
            if (result.success) {
                showSuccess('Invoice shared to WhatsApp successfully!');
            } else {
                showSuccess('Failed to share invoice');
            }
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            showSuccess('Error sharing invoice');
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3000);
    };

    const calculateTotalAmount = () => {
        const previousBalance = previousInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        return invoiceData.amount + previousBalance;
    };

    if (!customerData || !designData) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
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
                            Back to Invoices
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{invoiceData.invoice_number}</h1>
                            <p className="text-gray-600 mt-1">
                                Created on {new Date(invoiceData.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={generatePDF}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Download size={18} className="mr-2" />
                            Download PDF
                        </button>
                        <button
                            onClick={shareToWhatsApp}
                            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
                        >
                            <MessageCircle size={18} className="mr-2" />
                            Share WhatsApp
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Design Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Package size={20} className="text-purple-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Design Details</h2>
                        </div>
                        
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 mb-4">
                            <DesignImage
                                imagePath={designData.image_path}
                                alt={designData.design_name}
                                className="w-full h-full object-cover"
                                fallbackIconSize={60}
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Design Name</label>
                                <p className="text-lg font-semibold text-gray-900">{designData.design_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Design Code</label>
                                <p className="text-sm text-gray-900">{designData.design_code}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Category</label>
                                <p className="text-sm text-gray-900">{designData.category}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Price</label>
                                <p className="text-lg font-semibold text-green-600">₹{designData.price}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Invoice Info */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <User size={20} className="text-purple-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                    <p className="text-lg font-semibold text-gray-900">{customerData.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Phone</label>
                                    <p className="text-sm text-gray-900">{customerData.phone}</p>
                                </div>
                                {customerData.email && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Email</label>
                                        <p className="text-sm text-gray-900">{customerData.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <CreditCard size={20} className="text-purple-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-900">Payment Status</h2>
                                </div>
                                <button
                                    onClick={() => setEditingStatus(true)}
                                    className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50"
                                >
                                    <Edit3 size={16} />
                                </button>
                            </div>
                            
                            {editingStatus ? (
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={togglePaymentStatus}
                                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Save size={16} className="mr-2" />
                                        Mark as {invoiceData.is_paid ? 'Unpaid' : 'Paid'}
                                    </button>
                                    <button
                                        onClick={() => setEditingStatus(false)}
                                        className="flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    {invoiceData.is_paid ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <CheckCircle size={16} className="mr-2" />
                                            Paid
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            <X size={16} className="mr-2" />
                                            Unpaid
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Invoice Summary */}
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-6">
                        <FileText size={20} className="text-purple-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">Invoice Summary</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Current Design:</span>
                            <span className="font-semibold text-gray-900">₹{invoiceData.amount}</span>
                        </div>
                        
                        {previousInvoices.length > 0 && (
                            <>
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Previous Unpaid Invoices:</p>
                                    {previousInvoices.map((prevInv) => (
                                        <div key={prevInv.id} className="flex justify-between items-center py-1 text-sm">
                                            <span className="text-gray-500">{prevInv.invoice_number}</span>
                                            <span className="text-gray-700">₹{prevInv.amount}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center text-orange-600">
                                    <span>Previous Balance:</span>
                                    <span className="font-semibold">₹{previousInvoices.reduce((sum, inv) => sum + inv.amount, 0)}</span>
                                </div>
                            </>
                        )}
                        
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                <span>Total Amount:</span>
                                <span>₹{calculateTotalAmount()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
