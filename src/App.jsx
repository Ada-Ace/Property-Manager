import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const Motion = motion;
import {
    LayoutDashboard,
    Users,
    Receipt,
    Wrench,
    Plus,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    CreditCard,
    Droplets,
    Home,
    Settings,
    ChevronRight,
    ChevronLeft,
    Calendar,
    Camera,
    LogOut,
    Send,
    Hammer,
    Lock,
    User,
    ShieldCheck,
    Trash2,
    Briefcase,
    DollarSign,
    Phone,
    MessageSquare,
    BellRing,
    Info,
    FileText,
    Percent,
    Power,
    Bell,
    Upload,
    File,
    PlusCircle,
    CalendarRange,
    FileCheck,
    ExternalLink,
    Building2,
    ChevronDown,
    Maximize,
    Image as ImageIcon,
    Tag,
    Mail,
    ListChecks,
    Box,
    PlusSquare,
    XCircle,
    X,
    Zap,
    Flame,
    PieChart,
    LayoutGrid,
    MessageCircle,
    Activity,
    RefreshCcw,
    UploadCloud,
    TrendingUp,
    History,
    Package
} from 'lucide-react';

// --- System Credentials & Configuration ---
const MANAGER_CREDENTIALS = {
    email: import.meta.env.VITE_MANAGER_EMAIL || 'admin@propmanage.com',
    password: import.meta.env.VITE_MANAGER_PASSWORD || 'admin',
    mobile: import.meta.env.VITE_MANAGER_MOBILE || '+1555000111'
};

const TENANT_DEMO_CREDENTIALS = {
    mobile: import.meta.env.VITE_TENANT_MOBILE || '+1555111222',
    password: import.meta.env.VITE_TENANT_PASSWORD || 'tenant'
};

// --- Mock Initial Data ---
const INITIAL_TENANTS = [];
const INITIAL_UNITS = [];
const INITIAL_PROPERTIES = [
    { id: 'P1', name: 'Your First Property', address: 'Set Address in Settings', currency: 'USD' }
];
const INITIAL_BILLS = [];
const INITIAL_TASKS = [];
const INITIAL_MESSAGES = [];
const INITIAL_VENDORS = [];
const INITIAL_PAYMENTS = [];
const INITIAL_MANAGERS = [
    { id: 'M1', name: 'Primary Admin', mobile: MANAGER_CREDENTIALS.mobile, password: MANAGER_CREDENTIALS.password }
];

// ISO 4217 currency list for property settings
const ISO_CURRENCIES = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'IDR', name: 'Indonesian Rupiah' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'PHP', name: 'Philippine Peso' },
    { code: 'THB', name: 'Thai Baht' },
    { code: 'TWD', name: 'Taiwan Dollar' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'DKK', name: 'Danish Krone' },
    { code: 'PKR', name: 'Pakistani Rupee' },
    { code: 'BDT', name: 'Bangladeshi Taka' },
    { code: 'VND', name: 'Vietnamese Dong' },
];

// --- Global Configuration ---
const APP_TIMEZONE = 'Asia/Kuala_Lumpur'; // GMT+8
const LOCALE = 'en-MY'; // Or your preferred region for GMT+8

// --- Helper Functions ---
const getLocalDate = () => {
    try {
        // More robust way to get a UTC-based date for specific timezone comparison
        const d = new Date();
        return new Date(d.toLocaleString("en-US", { timeZone: APP_TIMEZONE }));
    } catch (e) {
        return new Date();
    }
};

// Standardised date formatter → dd-MMM-yyyy (e.g. 19-Mar-2026)
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const isPaidThisMonth = (lastPaymentDate) => {
    if (!lastPaymentDate) return false;
    const last = new Date(lastPaymentDate);
    const now = getLocalDate();
    return last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
};

