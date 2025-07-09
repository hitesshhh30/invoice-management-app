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

    updateDesign(designId, designData) {
        const stmt = this.db.prepare(`
            UPDATE designs 
            SET design_name = ?, design_code = ?, category = ?, price = ? 
            WHERE id = ?
        `);
        return stmt.run(designData.name, designData.code, designData.category, 
                       designData.price, designId);
    }

    deleteDesign(designId) {
        const stmt = this.db.prepare('DELETE FROM designs WHERE id = ?');
        return stmt.run(designId);
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
                   COALESCE(COUNT(i.id), 0) as invoice_count,
                   COALESCE(SUM(CASE WHEN i.is_paid = 0 THEN i.amount ELSE 0 END), 0) as pending_amount
            FROM customers c
            LEFT JOIN invoices i ON c.id = i.customer_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `).all();
    }

    updateCustomer(customerId, customerData) {
        const stmt = this.db.prepare(`
            UPDATE customers 
            SET name = ?, phone = ?, email = ? 
            WHERE id = ?
        `);
        return stmt.run(customerData.name, customerData.phone, customerData.email, customerId);
    }

    deleteCustomer(customerId) {
        const stmt = this.db.prepare('DELETE FROM customers WHERE id = ?');
        return stmt.run(customerId);
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
        `).all(customerId);
    }

    getAllInvoices() {
        return this.db.prepare(`
            SELECT i.*, d.design_name, d.image_path, d.design_code, c.name as customer_name
            FROM invoices i
            JOIN designs d ON i.design_id = d.id
            JOIN customers c ON i.customer_id = c.id
            ORDER BY i.created_at DESC
        `).all();
    }

    updateInvoiceStatus(invoiceId, isPaid) {
        const stmt = this.db.prepare('UPDATE invoices SET is_paid = ? WHERE id = ?');
        return stmt.run(isPaid ? 1 : 0, invoiceId);
    }

    deleteInvoice(invoiceId) {
        const stmt = this.db.prepare('DELETE FROM invoices WHERE id = ?');
        return stmt.run(invoiceId);
    }
}

module.exports = DatabaseManager;