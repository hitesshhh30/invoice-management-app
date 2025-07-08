import { shell } from 'electron';

export class WhatsAppManager {
    static async sendDesignToCustomer(customer, design, invoice) {
        const message = this.createInvoiceMessage(customer, design, invoice);
        const whatsappUrl = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
        
        try {
            await shell.openExternal(whatsappUrl);
            return true;
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            return false;
        }
    }

    static createInvoiceMessage(customer, design, invoice) {
        return `
Hello ${customer.name},

Here's your design invoice:

🎨 Design: ${design.design_name}
📝 Code: ${design.design_code}
💰 Price: ₹${design.price}
📄 Invoice #: ${invoice.invoice_number}

${invoice.pendingAmount > 0 ? `⚠️ Previous Balance: ₹${invoice.pendingAmount}` : ''}

Thank you for your business!
        `.trim();
    }
}