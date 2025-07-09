// Mock API for development when running in browser
const mockElectronAPI = {
    // Design operations
    addDesign: async (designData) => {
        console.log('Mock: Adding design', designData);
        return { success: true, data: { id: Date.now(), ...designData } };
    },
    getDesigns: async () => {
        console.log('Mock: Getting designs');
        return { success: true, data: [] };
    },
    updateDesign: async (designId, designData) => {
        console.log('Mock: Updating design', designId, designData);
        return { success: true, data: { id: designId, ...designData } };
    },
    deleteDesign: async (designId) => {
        console.log('Mock: Deleting design', designId);
        return { success: true, data: { deleted: true } };
    },
    
    // Customer operations
    addCustomer: async (customerData) => {
        console.log('Mock: Adding customer', customerData);
        return { success: true, data: { id: Date.now(), ...customerData } };
    },
    getCustomers: async () => {
        console.log('Mock: Getting customers');
        return { success: true, data: [] };
    },
    updateCustomer: async (customerId, customerData) => {
        console.log('Mock: Updating customer', customerId, customerData);
        return { success: true, data: { id: customerId, ...customerData } };
    },
    deleteCustomer: async (customerId) => {
        console.log('Mock: Deleting customer', customerId);
        return { success: true, data: { deleted: true } };
    },
    
    // Invoice operations
    createInvoice: async (invoiceData) => {
        console.log('Mock: Creating invoice', invoiceData);
        return { success: true, data: { id: Date.now(), ...invoiceData } };
    },
    getCustomerInvoices: async (customerId) => {
        console.log('Mock: Getting customer invoices', customerId);
        return { success: true, data: [] };
    },
    updateInvoiceStatus: async (invoiceId, isPaid) => {
        console.log('Mock: Updating invoice status', invoiceId, isPaid);
        return { success: true, data: { id: invoiceId, isPaid } };
    },
    getAllInvoices: async () => {
        console.log('Mock: Getting all invoices');
        return { success: true, data: [] };
    },
    
    // WhatsApp integration
    shareToWhatsapp: async (customer, design, invoice) => {
        console.log('Mock: Sharing to WhatsApp', customer, design, invoice);
        
        // Simulate PDF generation
        if (invoice) {
            console.log('Mock: Generating PDF for invoice', invoice.invoiceNumber);
            // Simulate PDF creation delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Mock: PDF generated successfully');
        }
        
        return { success: true, pdfPath: '/mock/path/invoice.pdf' };
    },
    
    // File operations
    saveImage: async (imageData, fileName) => {
        console.log('Mock: Saving image', fileName);
        return { success: true, filePath: `/mock/path/${fileName}` };
    },
    showSaveDialog: async (options) => {
        console.log('Mock: Showing save dialog', options);
        return { success: true, data: { filePath: '/mock/path/file.pdf' } };
    }
};

// Set up the mock API if window.electronAPI is not available
if (typeof window !== 'undefined' && !window.electronAPI) {
    window.electronAPI = mockElectronAPI;
}

export default mockElectronAPI;
