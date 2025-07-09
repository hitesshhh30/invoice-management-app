import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const importCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                resolve(processImportedData(results.data));
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const importExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(processImportedData(jsonData));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

// Process and validate imported data
const processImportedData = (data) => {
    return data.map(row => {
        // Map imported columns to match our database structure
        return {
            name: row.name || row.Name || row.NAME || row.customer_name || row.fullName || '',
            phone: row.phone || row.Phone || row.PHONE || row.mobile || row.contact || row.phoneNumber || '',
            email: row.email || row.Email || row.EMAIL || ''
        };
    }).filter(customer => customer.name && customer.phone); // Filter out rows without name or phone
};
