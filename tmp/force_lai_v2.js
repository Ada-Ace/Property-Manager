import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const API_URL_MATCH = envFile.match(/VITE_API_URL=(.+)/);
const API_URL = API_URL_MATCH ? API_URL_MATCH[1].trim() : null;

const finalFix = async () => {
    if (!API_URL) return;
    const resp = await fetch(API_URL);
    const data = await resp.json();
    const tenants = data.tenants || [];

    for (const t of tenants) {
        if (t.id === 'RES-FXYZ') {
            const updated = { ...t };
            // CORRECT Leading Apostrophe: Setting it as the FIRST character
            // In Google Sheets API, a leading ' is the standard way to escape text
            updated.leasestart = "'2026-03-15";
            updated.leaseend = "'2026-05-14";
            
            console.log(`Fixing LAI WEN JUN to leading apostrophe format...`);
            try {
                const postData = { action: 'UPDATE', sheetName: 'tenants', data: updated };
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(postData)
                });
                console.log('Success.');
            } catch (e) { console.error('Failed.'); }
        }
    }
};

finalFix();
