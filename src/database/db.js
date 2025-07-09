const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
    constructor() {
        // Ensure the data directory exists
        const dataDir = path.join(__dirname, '../../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const dbPath = path.join(dataDir, 'app.db');
        console.log('Opening database at:', dbPath);
        
        try {
            this.db = new Database(dbPath);
            this.initializeDatabase();
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    initializeDatabase() {
        try {
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            this.db.exec(schema);
            console.log('Database schema initialized');
        } catch (error) {
            console.error('Failed to initialize database schema:', error);
            throw error;
        }
    }

    // Design methods
    addDesign(designData) {
        const stmt = this.db.prepare(`
            INSERT INTO designs (design_code, design_name, category, price, image_path, unique_code)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(designData.code, designData.name, designData.category, 
                       designData.price, designData.imagePath, designData.uniqueCode);
    }

    getDesigns() {
        return this.db.prepare('SELECT * FROM designs ORDER BY created_at DESC').all();
    }

    // Customer methods
    addCustomer(customerData) {
        const stmt = this.db.prepare(`
            INSERT INTO customers (name, phone, email)
            VALUES (?, ?, ?)
        `);
        return stmt.run(customerData.name, customerData.phone, customerData.email);
    }

    getCustomers() {
        return this.db.prepare(`
            SELECT c.*, 
                   COUNT(i.id) as invoice_count,
                   SUM(CASE WHEN i.is_paid = 0 THEN i.amount ELSE 0 END) as pending_amount
            FROM customers c
            LEFT JOIN invoices i ON c.id = i.customer_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `).all();
    }

    // Invoice methods
    createInvoice(invoiceData) {
        const stmt = this.db.prepare(`
            INSERT INTO invoices (invoice_number, customer_id, design_id, amount)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(invoiceData.invoiceNumber, invoiceData.customerId, 
                       invoiceData.designId, invoiceData.amount);
    }

    getCustomerInvoices(customerId) {
        return this.db.prepare(`
            SELECT i.*, d.design_name, d.image_path, d.design_code
            FROM invoices i
            JOIN designs d ON i.design_id = d.id
            WHERE i.customer_id = ?
            ORDER BY i.created_at DESC
        `).get(customerId);
    }

    updateInvoiceStatus(invoiceId, isPaid) {
        const stmt = this.db.prepare('UPDATE invoices SET is_paid = ? WHERE id = ?');
        return stmt.run(isPaid ? 1 : 0, invoiceId);
    }
}

module.exports = DatabaseManager;