import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MessageSquare, FileText, Check, X } from 'lucide-react';
import { nanoid } from 'nanoid';

const InvoiceGenerator = ({ customer, onClose }) => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const result = await window.electronAPI.getDesigns();
      if (result.success) {
        setDesigns(result.data);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
    }
  };

  const generateInvoice = async () => {
    if (!selectedDesign) return;

    setIsGenerating(true);
    try {
      // Get customer's pending balance
      const invoicesResult = await window.electronAPI.getCustomerInvoices(customer.id);
      const pendingBalance = invoicesResult.success 
        ? invoicesResult.data.filter(inv => !inv.is_paid).reduce((sum, inv) => sum + inv.amount, 0)
        : 0;

      // Create new invoice
      const invoiceNumber = `INV-${Date.now()}-${nanoid(6)}`;
      const newInvoice = {
        invoiceNumber,
        customerId: customer.id,
        designId: selectedDesign.id,
        amount: selectedDesign.price,
        pendingBalance
      };

      const result = await window.electronAPI.createInvoice(newInvoice);
      
      if (result.success) {
        setInvoiceData({
          ...newInvoice,
          id: result.data.lastInsertRowid,
          design: selectedDesign,
          customer: customer,
          totalAmount: selectedDesign.price + pendingBalance
        });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToWhatsApp = async () => {
    if (!invoiceData) return;

    try {
      const result = await window.electronAPI.shareToWhatsApp(
        customer,
        invoiceData.design,
        invoiceData
      );

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
    }
  };

  const generatePDF = async () => {
    if (!invoiceData) return;

    try {
      // This would typically generate a PDF using jsPDF
      // For now, we'll show a success message
      console.log('Generating PDF for invoice:', invoiceData);
      alert('PDF generation feature will be implemented');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-green-600">Success!</DialogTitle>
          <p className="text-gray-600 mt-2">
            Invoice shared to WhatsApp successfully
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Invoice for {customer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Design Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Design</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {designs.map((design) => (
                <div
                  key={design.id}
                  onClick={() => setSelectedDesign(design)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDesign?.id === design.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {design.image_path && (
                      <img
                        src={design.image_path}
                        alt={design.design_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{design.design_name}</h4>
                      <p className="text-sm text-gray-500">{design.design_code}</p>
                      <p className="text-sm font-semibold">₹{design.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Preview */}
          {invoiceData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Invoice Preview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Invoice Number:</span>
                  <span className="font-medium">{invoiceData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Design:</span>
                  <span className="font-medium">{invoiceData.design.design_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">₹{invoiceData.design.price}</span>
                </div>
                {invoiceData.pendingBalance > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Previous Balance:</span>
                    <span className="font-medium">₹{invoiceData.pendingBalance}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>₹{invoiceData.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex space-x-2">
              {!invoiceData ? (
                <Button
                  onClick={generateInvoice}
                  disabled={!selectedDesign || isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Invoice'}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={generatePDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={shareToWhatsApp}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Share WhatsApp
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceGenerator;