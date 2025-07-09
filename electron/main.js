// Electron main process
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const fs = require('fs');
const Database = require('better-sqlite3');

let mainWindow;
let dbManager;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../assets/icon.svg'),
        backgroundColor: '#f9fafb',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#ffffff',
            symbolColor: '#9333ea'
        },
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
    try {
        // Ensure data directory exists
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Initialize database with better-sqlite3
        const dbPath = path.join(dataDir, 'app.db');
        const DatabaseManager = require('../src/database/db');
        dbManager = new DatabaseManager();
        console.log('Database initialized successfully at:', dbPath);
    } catch (error) {
        console.error('Database initialization error:', error);
        dialog.showErrorBox('Database Error', 
            `Failed to initialize database: ${error.message}\nApplication will close.`);
        app.quit();
        return;
    }
    
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

ipcMain.handle('delete-invoice', async (event, invoiceId) => {
    try {
        const result = dbManager.deleteInvoice(invoiceId);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Request PDF generation from renderer process (for better image handling)
ipcMain.handle('generate-pdf', async (event, customer, design, invoice) => {
    try {
        return new Promise((resolve) => {
            // Send request to renderer and wait for PDF data
            mainWindow.webContents.send('generate-pdf-request', { customer, design, invoice });
            
            // Listen for the PDF data response
            const handlePDFResponse = (event, response) => {
                ipcMain.removeListener('pdf-generated', handlePDFResponse);
                resolve(response);
            };
            
            ipcMain.once('pdf-generated', handlePDFResponse);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                ipcMain.removeListener('pdf-generated', handlePDFResponse);
                resolve({ success: false, error: 'PDF generation timeout' });
            }, 10000);
        });
    } catch (error) {
        console.error('Error in PDF generation:', error);
        return { success: false, error: error.message };
    }
});

// Receive PDF data from renderer and save it
ipcMain.handle('save-pdf-from-renderer', async (event, pdfData, invoiceNumber) => {
    try {
        const invoicesDir = path.join(__dirname, '../invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }
        
        const fileName = `Invoice_${invoiceNumber}.pdf`;
        const pdfPath = path.join(invoicesDir, fileName);
        
        // Convert base64 to buffer and save
        const pdfBuffer = Buffer.from(pdfData.split(',')[1], 'base64');
        fs.writeFileSync(pdfPath, pdfBuffer);
        
        return { success: true, pdfPath, fileName };
    } catch (error) {
        console.error('Error saving PDF:', error);
        return { success: false, error: error.message };
    }
});

// WhatsApp integration with improved PDF handling
ipcMain.handle('share-to-whatsapp', async (event, customer, design, invoice) => {
    try {
        let message;
        let pdfPath = null;
        
        if (invoice) {
            // Create invoice message with comprehensive details
            const previousBalanceText = invoice.pendingBalance > 0 
                ? `\n\n📋 *Previous Balance:* ₹${invoice.pendingBalance}`
                : '';
            
            message = `🌟 *JEWELRY INVOICE* 🌟

📄 *Invoice #:* ${invoice.invoiceNumber}
📅 *Date:* ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}

👤 *Customer:* ${customer.name}
📱 *Phone:* ${customer.phone}

✨ *Design Details:*
🎨 *Name:* ${design.design_name}
🔖 *Code:* ${design.design_code}
📂 *Category:* ${design.category}
💎 *Price:* ₹${design.price}${previousBalanceText}

💳 *TOTAL AMOUNT: ₹${invoice.totalAmount || design.price}*

📄 Please find the detailed invoice PDF attached. You can save and print this for your records.

Thank you for choosing our jewelry collection! 

Best regards,
Your Jewelry Team`;

            // Generate PDF using renderer process for better image handling
            try {
                const pdfResult = await new Promise((resolve) => {
                    // Send request to renderer
                    mainWindow.webContents.send('generate-pdf-request', { customer, design, invoice });
                    
                    // Listen for response
                    const handlePDFResponse = (event, response) => {
                        ipcMain.removeListener('pdf-generated', handlePDFResponse);
                        resolve(response);
                    };
                    
                    ipcMain.once('pdf-generated', handlePDFResponse);
                    
                    // Timeout after 15 seconds
                    setTimeout(() => {
                        ipcMain.removeListener('pdf-generated', handlePDFResponse);
                        resolve({ success: false, error: 'PDF generation timeout' });
                    }, 15000);
                });
                
                if (pdfResult.success && pdfResult.pdfData) {
                    // Save the PDF file
                    const invoicesDir = path.join(__dirname, '../invoices');
                    if (!fs.existsSync(invoicesDir)) {
                        fs.mkdirSync(invoicesDir, { recursive: true });
                    }
                    
                    const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;
                    pdfPath = path.join(invoicesDir, fileName);
                    
                    // Convert base64 to buffer and save
                    const pdfBuffer = Buffer.from(pdfResult.pdfData.split(',')[1], 'base64');
                    fs.writeFileSync(pdfPath, pdfBuffer);
                    
                    console.log('PDF saved at:', pdfPath);
                } else {
                    console.error('PDF generation failed:', pdfResult.error);
                }
            } catch (pdfError) {
                console.error('Error generating PDF:', pdfError);
            }
        } else {
            // Create simple design sharing message
            message = `🌟 *Jewelry Design Alert!* 🌟

✨ *${design.design_name}*
🔖 Code: ${design.design_code}
📂 Category: ${design.category}
💰 Price: ₹${design.price}

Specially curated for you! Would you like to know more about this beautiful piece?

Best regards,
Your Jewelry Team`;
        }
        
        // Open WhatsApp with message
        const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        await shell.openExternal(whatsappUrl);
        
        // If PDF was generated, open file explorer and provide improved instructions
        if (pdfPath && fs.existsSync(pdfPath)) {
            // Show the PDF file in explorer
            shell.showItemInFolder(pdfPath);
            
            // Show enhanced instructions dialog
            const result = dialog.showMessageBoxSync(mainWindow, {
                type: 'info',
                title: 'Invoice PDF Ready to Share',
                message: 'Invoice PDF Generated Successfully!',
                detail: `📄 PDF Location: ${pdfPath}\n\n🚀 Quick WhatsApp Sharing Steps:\n\n1. ✅ WhatsApp chat is now open\n2. 📎 Click the attachment (paperclip) button\n3. 📁 Select "Document" or "File"\n4. 🔍 Navigate to the PDF file (already highlighted in explorer)\n5. ✉️ Send the PDF to your customer\n\n💡 The PDF file will be automatically highlighted in the explorer window that opened.`,
                buttons: ['✅ Got it!', '📂 Open Folder Again']
            });
            
            // If user wants to open folder again
            if (result === 1) {
                shell.showItemInFolder(pdfPath);
            }
        }
        
        return { 
            success: true, 
            pdfPath, 
            message: pdfPath ? 'WhatsApp opened and PDF generated successfully' : 'WhatsApp opened successfully'
        };
    } catch (error) {
        console.error('Error sharing to WhatsApp:', error);
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

ipcMain.handle('get-image-url', async (event, imagePath) => {
    try {
        if (!imagePath) {
            return { success: false, error: 'No image path provided' };
        }
        
        // Check if file exists
        if (fs.existsSync(imagePath)) {
            try {
                // Read the image file and convert to base64
                const imageBuffer = fs.readFileSync(imagePath);
                const imageExtension = path.extname(imagePath).toLowerCase();
                let mimeType = 'image/jpeg'; // default
                
                if (imageExtension === '.png') mimeType = 'image/png';
                else if (imageExtension === '.gif') mimeType = 'image/gif';
                else if (imageExtension === '.webp') mimeType = 'image/webp';
                
                const base64Image = imageBuffer.toString('base64');
                const dataUrl = `data:${mimeType};base64,${base64Image}`;
                
                return { success: true, url: dataUrl };
            } catch (readError) {
                console.error('get-image-url: Error reading image file:', readError);
                return { success: false, error: 'Failed to read image file' };
            }
        } else {
            return { success: false, error: 'Image file not found' };
        }
    } catch (error) {
        console.error('get-image-url: Exception:', error);
        return { success: false, error: error.message };
    }
});
