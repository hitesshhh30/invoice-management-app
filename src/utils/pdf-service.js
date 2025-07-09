import { PDFGenerator } from './pdf-generator.js';

class PDFService {
    constructor() {
        this.setupPDFGenerationListener();
    }

    setupPDFGenerationListener() {
        // Listen for PDF generation requests from main process
        if (window.electronAPI?.onGeneratePDFRequest) {
            window.electronAPI.onGeneratePDFRequest(async (event, data) => {
                try {
                    const { customer, design, invoice } = data;
                    
                    // Generate PDF using the enhanced renderer-based generator
                    const doc = await PDFGenerator.generateInvoice(customer, design, invoice);
                    const pdfData = doc.output('datauristring'); // Get as data URI
                    
                    // Send the PDF data back to main process
                    window.electronAPI.sendPDFGenerated({
                        success: true,
                        pdfData: pdfData
                    });
                } catch (error) {
                    console.error('Error generating PDF in renderer:', error);
                    window.electronAPI.sendPDFGenerated({
                        success: false,
                        error: error.message
                    });
                }
            });
        }
    }

    async generateAndDownload(customer, design, invoice, shopName = "Jewelry Collection") {
        try {
            const fileName = await PDFGenerator.downloadInvoice(customer, design, invoice, shopName);
            return { success: true, fileName };
        } catch (error) {
            console.error('Error in generateAndDownload:', error);
            return { success: false, error: error.message };
        }
    }

    async generatePDFBlob(customer, design, invoice, shopName = "Jewelry Collection") {
        try {
            const blob = await PDFGenerator.getPDFBlob(customer, design, invoice, shopName);
            return { success: true, blob };
        } catch (error) {
            console.error('Error in generatePDFBlob:', error);
            return { success: false, error: error.message };
        }
    }

    async savePDFToElectron(customer, design, invoice, shopName = "Jewelry Collection") {
        try {
            // Generate PDF
            const doc = await PDFGenerator.generateInvoice(customer, design, invoice, shopName);
            const pdfData = doc.output('datauristring');
            
            // Save via Electron
            const result = await window.electronAPI.savePDFFromRenderer(
                pdfData, 
                invoice.invoice_number || invoice.invoiceNumber
            );
            
            return result;
        } catch (error) {
            console.error('Error in savePDFToElectron:', error);
            return { success: false, error: error.message };
        }
    }

    cleanup() {
        // Remove listeners when component unmounts
        if (window.electronAPI?.removeAllListeners) {
            window.electronAPI.removeAllListeners('generate-pdf-request');
        }
    }
}

// Create a singleton instance
export const pdfService = new PDFService();

// Export the class for manual instantiation if needed
export { PDFService };
