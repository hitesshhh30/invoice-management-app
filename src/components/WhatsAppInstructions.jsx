import React from 'react';
import { CheckCircle, FileText, MessageCircle, Smartphone, X } from 'lucide-react';

const WhatsAppInstructions = ({ onClose, pdfPath, invoiceNumber }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-white">
                            <CheckCircle size={24} className="mr-3" />
                            <div>
                                <h2 className="text-xl font-semibold">PDF Generated Successfully!</h2>
                                <p className="text-green-100 text-sm">Invoice #{invoiceNumber}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-green-200 p-2 hover:bg-green-600 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Chat Opened</h3>
                        <p className="text-gray-600">Follow these steps to send the PDF invoice to your customer:</p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">1</div>
                            <div>
                                <p className="font-semibold text-gray-900">WhatsApp Chat Window</p>
                                <p className="text-gray-600 text-sm">A WhatsApp chat with your customer has opened with a pre-written message.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">2</div>
                            <div>
                                <p className="font-semibold text-gray-900">Click Attachment Button</p>
                                <p className="text-gray-600 text-sm">In WhatsApp, click the paperclip (📎) or attachment button.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">3</div>
                            <div>
                                <p className="font-semibold text-gray-900">Select "Document"</p>
                                <p className="text-gray-600 text-sm">Choose the "Document" option from the attachment menu.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">4</div>
                            <div>
                                <p className="font-semibold text-gray-900">Find the PDF File</p>
                                <div className="text-gray-600 text-sm">
                                    <p>Navigate to and select the PDF file:</p>
                                    <div className="bg-gray-100 p-3 rounded-lg mt-2 font-mono text-xs break-all">
                                        {pdfPath || `Invoice_${invoiceNumber}.pdf`}
                                    </div>
                                    <p className="mt-2 text-green-600 font-medium">📂 The file explorer has opened automatically and highlighted the PDF for you!</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-0.5">5</div>
                            <div>
                                <p className="font-semibold text-gray-900">Send the Invoice</p>
                                <p className="text-gray-600 text-sm">Click send to share both the message and PDF with your customer.</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-start">
                            <Smartphone className="text-blue-600 mr-3 mt-0.5" size={20} />
                            <div>
                                <p className="font-semibold text-blue-900">Pro Tip:</p>
                                <p className="text-blue-700 text-sm">The file explorer window has also opened showing the PDF location. You can drag and drop the file directly into WhatsApp!</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppInstructions;
