import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Mail, Phone, Download, Edit, QrCode } from 'lucide-react';

const CustomerDetails = ({ customer, onBack }) => {
    const [invoices, setInvoices] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        if (customer) {
            loadCustomerInvoices();
            loadDesigns();
        }
    }, [customer]);

    const loadCustomerInvoices = async () => {
        try {
            const invoiceData = await window.electronAPI.getCustomerInvoices(customer.id);
            setInvoices(invoiceData);
        } catch (error) {
            console.error('Error loading invoices:', error);
        }
    };

    const loadDesigns = async () => {
        try {
            const designData = await window.electronAPI.getDesigns();
            setDesigns(designData);
        } catch (error) {
            console.error('Error loading designs:', error);
        }
    };

    const handleShareDesign = async (design) => {
        try {
            // Generate invoice
            const invoiceData = {
                invoiceNumber: `INV-${Date.now()}`,
                customerId: customer.id,
                designId: design.id,
                amount: design.price
            };

            await window.electronAPI.createInvoice(invoiceData);
            
            // Open WhatsApp
            const success = await window.electronAPI.shareToWhatsApp(customer, design, invoiceData);
            
            if (success) {
                setShowQRModal(true);
                loadCustomerInvoices(); // Refresh invoices
            }
        } catch (error) {
            console.error('Error sharing design:', error);
        }
    };

    const updatePaymentStatus = async (invoiceId, isPaid) => {
        try {
            await window.electronAPI.updateInvoiceStatus(invoiceId, isPaid);
            loadCustomerInvoices();
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

    const totalPending = invoices.reduce((sum, invoice) => 
        invoice.is_paid ? sum : sum + invoice.amount, 0
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Customers
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
                    <p className="text-gray-600">Customer Details & Transaction History</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowQRModal(true)}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <MessageCircle size={20} className="mr-2" />
                        WhatsApp
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Edit size={20} className="mr-2" />
                        Edit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
                                <p className="text-gray-600">Customer ID: {customer.id}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <Phone size={16} className="text-gray-500 mr-3" />
                                <span className="text-gray-700">{customer.phone}</span>
                            </div>
                            <div className="flex items-center">
                                <Mail size={16} className="text-gray-500 mr-3" />
                                <span className="text-gray-700">{customer.email}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
                                    <p className="text-sm text-gray-600">Total Invoices</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">₹{totalPending}</p>
                                    <p className="text-sm text-gray-600">Pending Amount</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Design */}
                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">Share New Design</h3>
                        <div className="space-y-3">
                            {designs.slice(0, 3).map(design => (
                                <div key={design.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{design.design_name}</p>
                                        <p className="text-sm text-gray-600">₹{design.price}</p>
                                    </div>
                                    <button
                                        onClick={() => handleShareDesign(design)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                    >
                                        Share
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            View All Designs
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">Transaction History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Invoice
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Design
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invoice.invoice_number}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(invoice.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {invoice.image_path && (
                                                        <img
                                                            src={invoice.image_path}
                                                            alt={invoice.design_name}
                                                            className="w-10 h-10 rounded-lg mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {invoice.design_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {invoice.design_code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">₹{invoice.amount}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    invoice.is_paid
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {invoice.is_paid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => updatePaymentStatus(invoice.id, !invoice.is_paid)}
                                                        className={`text-sm px-3 py-1 rounded ${
                                                            invoice.is_paid
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                    >
                                                        {invoice.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                                                    </button>
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp QR Modal */}
            {showQRModal && (
                <WhatsAppQRModal
                    onClose={() => setShowQRModal(false)}
                    customer={customer}
                />
            )}
        </div>
    );
};

// WhatsApp QR Modal Component
const WhatsAppQRModal = ({ onClose, customer }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-center mb-6">How To Proceed</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</span>
                        <p className="text-gray-700">Open WhatsApp on your phone</p>
                    </div>
                    <div className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</span>
                        <p className="text-gray-700">Tap Menu ⋮ or Settings ⚙️ and attached linked devices</p>
                    </div>
                    <div className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</span>
                        <p className="text-gray-700">Tap on Link a Device</p>
                    </div>
                    <div className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">4</span>
                        <p className="text-gray-700">Point your phone on this view to capture the code</p>
                    </div>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode size={64} className="text-gray-400" />
                        <div className="absolute bg-white rounded-full p-2">
                            <MessageCircle size={24} className="text-green-500" />
                        </div>
                    </div>
                </div>

                <p className="text-center text-blue-500 mb-6">Scan this QR code</p>

                <div className="text-center">
                    <h3 className="font-semibold text-gray-800 mb-2">What you will get</h3>
                    <p className="text-sm text-gray-600">
                        Direct access to {customer.name}'s WhatsApp chat with the design details ready to send.
                    </p>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
export { CustomerDetails };