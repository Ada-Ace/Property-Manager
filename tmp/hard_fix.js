import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const API_URL_MATCH = envFile.match(/VITE_API_URL=(.+)/);
const API_URL = API_URL_MATCH ? API_URL_MATCH[1].trim() : null;

// HARD CODED CORRECT DATES (No more guessing)
const corrections = {
    'RES-FXYZ': { start: '2026-03-15', end: '2026-05-14' },
    'RES-L9RF': { start: '2025-11-21', end: '2026-11-20' },
    'RES-HFGU': { start: '2026-01-01', end: '2026-12-31' }
};

const finalFinalFix = async () => {
    if (!API_URL) return;
    const resp = await fetch(API_URL);
    const data = await resp.json();
    const tenants = data.tenants || [];

    for (const id of Object.keys(corrections)) {
        const tenant = tenants.find(t => t.id === id);
        if (!tenant) continue;

        console.log(`FINAL FIX: ${tenant.name} -> '${corrections[id].start}`);
        const updated = { ...tenant };
        updated.leasestart = "'" + corrections[id].start;
        updated.leaseend = "'" + corrections[id].end;
        
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'UPDATE', sheetName: 'tenants', data: updated })
            });
            console.log('- Success.');
        } catch (e) { console.error('Failed.'); }
    }
};

finalFinalFix();
