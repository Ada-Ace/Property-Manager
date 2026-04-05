import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const API_URL_MATCH = envFile.match(/VITE_API_URL=(.+)/);
const API_URL = API_URL_MATCH ? API_URL_MATCH[1].trim() : null;

// Interpret the KL local day for the persistent 14T16:00 case
const forceLaiFix = (val) => {
    if (String(val).includes('T16:00:00')) return "'2026-03-15'";
    return "'" + String(val).trim().replace(/^'/, '');
};

const finalFix = async () => {
    if (!API_URL) return;
    const resp = await fetch(API_URL);
    const data = await resp.json();
    const tenants = data.tenants || [];

    for (const t of tenants) {
        if (t.id === 'RES-FXYZ') {
            console.log('Force-fixing LAI WEN JUN...');
            const updated = { ...t };
            // Force the leading apostrophe to prevent Google Sheet from "helping" with date formatting
            updated.leasestart = "'2026-03-15'";
            updated.leaseend = "'2026-05-14'";
            
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
