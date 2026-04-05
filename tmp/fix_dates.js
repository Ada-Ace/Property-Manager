import fs from 'fs';

// Get API_URL from .env
const envFile = fs.readFileSync('.env', 'utf8');
const API_URL_MATCH = envFile.match(/VITE_API_URL=(.+)/);
const API_URL = API_URL_MATCH ? API_URL_MATCH[1].trim() : null;

// CORRECT DATA FROM USER'S PREVIOUS SCREENSHOTS
const corrections = {
    'RES-FXYZ': { leaseStart: '2026-03-15', leaseEnd: '2026-05-14' },
    'RES-L9RF': { leaseStart: '2025-11-21', leaseEnd: '2026-11-20' },
    'RES-HFGU': { leaseStart: '2026-01-01', leaseEnd: '2026-12-31' }
};

const fix = async () => {
    if (!API_URL) return;
    console.log('Fetching tenants...');
    const resp = await fetch(API_URL);
    const data = await resp.json();
    const tenants = data.tenants || [];

    for (const tenant of tenants) {
        if (corrections[tenant.id]) {
            const upStart = corrections[tenant.id].leaseStart;
            const upEnd = corrections[tenant.id].leaseEnd;
            
            // Check if actual update is needed (Sheet headers might be leasestart or LEASESTART)
            console.log(`Fixing tenant ${tenant.id} (${tenant.name}): ${upStart} / ${upEnd}`);
            
            const updatedTenant = { ...tenant };
            // Update all potential case variations of the keys to be sure
            for (const key of Object.keys(tenant)) {
                const lk = key.toLowerCase();
                if (lk === 'leasestart') updatedTenant[key] = upStart;
                if (lk === 'leaseend') updatedTenant[key] = upEnd;
            }
            
            try {
                const postData = { action: 'UPDATE', sheetName: 'tenants', data: updatedTenant };
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(postData)
                });
                console.log(`- ${tenant.id} Success.`);
            } catch (e) {
                console.error(`- ${tenant.id} Failed:`, e.message);
            }
        }
    }
    console.log('Correction complete.');
};

fix();
