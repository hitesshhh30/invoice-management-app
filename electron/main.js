// Electron main process
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const DatabaseManager = require('../src/database/db');

let mainWindow;
let dbManager;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../assets/icon.png'),
        titleBarStyle: 'default',
        show: false
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    // Initialize database
    dbManager = new DatabaseManager();
    
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers for Database Operations

// Design operations
ipcMain.handle('add-design', async (event, designData) => {
    try {
        const result = dbManager.addDesign(designData);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-designs', async () => {
    try {
        const designs = dbManager.getDesigns();
        return { success: true, data: designs };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-design', async (event, designId, designData) => {
    try {
        const result = dbManager.updateDesign(designId, designData);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-design', async (event, designId) => {
    try {
        const result = dbManager.deleteDesign(designId);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Customer operations
ipcMain.handle('add-customer', async (event, customerData) => {
    try {
        const result = dbManager.addCustomer(customerData);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-customers', async () => {
    try {
        const customers = dbManager.getCustomers();
        return { success: true, data: customers };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-customer', async (event, customerId, customerData) => {
    try {
        const result = dbManager.updateCustomer(customerId, customerData);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-customer', async (event, customerId) => {
    try {
        const result = dbManager.deleteCustomer(customerId);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Invoice operations
ipcMain.handle('create-invoice', async (event, invoiceData) => {
    try {
        const result = dbManager.createInvoice(invoiceData);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-customer-invoices', async (event, customerId) => {
    try {
        const invoices = dbManager.getCustomerInvoices(customerId);
        return { success: true, data: invoices };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-invoice-status', async (event, invoiceId, isPaid) => {
    try {
        const result = dbManager.updateInvoiceStatus(invoiceId, isPaid);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-all-invoices', async () => {
    try {
        const invoices = dbManager.getAllInvoices();
        return { success: true, data: invoices };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// WhatsApp integration
ipcMain.handle('share-to-whatsapp', async (event, customer, design, invoice) => {
    try {
        const message = createWhatsAppMessage(customer, design, invoice);
        const whatsappUrl = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
        
        await shell.openExternal(whatsappUrl);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// File operations
ipcMain.handle('save-image', async (event, imageData, fileName) => {
    try {
        const fs = require('fs');
        const uploadsDir = path.join(__dirname, '../uploads');
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, imageData);
        
        return { success: true, filePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
    try {
        const result = await dialog.showSaveDialog(mainWindow, options);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
