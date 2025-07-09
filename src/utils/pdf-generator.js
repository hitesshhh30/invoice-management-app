import jsPDF from 'jspdf';

export class PDFGenerator {
    static async generateInvoice(customer, design, invoice, shopName = "Jewelry Collection") {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Colors
        const primaryColor = [147, 51, 234]; // Purple
        const secondaryColor = [99, 102, 241]; // Indigo
        const darkGray = [55, 65, 81];
        const lightGray = [156, 163, 175];
        const accentColor = [239, 246, 255];
        
        // Header Section with gradient effect
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Add subtle gradient effect
        doc.setFillColor(147, 51, 234, 0.8);
        doc.rect(0, 25, pageWidth, 10, 'F');
        
        // Company Logo/Name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text(shopName.toUpperCase(), 20, 25);
        
        // Subtitle
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Jewelry Collection', 20, 32);
        
        // Invoice details in header
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const invoiceNumber = invoice.invoice_number || invoice.invoiceNumber;
        const invoiceDate = new Date(invoice.created_at || invoice.createdAt || new Date()).toLocaleDateString('en-IN');
        doc.text(`INVOICE #: ${invoiceNumber}`, pageWidth - 85, 18);
        doc.text(`DATE: ${invoiceDate}`, pageWidth - 85, 28);
        
        // Reset colors for body
        doc.setTextColor(...darkGray);
        
        // Customer Information Section
        let yPos = 55;
        
        // Section header
        doc.setFillColor(...accentColor);
        doc.rect(15, yPos - 8, pageWidth - 30, 25, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('BILL TO:', 20, yPos);
        
        // Customer details
        doc.setTextColor(...darkGray);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(customer.name, 20, yPos + 12);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`📱 ${customer.phone}`, 20, yPos + 20);
        if (customer.email) {
            doc.text(`✉️ ${customer.email}`, 20, yPos + 28);
            yPos += 8;
        }
        
        // Design Image Section (if available)
        yPos += 45;
        let imageHeight = 0;
        
        if (design.image_path) {
            try {
                // Get image data from electron API
                const imageResult = await window.electronAPI?.getImageUrl(design.image_path);
                if (imageResult && imageResult.success && imageResult.url) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    await new Promise((resolve, reject) => {
                        img.onload = () => {
                            try {
                                // Create a higher quality canvas
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                
                                // Set canvas size for better quality
                                const scale = 2; // Higher resolution
                                canvas.width = img.width * scale;
                                canvas.height = img.height * scale;
                                
                                // Scale the context to draw at higher resolution
                                ctx.scale(scale, scale);
                                ctx.imageSmoothingEnabled = true;
                                ctx.imageSmoothingQuality = 'high';
                                
                                // Draw image at original size
                                ctx.drawImage(img, 0, 0, img.width, img.height);
                                
                                // Get high-quality JPEG data
                                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                                
                                // Calculate image dimensions for PDF
                                const maxWidth = 80;
                                const maxHeight = 80;
                                let imgWidth = maxWidth;
                                let imgHeight = (img.height / img.width) * maxWidth;
                                
                                if (imgHeight > maxHeight) {
                                    imgHeight = maxHeight;
                                    imgWidth = (img.width / img.height) * maxHeight;
                                }
                                
                                // Add image to PDF with better positioning
                                doc.addImage(imgData, 'JPEG', pageWidth - 95, yPos - 15, imgWidth, imgHeight);
                                imageHeight = imgHeight + 20;
                                
                                console.log('Image added to PDF successfully');
                                resolve();
                            } catch (error) {
                                console.warn('Error processing image for PDF:', error);
                                resolve();
                            }
                        };
                        img.onerror = (error) => {
                            console.warn('Error loading image for PDF:', error);
                            resolve();
                        };
                        img.src = imageResult.url;
                    });
                } else {
                    console.warn('Failed to get image URL:', imageResult?.error);
                }
            } catch (error) {
                console.warn('Error loading design image for PDF:', error);
            }
        }
        
