// Electron preload script
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Design operations
    addDesign: (designData) => ipcRenderer.invoke('add-design', designData),
    getDesigns: () => ipcRenderer.invoke('get-designs'),
    updateDesign: (designId, designData) => ipcRenderer.invoke('update-design', designId, designData),
    deleteDesign: (designId) => ipcRenderer.invoke('delete-design', designId),
    
    // Customer operations
    addCustomer: (customerData) => ipcRenderer.invoke('add-customer', customerData),
    getCustomers: () => ipcRenderer.invoke('get-customers'),
    updateCustomer: (customerId, customerData) => ipcRenderer.invoke('update-customer', customerId, customerData),
    deleteCustomer: (customerId) => ipcRenderer.invoke('delete-customer', customerId),
    
    // Invoice operations
    createInvoice: (invoiceData) => ipcRenderer.invoke('create-invoice', invoiceData),
    getCustomerInvoices: (customerId) => ipcRenderer.invoke('get-customer-invoices', customerId),
    updateInvoiceStatus: (invoiceId, isPaid) => ipcRenderer.invoke('update-invoice-status', invoiceId, isPaid),
    getAllInvoices: () => ipcRenderer.invoke('get-all-invoices'),
    
    // WhatsApp integration
    shareToWhatsApp: (customer, design, invoice) => ipcRenderer.invoke('share-to-whatsapp', customer, design, invoice),
    
    // File operations
    saveImage: (imageData, fileName) => ipcRenderer.invoke('save-image', imageData, fileName),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options)
});
