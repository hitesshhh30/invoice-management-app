import jsPDF from 'jspdf';

export class PDFGenerator {
    static generateInvoice(customer, design, invoice, shopName) {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text(shopName, 20, 20);
        
        // Invoice details
        doc.setFontSize(16);
        doc.text('TAX INVOICE', 20, 40);
        
        doc.setFontSize(12);
        doc.text(`Invoice No: ${invoice.invoice_number}`, 20, 60);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
        
        // Customer details
        doc.text('Bill To:', 20, 90);
        doc.text(customer.name, 20, 100);
        doc.text(customer.phone, 20, 110);
        
        // Design details
        doc.text('Design Details:', 20, 130);
        doc.text(`Name: ${design.design_name}`, 20, 140);
        doc.text(`Code: ${design.design_code}`, 20, 150);
        doc.text(`Price: ₹${design.price}`, 20, 160);
        
        // Add design image if available
        if (design.image_path) {
            // Add image logic here
        }
        
        // Total
        doc.setFontSize(14);
        doc.text(`Total: ₹${design.price}`, 20, 200);
        
        if (invoice.pendingAmount > 0) {
            doc.text(`Previous Balance: ₹${invoice.pendingAmount}`, 20, 210);
            doc.text(`Grand Total: ₹${design.price + invoice.pendingAmount}`, 20, 220);
        }
        
        return doc;
    }
}