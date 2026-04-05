import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const API_URL_MATCH = envFile.match(/VITE_API_URL=(.+)/);
const API_URL = API_URL_MATCH ? API_URL_MATCH[1].trim() : null;

const fixAll = async () => {
    if (!API_URL) return;
    const resp = await fetch(API_URL);
    const data = await resp.json();
    const tenants = data.tenants || [];

    for (const t of tenants) {
        if (['RES-FXYZ', 'RES-L9RF', 'RES-HFGU'].includes(t.id)) {
            const updated = { ...t };
            
            // Extract the clean yyyy-mm-dd from whatever format was there
            const dateStr = (val) => {
                const s = String(val).trim().replace(/^'/, '');
                if (s.includes('T16:00:00')) {
                    // Specific fix for the T16:00 offset case which is +1 day in KL
                    if (s.startsWith('2026-03-14')) return '2026-03-15';
                }
                const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (match) return `${match[1]}-${match[2]}-${match[3]}`;
                return s;
            };

            const start = dateStr(t.leasestart || t.LEASESTART);
            const end = dateStr(t.leaseend || t.LEASEEND);
            
            // APPLY LEADING APOSTROPHE TO FORCE TEXT MODE IN GOOGLE SHEETS
            updated.leasestart = "'" + start;
            updated.leaseend = "'" + end;
            
            console.log(`Fixing ${t.id} -> '${start} / '${end}`);
            
            try {
                const postData = { action: 'UPDATE', sheetName: 'tenants', data: updated };
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(postData)
                });
            } catch (e) { console.error('Failed.'); }
        }
    }
};

fixAll();
