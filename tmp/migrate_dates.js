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
 * Normalizes any date to 'dd-mm-yyyy format (prefixed with apostrophe for GS text force).
 */
const toSheetDate = (val) => {
    if (!val) return '';
    const s = String(val).trim().replace(/^'/, '');
    
    // Check if already dd-mm-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return `'${s}`;
    
    // Check if yyyy-mm-dd
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `'${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;

    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return `'${s}`;
        const res = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        return `'${res}`;
    } catch { return `'${s}`; }
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
                        // We check if the value in the sheet is already equal to our target (with or without ')
                        if (originalVal !== newVal && originalVal !== newVal.replace(/^'/, '')) {
                            updatedItem[key] = newVal;
                            modified = true;
                        } else if (!originalVal.startsWith("'") && newVal.startsWith("'")) {
                            // Even if characters are same, if we need to force text, mark as modified
                            updatedItem[key] = newVal;
                            modified = true;
                        }
                    }
                }

                if (modified && item.id) {
                    console.log(`Updating ${sheetName} item: ${item.id} with ${JSON.stringify(updatedItem)}`);
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
        console.log('Migration complete.');
    } catch (e) {
        console.error('Fatal Migration Error:', e.message);
    }
};

migrate();
