import fs from 'fs';

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
 * Normalizes any date to yyyy-mm-dd format (UTC Safe).
 */
const toSheetDate = (val) => {
    if (!val) return '';
    const s = String(val).trim().replace(/^'/, '');
    
    // 1. ISO pattern yyyy-mm-dd
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    
    // 2. dd-mm-yyyy pattern
    const rev = s.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})/);
    if (rev) return `${rev[3]}-${rev[2]}-${rev[1]}`;
    
    // Fallback: Date object/timestamp using UTC
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return s;
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    } catch { return s; }
};

const migrate = async () => {
    if (!API_URL) {
        console.error('VITE_API_URL is not set.');
        return;
    }

    console.log('Fetching all data from cloud...');
    try {
        const resp = await fetch(API_URL);
        const data = await resp.json();
        console.log('Success. Starting restoration to yyyy-mm-dd.');

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
                    console.log(`Restoring ${sheetName} item: ${item.id} to ${JSON.stringify(updatedItem)}`);
                    try {
                        const postData = { action: 'UPDATE', sheetName, data: updatedItem };
                        const result = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'text/plain' },
                            body: JSON.stringify(postData)
                        });
                        await result.json();
                    } catch (e) {
                        console.error(`- Failed to update ${item.id}:`, e.message);
                    }
                }
            }
        }
        console.log('Restoration complete.');
    } catch (e) {
        console.error('Fatal Migration Error:', e.message);
    }
};

migrate();
