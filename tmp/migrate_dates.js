import fs from 'fs';
import path from 'path';

// Get API_URL from .env
const envFile = fs.readFileSync('.env', 'utf8');
const API_URL_MATCH = envFile.match(/VITE_API_URL=(.+)/);
const API_URL = API_URL_MATCH ? API_URL_MATCH[1].trim() : null;

const dateFields = [
    'leasestart', 'leaseend', 'date', 'timestamp', 'scheduledate', 
    'duedate', 'moveoutdate', 'lastpaymentdate', 'vacantsince', 
    'lastupdated', 'resolvedat', 'paymentdate'
];

/**
 * Normalizes any date to dd-mm-yyyy format.
 */
const toSheetDate = (val) => {
    if (!val) return '';
    try {
        const strVal = String(val).trim();
        // Check if already dd-mm-yyyy
        if (/^\d{2}-\d{2}-\d{4}$/.test(strVal)) return strVal;
        
        const d = new Date(val);
        if (isNaN(d.getTime())) return strVal;
        
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    } catch { return val; }
};

const migrate = async () => {
    if (!API_URL) {
        console.error('VITE_API_URL is not set in .env.');
        return;
    }

    console.log(`Cloud endpoint: ${API_URL}`);
    console.log('Fetching all data from cloud...');
    try {
        const resp = await fetch(API_URL);
        const data = await resp.json();
        console.log('Success. Starting migration tasks.');

        for (const sheetName of Object.keys(data)) {
            const collection = data[sheetName];
            if (!Array.isArray(collection)) continue;

            console.log(`Processing Sheet: ${sheetName} (${collection.length} items)`);
            for (const item of collection) {
                let modified = false;
                const updatedItem = { ...item };

                for (const key of Object.keys(item)) {
                    const lkey = key.toLowerCase().replace(/[^a-z]/g, '');
                    if (dateFields.includes(lkey)) {
                        const originalVal = String(item[key]);
                        const newVal = toSheetDate(item[key]);
                        if (originalVal !== newVal) {
                            updatedItem[key] = newVal;
                            modified = true;
                        }
                    }
                }

                if (modified && item.id) {
                    console.log(`Updating ${sheetName} item: ${item.id}`);
                    try {
                        const postData = { action: 'UPDATE', sheetName, data: updatedItem };
                        const result = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'text/plain' },
                            body: JSON.stringify(postData)
                        });
                        const resJson = await result.json();
                        if (!resJson.success) {
                            console.error(`- Failed to update ${item.id}:`, resJson.message);
                        }
                    } catch (e) {
                        console.error(`- Failed to update ${sheetName} item ${item.id}:`, e.message);
                    }
                }
            }
        }
        console.log('Migration complete.');
    } catch (e) {
        console.error('Fatal Migration Error:', e.message);
    }
};

migrate();
