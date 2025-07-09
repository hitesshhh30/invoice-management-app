import React, { useState } from 'react';
import { Download, MessageCircle, X, FileText, Calendar, User, Package, IndianRupee } from 'lucide-react';
import DesignImage from './DesignImage';
import { PDFGenerator } from '../utils/pdf-generator';
import { pdfService } from '../utils/pdf-service';

const InvoicePDFPreview = ({ invoiceData, onClose, onShare }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        try {
            await onShare();
        } finally {
            setIsSharing(false);
        }
    };

    const generatePDF = async () => {
        setIsDownloading(true);
        try {
            const { customer, design } = invoiceData;
            
            // Use the improved PDF service
            const result = await pdfService.generateAndDownload(customer, design, invoiceData, "Jewelry Collection");
            
            if (result.success) {
                alert(`📄 PDF downloaded successfully as ${result.fileName}!\n\n💡 You can also share this invoice directly via WhatsApp using the "Share via WhatsApp" button.`);
            } else {
                throw new Error(result.error || 'Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('❌ Error generating PDF. Please try again.\n\nDetails: ' + error.message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-white">
                            <FileText size={24} className="mr-3" />
                            <div>
                                <h2 className="text-xl font-semibold">Invoice Preview</h2>
                                <p className="text-purple-100 text-sm">Review before sharing</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-purple-200 p-2 hover:bg-purple-600 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <div className="bg-white">
                        {/* Invoice Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-purple-600 mb-2">JEWELRY INVOICE</h1>
                            <div className="text-gray-600">
                                <p className="font-medium">Invoice #{invoiceData.invoiceNumber}</p>
                                <p>Date: {new Date(invoiceData.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Customer Info */}
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-center mb-4">
                                    <User className="text-purple-600 mr-2" size={20} />
                                    <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-gray-600 text-sm">Name:</span>
                                        <p className="font-medium text-gray-900">{invoiceData.customer.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-sm">Phone:</span>
                                        <p className="font-medium text-gray-900">{invoiceData.customer.phone}</p>
                                    </div>
                                    {invoiceData.customer.email && (
                                        <div>
                                            <span className="text-gray-600 text-sm">Email:</span>
                                            <p className="font-medium text-gray-900">{invoiceData.customer.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Info */}
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-center mb-4">
                                    <Calendar className="text-purple-600 mr-2" size={20} />
                                    <h3 className="text-lg font-semibold text-gray-900">Invoice Information</h3>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-gray-600 text-sm">Invoice Number:</span>
                                        <p className="font-medium text-gray-900">{invoiceData.invoiceNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-sm">Date:</span>
                                        <p className="font-medium text-gray-900">
                                            {new Date(invoiceData.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-sm">Status:</span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Unpaid
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Design Section */}
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <Package className="text-purple-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Design Details</h3>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="aspect-square bg-white rounded-xl overflow-hidden border-2 border-gray-200">
                                        <DesignImage
                                            imagePath={invoiceData.design.image_path}
                                            alt={invoiceData.design.design_name}
                                            className="w-full h-full object-cover"
                                            fallbackIconSize={60}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-gray-600 text-sm">Design Name:</span>
                                            <p className="font-semibold text-gray-900 text-lg">{invoiceData.design.design_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Design Code:</span>
                                            <p className="font-medium text-gray-900">{invoiceData.design.design_code}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Category:</span>
                                            <p className="font-medium text-gray-900">{invoiceData.design.category}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Price:</span>
                                            <p className="font-bold text-green-600 text-xl flex items-center">
                                                <IndianRupee size={18} className="mr-1" />
                                                {invoiceData.design.price}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Current Design:</span>
                                    <span className="font-medium text-gray-900 flex items-center">
                                        <IndianRupee size={16} className="mr-1" />
                                        {invoiceData.amount}
                                    </span>
                                </div>
                                
                                {invoiceData.previousUnpaidInvoices && invoiceData.previousUnpaidInvoices.length > 0 && (
                                    <>
                                        <div className="border-t pt-3">
                                            <p className="text-sm font-medium text-gray-600 mb-2">Previous Unpaid Invoices:</p>
                                            {invoiceData.previousUnpaidInvoices.map((prevInv, index) => (
                                                <div key={index} className="flex justify-between items-center py-1 text-sm">
                                                    <span className="text-gray-500">{prevInv.invoice_number}</span>
                                                    <span className="text-gray-700 flex items-center">
                                                        <IndianRupee size={14} className="mr-1" />
                                                        {prevInv.amount}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center text-orange-600 border-t pt-3">
                                            <span className="font-medium">Previous Balance:</span>
                                            <span className="font-semibold flex items-center">
                                                <IndianRupee size={16} className="mr-1" />
                                                {invoiceData.pendingBalance}
                                            </span>
                                        </div>
                                    </>
                                )}
                                
                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                        <span>Total Amount:</span>
                                        <span className="text-purple-600 flex items-center">
                                            <IndianRupee size={20} className="mr-1" />
                                            {invoiceData.totalAmount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                        >
                            Close
                        </button>
                        <div className="flex space-x-3">
                            <button
                                onClick={generatePDF}
                                disabled={isDownloading}
                                className={`flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
                                    isDownloading 
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <Download size={18} className="mr-2" />
                                {isDownloading ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className={`flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
                                    isSharing 
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                <MessageCircle size={18} className="mr-2" />
                                {isSharing ? 'Sharing...' : 'Share on WhatsApp'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePDFPreview;