        // Design Details Section
        doc.setFillColor(...accentColor);
        doc.rect(15, yPos - 8, pageWidth - 30, Math.max(imageHeight + 10, 45), 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('DESIGN DETAILS:', 20, yPos);
        
        // Design info
        doc.setTextColor(...darkGray);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Design Name:', 20, yPos + 15);
        doc.setFont('helvetica', 'normal');
        doc.text(design.design_name || design.name, 55, yPos + 15);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Code:', 20, yPos + 25);
        doc.setFont('helvetica', 'normal');
        doc.text(design.design_code || design.code, 35, yPos + 25);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Category:', 20, yPos + 35);
        doc.setFont('helvetica', 'normal');
        doc.text(design.category, 50, yPos + 35);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Price:', 20, yPos + 45);
        doc.setFont('helvetica', 'normal');
        doc.text(`₹${design.price}`, 40, yPos + 45);
        
        yPos += Math.max(imageHeight + 20, 65);
        
        // Previous Invoices Section (if any)
        const previousInvoices = invoice.previousUnpaidInvoices || [];
        const pendingBalance = invoice.pendingBalance || 0;
        
        if (previousInvoices.length > 0) {
            yPos += 10;
            doc.setFillColor(254, 242, 242);
            doc.rect(15, yPos - 8, pageWidth - 30, 15 + (previousInvoices.length * 8), 'F');
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 38, 38);
            doc.text('PREVIOUS UNPAID INVOICES:', 20, yPos);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkGray);
            doc.text('Invoice Number', 25, yPos + 12);
            doc.text('Amount', pageWidth - 50, yPos + 12);
            
            doc.setFont('helvetica', 'normal');
            previousInvoices.forEach((inv, index) => {
                const lineY = yPos + 20 + (index * 8);
                doc.text(inv.invoice_number, 25, lineY);
                doc.text(`₹${inv.amount}`, pageWidth - 50, lineY);
            });
            
            yPos += 25 + (previousInvoices.length * 8);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 38, 38);
            doc.text(`Previous Balance: ₹${pendingBalance}`, 20, yPos);
            yPos += 15;
        }
        
        // Total Amount Section
        yPos += 15;
        const totalAmount = invoice.totalAmount || invoice.amount || (parseFloat(design.price) + pendingBalance);
        
        // Create a bordered box for total
        doc.setFillColor(...primaryColor);
        doc.rect(15, yPos - 10, pageWidth - 30, 25, 'F');
        
        // Add border
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(2);
        doc.rect(15, yPos - 10, pageWidth - 30, 25);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL AMOUNT: ₹${totalAmount}`, 25, yPos + 5);
        
        // Payment Status
        yPos += 35;
        doc.setTextColor(...darkGray);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const paymentStatus = invoice.is_paid ? 'PAID' : 'PENDING';
        const statusColor = invoice.is_paid ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(...statusColor);
        doc.text(`Payment Status: ${paymentStatus}`, 20, yPos);
        
        // Terms and Footer
        yPos += 25;
        doc.setTextColor(...lightGray);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Terms & Conditions:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text('• Payment is due within 30 days of invoice date', 20, yPos + 8);
        doc.text('• All pieces are handcrafted with premium materials', 20, yPos + 16);
        doc.text('• Custom designs are non-returnable', 20, yPos + 24);
        
        // Footer
        const footerY = pageHeight - 25;
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.5);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Thank you for choosing our jewelry collection!', 20, footerY);
        
        doc.setTextColor(...lightGray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('For any queries, please contact us at: contact@jewelrycollection.com | +91 9876543210', 20, footerY + 8);
        
        return doc;
    }
    
    static async downloadInvoice(customer, design, invoice, shopName = "Jewelry Collection") {
        try {
            const doc = await this.generateInvoice(customer, design, invoice, shopName);
            const fileName = `Invoice_${invoice.invoice_number || invoice.invoiceNumber}.pdf`;
            doc.save(fileName);
            return { success: true, fileName };
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    }
    
    static async getPDFBlob(customer, design, invoice, shopName = "Jewelry Collection") {
        try {
            const doc = await this.generateInvoice(customer, design, invoice, shopName);
            return doc.output('blob');
        } catch (error) {
            console.error('Error generating PDF blob:', error);
            throw error;
        }
    }
    
    static async getPDFArrayBuffer(customer, design, invoice, shopName = "Jewelry Collection") {
        try {
            const doc = await this.generateInvoice(customer, design, invoice, shopName);
            return doc.output('arraybuffer');
        } catch (error) {
            console.error('Error generating PDF array buffer:', error);
            throw error;
        }
    }
}