const formatDate = (date, includeTime = false) => {
    if (!date) return '—';
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return 'N/A';
        const dd   = String(d.getDate()).padStart(2, '0');
        const mmm  = MONTHS_SHORT[d.getMonth()];
        const yyyy = d.getFullYear();
        const base = `${dd}-${mmm}-${yyyy}`;
        if (!includeTime) return base;
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${base} ${hh}:${mi}`;
    } catch (e) {
        return 'N/A';
    }
};

const fmtDate = (str) => {
    if (!str) return '—';
    try {
        const strVal = String(str).trim();
        const clean = strVal.split('T')[0];
        const parts = clean.split('-');
        
        // Handle yyyy-mm-dd or similar standard iso prefixes
        if (parts.length === 3) {
            const [y, m, d] = parts;
            if (y.length === 4 && !isNaN(m) && !isNaN(d)) {
                return `${d.padStart(2,'0')}-${MONTHS_SHORT[parseInt(m,10)-1]}-${y}`;
            }
        }
        
        // Fallback for JS date string formats natively
        const d = new Date(strVal);
        if (!isNaN(d.getTime())) {
            return formatDate(d, false);
        }
        return '—';
    } catch (e) {
        return '—';
    }
};

const generateId = (prefix) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous 0,1,I,O
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
};


const calculateNextRentDue = (leaseStart) => {
    const today = getLocalDate();
    const lStart = new Date(leaseStart);
    
    // Safety check: If lease date is invalid, use today as a safe bail-out
    if (isNaN(lStart.getTime())) return new Date(today);
    
    const day = lStart.getDate();
    let dueDate = new Date(today.getFullYear(), today.getMonth(), day - 1);
    
    if (dueDate < today) {
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, day - 1);
    }
    return dueDate;
};

const getDaysUntilDue = (leaseStart) => {
    const today = getLocalDate();
    today.setHours(0, 0, 0, 0);
    const dueDate = calculateNextRentDue(leaseStart);
    if (isNaN(dueDate.getTime())) return 0;
    dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
};

// Returns the current billing period { from, to } based on lease start day
const getBillingPeriod = (leaseStart) => {
    const to = calculateNextRentDue(leaseStart);
    if (isNaN(to.getTime())) return { from: null, to: null };
    // 'from' is one month before 'to', +1 day
    const from = new Date(to);
    from.setMonth(from.getMonth() - 1);
    from.setDate(from.getDate() + 1);
    return { from, to };
};



// --- API Service Management ---
const API_URL = import.meta.env.VITE_API_URL;

const API = {
    isValid() {
        return typeof API_URL === 'string' && API_URL.includes("/exec");
    },

    async uploadToDrive(fileData, fileName) {
        if (!this.isValid()) return { success: false, message: 'Invalid API URL (Must end in /exec)' };
        try {
            const resp = await fetch(API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'UPLOAD', fileData, fileName })
            });
            return await resp.json();
        } catch (err) {
            console.error('Drive Upload Error:', err);
            return { success: false, message: 'Upload failed' };
        }
    },

    async uploadFile(file) {
        if (!file || !this.isValid()) return null;
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const res = await this.uploadToDrive(reader.result, file.name);
                resolve(res.success ? res.url : null);
            };
            reader.readAsDataURL(file);
        });
    },

    async saveToSheet(action, sheetName, data) {
        if (!this.isValid()) return { success: false, message: 'Invalid API URL' };
        try {
            // Using text/plain to avoid preflight (CORS-safe for Google Scripts)
            const resp = await fetch(API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action, sheetName, data })
            });
            const result = await resp.json();
            if (result.success) {
                // If it's a mutation, we want the app to stay in sync
                // But we don't want a heavy reload, we trust the result
            }
            return result;
        } catch (err) {
            console.error('Sheet Save Error:', err);
            return { success: false, message: 'Connection Error - Check Internet' };
        }
    },

    async getAllData() {
        if (!this.isValid()) {
            console.warn("Cloud Sync disabled: Library or missing API URL. Please deploy as Web App.");
            return null;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for cold starts
            
            const resp = await fetch(API_URL, { 
                signal: controller.signal,
                method: 'GET',
                mode: 'cors',
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);
            
            if (!resp.ok) throw new Error(`HTTP ${resp.status} - Cloud Script Error`);
            const content = await resp.json();
            return content;
        } catch (err) {
            console.error('Cloud Sync Error (Using Offline Mode):', err);
            return null;
        }
    }
};

export default function App() {
    const [view, setView] = useState('login');
    const [isLoading, setIsLoading] = useState(true);
    const [tenants, setTenants] = useState([]);
    const [propertyUnits, setPropertyUnits] = useState([]);
    const [utilityBills, setUtilityBills] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeTenantId, setActiveTenantId] = useState(null);
    const [activeProperty, setActiveProperty] = useState(null);
    const [globalMessage, setGlobalMessage] = useState(null);
    const [properties, setProperties] = useState([]);
    const [tenantMessages, setTenantMessages] = useState([]);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState(null); // null means adding new
    const [syncStatus, setSyncStatus] = useState('offline'); // 'connecting', 'connected', 'error', 'offline'
    const [lastSyncError, setLastSyncError] = useState(null);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);

    // Get ISO 4217 currency for the currently active property
    const activeCurrency = useMemo(() => {
        const prop = Array.isArray(properties) ? properties.find(p => p.name === activeProperty) : null;
        return prop?.currency || 'USD';
    }, [properties, activeProperty]);

    const updatePropertyCurrency = (currency) => {
        const prop = Array.isArray(properties) ? properties.find(p => p.name === activeProperty) : null;
        if (!prop) {
            // Backup for local/unsynced properties
            API.saveToSheet('UPDATE', 'Properties', { id: `cloud-${Date.now()}`, name: activeProperty, currency });
            return;
        }
        const updatedProp = { ...prop, currency };
        setProperties(prev => prev.map(p => p.name === activeProperty ? updatedProp : p));
        API.saveToSheet('UPDATE', 'Properties', updatedProp);
    };

    // Computed filtered lists based on selected property (ensure arrays exist)
    const filteredTenants = useMemo(() => {
        if (!activeProperty || !Array.isArray(tenants)) return [];
        const normActive = String(activeProperty).trim().toLowerCase();
        return tenants.filter(t => t && String(t.propertyName || '').trim().toLowerCase() === normActive);
    }, [tenants, activeProperty]);

    const filteredUnits = useMemo(() => {
        if (!activeProperty || !Array.isArray(propertyUnits)) return [];
        const normActive = String(activeProperty).trim().toLowerCase();
        return propertyUnits.filter(u => u && String(u.propertyName || '').trim().toLowerCase() === normActive);
    }, [propertyUnits, activeProperty]);

    const filteredMessages = useMemo(() => {
        if (!activeProperty || !Array.isArray(tenantMessages)) return [];
        const normActive = String(activeProperty).trim().toLowerCase();
        return tenantMessages.filter(m => m && String(m.propertyName || '').trim().toLowerCase() === normActive);
    }, [tenantMessages, activeProperty]);

    const filteredBills = useMemo(() => {
        if (!activeProperty || !Array.isArray(utilityBills)) return [];
        const normActive = String(activeProperty).trim().toLowerCase();
        return utilityBills.filter(b => b && String(b.propertyName || '').trim().toLowerCase() === normActive);
    }, [utilityBills, activeProperty]);

    const filteredTasks = useMemo(() => {
        if (!activeProperty || !Array.isArray(tasks)) return [];
        const normActive = String(activeProperty).trim().toLowerCase();
        return tasks.filter(t => t && String(t.propertyName || '').trim().toLowerCase() === normActive);
    }, [tasks, activeProperty]);

    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [vendors, setVendors] = useState(INITIAL_VENDORS);
    const [payments, setPayments] = useState(INITIAL_PAYMENTS);
    const [managers, setManagers] = useState(INITIAL_MANAGERS);

    const handleAddVendor = async (vendor) => {
        const newVendor = { ...vendor, id: generateId('VEN'), propertyName: activeProperty };
        setVendors(prev => [...prev, newVendor]);
        await API.saveToSheet('ADD', 'Vendors', newVendor);
    };

    const handleEditVendor = async (vendor) => {
        setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v));
        await API.saveToSheet('UPDATE', 'Vendors', vendor);
    };

    const handleDeleteVendor = async (vendorId) => {
        if (!window.confirm('Are you sure you want to remove this contractor?')) return;
        setVendors(prev => prev.filter(v => v.id !== vendorId));
        await API.saveToSheet('DELETE', 'Vendors', { id: vendorId });
    };

    const handleAddProperty = () => {
        setPropertyToEdit(null); // Clear for new
        setShowPropertyModal(true);
    };

    const savePropertyDetails = async (propData) => {
        const isNew = !propData.id;
        const finalProp = isNew ? { ...propData, id: generateId('PRP') } : propData;
        
        if (isNew) {
            setProperties(prev => [...prev, finalProp]);
        } else {
            setProperties(prev => prev.map(p => p.id === finalProp.id ? finalProp : p));
        }
        
        setActiveProperty(finalProp.name);
        await API.saveToSheet(isNew ? 'ADD' : 'UPDATE', 'Properties', finalProp);
        setShowPropertyModal(false);
        setGlobalMessage({ type: 'success', text: `Property "${finalProp.name}" ${isNew ? 'Registered' : 'Updated'}` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const syncWithCloud = async (isBackground = false) => {
        if (!API.isValid()) {
            setSyncStatus('offline');
            if (!isBackground) {
                // Fallback to local/demo data if no cloud URL
                setProperties(INITIAL_PROPERTIES);
                setTenants(INITIAL_TENANTS);
                setPropertyUnits(INITIAL_UNITS);
                setUtilityBills(INITIAL_BILLS);
                setTenantMessages(INITIAL_MESSAGES || []);
                setManagers(INITIAL_MANAGERS);
                setActiveProperty(INITIAL_PROPERTIES[0].name);
                setTimeout(() => setIsLoading(false), 500); 
            }
            return;
        }

        if (!isBackground) setIsLoading(true);
        else setIsRefreshing(true);
        setSyncStatus('connecting');
        
        try {
            const data = await API.getAllData();
            if (data && typeof data === 'object') {
                // Hardened Property Extraction
                let actualProperties = Array.isArray(data.properties) ? data.properties.map(p => ({ 
                    ...p, 
                    name: String(p.name || '').trim(),
                    currency: p.currency || 'USD' 
                })) : [];
                
                const rawUnits = Array.isArray(data.units) ? data.units : [];
                const rawTenants = Array.isArray(data.tenants) ? data.tenants : [];
                const rawBills = Array.isArray(data.bills) ? data.bills : [];
                const rawTasks = Array.isArray(data.tasks) ? data.tasks : [];
                const rawMessages = Array.isArray(data.messages) ? data.messages : [];
                const rawPayments = Array.isArray(data.payments) ? data.payments : [];
                const rawManagers = Array.isArray(data.managers) ? data.managers : [];

                // Even if no properties are found, if we got a valid object, we are connected
                setSyncStatus('connected');
                setLastSyncTime(new Date());

                if (actualProperties.length === 0) {
                    const foundNames = [...rawUnits, ...rawTenants, ...rawBills, ...rawTasks, ...rawMessages]
                        .map(item => item?.propertyName)
                        .filter(Boolean)
                        .map(n => String(n).trim());
                    
                    const uniqueNames = Array.from(new Set(foundNames));
                    actualProperties = uniqueNames.map((name, idx) => ({ id: generateId('PRP'), name, address: 'Synced Property' }));
                }

                if (actualProperties.length > 0) {
                    setProperties(actualProperties);
                    setTenants(rawTenants);
                    setPropertyUnits(rawUnits);
                    setUtilityBills(rawBills);
                    setTasks(rawTasks);
                    setTenantMessages(rawMessages);
                    setPayments(rawPayments.length > 0 ? rawPayments : payments);
                    if (rawManagers.length > 0) setManagers(rawManagers);
                    
                    if (!activeProperty) {
                        setActiveProperty(actualProperties[0].name);
                    }
                } else {
                    // Successful connection but no data found in cloud
                    if (!isBackground) {
                        setProperties(INITIAL_PROPERTIES);
                        setTenants(INITIAL_TENANTS);
                    }
                }
            } else {
                // API returned invalid format
                setSyncStatus('error');
                if (!isBackground) {
                    setProperties(INITIAL_PROPERTIES);
                    setTenants(INITIAL_TENANTS);
                }
            }
        } catch (err) {
            const errMsg = err.name === 'AbortError' ? 'Timeout (Cold Start)' : err.message;
            console.error('Core sync failure:', err);
            setSyncStatus('error');
            setLastSyncError(errMsg);
            if (!isBackground) {
                setGlobalMessage({ type: 'error', text: `Connection Failed: ${errMsg}` });
                setProperties(INITIAL_PROPERTIES);
                setTenants(INITIAL_TENANTS);
                if (!activeProperty) setActiveProperty(INITIAL_PROPERTIES[0].name);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Auto-Sync Heartbeat (Every 60s)
    useEffect(() => {
        syncWithCloud(); // Initial
        const interval = setInterval(() => syncWithCloud(true), 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = (mobileInput, password) => {
        // Force-clear landing delay if logging in manually
        setIsLoading(false); 
        
        // Strip out any non-numeric/plus characters to make matching robust
        const cleanMobile = (str) => String(str || '').replace(/[^\d+]/g, '');
        const inputMobileCleaned = cleanMobile(mobileInput);
        
        if (inputMobileCleaned === cleanMobile(MANAGER_CREDENTIALS.mobile) && password === MANAGER_CREDENTIALS.password) {
            const firstProp = (Array.isArray(properties) && properties[0]?.name) || INITIAL_PROPERTIES[0]?.name;
            setActiveProperty(firstProp);
            setView('manager');
            setIsLoading(false);
            return { success: true };
        }

        // Check Dynamic Managers from Cloud
        const cloudManager = managers.find(m => cleanMobile(m.mobile) === inputMobileCleaned && m.password === password);
        if (cloudManager) {
            const firstProp = (Array.isArray(properties) && properties[0]?.name) || INITIAL_PROPERTIES[0]?.name;
            setActiveProperty(firstProp);
            setView('manager');
            setIsLoading(false);
            return { success: true };
        }

        // --- NEW: Tenant Demo Credentials Access ---
        if (inputMobileCleaned === cleanMobile(TENANT_DEMO_CREDENTIALS.mobile) && password === TENANT_DEMO_CREDENTIALS.password) {
            const firstTenant = Array.isArray(tenants) && tenants.length > 0 ? tenants[0] : null;
            if (firstTenant) {
                setActiveTenantId(firstTenant.id);
                setActiveProperty(firstTenant.propertyName);
                setView('tenant');
                setIsLoading(false);
                return { success: true };
            }
        }
        
        const tenant = tenants.find(t => cleanMobile(t.mobile) === inputMobileCleaned && t.password === password);
        if (tenant) {
            setActiveTenantId(tenant.id);
            setActiveProperty(tenant.propertyName);
            setView('tenant');
            return { success: true };
        }
        return { success: false, message: 'Invalid mobile number or password' };
    };

    const logout = () => {
        setView('login');
        setActiveTenantId(null);
        setActiveProperty(null);
    };

    const updateUnitFittings = async (unitId, newFittings) => {
        const unit = propertyUnits.find(u => u.id === unitId);
        if (unit) {
            const updatedUnit = { ...unit, fittings: newFittings };
            setPropertyUnits(prev => prev.map(u => u.id === unitId ? updatedUnit : u));
            setGlobalMessage({ type: 'info', text: "Synchronizing inventory with cloud..." });
            const res = await API.saveToSheet('UPDATE', 'Units', updatedUnit);
            if (res.success) {
                setGlobalMessage({ type: 'success', text: "Inventory Verified & Cloud Synced" });
                syncWithCloud(true);
            } else {
                setGlobalMessage({ type: 'error', text: `Sync Failed: ${res.message}` });
            }
        }
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleAddBill = async (newBillData, updatedTenants) => {
        const newBill = { ...newBillData, id: generateId('BIL'), propertyName: activeProperty };
        setUtilityBills([...utilityBills, newBill]);
        setTenants(updatedTenants);
        
        // Save bill
        await API.saveToSheet('ADD', 'Bills', newBill);
        // Update all affected tenants
        for (const t of updatedTenants) {
            await API.saveToSheet('UPDATE', 'Tenants', t);
        }

        setGlobalMessage({ type: 'success', text: `Bill recorded and allocated for ${activeProperty}!` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleMarkPaid = async (tenantId, amount) => {
        const tenant = tenants.find(t => t.id === tenantId);
        if (tenant) {
            const updatedTenant = { 
                ...tenant, 
                lastPaymentDate: new Date().toISOString() 
            };
            const newPayment = {
                id: generateId('PAY'),
                tenantId: tenant.id,
                amount: amount,
                date: new Date().toISOString(),
                propertyName: activeProperty
            };

            setTenants(prev => prev.map(t => t.id === tenantId ? updatedTenant : t));
            setPayments(prev => [newPayment, ...prev]);
            setGlobalMessage({ type: 'success', text: `Payment for ${tenant.unit} Verified!` });
            
            await API.saveToSheet('UPDATE', 'Tenants', updatedTenant);
            await API.saveToSheet('ADD', 'Payments', newPayment);
            
            setTimeout(() => setGlobalMessage(null), 3000);
            
            // Generate receipt link
            const msg = encodeURIComponent(`Hi ${tenant.name.split(' ')[0]},\n\nWe have successfully received and verified your rent payment of ${activeCurrency} ${amount}. \n\nThank you for the prompt payment! \n\nBest regards,\nProperty Management`);
            const waLink = `https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}?text=${msg}`;
            window.open(waLink, '_blank');
        }
    };

    const handleAddTask = async (newTask) => {
        const taskData = { ...newTask, id: generateId('MTN'), propertyName: activeProperty };
        setTasks([...tasks, taskData]);
        await API.saveToSheet('ADD', 'Tasks', taskData);
        setGlobalMessage({ type: 'success', text: `Maintenance task created for ${activeProperty}!` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const addUnitToCatalog = async (unitData) => {
        let imageUrl = unitData.image;
        if (unitData.newImageFile) {
            setGlobalMessage({ type: 'info', text: "Uploading unit photo..." });
            const uploadRes = await API.uploadToDrive(unitData.newImageFile, `unit_${unitData.unitNumber}_${Date.now()}.png`);
            if (uploadRes.success) imageUrl = uploadRes.url;
        }

        const newUnit = { 
            ...unitData, 
            id: generateId('UNT'), 
            fittings: [], 
            propertyName: activeProperty,
            image: imageUrl 
        };
        delete newUnit.newImageFile; // Clean up for state/sheet

        setPropertyUnits([...propertyUnits, newUnit]);
        const res = await API.saveToSheet('ADD', 'Units', newUnit);
        if (res.success) {
            setGlobalMessage({ type: 'success', text: `Unit ${unitData.unitNumber} added & Cloud Synced` });
            syncWithCloud(true);
        } else {
            setGlobalMessage({ type: 'error', text: `Cloud Save Failed: ${res.message}` });
        }
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const editUnitInCatalog = async (updatedUnit) => {
        let imageUrl = updatedUnit.image;
        if (updatedUnit.newImageFile) {
            setGlobalMessage({ type: 'info', text: "Updating unit photo..." });
            const uploadRes = await API.uploadToDrive(updatedUnit.newImageFile, `unit_${updatedUnit.unitNumber}_${Date.now()}.png`);
            if (uploadRes.success) imageUrl = uploadRes.url;
        }

        const finalUnit = { ...updatedUnit, image: imageUrl };
        delete finalUnit.newImageFile; // Clean up

        setPropertyUnits(prev => prev.map(u => u.id === finalUnit.id ? finalUnit : u));
        await API.saveToSheet('UPDATE', 'Units', finalUnit);
        setGlobalMessage({ type: 'success', text: `Unit ${finalUnit.unitNumber} updated successfully` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const deleteUnit = async (unitId) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this unit? This cannot be undone.")) return;
        
        const unit = propertyUnits.find(u => u.id === unitId);
        setPropertyUnits(prev => prev.filter(u => u.id !== unitId));
        setGlobalMessage({ type: 'info', text: "Removing unit from cloud..." });
        await API.saveToSheet('DELETE', 'Units', { id: unitId });
        setGlobalMessage({ type: 'success', text: `Unit deleted & synced successfully` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const addTenant = async (newTenant) => {
        setGlobalMessage({ type: 'info', text: "Initializing lease setup..." });
        
        let docUrl = null;
        if (newTenant.leaseFile) {
            setGlobalMessage({ type: 'info', text: "Uploading documentation to cloud..." });
            const uploadedUrl = await API.uploadFile(newTenant.leaseFile);
            if (uploadedUrl) docUrl = uploadedUrl;
        }

        const tenantData = {
            ...newTenant,
            id: generateId('RES'),
            maintenanceSelection: null,
            utilityShare: 0,
            notifications: [],
            leaseDocument: docUrl,
            propertyName: activeProperty
        };
        delete tenantData.leaseFile; // Clean up

        setTenants([...tenants, tenantData]);
        setPropertyUnits(prev => prev.map(u => u.unitNumber === newTenant.unit ? { ...u, status: 'Occupied' } : u));
        
        setGlobalMessage({ type: 'info', text: "Syncing data to cloud..." });
        const res = await API.saveToSheet('ADD', 'Tenants', tenantData);
        
        const unit = propertyUnits.find(u => u.unitNumber === newTenant.unit);
        if (unit) {
            await API.saveToSheet('UPDATE', 'Units', { ...unit, status: 'Occupied' });
        }

        if (res.success) {
            setGlobalMessage({ type: 'success', text: `Registration Complete & Cloud Synced` });
            syncWithCloud(true);
        } else {
            setGlobalMessage({ type: 'error', text: `Sync Failure: ${res.message}` });
        }
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const editTenant = async (updatedTenant) => {
        setGlobalMessage({ type: 'info', text: "Updating agreement details..." });
        
        let docUrl = updatedTenant.leaseDocument || null;
        if (updatedTenant.leaseFile) {
            setGlobalMessage({ type: 'info', text: "Uploading documentation to cloud..." });
            const uploadedUrl = await API.uploadFile(updatedTenant.leaseFile);
            if (uploadedUrl) docUrl = uploadedUrl;
        }

        const tenantData = { 
            ...updatedTenant, 
            leaseDocument: docUrl,
            lastUpdated: new Date().toISOString() 
        };
        delete tenantData.leaseFile; // Don't send file object to sheet

        setTenants(prev => prev.map(t => t.id === updatedTenant.id ? tenantData : t));
        const oldTenant = tenants.find(t => t.id === updatedTenant.id);
        
        if (tenantData.unit) {
            // Update local units state
            setPropertyUnits(prev => prev.map(u => {
                if (u.unitNumber === tenantData.unit) return { ...u, status: 'Occupied' };
                if (oldTenant && oldTenant.unit === u.unitNumber && oldTenant.unit !== tenantData.unit) return { ...u, status: 'Available' };
                return u;
            }));

            // Sync unit changes to cloud
            const newUnit = propertyUnits.find(u => u.unitNumber === tenantData.unit);
            if (newUnit) await API.saveToSheet('UPDATE', 'Units', { ...newUnit, status: 'Occupied' });
            
            if (oldTenant && oldTenant.unit !== tenantData.unit) {
                const prevUnit = propertyUnits.find(u => u.unitNumber === oldTenant.unit);
                if (prevUnit) await API.saveToSheet('UPDATE', 'Units', { ...prevUnit, status: 'Available' });
            }
        }
        
        const res = await API.saveToSheet('UPDATE', 'Tenants', tenantData);
        if (res.success) {
            setGlobalMessage({ type: 'success', text: `Agreement Finalized & Synced` });
            syncWithCloud(true);
        } else {
            setGlobalMessage({ type: 'error', text: `Cloud Save Failed: ${res.message}` });
        }
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleSendMessage = async (msg, photoData = null) => {
        let photoUrl = null;
        
        if (photoData) {
            setGlobalMessage({ type: 'info', text: "Uploading attachment..." });
            const uploadRes = await API.uploadToDrive(photoData, `msg_${Date.now()}.png`);
            if (uploadRes.success) {
                photoUrl = uploadRes.url;
            } else {
                setGlobalMessage({ type: 'error', text: "Photo upload failed! Please ensure UPLOAD_FOLDER_ID is set in your GAS Script." });
                setTimeout(() => setGlobalMessage(null), 5000);
                // We proceed with the text message anyway, or return?
                // Better to return if they tried to upload a photo but it failed?
                // User said "i cant see the proof", so photo is important.
            }
        }

        const newMessage = {
            id: generateId('MSG'),
            tenantId: activeTenantId,
            content: msg,
            photoUrl: photoUrl, // Remote URL
            timestamp: new Date().toISOString(),
            propertyName: activeProperty
        };

        // UI Persistence (Immediate)
        setTenantMessages(prev => [newMessage, ...prev]);
        
        // Remote Persistence
        await API.saveToSheet('ADD', 'Messages', newMessage);

        setGlobalMessage({ type: 'success', text: `Message sent to ${activeProperty} management!` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleMoveOut = async (unit, tenant) => {
        if (!window.confirm(`Are you sure you want to mark ${tenant.name} as moved out and set Unit ${unit.unitNumber} as Available?`)) return;
        
        try {
            setGlobalMessage({ type: 'info', text: 'Processing Move-Out...' });
            
            // 1. Mark unit as Available with Vacancy Tracking
            const updatedUnit = { 
                ...unit, 
                status: 'Available',
                vacantSince: new Date().toISOString().split('T')[0] // Track when lost revenue starts
            };
            await editUnitInCatalog(updatedUnit);

            // 2. Mark tenant as archived
            const updatedTenant = { ...tenant, unit: 'None' };
            await editTenant(updatedTenant);

            // 3. Create Turnover Task
            const newTask = {
                id: `T${Date.now()}`,
                unit: unit.unitNumber,
                type: 'Maintenance',
                status: 'Pending',
                date: new Date().toISOString().split('T')[0],
                task: `🧹 Turnover Cleaning & Inspection for Unit ${unit.unitNumber}`
            };
            setTasks(prev => [newTask, ...prev]);
            await API.saveToSheet('ADD', 'Tasks', newTask);

            setGlobalMessage({ type: 'success', text: `Unit ${unit.unitNumber} is now Available. Cleanup task scheduled.` });
            setTimeout(() => setGlobalMessage(null), 3000);
        } catch (err) {
            console.error('Move out failed:', err);
            setGlobalMessage({ type: 'error', text: 'Move-out failed. Connection issue?' });
        }
    };

    const handleLeaseDocUpload = async (tenantId, file) => {
        try {
            setGlobalMessage({ type: 'info', text: 'Uploading Lease Agreement...' });
            const docUrl = await API.uploadFile(file);
            if (docUrl) {
                const tenant = tenants.find(t => t.id === tenantId);
                const updatedTenant = { ...tenant, leaseDocument: docUrl };
                await editTenant(updatedTenant);
                setGlobalMessage({ type: 'success', text: 'Lease Agreement Uploaded Successfully' });
                setTimeout(() => setGlobalMessage(null), 3000);
            }
        } catch (err) {
            console.error('Lease upload failed:', err);
            setGlobalMessage({ type: 'error', text: 'Upload Failed - Check Cloud Connection' });
            setTimeout(() => setGlobalMessage(null), 3000);
        }
    };

    if (view === 'login') return <LoginPage onLogin={handleLogin} />;
    
    // Property selection view removed as requested - admins now go direct

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 premium-gradient selection:text-white">
            <AnimatePresence>
            {globalMessage && (
                <Motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[200]"
                >
                    <div className="bg-emerald-600/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-black italic tracking-tight">{globalMessage.text}</span>
                    </div>
                </Motion.div>
            )}
            </AnimatePresence>

            <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
                <div className="w-full px-6 md:px-12 h-[72px] flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/20">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-white font-black text-base tracking-tight">
                                {import.meta.env.VITE_APP_NAME || "PropManage"}
                                <span className="text-indigo-400 font-light italic ml-1 text-sm">Pro</span>
                            </span>
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-0.5">Enterprise Suite</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        {view === 'manager' && (
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 hover:bg-white/10 transition-all">
                                <div className="flex flex-col items-end gap-0.5 pr-2 border-r border-white/10">
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <p className={`text-[7px] font-black uppercase tracking-tight ${syncStatus === 'connected' ? 'text-emerald-400' : syncStatus === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
                                            {syncStatus === 'connected' ? 'Cloud Live' : syncStatus === 'error' ? 'Sync Error' : syncStatus === 'connecting' ? 'Connecting' : 'Offline Mode'}
                                        </p>
                                        <button 
                                            onClick={() => syncWithCloud()} 
                                            title="Force Refresh Data"
                                            className={`p-0.5 hover:scale-110 active:scale-95 transition-all ${isRefreshing || syncStatus === 'connecting' ? 'animate-spin text-indigo-400' : 'text-slate-500 hover:text-emerald-400'}`}
                                        >
                                            <RefreshCcw className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                    <p className="text-[7px] text-slate-600 font-black uppercase tracking-tight tabular-nums">
                                        {lastSyncTime ? `Last Updated: ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '— Local Cache Only'}
                                    </p>
                                </div>
                                <div className="relative">
                                    {/* Custom Property Picker Button */}
                                    <button
                                        onClick={() => setShowPropertyPicker(v => !v)}
                                        className="flex items-center gap-2 text-indigo-400 hover:text-white transition-all"
                                    >
                                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest max-w-[120px] md:max-w-[200px] truncate">{activeProperty}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showPropertyPicker ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Custom Dropdown Panel */}
                                    <AnimatePresence>
                                    {showPropertyPicker && (
                                        <>
                                            {/* Backdrop */}
                                            <div className="fixed inset-0 z-[90]" onClick={() => setShowPropertyPicker(false)} />
                                            <Motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                className="absolute top-full right-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-2xl shadow-black/50 overflow-hidden z-[100]"
                                            >
                                                {/* Header label */}
                                                <div className="px-4 pt-4 pb-2">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600">Your Properties</p>
                                                </div>

                                                {/* Property List */}
                                                <div className="px-2 pb-2 space-y-0.5">
                                                    {Array.isArray(properties) && properties.map(p => (
                                                        <button
                                                            key={p?.id || p?.name}
                                                            onClick={() => { setActiveProperty(p?.name || p); setShowPropertyPicker(false); }}
                                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                                                                activeProperty === (p?.name || p)
                                                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                                                                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                                                            }`}
                                                        >
                                                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                                activeProperty === (p?.name || p) ? 'bg-indigo-400' : 'bg-slate-700 group-hover:bg-slate-500'
                                                            } transition-colors`} />
                                                            <span className="text-[11px] font-black uppercase tracking-wide truncate">{p?.name || p}</span>
                                                            {activeProperty === (p?.name || p) && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 ml-auto shrink-0" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Divider + Register New */}
                                                <div className="p-2 border-t border-white/5">
                                                    <button
                                                        onClick={() => { handleAddProperty(); setShowPropertyPicker(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-indigo-400 hover:bg-indigo-600 hover:text-white border border-dashed border-indigo-500/30 hover:border-indigo-500 transition-all group"
                                                    >
                                                        <PlusCircle className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Register New Property</span>
                                                    </button>
                                                </div>
                                            </Motion.div>
                                        </>
                                    )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                        {view === 'manager' && (
                            <Motion.button
                                whileHover={{ scale: 1.05, rotate: 30 }}
                                whileTap={{ scale: 0.95 }}
                                title="Property Settings"
                                onClick={() => {
                                    const current = properties.find(p => p.name === activeProperty) || { name: activeProperty, currency: 'USD' };
                                    setPropertyToEdit(current);
                                    setShowPropertyModal(true);
                                }}
                                className="p-2.5 text-slate-500 hover:text-indigo-400 bg-white/5 hover:bg-indigo-500/10 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all"
                            >
                                <Settings className="w-4 h-4" />
                            </Motion.button>
                        )}
                        <Motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={logout} 
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-white hover:bg-red-600 transition-all bg-red-500/10 px-5 py-2.5 rounded-2xl border border-red-500/20 font-black"
                        >
                            <Power className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Sign Out</span>
                        </Motion.button>
                    </div>
                </div>
            </nav>

            {showPropertyModal && (
                <PropertyModal
                    initialData={propertyToEdit}
                    apiStatus={{ 
                        url: API_URL, 
                        status: syncStatus, 
                        error: lastSyncError
                    }}
                    onClose={() => setShowPropertyModal(false)}
                    onSave={savePropertyDetails}
                />
            )}

            <main className="w-full px-6 md:px-12 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Syncing Cloud Dashboard...</p>
                    </div>
                ) : (
                    <Motion.div
                        key={view + activeProperty}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {view === 'manager' ? (
                            <ErrorBoundary>
                                <ManagerDashboard
                                    key={activeProperty}
                                    activeProperty={activeProperty}
                                    tenants={filteredTenants}
                                    payments={payments}
                                    propertyUnits={filteredUnits}
                                    utilityBills={filteredBills}
                                    tasks={filteredTasks}
                                    vendors={vendors.filter(v => !v.propertyName || v.propertyName === activeProperty)}
                                    tenantMessages={filteredMessages}
                                    currency={activeCurrency}
                                    onAddUnit={addUnitToCatalog}
                                    onEditUnit={editUnitInCatalog}
                                    onDeleteUnit={deleteUnit}
                                    onAddTenant={addTenant}
                                    onEditTenant={editTenant}
                                    onUpdateFittings={updateUnitFittings}
                                    onAddBill={handleAddBill}
                                    onAddTask={handleAddTask}
                                    onAddVendor={handleAddVendor}
                                    onEditVendor={handleEditVendor}
                                    onDeleteVendor={handleDeleteVendor}
                                    onMarkPaid={handleMarkPaid}
                                    onUpdateLeaseDoc={handleLeaseDocUpload}
                                    onMoveOut={handleMoveOut}
                                />
                            </ErrorBoundary>
                        ) : (
                            <TenantDashboard
                                tenant={tenants.find(t => t.id === activeTenantId)}
                                unit={propertyUnits.find(u => u.unitNumber === (tenants.find(t => t.id === activeTenantId)?.unit))}
                                currency={activeCurrency}
                                onSendMessage={handleSendMessage}
                            />
                        )}
                    </Motion.div>
                )}
            </main>
        </div>
    );
}

// --- Manager Components ---

function ManagerDashboard({ activeProperty, tenants, payments, propertyUnits, utilityBills, tasks, vendors, tenantMessages, currency = 'USD', onAddUnit, onEditUnit, onDeleteUnit, onAddTenant, onEditTenant, onUpdateFittings, onAddBill, onAddTask, onAddVendor, onEditVendor, onDeleteVendor, onMarkPaid, onUpdateLeaseDoc, onMoveOut }) {
    const [activeTab, setActiveTab] = useState('rents');
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [selectedUnitForLease, setSelectedUnitForLease] = useState(null);

    const [showVendorModal, setShowVendorModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    const handleAddVendor = (vendorData) => {
        onAddVendor(vendorData);
        setShowVendorModal(false);
    };

    const handleUpdateVendor = (vendorData) => {
        onEditVendor(vendorData);
        setShowVendorModal(false);
        setEditingVendor(null);
    };

    const totalRevenue = useMemo(() => (Array.isArray(tenants) ? tenants.reduce((a, b) => a + (Number(b?.baseRent) || 0), 0) : 0), [tenants]);
    const occupiedUnits = useMemo(() => (Array.isArray(propertyUnits) ? propertyUnits.filter(u => tenants.some(t => t.unit === u.unitNumber)).length : 0), [propertyUnits, tenants]);
    const totalUnits = Array.isArray(propertyUnits) ? propertyUnits.length : 0;
    const vacantUnits = totalUnits - occupiedUnits;
    const tasksCount = Array.isArray(tasks) ? tasks.length : 0;

    // Currency tag helper — prepends ISO code as a label
    const cur = (amount) => `${currency} ${Number(amount || 0).toLocaleString()}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <VendorModal 
                isOpen={showVendorModal} 
                onClose={() => { setShowVendorModal(false); setEditingVendor(null); }} 
                onSubmit={editingVendor ? handleUpdateVendor : handleAddVendor} 
                editingVendor={editingVendor} 
            />
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard index={0} title="Monthly Revenue" value={cur(totalRevenue)} icon={<CreditCard className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />} />
                <StatCard index={1} title="Occupancy Rate" value={totalUnits > 0 ? `${Math.round((occupiedUnits / totalUnits) * 100)}%` : '0%'} icon={<Users className="text-blue-400 group-hover:text-blue-300 transition-colors" />} />
                <StatCard index={2} title="Available Units" value={vacantUnits || 0} icon={<Building2 className="text-sky-400 group-hover:text-sky-300 transition-colors" />} />
                <StatCard index={3} title="Active Maintenance" value={(tasksCount || 0).toString()} icon={<Wrench className="text-amber-400 group-hover:text-amber-300 transition-colors" />} />
            </div>

            <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto no-scrollbar snap-x relative backdrop-blur-md">
                {(Array.isArray(tenants) ? [
                    { id: 'rents', icon: <Receipt className="w-3.5 h-3.5" />, label: 'Rent Summary' },
                    { id: 'inventory', icon: <Building2 className="w-3.5 h-3.5" />, label: 'Property Catalog' },
                    { id: 'utilities', icon: <Droplets className="w-3.5 h-3.5" />, label: 'Utilities Share' },
                    { id: 'tasks', icon: <Hammer className="w-3.5 h-3.5" />, label: 'Maintenance' },
                    { id: 'messages', icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Messages', badge: (tenantMessages?.length > 0) }
                ] : []).map((tab) => (
                    <Motion.button 
                        key={tab.id}
                        layout
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`relative px-5 md:px-7 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center justify-center gap-2.5 shrink-0 z-10 snap-start uppercase tracking-widest ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab.icon} {tab.label}
                        {tab.badge && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        {activeTab === tab.id && (
                            <Motion.div 
                                layoutId="activeTab"
                                className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/40"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </Motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <Motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'rents' && <RentSummaryTab tenants={tenants} payments={payments.filter(p => !p.propertyName || p.propertyName === activeProperty)} currency={currency} onMarkPaid={onMarkPaid} propertyName={activeProperty} tenantMessages={tenantMessages} />}
                    {activeTab === 'messages' && <MessagesManager tenants={tenants} messages={tenantMessages} onMarkPaid={onMarkPaid} currency={currency} />}
                    {activeTab === 'tasks' && (
                        <TasksManager 
                            tenants={tenants} 
                            tasks={tasks} 
                            vendors={vendors}
                            onAddTask={onAddTask} 
                            onAddVendor={() => { setEditingVendor(null); setShowVendorModal(true); }}
                            onEditVendor={(v) => { setEditingVendor(v); setShowVendorModal(true); }}
                            onDeleteVendor={onDeleteVendor}
                            currency={currency}
                        />
                    )}
                    {activeTab === 'inventory' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                            {propertyUnits.map(unit => {
                                const tenant = tenants.find(t => t.unit === unit.unitNumber);
                                return (
                                    <UnitCard
                                        key={unit.id}
                                        unit={unit}
                                        tenant={tenant}
                                        currency={currency}
                                        history={{
                                            rents: utilityBills?.filter(b => b.unit === unit.unitNumber).slice(0, 3) || [],
                                            tasks: tasks?.filter(t => t.unit === unit.unitNumber).slice(0, 3) || []
                                        }}
                                        onUpdateFittings={onUpdateFittings}
                                        onEditUnit={() => setEditingUnit(unit)}
                                        onDeleteUnit={() => onDeleteUnit(unit.id)}
                                        onAddLease={() => { setEditingTenant(null); setSelectedUnitForLease(unit); setShowLeaseModal(true); }}
                                        onEditLease={() => { setEditingTenant(tenant); setSelectedUnitForLease(unit); setShowLeaseModal(true); }}
                                        onUpdateLeaseDoc={onUpdateLeaseDoc}
                                        onMoveOut={() => onMoveOut(unit, tenant)}
                                    />
                                );
                            })}
                            <Motion.button 
                                whileHover={{ y: -5, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowUnitModal(true)} 
                                className="h-full min-h-[300px] border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all group shadow-xl"
                            >
                                <div className="p-5 bg-slate-800 rounded-3xl group-hover:bg-indigo-600 transition-colors">
                                    <PlusCircle className="w-10 h-10 group-hover:text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Add New Unit</span>
                            </Motion.button>
                        </div>
                    )}
                    {activeTab === 'utilities' && (
                        <UtilityManager tenants={tenants} utilityBills={utilityBills} onAddBill={onAddBill} currency={currency} />
                    )}
                </Motion.div>
            </AnimatePresence>

            {showUnitModal && <UnitModal onClose={() => setShowUnitModal(false)} onSubmit={onAddUnit} />}
            {editingUnit && <UnitModal initialData={editingUnit} onClose={() => setEditingUnit(null)} onSubmit={(data) => { onEditUnit(data); setEditingUnit(null); }} />}
            {showLeaseModal && (
                <LeaseModal 
                    initialData={selectedUnitForLease ? { unit: selectedUnitForLease.unitNumber } : (editingTenant || {})}
                    availableUnits={propertyUnits.filter(u => !tenants.some(t => t.unit === u.unitNumber) || (editingTenant && u.unitNumber === editingTenant.unit) || (selectedUnitForLease && u.unitNumber === selectedUnitForLease.unitNumber))} 
                    onClose={() => { setShowLeaseModal(false); setEditingTenant(null); setSelectedUnitForLease(null); }} 
                    onSubmit={async (data) => { 
                        if (data.id || editingTenant) await onEditTenant(data);
                        else await onAddTenant(data);
                        setShowLeaseModal(false);
                        setEditingTenant(null);
                        setSelectedUnitForLease(null);
                    }} 
                />
            )}
        </div>
    );
}

// --- Payment Confirmation Modal ---
function PaymentConfirmModal({ tenant, currency, proofMessages, onConfirm, onClose }) {
    const [selectedProof, setSelectedProof] = useState(proofMessages[0] || null);
    const bp = getBillingPeriod(tenant?.leaseStart);
    const totalDue = (Number(tenant?.baseRent) || 0) + (Number(tenant?.utilityShare) || 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(245,158,11,0.06),transparent_50%)]" />
            <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                            <CreditCard className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white tracking-tight">Payment Review</h2>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">{tenant?.unit} · {tenant?.name}</p>
                        </div>
                    </div>
                    <Motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-all">
                        <X className="w-4 h-4" />
                    </Motion.button>
                </div>

                {/* Billing Info Row */}
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">Billing Period</p>
                        <p className="text-[11px] font-black text-slate-300 flex items-center gap-1.5">
                            {bp.from ? fmtDate(bp.from.toISOString()) : '—'}
                            <span className="text-indigo-400">→</span>
                            {bp.to ? fmtDate(bp.to.toISOString()) : '—'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">Amount Due</p>
                        <p className="text-xl font-black text-emerald-400 tracking-tighter">{currency} {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Proof Preview */}
                <div className="p-6">
                    {proofMessages.length > 0 ? (
                        <>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Payment Proof ({proofMessages.length} file{proofMessages.length > 1 ? 's' : ''})
                            </p>
                            {/* Main large preview */}
                            <div className="w-full h-56 rounded-2xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center mb-3">
                                {selectedProof?.photoUrl ? (
                                    <img
                                        src={selectedProof.photoUrl}
                                        alt="Payment proof"
                                        className="w-full h-full object-contain"
                                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                    />
                                ) : null}
                                <div className="hidden flex-col items-center gap-2 text-slate-600">
                                    <ImageIcon className="w-8 h-8 opacity-30" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Preview Unavailable</p>
                                </div>
                            </div>
                            {/* Thumbnail strip if multiple */}
                            {proofMessages.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    {proofMessages.map((m, i) => (
                                        <button key={i} onClick={() => setSelectedProof(m)}
                                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${selectedProof === m ? 'border-amber-400' : 'border-white/5 hover:border-white/20'}`}>
                                            <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            <p className="text-[8px] text-slate-600 mt-2 font-medium">
                                Submitted: {selectedProof ? fmtDate(selectedProof.timestamp, true) : '—'}
                            </p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-white/5 rounded-2xl text-slate-600">
                            <ImageIcon className="w-10 h-10 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-center">No proof submitted yet.<br />You can still manually confirm payment.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex gap-3">
                    <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        Cancel
                    </Motion.button>
                    <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
                        className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Confirm & Mark Paid
                    </Motion.button>
                </div>
            </Motion.div>
        </div>
    );
}

// --- Rent Summary Tab ---
function RentSummaryTab({ tenants, payments, currency = 'USD', onMarkPaid, propertyName, tenantMessages = [] }) {
    const [confirmTenant, setConfirmTenant] = useState(null); // tenant to confirm payment for
    const downloadLedgerPDF = () => {
        if (!window.jspdf) {
            alert('PDF utility is initializing. Please wait a second.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Branded Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text(`${propertyName} - Rent Ledger`, 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Transaction Statement Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Unit", "Tenant", "Payment Date", "Amount"];
        const tableRows = payments.slice().reverse().map(pay => {
            const t = tenants.find(ten => ten.id === pay.tenantId);
            return [
                t?.unit || 'N/A',
                t?.name || 'Archived Tenant',
                fmtDate(pay.date),
                `${currency} ${Number(pay.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            ];
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }, // Indigo-600
            alternateRowStyles: { fillColor: [245, 247, 250] }
        });

        doc.save(`Ledger_${propertyName}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const today = getLocalDate() || new Date();
    const currentMonthLabel = (today && typeof today.toLocaleString === 'function') ? today.toLocaleString(LOCALE, { month: 'long', year: 'numeric', timeZone: APP_TIMEZONE }) : 'Current Month';

    const upcomingRents = useMemo(() => {
        if (!Array.isArray(tenants)) return [];
        return tenants.map(t => {
            try {
                if (!t.leaseStart) throw new Error();
                const dueDate = calculateNextRentDue(t.leaseStart);
                const daysUntil = getDaysUntilDue(t.leaseStart);
                return { ...t, dueDate, daysUntil };
            } catch (e) {
                return { ...t, dueDate: new Date(), daysUntil: 0 };
            }
        }).sort((a, b) => {
            const da = (a.dueDate instanceof Date && !isNaN(a.dueDate)) ? a.dueDate.getTime() : 0;
            const db = (b.dueDate instanceof Date && !isNaN(b.dueDate)) ? b.dueDate.getTime() : 0;
            return da - db;
        });
    }, [tenants]);

    const totalRevenueThisCycle = useMemo(() => upcomingRents.reduce((a, b) => a + (Number(b?.baseRent) || 0), 0), [upcomingRents]);
    const soonDueCount = upcomingRents.filter(r => r && (Number(r?.daysUntil) || 0) <= 3).length;

    return (
        <div className="space-y-8">
            {/* Payment Confirmation Modal */}
            <AnimatePresence>
            {confirmTenant && (
                <PaymentConfirmModal
                    tenant={confirmTenant}
                    currency={currency}
                    proofMessages={tenantMessages.filter(m => m.tenantId === confirmTenant.id && m.photoUrl).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))}
                    onConfirm={() => {
                        onMarkPaid(confirmTenant.id, (Number(confirmTenant.baseRent) + Number(confirmTenant.utilityShare || 0)).toFixed(2));
                        setConfirmTenant(null);
                    }}
                    onClose={() => setConfirmTenant(null)}
                />
            )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard index={0} title="Expected Revenue" value={`${currency} ${totalRevenueThisCycle.toLocaleString()}`} icon={<DollarSign className="text-emerald-400" />} />
                <StatCard index={1} title="Collections Due" value={upcomingRents.length} icon={<CalendarRange className="text-blue-400" />} />
                <StatCard index={2} title="Action Required" value={soonDueCount} icon={<BellRing className={soonDueCount > 0 ? "text-orange-400 animate-bounce" : "text-slate-500"} />} />
            </div>

            <div className="premium-card rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/5 gap-4">
                    <div>
                        <h3 className="font-black text-2xl text-white italic tracking-tight flex items-center gap-3">
                            <CreditCard className="w-7 h-7 text-indigo-400" />
                            Rent Collection
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">
                            {currentMonthLabel} · Sorted by urgency
                        </p>
                    </div>
                    {soonDueCount > 0 && (
                        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-5 py-2.5 rounded-2xl">
                            <BellRing className="w-4 h-4 text-orange-400 animate-bounce" />
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{soonDueCount} Urgent</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {upcomingRents.map((rent, idx) => {
                        const isUrgent = rent.daysUntil <= 3;
                        const isOverdue = rent.daysUntil < 0;
                        const dueDateStr = (rent.dueDate instanceof Date && !isNaN(rent.dueDate)) ? fmtDate(rent.dueDate.toISOString()) : 'N/A';
                        return (
                            <Motion.div 
                                key={rent.id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`rounded-3xl p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${
                                    isPaidThisMonth(rent.lastPaymentDate) ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-600/5' :
                                    isOverdue ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' :
                                    isUrgent ? 'bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10' :
                                    'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                                }`}
                            >
                                {/* Left: avatar + info */}
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg shrink-0 ${
                                        isPaidThisMonth(rent.lastPaymentDate) ? 'bg-emerald-600 shadow-emerald-600/20' :
                                        isOverdue ? 'bg-red-600 shadow-red-600/20' :
                                        isUrgent ? 'bg-orange-500 shadow-orange-500/20' :
                                        'bg-indigo-600 shadow-indigo-600/20'
                                    }`}>{rent.unit}</div>
                                    <div>
                                        <p className="text-base font-black text-white tracking-tight flex items-center gap-2">
                                            {rent.name}
                                            {/* Proof of payment badge */}
                                            {(() => {
                                                const hasProof = tenantMessages.some(m => m.tenantId === rent.id && m.photoUrl);
                                                return hasProof && !isPaidThisMonth(rent.lastPaymentDate) ? (
                                                    <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <ImageIcon className="w-2.5 h-2.5" /> Proof Submitted
                                                    </span>
                                                ) : null;
                                            })()}
                                        </p>
                                        {(() => {
                                            const bp = getBillingPeriod(rent.leaseStart);
                                            return bp.from && bp.to ? (
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                                    <CalendarRange className="w-3 h-3 text-indigo-400/60 shrink-0" />
                                                    {fmtDate(bp.from.toISOString())}
                                                    <span className="text-indigo-400/60">→</span>
                                                    {fmtDate(bp.to.toISOString())}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Lease Start: {fmtDate(rent.leaseStart)}</p>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Right: info + action */}
                                <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto">
                                    <div className="text-left md:text-right">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Due</p>
                                        <p className={`text-sm font-black tracking-tight ${
                                            isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-slate-300'
                                        }`}>{dueDateStr}</p>
                                        <p className={`text-[9px] font-black uppercase mt-0.5 ${
                                            isPaidThisMonth(rent.lastPaymentDate) ? 'text-emerald-500' :
                                            isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-slate-600'
                                        }`}>
                                            {isPaidThisMonth(rent.lastPaymentDate) ? '✅ Paid & Verified' : rent.daysUntil === 0 ? '🔴 Due Today' : isOverdue ? `${Math.abs(rent.daysUntil)}d overdue` : `${rent.daysUntil}d left`}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Monthly Rent</p>
                                        <p className="text-xl font-black text-emerald-400 tracking-tighter">{currency} {Number(rent.baseRent).toLocaleString()}</p>
                                    </div>

                                    {isPaidThisMonth(rent.lastPaymentDate) ? (
                                        <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Received
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmTenant(rent)}
                                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                tenantMessages.some(m => m.tenantId === rent.id && m.photoUrl)
                                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/30'
                                                    : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30'
                                            }`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {tenantMessages.some(m => m.tenantId === rent.id && m.photoUrl) ? 'Review & Verify' : 'Mark Paid'}
                                        </button>
                                    )}
                                </div>
                            </Motion.div>
                        );
                    })}
                </div>

                {payments.length > 0 && (
                    <div className="flex justify-end gap-3 mt-8">
                        <button 
                            onClick={downloadLedgerPDF}
                            className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl"
                        >
                            <FileCheck className="w-4 h-4 text-emerald-400" /> Download PDF Report
                        </button>
                    </div>
                )}
            </div>

            {/* Historical Payment Ledger */}
            <div className="premium-card rounded-[2.5rem] p-8 mt-12">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                    <div>
                        <h3 className="font-black text-2xl text-white italic tracking-tight flex items-center gap-3">
                            <History className="w-7 h-7 text-indigo-400" />
                            Collection Ledger
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Historical Transaction Log</p>
                    </div>
                </div>

                {payments.length === 0 ? (
                    <div className="text-center py-20 text-slate-600 border-2 border-dashed border-white/5 rounded-[2rem]">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-[10px] uppercase font-black tracking-widest">No transactions recorded</p>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2rem]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Unit</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Tenant</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-500 tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.slice().reverse().map((pay, i) => {
                                    const t = tenants.find(ten => ten.id === pay.tenantId);
                                    return (
                                        <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                                            <td className="px-8 py-6 font-black text-indigo-400 text-xs">{t?.unit || 'N/A'}</td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-white tracking-tight">{t?.name || 'Archived Tenant'}</p>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-slate-400 font-bold">{fmtDate(pay.date)}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-sm font-black text-emerald-400 tabular-nums">{currency} {Number(pay.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function VendorModal({ isOpen, onClose, onSubmit, editingVendor }) {
    const [vendorForm, setVendorForm] = useState({
        id: `VEN${Date.now()}`,
        name: '',
        mobile: '',
        type: 'General Maintenance',
        rating: 5,
        email: ''
    });

    useEffect(() => {
        if (editingVendor) setVendorForm(editingVendor);
        else setVendorForm({ id: `VEN${Date.now()}`, name: '', mobile: '', type: 'General Maintenance', rating: 5, email: '' });
    }, [editingVendor, isOpen]);

    if (!isOpen) return null;

    const specializations = ['Plumbing', 'Electrical', 'HVAC / Aircon', 'Pest Control', 'Cleaning', 'Structural', 'General Maintenance', 'Landscaping'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in transition-all">
            <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-10 pb-6 border-b border-white/5 bg-slate-900/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20"><Briefcase className="w-6 h-6 text-indigo-400" /></div>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{editingVendor ? 'Modify Partner' : 'Enlist Partner'}</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 opacity-60">Service Network Registration</p>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Contractor Name</label>
                            <input type="text" className="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500 focus:bg-slate-950 transition-all font-bold" placeholder="e.g. Acme Plumbing" value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Primary Specialization</label>
                                <select className="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500 font-black uppercase text-[10px] tracking-widest" value={vendorForm.type} onChange={e => setVendorForm({ ...vendorForm, type: e.target.value })}>
                                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Mobile Contact</label>
                                <input type="text" className="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500" placeholder="+123456789" value={vendorForm.mobile} onChange={e => setVendorForm({ ...vendorForm, mobile: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Email Address (Optional)</label>
                            <input type="email" className="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500" placeholder="contractor@example.com" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="p-10 pt-0">
                    <button onClick={() => onSubmit(vendorForm)} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all transform active:scale-95">
                        {editingVendor ? <RefreshCcw className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        {editingVendor ? 'Confirm Modifications' : 'Enlist Contractor'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function MessagesManager({ tenants, messages, onMarkPaid, currency = 'USD' }) {
    return (
        <div className="space-y-6">
            <div className="premium-card rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/5 gap-4">
                    <div>
                        <h3 className="font-black text-2xl text-white italic tracking-tight flex items-center gap-3">
                            <MessageSquare className="w-7 h-7 text-indigo-400" />
                            Communications
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Tenant inbox · All messages</p>
                    </div>
                    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                        messages.length > 0 
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' 
                        : 'bg-white/5 text-slate-500 border-white/5'
                    }`}>
                        {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
                    </div>
                </div>

                {messages.length === 0 ? (
                    <div className="text-center py-24 text-slate-600">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <MessageSquare className="w-10 h-10 opacity-30" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.3em]">Inbox is empty</p>
                        <p className="text-[10px] text-slate-700 font-bold mt-2">Messages sent by tenants will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {messages.map((msg, idx) => {
                            const tenant = tenants.find(t => t.id === msg.tenantId);
                            const waReplyLink = tenant ? `https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${String(tenant.name || 'Tenant').split(' ')[0]}, received your message: "${msg.content}". \n\n`)}` : '#';
                            const initials = (tenant?.name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                            return (
                                <Motion.div 
                                    key={msg.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.05] transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-lg shadow-indigo-600/20 shrink-0">
                                                    {initials}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-white">{tenant?.name || 'Unknown Tenant'}</h4>
                                                        <span className="text-[9px] text-indigo-400 font-black uppercase bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">Unit {tenant?.unit}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">
                                                        {formatDate(msg.timestamp, true)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 text-slate-300 text-sm italic leading-relaxed">
                                                <span className="text-slate-600 mr-1 text-lg leading-none">"</span>
                                                {msg.content}
                                                <span className="text-slate-600 ml-1 text-lg leading-none">"</span>
                                            </div>
                                            {msg.photoUrl && (
                                                <div className="mt-4">
                                                    <a href={msg.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative">
                                                        <img src={msg.photoUrl} alt="Attachment" className="h-36 w-auto rounded-2xl border border-white/10 shadow-xl group-hover:scale-[1.02] transition-transform" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                            <ExternalLink className="w-5 h-5 text-white" />
                                                        </div>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full md:w-auto self-end flex flex-col md:flex-row gap-2 flex-shrink-0">
                                            {tenant && (
                                                <>
                                                    {msg.photoUrl && (
                                                        <Motion.button
                                                            whileHover={{ scale: 1.04 }}
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={() => onMarkPaid(tenant.id, (Number(tenant.baseRent) + Number(tenant.utilityShare)).toFixed(2))}
                                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all border border-indigo-500/30"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" /> Verify & Send Receipt
                                                        </Motion.button>
                                                    )}
                                                    <Motion.a
                                                        whileHover={{ scale: 1.04 }}
                                                        whileTap={{ scale: 0.96 }}
                                                        href={waReplyLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full md:w-auto bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 px-7 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <MessageSquare className="w-4 h-4" /> Reply on WhatsApp
                                                    </Motion.a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function WhatsAppRentButton({ tenant, mode = 'rent', currency = 'USD', fullWidth = false }) {
    if (!tenant) return null;
    
    if (mode === 'renewal') {
        const leaseEnd = fmtDate(tenant.leaseEnd) || 'the end of your contract';
        const message = encodeURIComponent(`Hi ${String(tenant.name || 'Tenant').split(' ')[0]},\n\nJust reaching out as your lease for Unit *${tenant.unit}* is scheduled to end on *${leaseEnd}*.\n\nWe would love to have you stay! Would you be interested in discussing a lease renewal?\n\nPlease let us know your thoughts.\n\nThank you!`);
        const waLink = `https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}?text=${message}`;

        let isUrgent = false;
        try {
            const end = new Date(tenant.leaseEnd);
            if (!isNaN(end)) {
                const diff = end - new Date();
                isUrgent = diff > 0 && diff < (90 * 24 * 60 * 60 * 1000);
            }
        } catch(e) {}

        return (
            <a 
                href={waLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`text-[10px] uppercase font-black tracking-widest px-4 py-3 rounded-2xl border transition-all flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''} ${
                    isUrgent 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30 shadow-lg shadow-amber-500/10' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
            >
                <MessageSquare className="w-3.5 h-3.5" /> 
                Lease Renewal Alert
                {isUrgent && <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
            </a>
        );
    }

    // Default: Rent Mode
    const dueDate = fmtDate(calculateNextRentDue(tenant.leaseStart).toISOString());
    const daysUntil = getDaysUntilDue(tenant.leaseStart);
    const message = encodeURIComponent(`Hi ${String(tenant.name || 'Tenant').split(' ')[0]},\n\nJust a friendly reminder that your monthly rent of *${currency} ${(Number(tenant.baseRent) || 0).toLocaleString()}* for Unit *${tenant.unit}* is due on *${dueDate}*.\n\nPlease ensure payment is made before the deadline to avoid any late fees.\n\nThank you!`);
    const waLink = `https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}?text=${message}`;
    const isUrgent = daysUntil <= 3;

    return (
        <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`text-[10px] uppercase font-black tracking-widest px-4 py-3 rounded-2xl border transition-all flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''} ${
                isUrgent 
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 hover:bg-orange-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
        >
            <MessageSquare className="w-3.5 h-3.5" /> 
            {isUrgent ? 'Push Rent Alert' : 'Notify Rent'}
            {isUrgent && <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500"></span>}
        </a>
    );
}

// --- Utility Components ---

function UtilityManager({ tenants, utilityBills, onAddBill, currency = 'USD' }) {
    const [activeTab, setActiveTab] = useState('new'); // 'new', 'monthly', or 'history'

    const uniqueMonths = useMemo(() => {
        if (!Array.isArray(utilityBills)) return [new Date().toISOString().substring(0, 7)];
        const months = Array.from(new Set(utilityBills.filter(b => b && typeof b.date === 'string').map(b => b.date.substring(0, 7)))).sort().reverse();
        return months.length > 0 ? months : [new Date().toISOString().substring(0, 7)];
    }, [utilityBills]);

    const [selectedMonth, setSelectedMonth] = useState(uniqueMonths[0]);

    const effectiveMonth = useMemo(() => {
        return uniqueMonths.includes(selectedMonth) ? selectedMonth : uniqueMonths[0];
    }, [uniqueMonths, selectedMonth]);

    // New Bill State
    const [billType, setBillType] = useState('Electricity');
    const [billDate, setBillDate] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const [billFile, setBillFile] = useState(null);
    const [mode, setMode] = useState('equal');
    const [tenantDates, setTenantDates] = useState(
        tenants.reduce((acc, t) => ({ ...acc, [t.id]: { start: '', end: '' } }), {})
    );

    const getDays = (start, end) => {
        if (!start || !end) return 0;
        const diff = new Date(end) - new Date(start);
        return diff >= 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1 : 0;
    };

    const tenantDays = tenants.reduce((acc, t) => {
        acc[t.id] = getDays(tenantDates[t.id].start, tenantDates[t.id].end);
        return acc;
    }, {});

    const totalBill = Number(billAmount) || 0;
    const totalDays = Object.values(tenantDays).reduce((a, b) => a + Number(b), 0);

    const handleApply = () => {
        const allocations = tenants.map(t => {
            let share = 0;
            if (mode === 'equal') {
                share = totalBill / tenants.length;
            } else {
                share = totalDays > 0 ? (totalBill * (Number(tenantDays[t.id]) / totalDays)) : 0;
            }
            return { tenantId: t.id, amount: Number(share.toFixed(2)) };
        });

        const newBill = {
            id: `B${Date.now()}`,
            type: billType,
            date: billDate || new Date().toISOString().split('T')[0],
            amount: totalBill,
            mode,
            allocations,
            hasFile: !!billFile,
            fileName: billFile?.name
        };

        const updatedTenants = tenants.map(t => {
            const allocation = allocations.find(a => a.tenantId === t.id);
            return { ...t, utilityShare: t.utilityShare + (allocation?.amount || 0) };
        });

        onAddBill(newBill, updatedTenants);

        setBillAmount('');
        setBillDate('');
        setBillFile(null);
        setTenantDates(tenants.reduce((acc, t) => ({ ...acc, [t.id]: { start: '', end: '' } }), {}));
        setActiveTab('history');
    };

    return (
        <div className="space-y-6">
            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 w-fit">
                <button onClick={() => setActiveTab('new')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}><PlusCircle className="w-4 h-4" /> Add Bill</button>
                <button onClick={() => setActiveTab('monthly')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}><Calendar className="w-4 h-4" /> Monthly Summary</button>
                <button onClick={() => setActiveTab('history')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}><Clock className="w-4 h-4" /> Bill History</button>
            </div>

            {activeTab === 'new' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-sm font-black text-white italic mb-6 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-indigo-400" /> Bill Details
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Type</label>
                                    <select className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" value={billType} onChange={e => setBillType(e.target.value)}>
                                        <option>Electricity</option>
                                        <option>Water</option>
                                        <option>Gas</option>
                                        <option>Trash</option>
                                        <option>Internet</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Date</label>
                                    <input type="date" style={{ colorScheme: 'dark' }} className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" value={billDate} onChange={e => setBillDate(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Amount ($)</label>
                                    <input type="number" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" placeholder="0.00" value={billAmount} onChange={e => setBillAmount(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Document (Optional)</label>
                                    <div className="relative">
                                        <input type="file" id="billUpload" className="hidden" onChange={e => setBillFile(e.target.files[0])} />
                                        <label htmlFor="billUpload" className="flex items-center justify-between w-full bg-slate-800 hover:bg-slate-700/50 rounded-xl p-3 cursor-pointer transition-colors group border border-dashed border-white/10 hover:border-indigo-500/50">
                                            <span className="text-sm text-slate-400 font-medium truncate pr-4">{billFile ? billFile.name : 'Upload PDF/Image'}</span>
                                            <UploadCloud className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-sm font-black text-white italic mb-6 flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-indigo-400" /> Distribution Logic
                            </h3>
                            <div className="space-y-3">
                                <button onClick={() => setMode('equal')} className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${mode === 'equal' ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-white/5 border-transparent opacity-60'}`}>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">Standard Share</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Split equally by active tenants</p>
                                    </div>
                                    {mode === 'equal' && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <button onClick={() => setMode('designated')} className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${mode === 'designated' ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-white/5 border-transparent opacity-60'}`}>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">Designated Share</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Split by occupancy period</p>
                                    </div>
                                    {mode === 'designated' && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-lg text-white italic flex items-center gap-2">
                                <ListChecks className="w-5 h-5 text-indigo-400" /> Share Allocation
                            </h3>
                            <div className="flex gap-4 items-center">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Bill</p>
                                    <p className="text-xl font-black text-white tracking-tighter">{currency} {totalBill.toFixed(2)}</p>
                                </div>
                                {mode === 'designated' && (
                                    <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Total: {totalDays} Days
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {tenants.map(t => {
                                const calculatedAmt = mode === 'equal' ? (totalBill / tenants.length) : (totalDays > 0 ? totalBill * (Number(tenantDays[t.id]) / totalDays) : 0);
                                return (
                                    <div key={t.id} className="bg-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">{t.unit}</div>
                                            <div>
                                                <p className="text-sm font-black text-white">{t.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lease Active</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            {mode === 'designated' && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <input type="date" style={{ colorScheme: 'dark' }} className="w-[110px] bg-slate-800 border-none rounded-lg p-1.5 text-[10px] font-black text-white outline-none focus:ring-1 ring-indigo-500 uppercase tracking-widest" value={tenantDates[t.id].start} onChange={e => setTenantDates(prev => ({ ...prev, [t.id]: { ...prev[t.id], start: e.target.value } }))} />
                                                        <span className="text-slate-500 text-xs">to</span>
                                                        <input type="date" style={{ colorScheme: 'dark' }} className="w-[110px] bg-slate-800 border-none rounded-lg p-1.5 text-[10px] font-black text-white outline-none focus:ring-1 ring-indigo-500 uppercase tracking-widest" value={tenantDates[t.id].end} onChange={e => setTenantDates(prev => ({ ...prev, [t.id]: { ...prev[t.id], end: e.target.value } }))} />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">{tenantDays[t.id]} Days</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-right min-w-[80px]">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Share Amount</p>
                                                <p className="text-lg font-black text-indigo-400 tracking-tighter">{currency} {calculatedAmt.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button disabled={totalBill <= 0 || (mode === 'designated' && totalDays <= 0)} onClick={handleApply} className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                            Record & Allocate Bill <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'monthly' && (
                <div className="premium-card rounded-[2.5rem] p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/5 pb-6 gap-4">
                        <div>
                            <h3 className="font-black text-2xl text-white italic tracking-tight flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-indigo-400" /> Monthly Utility Breakdown
                            </h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Bills per tenant · {new Date(effectiveMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hidden md:inline">Period</span>
                            <select className="bg-slate-950/60 border border-white/10 hover:border-indigo-500/40 rounded-2xl px-5 py-3 text-white text-xs font-black outline-none cursor-pointer transition-all" value={effectiveMonth} onChange={e => setSelectedMonth(e.target.value)}>
                                {uniqueMonths.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(tenants) && tenants.map((t, idx) => {
                            const billsInMonth = (Array.isArray(utilityBills) ? utilityBills.filter(b => b && typeof b.date === 'string' && b.date.startsWith(effectiveMonth)) : []);
                            const breakdowns = billsInMonth.reduce((acc, bill) => {
                                const alloc = bill.allocations.find(a => a.tenantId === t.id);
                                if (alloc && alloc.amount > 0) acc.push({ type: bill.type, amount: alloc.amount });
                                return acc;
                            }, []);
                            const totalOwed = breakdowns.reduce((sum, item) => sum + item.amount, 0);

                            return (
                                <Motion.div 
                                    key={t.id} 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 flex flex-col hover:border-indigo-500/20 hover:bg-white/[0.06] transition-all group"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center font-black text-sm shrink-0">{t.unit}</div>
                                        <div>
                                            <p className="font-black text-white">{t.name}</p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{t.mobile || 'No Contact'}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        {breakdowns.length > 0 ? (
                                            <div className="space-y-2.5">
                                                {breakdowns.map((b, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                                                        <span className="text-slate-400 font-black uppercase tracking-widest text-[9px] flex items-center gap-2">
                                                            {b.type === 'Electricity' ? <Zap className="w-3 h-3 text-amber-400" /> : b.type === 'Water' ? <Droplets className="w-3 h-3 text-blue-400" /> : b.type === 'Gas' ? <Flame className="w-3 h-3 text-orange-400" /> : null}
                                                            {b.type}
                                                        </span>
                                                        <span className="text-white font-black text-sm">{currency} {b.amount.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center py-8 border border-dashed border-white/5 rounded-2xl">
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">No Bills Allocated</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-5 mt-5 border-t border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Utility Total</span>
                                            <span className={`text-2xl font-black tracking-tighter ${totalOwed > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{currency} {totalOwed.toFixed(2)}</span>
                                        </div>
                                        {t.mobile && totalOwed > 0 && (
                                            <Motion.a
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                href={`https://wa.me/${String(t.mobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${String(t.name || 'Tenant').split(' ')[0]},\n\nYour utility bill summary for ${new Date(effectiveMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })} is:\n${breakdowns.map(b => `- ${b.type}: ${currency} ${b.amount.toFixed(2)}`).join('\n')}\n\n*Total Due: ${currency} ${totalOwed.toFixed(2)}*`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-600/5"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" /> Send Utility Alert
                                            </Motion.a>
                                        )}
                                    </div>
                                </Motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white italic mb-8"><Receipt className="w-5 h-5 text-indigo-400" /> Bill History</h3>
                    {utilityBills.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">No bills recorded yet</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {utilityBills.slice().reverse().map(bill => (
                                <div key={bill.id} className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
                                        <div className="flex gap-4 items-center">
                                            <div className="bg-indigo-600/20 p-3.5 rounded-2xl border border-indigo-500/20">
                                                {bill.type === 'Electricity' ? <Zap className="w-6 h-6 text-amber-400" /> : bill.type === 'Water' ? <Droplets className="w-6 h-6 text-blue-400" /> : bill.type === 'Gas' ? <Flame className="w-6 h-6 text-orange-400" /> : <Receipt className="w-6 h-6 text-indigo-400" />}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white flex items-center gap-2">
                                                    {bill.type} Bill
                                                    {bill.hasFile && (
                                                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1 border border-emerald-500/20">
                                                            <FileText className="w-3 h-3" /> Attached
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"><span className="text-indigo-400">{fmtDate(bill.date)}</span> • {bill.mode === 'equal' ? 'Standard Split' : 'Designated Split'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-3xl font-black text-white tracking-tighter">{currency} {bill.amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {bill.allocations.map(alloc => {
                                            const t = tenants.find(t => t.id === alloc.tenantId);
                                            return t ? (
                                                <div key={alloc.tenantId} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">Unit <span className="text-white">{t.unit}</span></p>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs font-bold text-slate-300">{t.name.split(' ')[0]}</span>
                                                        <span className="text-lg font-black text-indigo-400 tracking-tighter">{currency} {alloc.amount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TasksManager({ tenants, tasks, vendors, onAddTask, onAddVendor, onEditVendor, onDeleteVendor, currency = 'USD' }) {
    const [subTab, setSubTab] = useState('active'); // 'active', 'vendors'
    const [title, setTitle] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [category, setCategory] = useState('General Maintenance');
    const [priority, setPriority] = useState('Normal');
    const [dateOptions, setDateOptions] = useState([{ date: '', time: '' }]);

    const categories = ['Plumbing', 'Electrical', 'HVAC / Aircon', 'Pest Control', 'Cleaning', 'Structural', 'General Maintenance'];
    const priorities = ['Low', 'Normal', 'High', 'URGENT'];

    const handleAdd = () => {
        if (!title || !tenantId) return;
        const formattedOptions = dateOptions.map(opt => `${opt.date} ${opt.time}`);
        onAddTask({
            id: `TSK${Date.now()}`,
            title,
            tenantId,
            category,
            priority,
            dateOptions: formattedOptions,
            status: 'Pending Discovery'
        });
        setTitle('');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 w-fit backdrop-blur-md">
                {[
                    { id: 'active', icon: <Hammer className="w-3.5 h-3.5" />, label: 'Work Orders' },
                    { id: 'vendors', icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Service Network' }
                ].map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${subTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {subTab === 'active' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-sm font-black text-white italic mb-8 flex items-center gap-2">
                                <PlusCircle className="w-4 h-4 text-indigo-400" /> Dispatch New Order
                            </h3>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Issue Description</label>
                                    <input type="text" className="w-full bg-slate-800 border-none rounded-xl p-4 text-white text-sm outline-none focus:ring-1 ring-indigo-500" placeholder="e.g. Master Bedroom Leak" value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Category</label>
                                        <select className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 ring-indigo-500" value={category} onChange={e => setCategory(e.target.value)}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Priority</label>
                                        <select className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 ring-indigo-500" value={priority} onChange={e => setPriority(e.target.value)}>
                                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Assign Resident</label>
                                    <select className="w-full bg-slate-800 border-none rounded-xl p-4 text-white text-sm outline-none focus:ring-1 ring-indigo-500" value={tenantId} onChange={e => setTenantId(e.target.value)}>
                                        <option value="">Select Tenant...</option>
                                        <option value="ALL">Broadcast to All</option>
                                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Inspection Slots</label>
                                    {dateOptions.map((opt, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input type="date" style={{ colorScheme: 'dark' }} className="flex-1 bg-slate-800 border-none rounded-xl p-3 text-white text-xs outline-none focus:ring-1 ring-indigo-500" value={opt.date} onChange={e => { const n = [...dateOptions]; n[i].date = e.target.value; setDateOptions(n); }} />
                                            <input type="time" style={{ colorScheme: 'dark' }} className="flex-1 bg-slate-800 border-none rounded-xl p-3 text-white text-xs outline-none focus:ring-1 ring-indigo-500" value={opt.time} onChange={e => { const n = [...dateOptions]; n[i].time = e.target.value; setDateOptions(n); }} />
                                        </div>
                                    ))}
                                    <button onClick={() => setDateOptions([...dateOptions, { date: '', time: '' }])} className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] px-2 py-1 hover:text-white transition-all">+ Add Option</button>
                                </div>
                                <button onClick={handleAdd} className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-[10px]">Generate Work Order</button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {tasks.slice().reverse().map(task => {
                            const tenant = tenants.find(t => t.id === task.tenantId) || { name: 'All Tenants', unit: 'All' };
                            return (
                                <div key={task.id} className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between gap-6 hover:border-indigo-500/30 transition-all group">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>{task.priority}</span>
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{task.category || 'Maintenance'}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-white tracking-tight">{task.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Unit {tenant.unit} • {tenant.name}</p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {task.dateOptions?.map((d, idx) => <span key={idx} className="bg-slate-950/40 text-slate-400 text-[9px] font-bold px-3 py-1.5 rounded-lg border border-white/5">{d}</span>)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[160px]">
                                        <div className="px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Status</p>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{task.status}</p>
                                        </div>
                                        <a href={`https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all">Notify Tenant</a>
                                        <button className="bg-white/5 hover:bg-white/10 text-slate-400 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all">Close Order</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((v, i) => (
                        <div key={i} className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group relative">
                            <div className="absolute top-8 right-8 flex gap-2">
                                <button onClick={() => onEditVendor(v)} className="p-2 bg-slate-800/80 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5">
                                    <Settings className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onDeleteVendor(v.id)} className="p-2 bg-slate-800/80 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20"><Briefcase className="w-6 h-6 text-indigo-400" /></div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Specialization</p>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{v.type}</p>
                                </div>
                            </div>
                            <h4 className="text-xl font-black text-white mb-2">{v.name}</h4>
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, idx) => <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx < Math.floor(v.rating || 5) ? 'bg-amber-500' : 'bg-slate-700'}`}></span>)}
                                <span className="text-[10px] text-slate-500 font-black ml-2">{v.rating || 5} Verified</span>
                            </div>
                            <a href={`https://wa.me/${String(v.mobile || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all">
                                <Phone className="w-4 h-4" /> DISPATCH VENDOR
                            </a>
                        </div>
                    ))}
                    <div onClick={onAddVendor} className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-600 hover:text-indigo-400 hover:border-indigo-500/40 transition-all cursor-pointer group bg-white/[0.02]">
                        <PlusSquare className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Enlist New Contractor</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Tenant Dashboard (unchanged logic, showing for completeness) ---

function TenantDashboard({ tenant, unit, onSendMessage, currency = 'USD' }) {
    const [showMsgModal, setShowMsgModal] = useState(false);
    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Syncing Lease Profile...</p>
            </div>
        );
    }
    const totalDue = (Number(tenant.baseRent) || 0) + (Number(tenant.utilityShare) || 0);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-white/5">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic">Howdy, {String(tenant.name || 'Tenant').split(' ')[0]}</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                            <Home className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Unit {tenant.unit}</span>
                        </div>
                        {unit?.size && (
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Maximize className="w-3 h-3" /> {unit.size} SQFT
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowMsgModal(true)}
                    className="bg-slate-900 border border-white/10 text-slate-300 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-all"
                >
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Message Manager
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CreditCard className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Outstanding</p>
                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">{currency} {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">Balanced Due</span>
                    </div>
 
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">Base Monthly Rent</span>
                            <span className="text-white">{currency} {(Number(tenant.baseRent) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Utility Share <Droplets className="w-3 h-3 text-blue-400" />
                            </span>
                            <span className="text-white">{currency} {(Number(tenant.utilityShare) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowMsgModal(true)}
                        className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-widest mt-8 flex items-center justify-center gap-2"
                    >
                        Upload Proof of Rent Payment <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            Lease Agreement Details
                        </h3>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Lease Start</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <p className="text-sm font-bold text-white tracking-tight">{fmtDate(tenant.leaseStart)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Lease End</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <p className="text-sm font-bold text-white tracking-tight">{fmtDate(tenant.leaseEnd)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Security Deposit</p>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <p className="text-sm font-black text-white tracking-tight">${tenant.deposit?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Document Status</p>
                                <div className="flex items-center gap-2">
                                    {tenant.leaseDocument ? (
                                        <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1.5">
                                            <FileCheck className="w-3.5 h-3.5" /> Verified PDF
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5" /> Action Required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-2xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] leading-relaxed text-indigo-200/70 font-medium">
                            Bills are updated monthly based on building consumption. {tenant.utilityShare > 0 ? "The current amount includes shared building water and electricity charges." : "Utilities for this period haven't been shared yet."}
                        </p>
                    </div>
                </div>
            </div>

            {showMsgModal && (
                <MessageModal
                    onClose={() => setShowMsgModal(false)}
                    onSubmit={(msg, photo) => { onSendMessage(msg, photo); setShowMsgModal(false); }}
                />
            )}
        </div>
    );
}

// --- Modals & Support Components ---

function MessageModal({ onClose, onSubmit }) {
    const [msg, setMsg] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result); // Data URL
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <Motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white italic flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Message Manager
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(msg, photo); }} className="space-y-4">
                    <textarea
                        required
                        rows={4}
                        className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white text-sm outline-none ring-1 ring-white/5 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                        placeholder="Describe the issue or request..."
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                    />
                    
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1 mb-2 block">Attachment (Optional)</label>
                        <div className="flex gap-4 items-center">
                            <label className="flex-1 cursor-pointer">
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                <div className="border border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                                    <ImageIcon className="w-5 h-5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{photo ? 'Change Photo' : 'Upload Photo'}</span>
                                </div>
                            </label>
                            {photoPreview && (
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl overflow-hidden border border-white/10 relative group">
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                        <Send className="w-3.5 h-3.5" /> Send Message
                    </button>
                </form>
            </Motion.div>
        </div>
    );
}

function InventoryModal({ unit, onClose, onSave }) {
    const [localFittings, setLocalFittings] = useState([...(unit.fittings || [])]);
    const [newItem, setNewItem] = useState('');
    const addItem = () => { if (newItem.trim()) { setLocalFittings([...localFittings, newItem.trim()]); setNewItem(''); } };
    const removeItem = (index) => { setLocalFittings(localFittings.filter((_, i) => i !== index)); };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white italic flex items-center gap-3">
                        <Box className="w-6 h-6 text-indigo-500" /> Inventory & Fittings
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex gap-2 mb-4">
                        <input type="text" className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 ring-indigo-500" placeholder="E.g. Smart TV..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
                        <button onClick={addItem} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-all"><Plus className="w-5 h-5 text-white" /></button>
                    </div>
                    <div className="space-y-2">
                        {localFittings.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl border border-white/5 group">
                                <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {item}</span>
                                <button onClick={() => removeItem(idx)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={() => onSave(localFittings)} className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">Save Changes</button>
            </div>
        </div>
    );
}

function UnitCard({ unit, tenant, currency = 'USD', history, onUpdateFittings, onEditUnit, onDeleteUnit, onAddLease, onEditLease, onUpdateLeaseDoc, onMoveOut }) {
    const [activeSubTab, setActiveSubTab] = useState('info');
    const tenantName = tenant?.name;
    const actualRent = tenant?.baseRent;
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const isOccupied = unit.status === 'Occupied' && !!tenant;

    // Financial Intelligence: Yield & Vacancy
    const yieldGap = isOccupied ? (Number(tenant.baseRent || 0) - Number(unit.expectedRent || 0)) : 0;
    const vacancyDays = !isOccupied && unit.vacantSince ? Math.ceil((new Date() - new Date(unit.vacantSince)) / (1000 * 60 * 60 * 24)) : 0;
    const lostRevenue = !isOccupied ? (Number(unit.expectedRent || 0) / 30) * vacancyDays : 0;

    // Decision Intelligence: Lease Expiry Calculation
    const getLeaseStatus = () => {
        if (!isOccupied || !tenant?.leaseEnd) return null;
        const end = new Date(tenant.leaseEnd);
        const today = new Date();
        const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { label: 'Expired', color: 'bg-red-600 text-white shadow-red-500/50', icon: AlertCircle, pulse: true };
        if (diffDays <= 30) return { label: 'Urgent: Renew Now', color: 'bg-red-500 text-white shadow-red-500/20', icon: Clock, pulse: true };
        if (diffDays <= 60) return { label: 'Action Required: Renew Soon', color: 'bg-amber-500 text-white shadow-amber-500/20', icon: Calendar, pulse: false };
        return { label: 'Tenure Secure', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, pulse: false };
    };
    const leaseStatus = getLeaseStatus();

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    return (
        <Motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`premium-card rounded-[2.5rem] overflow-hidden group flex flex-col h-full bg-slate-900 shadow-2xl shadow-black/50 border transition-colors duration-500 ${
                leaseStatus?.pulse ? 'border-red-500/30' : 'border-white/5'
            }`}
        >
            <div className={`h-48 relative flex items-center justify-center overflow-hidden bg-slate-800/50`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 z-10" />
                
                {unit.image ? (
                    <img src={unit.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="text-slate-700 flex flex-col items-center gap-2 relative z-0 transition-transform group-hover:scale-110 duration-700">
                        <ImageIcon className="w-16 h-16 opacity-10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Unit {unit.unitNumber}</span>
                    </div>
                )}

                {/* Quick Actions (Floating) */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEditUnit(); }}
                        className="p-2.5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all hover:scale-110"
                        title="Edit Unit Details"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    {!isOccupied && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit.id); }}
                            className="p-2.5 bg-red-900/20 backdrop-blur-xl border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-600 hover:text-white transition-all hover:scale-110"
                            title="Decommission Unit"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    {isOccupied && (
                        <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-tight flex items-center gap-2 border backdrop-blur-xl shadow-xl ${
                            yieldGap >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                            <TrendingUp className="w-3.5 h-3.5" />
                            {yieldGap >= 0 ? `+${yieldGap} Yield` : `${yieldGap} Below Mkt`}
                        </div>
                    )}
                    {vacancyDays > 0 && (
                        <div className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-tight flex items-center gap-2 border bg-red-500/20 text-red-400 border-red-500/30 backdrop-blur-xl shadow-xl">
                            <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                            -{vacancyDays}d / ${Math.round(lostRevenue)} Loss
                        </div>
                    )}
                </div>

                {/* Status Badges */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-20">
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-xl shadow-2xl ${
                        !isOccupied 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-indigo-600/30 text-indigo-400 border-indigo-500/30'
                    }`}>
                        {isOccupied ? 'Occupied' : 'Available'}
                    </div>
                    {leaseStatus && (
                        <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-tight flex items-center gap-2 border border-white/10 backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-right-4 transition-all ${leaseStatus.color} ${leaseStatus.pulse ? 'animate-pulse' : ''}`}>
                            <leaseStatus.icon className="w-3 h-3" />
                            {leaseStatus.label}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col relative">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h4 className="text-2xl font-black text-white tracking-tighter italic">Unit {unit.unitNumber}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mt-1.5 opacity-60">
                            <Maximize className="w-3.5 h-3.5" /> {unit.size} SQFT Space
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-800/40 p-1 rounded-2xl border border-white/5 mb-6 backdrop-blur-md">
                    {[
                        { id: 'info', icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Financials' },
                        { id: 'activity', icon: <Activity className="w-3.5 h-3.5" />, label: 'Activity' },
                        { id: 'inventory', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Inventory' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 min-h-[160px]">
                    <AnimatePresence mode="wait">
                        <Motion.div
                            key={activeSubTab}
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.15 }}
                            className="h-full"
                        >
                            {activeSubTab === 'info' ? (
                                isOccupied ? (
                                    <div className="flex flex-col gap-5 pt-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-1.5">
                                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Resident</p>
                                                <p className="text-white font-black text-sm truncate uppercase tracking-tight">{tenantName}</p>
                                            </div>
                                            <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20 space-y-1.5">
                                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Base Rent</p>
                                                <p className="text-white font-black text-lg tracking-tighter">
                                                    <span className="text-xs text-indigo-500 mr-0.5">{currency}</span>{Number(actualRent).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Security Deposit</p>
                                                    <p className="text-white font-bold text-xs mt-0.5">{currency} {Number(tenant.deposit || 0).toLocaleString()}</p>
                                                </div>
                                                <Lock className="w-3.5 h-3.5 text-slate-700" />
                                            </div>
                                            <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Utilities Allocation</p>
                                                    <p className="text-white font-bold text-xs mt-0.5">{currency} {Number(tenant.utilityShare || 0).toLocaleString()}</p>
                                                </div>
                                                <Droplets className="w-3.5 h-3.5 text-blue-500/50" />
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/20 rounded-2xl border border-white/5 p-4 space-y-4">
                                            <div className="flex items-center justify-between text-[9px] font-bold uppercase text-slate-500 border-b border-white/5 pb-3">
                                                <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Tenure</span>
                                                <span className="text-indigo-400">{fmtDate(tenant.leaseStart)} — {fmtDate(tenant.leaseEnd)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    {tenant.leaseDocument ? (
                                                        <a href={tenant.leaseDocument} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/5 px-4 py-2.5 rounded-xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
                                                            <FileCheck className="w-4 h-4" /> Agreement Signed
                                                        </a>
                                                    ) : (
                                                        <label className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase bg-white/5 px-4 py-2.5 rounded-xl border border-dashed border-white/10 cursor-pointer hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                                                            <Upload className="w-4 h-4" /> Pending Documentation
                                                            <input type="file" className="hidden" onChange={(e) => e.target.files[0] && onUpdateLeaseDoc(tenant.id, e.target.files[0])} />
                                                        </label>
                                                    )}
                                                </div>
                                                <button onClick={onEditLease} className="p-3 bg-slate-900 border border-white/5 text-slate-500 hover:text-white rounded-xl transition-all"><Settings className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2.5 mt-2">
                                            <a href={`https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-500 font-black rounded-2xl py-3.5 flex items-center justify-center gap-2.5 text-[10px] uppercase tracking-widest transition-all">
                                                <MessageCircle className="w-4 h-4" /> CONTACT RESIDENT
                                            </a>
                                            <button onClick={onMoveOut} className="bg-slate-900 border border-white/5 text-slate-500 hover:text-red-400 font-black rounded-2xl px-6 py-3.5 flex items-center justify-center gap-2.5 text-[10px] uppercase tracking-widest transition-all">
                                                <LogOut className="w-4 h-4" /> MOVE OUT
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col pt-2">
                                        <div className="bg-slate-950/20 rounded-[2rem] border border-white/5 p-6 mb-6">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2.5 text-emerald-500 font-black bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/10">
                                                        <LayoutGrid className="w-4 h-4" />
                                                        <span className="text-[9px] uppercase tracking-widest">Market Ready Status</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Target Revenue</p>
                                                    <p className="text-3xl font-black text-white tracking-tighter">
                                                        <span className="text-sm mr-0.5">$</span>{Number(unit.expectedRent).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Projected Yield</p>
                                                    <p className="text-emerald-400 font-black text-sm">8.4% APY</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Estimated Vacancy</p>
                                                    <p className="text-slate-400 font-black text-sm">Low Demand</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={onAddLease} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                            <PlusCircle className="w-5 h-5" /> RE-POPULATE UNIT
                                        </button>
                                    </div>
                                )
                            ) : activeSubTab === 'activity' ? (
                                <div className="space-y-6 pt-2 h-full flex flex-col">
                                    <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-5 space-y-4">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                                            <History className="w-3.5 h-3.5 text-indigo-400" /> Revenue & Task Stream
                                        </p>
                                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                            {history?.rents?.length > 0 ? history.rents.map((r, i) => (
                                                <div key={`rent-${i}`} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center group hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg"><Receipt className="w-3 h-3 text-emerald-400" /></div>
                                                        <span className="text-[10px] text-white font-bold">{new Date(r.dueDate).toLocaleDateString([], { month: 'short', year: 'numeric' })} Bill</span>
                                                    </div>
                                                    <span className="text-[10px] text-emerald-400 font-black">{currency} {r.totalAmount}</span>
                                                </div>
                                            )) : null}
                                            {history?.tasks?.length > 0 ? history.tasks.map((t, i) => (
                                                <div key={`task-${i}`} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center group hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-amber-500/10 rounded-lg"><Wrench className="w-3 h-3 text-amber-400" /></div>
                                                        <span className="text-[10px] text-white font-bold truncate max-w-[100px]">{t.task}</span>
                                                    </div>
                                                    <span className="text-[8px] text-slate-400 font-black uppercase px-2 py-0.5 bg-slate-800 rounded-lg">{t.status}</span>
                                                </div>
                                            )) : null}
                                            {(!history?.rents?.length && !history?.tasks?.length) && (
                                                <div className="py-10 text-center opacity-30 flex flex-col items-center gap-2">
                                                    <Activity className="w-6 h-6" />
                                                    <p className="text-[9px] font-black uppercase tracking-widest">No recent stream data</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Avg Response</p>
                                            <p className="text-white font-black text-xs">2.4 Hours</p>
                                        </div>
                                        <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Lifetime Rev</p>
                                            <p className="text-white font-black text-xs">{currency} 12,450</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 h-full flex flex-col pt-2">
                                    <div className="bg-slate-950/20 border border-white/5 rounded-[2rem] p-6 flex-1">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                            <Package className="w-3.5 h-3.5 text-indigo-400" /> Unit Specifications
                                        </p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {unit.fittings?.length > 0 ? unit.fittings.map((fit, idx) => (
                                                <span key={idx} className="bg-slate-900/60 border border-white/5 text-slate-300 text-[9px] font-black px-4 py-2.5 rounded-2xl uppercase flex items-center gap-2 hover:border-indigo-500/30 transition-all">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {fit}
                                                </span>
                                            )) : (
                                                <div className="w-full py-8 text-center opacity-20 border-2 border-dashed border-white/5 rounded-3xl">
                                                    <Package className="w-8 h-8 mx-auto mb-2" />
                                                    <p className="text-[9px] font-black uppercase">No Fittings cataloged</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => setShowInventoryModal(true)} className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] border border-white/5 transition-all flex items-center justify-center gap-3 group shadow-xl">
                                        <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" /> MODIFY INVENTORY CATALOG
                                    </button>
                                </div>
                            )}
                        </Motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {showInventoryModal && (
                <InventoryModal 
                    unit={unit} 
                    onClose={() => setShowInventoryModal(false)} 
                    onSave={(newInventory) => {
                        onUpdateFittings(unit.id, newInventory);
                        setShowInventoryModal(false);
                    }} 
                />
            )}
        </Motion.div>
    );
}

function UnitModal({ initialData, onSubmit, onClose }) {
    const [form, setForm] = useState(initialData || { unitNumber: '', size: '', expectedRent: '', status: 'Available', image: null });
    const [imagePreview, setImagePreview] = useState(initialData?.image || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setForm({ ...form, newImageFile: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
            <Motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-slate-900 border-t md:border border-white/10 w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar"
            >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 md:hidden" />
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black text-white italic flex items-center gap-4 tracking-tighter">
                        {initialData ? <Settings className="w-8 h-8 text-indigo-500" /> : <PlusCircle className="w-8 h-8 text-indigo-500" />}
                        {initialData ? 'Edit Property' : 'Add New Unit'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-8">
                    {/* Hero Image Upload */}
                    <div className="relative group">
                        <div className="w-full h-48 md:h-56 rounded-[2rem] bg-slate-800 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-slate-900 rounded-2xl">
                                        <Camera className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tap to Upload Photo</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Reference Label</label>
                            <input 
                                required 
                                className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-base font-bold outline-none transition-all placeholder:text-slate-600" 
                                placeholder="e.g. Unit 402 or Penthouse A" 
                                value={form.unitNumber} 
                                onChange={e => setForm({ ...form, unitNumber: e.target.value })} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Total Space (FT²)</label>
                                <input 
                                    required 
                                    type="number" 
                                    className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-base font-bold outline-none transition-all" 
                                    placeholder="1200" 
                                    value={form.size} 
                                    onChange={e => setForm({ ...form, size: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Target Rent</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">$</span>
                                    <input 
                                        required 
                                        type="number" 
                                        className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 pl-8 text-white text-base font-bold outline-none transition-all" 
                                        placeholder="2500" 
                                        value={form.expectedRent} 
                                        onChange={e => setForm({ ...form, expectedRent: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 pb-2 md:pb-0">
                        <Motion.button 
                            type="submit" 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {initialData ? 'Update Property' : 'Add to Collection'}
                        </Motion.button>
                    </div>
                </form>
            </Motion.div>
        </div>
    );
}

function LeaseModal({ initialData, availableUnits, onClose, onSubmit }) {
    const [leaseForm, setLeaseForm] = useState({ 
        name: '', 
        unit: '', 
        mobile: '', 
        password: '', 
        baseRent: '', 
        deposit: '', 
        leaseStart: '', 
        leaseEnd: '', 
        ...initialData 
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-hidden">
            <Motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-slate-900 border-t md:border border-white/10 w-full max-w-xl rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar"
            >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 md:hidden" />
                
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white italic flex items-center gap-4 tracking-tighter">
                            {initialData?.id ? <Settings className="w-8 h-8 text-indigo-500" /> : <PlusCircle className="w-8 h-8 text-emerald-500" />}
                            {initialData?.id ? 'Adjust Agreement' : 'Register New Lease'}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 ml-1 opacity-60">Legal Tenure Configuration</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(leaseForm); }} className="space-y-10">
                    {/* section: primary */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 py-2 px-4 rounded-full w-fit">
                            <User className="w-3.5 h-3.5" /> Identity & Unit
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-base font-bold outline-none transition-all placeholder:text-slate-600" placeholder="Full Resident Name" value={leaseForm.name} onChange={e => setLeaseForm({ ...leaseForm, name: e.target.value })} />
                            <select required className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-base font-bold outline-none transition-all appearance-none" value={leaseForm.unit} onChange={e => setLeaseForm({ ...leaseForm, unit: e.target.value })}>
                                <option value="" disabled>Assigned Unit</option>
                                {availableUnits.map(u => <option key={u.id} value={u.unitNumber}>{u.unitNumber} ({u.size} SQFT)</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required type="tel" className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-base font-bold outline-none transition-all placeholder:text-slate-600" placeholder="WhatsApp Number" value={leaseForm.mobile} onChange={e => setLeaseForm({ ...leaseForm, mobile: e.target.value })} />
                            <input required type="text" className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-base font-bold outline-none transition-all placeholder:text-slate-600" placeholder="Portal Password" value={leaseForm.password} onChange={e => setLeaseForm({ ...leaseForm, password: e.target.value })} />
                        </div>
                    </div>

                    {/* section: financial */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 py-2 px-4 rounded-full w-fit">
                            <DollarSign className="w-3.5 h-3.5" /> Financial Commitment
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                                <input type="number" className="w-full bg-slate-800/50 border border-white/5 focus:border-emerald-500/50 rounded-2xl p-4 pl-8 text-white text-base font-bold outline-none transition-all" placeholder="Actual Rent" value={leaseForm.baseRent} onChange={e => setLeaseForm({ ...leaseForm, baseRent: Number(e.target.value) })} />
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                                <input type="number" className="w-full bg-slate-800/50 border border-white/5 focus:border-emerald-500/50 rounded-2xl p-4 pl-8 text-white text-base font-bold outline-none transition-all" placeholder="Security Deposit" value={leaseForm.deposit} onChange={e => setLeaseForm({ ...leaseForm, deposit: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>

                    {/* section: dates */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/5 py-2 px-4 rounded-full w-fit">
                            <CalendarRange className="w-3.5 h-3.5" /> Tenure Boundaries
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Commencement Date</label>
                                <input 
                                    required 
                                    type="date" 
                                    style={{ colorScheme: 'dark' }} 
                                    className="w-full bg-slate-800/50 border border-white/5 focus:border-amber-500/50 rounded-2xl p-4 text-white text-[13px] font-bold outline-none transition-all" 
                                    value={leaseForm.leaseStart} 
                                    onChange={e => setLeaseForm({ ...leaseForm, leaseStart: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1 mb-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Termination Date</label>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const baseDate = leaseForm.leaseEnd || leaseForm.leaseStart;
                                            if (!baseDate) return;
                                            // Handle as parts to avoid timezone shifting
                                            const [y, m, d_val] = baseDate.split('-').map(Number);
                                            const d = new Date(y, m - 1, d_val);
                                            
                                            if (leaseForm.leaseEnd) d.setDate(d.getDate() + 1);
                                            d.setMonth(d.getMonth() + 6);
                                            d.setDate(d.getDate() - 1);
                                            
                                            const year = d.getFullYear();
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            const day = String(d.getDate()).padStart(2, '0');
                                            setLeaseForm({ ...leaseForm, leaseEnd: `${year}-${month}-${day}` });
                                        }}
                                        className="text-[9px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-tight bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 transition-all active:translate-y-0.5"
                                    >
                                        + 6 mo
                                    </button>
                                </div>
                                <input 
                                    required 
                                    type="date" 
                                    style={{ colorScheme: 'dark' }} 
                                    className="w-full bg-slate-800/50 border border-white/5 focus:border-amber-500/50 rounded-2xl p-4 text-white text-[13px] font-bold outline-none transition-all" 
                                    value={leaseForm.leaseEnd} 
                                    onChange={e => setLeaseForm({ ...leaseForm, leaseEnd: e.target.value })} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* section: documentation */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[10px] font-black text-sky-400 uppercase tracking-widest bg-sky-500/5 py-2 px-4 rounded-full w-fit">
                            <FileText className="w-3.5 h-3.5" /> Documentation
                        </div>
                        <div className="relative group">
                            <div className="w-full bg-slate-800/30 border-2 border-dashed border-white/5 hover:border-sky-500/30 rounded-[2rem] p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden">
                                {leaseForm.leaseFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-4 bg-sky-600 rounded-2xl shadow-lg shadow-sky-600/30">
                                            <FileCheck className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Document Ready</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-4 bg-slate-900 rounded-2xl">
                                            <UploadCloud className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attach Signed Agreement (PDF/IMG)</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) setLeaseForm({ ...leaseForm, leaseFile: file });
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 pb-2 md:pb-0">
                        <Motion.button 
                            type="submit" 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-5 text-white font-black rounded-[2rem] uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl flex items-center justify-center gap-4 ${initialData?.id ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
                        >
                            <FileCheck className="w-5 h-5" />
                            {initialData?.id ? 'Update Lease Agreement' : 'Finalize & Create Lease'}
                        </Motion.button>
                    </div>
                </form>
            </Motion.div>
        </div>
    );
}

function StatCard({ title, value, icon, index }) {
    return (
        <Motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="premium-card p-6 md:p-8 rounded-[2rem] relative overflow-hidden group border border-white/5 hover:border-white/10"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-600/10 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-600/5 blur-3xl rounded-full -ml-12 -mb-12 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-6">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">{title}</p>
                <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-white/5 shadow-inner group-hover:bg-slate-700/60 group-hover:border-indigo-500/20 group-hover:rotate-6 transition-all duration-300">{icon}</div>
            </div>
            <p className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none group-hover:scale-[1.03] transition-transform origin-left">{value}</p>
        </Motion.div>
    );
}

function LoginPage({ onLogin }) {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e) => { 
        e.preventDefault(); 
        const res = onLogin(mobile, password); 
        if (!res.success) setError(res.message); 
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
            {/* Immersive Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/5 blur-[150px] rounded-full" />
            
            <Motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-12">
                    <Motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-indigo-400/20"
                    >
                        <ShieldCheck className="w-12 h-12 text-white" />
                    </Motion.div>
                    <h1 className="text-6xl font-black text-white italic tracking-tighter mb-3 leading-none">PropManage</h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] opacity-70">The Enterprise Standard</p>
                </div>

                <div className="premium-card p-12 rounded-[3.5rem] space-y-8">
                    {error && (
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-[10px] font-black border border-red-500/20 text-center uppercase tracking-widest"
                        >
                            {error}
                        </Motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 opacity-60">Identity / Mobile</label>
                            <input 
                                type="tel" 
                                required 
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-6 text-white outline-none focus:ring-2 ring-indigo-500/40 transition-all placeholder:text-slate-700 text-sm" 
                                placeholder="+1555000111" 
                                value={mobile} 
                                onChange={(e) => setMobile(e.target.value)} 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 opacity-60">Security Key</label>
                            <input 
                                type="password" 
                                required 
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-6 text-white outline-none focus:ring-2 ring-indigo-500/40 transition-all placeholder:text-slate-700 text-sm" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>

                        <Motion.button 
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl mt-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all uppercase tracking-[0.2em] text-[11px]"
                        >
                            Establish Connection
                        </Motion.button>
                    </form>

                    <div className="pt-8 border-t border-white/5 flex flex-col items-center">
                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mb-6">Simulation access</p>
                        <div className="flex gap-4 w-full">
                            <button type="button" onClick={() => { setMobile('+1555000111'); setPassword('admin') }} className="flex-1 py-4 rounded-2xl bg-indigo-500/5 text-indigo-400 text-[10px] font-black border border-indigo-500/10 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-tighter">Admin Portal</button>
                            <button type="button" onClick={() => { setMobile('+1234567890'); setPassword('password123') }} className="flex-1 py-4 rounded-2xl bg-emerald-500/5 text-emerald-400 text-[10px] font-black border border-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-tighter">Tenant View</button>
                        </div>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
}

function PropertySelectView({ properties, onSelect }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#020617] relative overflow-hidden">
             {/* Background Polish */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_70%)]" />
            
            <Motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-16 relative z-10"
            >
                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20 border border-indigo-400/20">
                    <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter mb-3 leading-none">Management Gate</h2>
                <p className="text-slate-500 text-[11px] uppercase font-black tracking-[0.4em] opacity-60">Select designated property</p>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10">
                {properties.map((prop, idx) => (
                    <Motion.button
                        key={prop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -8, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(prop.name)}
                        className="premium-card p-10 text-left rounded-[3rem] group"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-slate-800 p-4 rounded-2xl border border-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-400 shadow-inner">
                                <Home className="w-8 h-8" />
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                <ArrowUpRight className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-white italic mb-2 tracking-tight transition-colors group-hover:text-indigo-400">{prop.name}</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-relaxed">{prop.address}</p>
                    </Motion.button>
                ))}
            </div>

            <Motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => window.location.reload()} 
                className="mt-16 text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-[0.34em] flex items-center gap-3 border-b-2 border-transparent hover:border-indigo-500/50 pb-2 transition-all opacity-40 hover:opacity-100"
            >
                <LogOut className="w-4 h-4" /> Reset Authorization
            </Motion.button>
        </div>
    );
}


// --- Global Support ---
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-white italic mb-2">Portal Crash Detected</h2>
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest leading-relaxed">
                        An incompatibility in local data or browser settings prevented this dashboard from loading.<br/>
                        <span className="opacity-60 text-[8px]">{this.state.error?.message}</span>
                    </p>
                    <button onClick={() => window.location.reload()} className="mt-6 text-[9px] font-black text-white bg-red-600 px-6 py-2 rounded-xl uppercase tracking-widest shadow-lg active:scale-95">Re-sync Dashboard</button>
                </div>
            );
        }
        return this.props.children;
    }
}

function PropertyModal({ initialData, apiStatus, onClose, onSave }) {
    const [form, setForm] = useState({
        name: '',
        address: '',
        currency: 'USD',
        ...initialData
    });

    const currentCurrencyInfo = ISO_CURRENCIES.find(c => c.code === form.currency);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-8 bg-slate-950/80 backdrop-blur-md overflow-hidden">
            {/* Background Polish */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(79,70,229,0.1),transparent_50%)]" />
            
            <Motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/20">
                                <Building2 className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">
                                    {initialData?.id ? 'Configure Property' : 'Register New Property'}
                                </h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">Asset & Legal Details</p>
                            </div>
                        </div>
                        <Motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </Motion.button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] ml-1">Commercial Name</label>
                            <input 
                                required
                                className="w-full bg-slate-800 border border-white/10 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-sm font-bold outline-none transition-all placeholder:text-slate-600"
                                placeholder="e.g. Skyline Towers"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] ml-1">Legal Address</label>
                            <textarea
                                required
                                rows={2}
                                className="w-full bg-slate-800 border border-white/10 focus:border-indigo-500/50 rounded-2xl p-4 text-white text-sm font-bold outline-none transition-all placeholder:text-slate-600"
                                placeholder="Full street address, postal code, city"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] ml-1">Operating Currency</label>
                            <select
                                value={form.currency}
                                onChange={e => setForm({ ...form, currency: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 focus:border-indigo-500/40 rounded-2xl px-5 py-4 text-white font-black text-sm outline-none cursor-pointer transition-all appearance-none"
                            >
                                {ISO_CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code} className="bg-slate-900">{c.code} - {c.name}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-[9px] text-indigo-400/60 font-medium px-1">
                                Base currency for all rents and reports: {currentCurrencyInfo?.name}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Connectivity status</h4>
                        <div className="bg-black/20 rounded-2xl p-4 space-y-3 border border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Sync Mode</span>
                                <span className={`text-[9px] font-black uppercase ${apiStatus.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {apiStatus.status === 'connected' ? 'Cloud Integrated' : 'Maintenance Required'}
                                </span>
                            </div>
                            <p className="text-[8px] text-slate-600 font-medium leading-relaxed italic mt-1">
                                Changes are immediately pushed to your linked Google Sheet.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 flex gap-3">
                    <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-black"
                    >
                        Back
                    </Motion.button>
                    <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (!form.name || !form.address) {
                                alert('Please provide name and address.');
                                return;
                            }
                            onSave(form);
                        }}
                        className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" /> 
                        {initialData?.id ? 'Apply Updates' : 'Confirm Registration'}
                    </Motion.button>
                </div>
            </Motion.div>
        </div>
    );
}

// --- Property Settings Modal ---
function PropertySettingsModal({ property, apiStatus, onClose, onSave }) {
    const [currency, setCurrency] = useState(property?.currency || 'USD');
    const currentCurrencyInfo = ISO_CURRENCIES.find(c => c.code === currency);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />
            <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-md bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/20">
                                <Settings className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">Property Settings</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">{property?.name}</p>
                            </div>
                        </div>
                        <Motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </Motion.button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                            <DollarSign className="w-3 h-3" /> Currency (ISO 4217)
                        </label>
                        <select
                            value={currency}
                            onChange={e => setCurrency(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 hover:border-indigo-500/40 rounded-2xl px-5 py-4 text-white font-black text-sm outline-none cursor-pointer transition-all"
                        >
                            {ISO_CURRENCIES.map(c => (
                                <option key={c.code} value={c.code} className="bg-slate-900">{c.code} - {c.name}</option>
                            ))}
                        </select>
                        <p className="mt-3 text-[9px] text-indigo-400/60 font-medium px-1 flex items-center gap-1.5">
                            <Info className="w-3 h-3" />
                            Selected: {currentCurrencyInfo?.name}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Diagnostics</h4>
                        <div className="bg-black/20 rounded-2xl p-4 space-y-3 border border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Cloud Sync Status</span>
                                <span className={`text-[9px] font-black uppercase ${apiStatus.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>{apiStatus.status}</span>
                            </div>
                            <div className="flex justify-between items-center overflow-hidden">
                                <span className="text-[9px] text-slate-500 font-bold uppercase shrink-0 mr-4">Active Endpoint</span>
                                <span className="text-[9px] text-slate-400 font-mono truncate">{apiStatus.url ? '.../' + apiStatus.url.split('/').pop() : 'NOT SET'}</span>
                            </div>
                            {apiStatus.error && (
                                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <p className="text-[8px] text-red-500 font-black uppercase tracking-widest">Last Error:</p>
                                    <p className="text-[9px] text-red-300 font-medium leading-tight mt-1">{apiStatus.error}</p>
                                </div>
                            )}
                            <p className="text-[8px] text-slate-600 font-medium leading-relaxed italic mt-2">
                                Note: If you updated Vercel environment variables, a "Redeploy" is usually required to apply changes to the live site.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 flex gap-3">
                    <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </Motion.button>
                    <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSave(currency)}
                        className="flex-2 flex-grow py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Save Settings
                    </Motion.button>
                </div>
            </Motion.div>
        </div>
    );
}
