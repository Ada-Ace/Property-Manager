import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const API_URL_MATCH = envFile.match(/VITE_API_URL=(.+)/);
const API_URL = API_URL_MATCH ? API_URL_MATCH[1].trim() : null;

const check = async () => {
    if (!API_URL) return;
    console.log('Fetching raw data...');
    const resp = await fetch(API_URL + "?t=" + Date.now());
    const data = await resp.json();
    const tenants = data.tenants || [];
    
    console.log('--- RAW TENANT DATA ---');
    for (const t of tenants) {
        if (['RES-FXYZ', 'RES-L9RF', 'RES-HFGU'].includes(t.id)) {
            console.log(`ID: ${t.id} | Name: ${t.name}`);
            console.log(`- leaseStart (raw): ${t.leasestart || t.LEASESTART || t.leaseStart}`);
            console.log(`- leaseEnd (raw): ${t.leaseend || t.LEASEEND || t.leaseEnd}`);
        }
    }
};

check();
