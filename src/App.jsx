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
    Shield,
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
    Terminal,
    UploadCloud,
    TrendingUp,
    History,
    Package,
    Key
} from 'lucide-react';

// --- System Credentials & Configuration ---
const MANAGER_CREDENTIALS = {
    email: import.meta.env.VITE_MANAGER_EMAIL,
    password: import.meta.env.VITE_MANAGER_PASSWORD,
    mobile: import.meta.env.VITE_MANAGER_MOBILE
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
const cleanMobile = (str) => String(str || '').replace(/[^\d]/g, ''); // Digits Only for max compatibility

const findCollection = (payload, name) => {
    if (!payload || typeof payload !== 'object') return [];
    const normalizedName = name.toLowerCase().trim();
    // Try to find the key case-insensitively (handles "Managers" vs "managers" vs "Managers ")
    const key = Object.keys(payload).find(k => k.toLowerCase().trim() === normalizedName);
    return key ? (Array.isArray(payload[key]) ? payload[key] : []) : [];
};

const getLocalDate = () => {
    try {
        const d = new Date();
        return new Date(d.toLocaleString("en-US", { timeZone: APP_TIMEZONE }));
    } catch (_ /* eslint-disable-line no-unused-vars */) {
        return new Date();
    }
};

// Standardised date formatter -?dd-MMM-yyyy (e.g. 19-Mar-2026)
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const isPaidThisMonth = (lastPaymentDate) => {
    if (!lastPaymentDate) return false;
    const last = new Date(lastPaymentDate);
    const now = getLocalDate();
    return last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
};

const formatDate = (date, includeTime = false) => {
    if (!date) return 'N/A';
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
    } catch (_) { // eslint-disable-line no-unused-vars
        return 'N/A';
    }
};

const fmtDate = (str) => {
    if (!str) return 'N/A';
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
        return 'N/A';
    } catch (_) { // eslint-disable-line no-unused-vars
        return 'N/A';
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
    
    let day = 1;
    try {
        const d = new Date(leaseStart);
        if (!isNaN(d.getTime())) {
            // Extract the day of the month using the target timezone consistently
            const lStartStr = d.toLocaleString("en-US", { day: 'numeric', timeZone: APP_TIMEZONE });
            day = parseInt(lStartStr, 10);
        }
    } catch (e) {
        day = 1;
    }
    
    if (isNaN(day)) day = 1;

    // Rent is now due EXACTLY on the lease commencement day of the month
    let dueDate = new Date(today.getFullYear(), today.getMonth(), day);
    
    // If the due date for this month has passed, the next collection is next month
    if (dueDate < today) {
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
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
    const dueDate = calculateNextRentDue(leaseStart);
    if (!dueDate || isNaN(dueDate.getTime())) return { from: null, to: null };
    
    // Rent period starts EXACTLY on the lease commencement day (aligned with the due date)
    const from = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    // Rent period ends on the day before the same day in the next month
    const to = new Date(from.getFullYear(), from.getMonth() + 1, from.getDate() - 1);
    
    return { from, to };
};



// --- API Service Management ---
const API_URL = String(import.meta.env.VITE_API_URL || '').trim();

const API = {
    isValid() {
        return typeof API_URL === 'string' && API_URL.includes("/exec");
    },

    async uploadToDrive(fileData, fileName) {
        if (!this.isValid()) return { success: false, message: 'Invalid API URL (Must end in /exec)' };
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes for large PDFs on slow networks
            
            const resp = await fetch(API_URL, {
                signal: controller.signal,
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ 
                    action: 'UPLOAD', 
                    fileData, 
                    fileName: fileName.replace(/[^a-z0-9_\-\.]/gi, '_') // Sanitize file name for cloud safety
                })
            });
            clearTimeout(timeoutId);
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
            reader.onload = async () => {
                try {
                    const res = await this.uploadToDrive(reader.result, file.name);
                    resolve(res);
                } catch (err) {
                    console.error('Upload stream failed:', err);
                    resolve({ success: false, message: 'Stream interrupted' });
                }
            };
            reader.onerror = () => resolve({ success: false, message: 'File read failed locally' });
            reader.readAsDataURL(file);
        });
    },

    async saveToSheet(action, sheetName, data) {
        if (!this.isValid()) return { success: false, message: 'Invalid API URL' };
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            // Using text/plain to avoid preflight (CORS-safe for Google Scripts)
            const resp = await fetch(API_URL, {
                signal: controller.signal,
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action, sheetName, data })
            });
            clearTimeout(timeoutId);
            return await resp.json();
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

function App() {
    const [view, setView] = useState('login');
    const [isLoading, setIsLoading] = useState(true);
    const [tenants, setTenants] = useState([]);
    const [propertyUnits, setPropertyUnits] = useState([]);
    const [utilityBills, setUtilityBills] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeTenantId, setActiveTenantId] = useState(null);
    const [activeProperty, setActiveProperty] = useState(null);
    const [activeManager, setActiveManager] = useState(null); // Track logged-in admin identity
    const [globalMessage, setGlobalMessage] = useState(null);
    const [properties, setProperties] = useState([]);
    const [tenantMessages, setTenantMessages] = useState([]);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState(null); // null means adding new
    const [syncStatus, setSyncStatus] = useState('offline'); // 'connecting', 'connected', 'error', 'offline'
    const [lastSyncError, setLastSyncError] = useState(null);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);
    const [activeTabForNav, setActiveTabForNav] = useState('rents');

    // Get ISO 4217 currency for the currently active property
    const activeCurrency = useMemo(() => {
        const prop = Array.isArray(properties) ? properties.find(p => p.name === activeProperty) : null;
        return prop?.currency || 'USD';
    }, [properties, activeProperty]);

    const updatePropertyCurrency = (currency) => { // eslint-disable-line no-unused-vars
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
    const [processingMessage, setProcessingMessage] = useState(null);


    const [vendors, setVendors] = useState(INITIAL_VENDORS);
    const [payments, setPayments] = useState(INITIAL_PAYMENTS);
    const [managers, setManagers] = useState(INITIAL_MANAGERS);

    const handleAddVendor = async (vendor) => {
        setProcessingMessage('ENLISTING_NEW_PARTNER');
        try {
            const newVendor = { ...vendor, id: generateId('VEN'), propertyName: activeProperty };
            setVendors(prev => [...prev, newVendor]);
            await API.saveToSheet('ADD', 'Vendors', newVendor);
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleEditVendor = async (vendor) => {
        setProcessingMessage('UPDATING_PARTNER_PROFILE');
        try {
            setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v));
            await API.saveToSheet('UPDATE', 'Vendors', vendor);
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        if (!window.confirm('Are you sure you want to remove this contractor?')) return;
        setProcessingMessage('DECOMMISSIONING_PARTNER');
        try {
            setVendors(prev => prev.filter(v => v.id !== vendorId));
            await API.saveToSheet('DELETE', 'Vendors', { id: vendorId });
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleAddProperty = () => {
        setPropertyToEdit(null); // Clear for new
        setShowPropertyModal(true);
    };

    const savePropertyDetails = async (propData) => {
        setProcessingMessage(propData.id ? 'UPDATING_PROPERTY_DETAILS' : 'REGISTERING_NEW_PROPERTY');
        try {
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
        } finally {
            setProcessingMessage(null);
        }
    };

    const syncWithCloud = React.useCallback(async (isBackground = false) => {
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

        if (!isBackground) {
            setIsRefreshing(true); // Always show refreshing indicator
        } else {
            setIsRefreshing(true);
        }
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
                // Even if no properties are found, if we got a valid object, we are connected
                setSyncStatus('connected');
                setLastSyncTime(new Date());

                // DIAGNOSTIC LOG (F12 Console): See exactly what cloud data structure looks like
                console.log('--- Sync Snapshot ---', {
                    managers: data.managers ? data.managers.length : 'MISSING TAB',
                    keys: Object.keys(data)
                });

                // Robustly Extract Collections (Keys are now lowercased & trimmed from GAS)
                const keyMap={'unitnumber':'unitNumber','expectedrent':'expectedRent','propertyname':'propertyName','baserent':'baseRent','leasestart':'leaseStart','leaseend':'leaseEnd','leasedocument':'leaseDocument','utilityshare':'utilityShare','depositrefunded':'depositRefunded','depositdeducted':'depositDeducted','moveoutdate':'moveOutDate','lastpaymentdate':'lastPaymentDate','scheduledate':'scheduleDate','tenantid':'tenantId','photourl':'photoUrl','handledby':'handledBy','duedate':'dueDate','maintenanceselection':'maintenanceSelection','vacantsince':'vacantSince','lastupdated':'lastUpdated'};
                const normalize=(arr)=>arr.map(item=>{const obj={...item};for(const key of Object.keys(item)){const lk=key.toLowerCase();if(keyMap[lk]&&key!==keyMap[lk]){obj[keyMap[lk]]=obj[key];delete obj[key];}}if(obj.propertyname&&!obj.propertyName){obj.propertyName=String(obj.propertyname);delete obj.propertyname;}return obj;});
                const rawUnits = normalize(findCollection(data, 'units'));
                const rawTenants = normalize(findCollection(data, 'tenants'));
                const rawBills = normalize(findCollection(data, 'bills'));
                const rawTasks = normalize(findCollection(data, 'tasks'));
                const rawMessages = normalize(findCollection(data, 'messages'));
                const rawPayments = normalize(findCollection(data, 'payments'));
                const rawManagers = normalize(findCollection(data, 'managers'));

                // Update Local UI States
                setTenants(rawTenants);
                setPropertyUnits(rawUnits);
                setUtilityBills(rawBills);
                setTasks(rawTasks);
                setTenantMessages(rawMessages);
                setPayments(prev => rawPayments.length > 0 ? rawPayments : prev);
                setManagers(prev => rawManagers.length > 0 ? rawManagers : prev);

                if (actualProperties.length > 0) {
                    setProperties(actualProperties);
                    setActiveProperty(prev => {
                        if (prev) return prev;
                        const defaultProp = actualProperties.find(p => p.name.toUpperCase() === 'UPTOWN@FARRER') || actualProperties[0];
                        return defaultProp.name;
                    });
                } else {
                    setProperties(INITIAL_PROPERTIES);
                    setActiveProperty(prev => {
                        if (prev) return prev;
                        const defaultProp = INITIAL_PROPERTIES.find(p => p.name.toUpperCase() === 'UPTOWN@FARRER') || INITIAL_PROPERTIES[0];
                        return defaultProp.name;
                    });
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
                setActiveProperty(prev => {
                    if (prev) return prev;
                    const defaultProp = INITIAL_PROPERTIES.find(p => p.name.toUpperCase() === 'UPTOWN@FARRER') || INITIAL_PROPERTIES[0];
                    return defaultProp.name;
                });
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setProcessingMessage(null);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-Sync Heartbeat (Every 60s)
    useEffect(() => {
        syncWithCloud(); // Initial
        const interval = setInterval(() => syncWithCloud(true), 300000);
        return () => clearInterval(interval);
    }, [syncWithCloud]);

    const handleLogin = (mobileInput, passwordInput) => {
        // Deep stringification and trimming for robust matching
        const inputMobile = cleanMobile(mobileInput);
        const inputPass = String(passwordInput || '').trim();

        // 1. Check Root Admin (Environment Variables)
        const rootMobile = cleanMobile(MANAGER_CREDENTIALS.mobile);
        const rootPass = String(MANAGER_CREDENTIALS.password || '').trim();

        if (inputMobile === rootMobile && inputPass === rootPass && rootMobile.length > 5) {
            setView('manager');
            setActiveManager({ name: 'Root Administrator' });
            setActiveProperty('UPTOWN@FARRER');
            return { success: true };
        }

        // 2. Check Cloud Managers (Fetched from Google Sheet)
        const cloudManager = managers.find(m => {
            const mMobile = cleanMobile(m.mobile);
            const mPass = String(m.password || '').trim();
            return mMobile === inputMobile && mPass === inputPass;
        });

        if (cloudManager) {
            setActiveManager({ name: cloudManager.name });
            setActiveProperty('UPTOWN@FARRER');
            setView('manager');
            return { success: true };
        }

        // Main login logic continues...
        
        const tenant = tenants.find(t => cleanMobile(t.mobile) === inputMobile && t.password === inputPass);
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
        setActiveManager(null);
        // Clear global cache silently but keep structure to prevent crashing
    };

    const updateUnitFittings = async (unitId, newFittings) => {
        setProcessingMessage('VERIFYING_INVENTORY');
        try {
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
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleAddBill = async (newBillData, updatedTenants) => {
        setProcessingMessage('ALLOCATING_UTILITY_BILL');
        try {
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
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleMarkPaid = async (tenantId, amount) => {
        setProcessingMessage('PROCESSING_RENT_PAYMENT');
        try {
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
                    propertyName: activeProperty,
                    confirmedBy: activeManager?.name || 'Admin'
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
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleAddTask = async (newTask) => {
        setProcessingMessage('DISPATCHING_WORK_ORDER');
        try {
            const taskData = { ...newTask, id: generateId('MTN'), propertyName: activeProperty };
            setTasks([...tasks, taskData]);
            await API.saveToSheet('ADD', 'Tasks', taskData);
            setGlobalMessage({ type: 'success', text: `Maintenance task created for ${activeProperty}!` });
            setTimeout(() => setGlobalMessage(null), 3000);
        } finally {
            setProcessingMessage(null);
        }
    };

    const addUnitToCatalog = async (unitData) => {
        setProcessingMessage('CATALOGING_NEW_UNIT');
        try {
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

            setPropertyUnits(prev => [...prev, newUnit]);
            const res = await API.saveToSheet('ADD', 'Units', newUnit);
            if (res.success) {
                setGlobalMessage({ type: 'success', text: `Unit ${unitData.unitNumber} added & Cloud Synced` });
                syncWithCloud(true);
            } else {
                setGlobalMessage({ type: 'error', text: `Cloud Save Failed: ${res.message}` });
            }
            setTimeout(() => setGlobalMessage(null), 3000);
        } finally {
            setProcessingMessage(null);
        }
    };

    const editUnitInCatalog = async (updatedUnit) => {
        setProcessingMessage('UPDATING_UNIT_DETAILS');
        try {
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
        } finally {
            setProcessingMessage(null);
        }
    };

    const deleteUnit = async (unitId) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this unit? This cannot be undone.")) return;
        setProcessingMessage('DECOMMISSIONING_UNIT');
        try {
            const unit = propertyUnits.find(u => u.id === unitId); // eslint-disable-line no-unused-vars
            setPropertyUnits(prev => prev.filter(u => u.id !== unitId));
            setGlobalMessage({ type: 'info', text: "Removing unit from cloud..." });
            await API.saveToSheet('DELETE', 'Units', { id: unitId });
            setGlobalMessage({ type: 'success', text: `Unit deleted & synced successfully` });
            setTimeout(() => setGlobalMessage(null), 3000);
        } finally {
            setProcessingMessage(null);
        }
    };

    const addTenant = async (newTenant, isSilent = false) => {
        if (!isSilent) setProcessingMessage('INITIALIZING_LEASE_SETUP');
        try {
            setGlobalMessage({ type: 'info', text: "Initializing lease setup..." });
            
            let docUrl = null;
            if (newTenant.leaseFile) {
                setGlobalMessage({ type: 'info', text: "Uploading documentation to cloud..." });
                const uploadRes = await API.uploadFile(newTenant.leaseFile);
                if (uploadRes && uploadRes.success) docUrl = uploadRes.url;
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
        } finally {
            setProcessingMessage(null);
        }
    };

    const editTenant = async (updatedTenant, isSilent = false) => {
        if (!isSilent) setProcessingMessage('UPDATING_AGREEMENT_DETAILS');
        try {
            setGlobalMessage({ type: 'info', text: "Updating agreement details..." });
            
            let docUrl = updatedTenant.leaseDocument && typeof updatedTenant.leaseDocument === 'string' && !updatedTenant.leaseDocument.includes('[object') ? updatedTenant.leaseDocument : null;
            if (updatedTenant.leaseFile) {
                setGlobalMessage({ type: 'info', text: "Uploading documentation to cloud..." });
                const uploadRes = await API.uploadFile(updatedTenant.leaseFile);
                if (uploadRes && uploadRes.success) docUrl = uploadRes.url;
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
        } finally {
            if (!isSilent) setProcessingMessage(null);
        }
    };

    const handleUpdateMessage = async (msgId, updates) => {
        setProcessingMessage('UPDATING_MESSAGE_STATUS');
        try {
            const msg = tenantMessages.find(m => m.id === msgId);
            if (!msg) return;
            const updatedMsg = { ...msg, ...updates };
            setTenantMessages(prev => prev.map(m => m.id === msgId ? updatedMsg : m));
            await API.saveToSheet('UPDATE', 'Messages', updatedMsg);
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleSendMessage = async (msg, photoData = null) => {
        setProcessingMessage('TRANSMITTING_MESSAGE');
        try {
            let photoUrl = null;
            
            if (photoData) {
                setGlobalMessage({ type: 'info', text: "Uploading attachment..." });
                const uploadRes = await API.uploadToDrive(photoData, `msg_${Date.now()}.png`);
                if (uploadRes.success) {
                    photoUrl = uploadRes.url;
                } else {
                    setGlobalMessage({ type: 'error', text: "Photo upload failed! Please ensure UPLOAD_FOLDER_ID is set in your GAS Script." });
                    setTimeout(() => setGlobalMessage(null), 5000);
                }
            }

            const newMessage = {
                id: generateId('MSG'),
                tenantId: activeTenantId,
                content: msg,
                photoUrl: photoUrl, // Remote URL
                timestamp: new Date().toISOString(),
                propertyName: activeProperty,
                status: 'UNREAD',
                handledBy: ''
            };

            // UI Persistence (Immediate)
            setTenantMessages(prev => [newMessage, ...prev]);
            
            // Remote Persistence
            await API.saveToSheet('ADD', 'Messages', newMessage);

            setGlobalMessage({ type: 'success', text: `Message sent to ${activeProperty} management!` });
            setTimeout(() => setGlobalMessage(null), 3000);
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleMoveOut = async (unit, tenant, offboardingData) => {
        setProcessingMessage('FINALIZING_OFFBOARDING');
        try {
            setGlobalMessage({ type: 'info', text: 'Finalizing Settlement & Offboarding...' });
            
            // 1. Mark unit as Available with Vacancy Tracking
            const updatedUnit = { 
                ...unit, 
                status: 'Available',
                vacantSince: new Date().toISOString().split('T')[0] // Track when lost revenue starts
            };
            await editUnitInCatalog(updatedUnit);

            // 2. Archive tenant and wipe portal credentials
            const updatedTenant = { 
                ...tenant, 
                unit: 'None', 
                status: 'Archived', 
                password: '', // Revoke portal access permanently
                depositRefunded: offboardingData.refundAmount,
                depositDeducted: offboardingData.deductionAmount,
                moveOutDate: new Date().toISOString().split('T')[0]
            };
            await editTenant(updatedTenant);

            // 3. Create Turnover Task with damages/notes attached
            let taskDesc = `-- Turnover Cleaning & Inspection for Unit ${unit.unitNumber}`;
            if (offboardingData.hasDamages) taskDesc += ` | Notes: Check for reported damages.`;
            
            const newTask = {
                id: generateId('TSK'),
                unit: unit.unitNumber,
                type: 'Maintenance',
                status: 'Pending',
                propertyName: activeProperty,
                scheduleDate: new Date().toISOString().split('T')[0],
                title: taskDesc,
                description: 'Generated automatically from Offboarding workflow.'
            };
            
            setTasks(prev => [newTask, ...prev]);
            await API.saveToSheet('ADD', 'Tasks', newTask);

            setGlobalMessage({ type: 'success', text: `Offboarding Complete. Financials logged and unit secured.` });
            setTimeout(() => setGlobalMessage(null), 3000);
        } catch (err) {
            console.error('Move out failed:', err);
            setGlobalMessage({ type: 'error', text: 'Move-out failed. Connection issue?' });
        } finally {
            setProcessingMessage(null);
        }
    };

    const handleLeaseDocUpload = async (tenantId, file) => {
        try {
            setGlobalMessage({ type: 'info', text: 'Step 1/3: Reading Agreement File...' });
            setGlobalMessage({ type: 'info', text: 'Step 2/3: Transmitting to Secure Cloud...' });
            
            const uploadRes = await API.uploadFile(file);
            
            if (uploadRes && uploadRes.success) {
                const docUrl = uploadRes.url;
                const tenant = tenants.find(t => String(t.id).toLowerCase().trim() === String(tenantId).toLowerCase().trim());
                if (!tenant) throw new Error('Tenant record lookup failed');
                
                const updatedTenant = { ...tenant, leaseDocument: docUrl, lastUpdated: new Date().toISOString() };
                
                setTenants(prev => prev.map(t => String(t.id).toLowerCase().trim() === String(tenantId).toLowerCase().trim() ? updatedTenant : t));
                
                setGlobalMessage({ type: 'info', text: 'Step 3/3: Finalizing Cloud Handshake...' });
                await editTenant(updatedTenant, true);
                
                setGlobalMessage({ type: 'success', text: 'Lease Agreement Uploaded Successfully' });
                setTimeout(() => setGlobalMessage(null), 3500);
            } else {
                const failMsg = uploadRes?.message || 'Cloud storage rejected the document';
                setGlobalMessage({ type: 'error', text: `${failMsg}. Ensure file is <10MB and Drive Folder is set.` });
                setTimeout(() => setGlobalMessage(null), 6000);
            }
        } catch (err) {
            console.error('Lease upload failed:', err);
            setGlobalMessage({ type: 'error', text: 'Upload Failed - Check Cloud Connection' });
            setTimeout(() => setGlobalMessage(null), 3000);
        } finally {
            setProcessingMessage(null);
        }
    };

    // Initial Splash Screen (Only on cold start before data is ready)
    if (isLoading && tenants.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden premium-gradient">
                <AnimatePresence>
                    {processingMessage && <CommandProcessingOverlay message={processingMessage} />}
                </AnimatePresence>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
                
                <Motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <Motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-indigo-400/20"
                    >
                        <div className="relative flex items-center justify-center">
                            <Shield className="w-20 h-20 text-white fill-indigo-600" strokeWidth={3} />
                            <span className="absolute text-white text-3xl font-black select-none drop-shadow-2xl">M</span>
                        </div>
                    </Motion.div>

                    <div className="text-center space-y-3">
                        <h2 className="text-white font-black text-2xl tracking-tighter uppercase">Initializing MDO...</h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                        <p className="text-slate-500 text-[9px] uppercase font-black tracking-[0.4em] opacity-60 font-mono-data">Command Your Day &bull; MyDay OS</p>
                    </div>
                    
                    <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
                        <Motion.div 
                            animate={{ x: [-200, 200] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" 
                        />
                    </div>
                </Motion.div>
            </div>
        );
    }

    if (view === 'login') return <LoginPage onLogin={handleLogin} />;

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
                            <span className="text-white font-black text-base tracking-tight uppercase">
                                MyDay OS
                            </span>
                            <span className="hidden sm:inline text-[7px] text-indigo-400/60 font-black uppercase tracking-[0.2em] mt-0.5">v1.3.1 -?STATUS: OPTIMIZED</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        {view === 'manager' && (
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 hover:bg-white/10 transition-all">
                                <div className="flex flex-col items-end gap-0.5 pr-2 border-r border-white/10">
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <p className={`text-[7px] font-black uppercase tracking-tight ${syncStatus === 'connected' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]' : syncStatus === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
                                            <span className="hidden xs:inline">{syncStatus === 'connected' ? 'SYSTEM_COMMAND_LIVE' : syncStatus === 'error' ? 'SYNC_ERROR' : syncStatus === 'connecting' ? 'CONNECTING...' : 'OFFLINE_MODE'}</span>
                                            <span className="xs:hidden">{syncStatus === 'connected' ? 'LIVE' : syncStatus === 'error' ? 'ERR' : 'OFF'}</span>
                                        </p>
                                        <button 
                                            onClick={() => syncWithCloud()} 
                                            title="Force Refresh Data"
                                            className={`p-0.5 hover:scale-110 active:scale-95 transition-all ${isRefreshing || syncStatus === 'connecting' ? 'animate-spin text-indigo-400' : 'text-slate-500 hover:text-emerald-400'}`}
                                        >
                                            <RefreshCcw className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                    <p className="text-[7px] text-slate-600 font-black uppercase tracking-tight tabular-nums font-mono-data">
                                        {lastSyncTime ? `Last Updated: ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '-?Local Cache Only'}
                                    </p>
                                </div>
                                <div className="relative">
                                    {/* Custom Property Picker Button */}
                                    <button
                                        onClick={() => setShowPropertyPicker(v => !v)}
                                        className="flex items-center gap-2 text-indigo-400 hover:text-white transition-all"
                                    >
                                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest max-w-[80px] md:max-w-[200px] truncate">{activeProperty}</span>
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
                                                    {Array.isArray(properties) && properties.filter(p => !p.isArchived).map(p => (
                                                        <button
                                                            key={p?.id || p?.name}
                                                            onClick={() => { setActiveProperty(p?.name || p); setShowPropertyPicker(false); }}
                                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                                                                activeProperty === (p?.name || p)
                                                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 glow-indigo'
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
                                className="hidden md:flex p-2.5 text-slate-500 hover:text-indigo-400 bg-white/5 hover:bg-indigo-500/10 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all font-black"
                            >
                                <Settings className="w-4 h-4" />
                            </Motion.button>
                        )}
                        <Motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={logout} 
                            className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-white hover:bg-red-600 transition-all bg-red-500/10 px-5 py-2.5 rounded-2xl border border-red-500/20 font-black"
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

            <AnimatePresence>
                {processingMessage && <CommandProcessingOverlay message={processingMessage} />}
            </AnimatePresence>

            <main className="w-full px-6 md:px-12 py-8 pb-32 md:pb-8">

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
                                    onUpdateMessage={handleUpdateMessage}
                                    activeManager={activeManager}
                                    activeTab={activeTabForNav}
                                    setActiveTab={setActiveTabForNav}
                                />
                            </ErrorBoundary>
                        ) : (
                            <TenantDashboard
                                tenant={tenants.find(t => t.id === activeTenantId)}
                                unit={propertyUnits.find(u => u.unitNumber === (tenants.find(t => t.id === activeTenantId)?.unit))}
                                currency={activeCurrency}
                                tenantMessages={tenantMessages.filter(m => m.tenantId === activeTenantId)}
                                onSendMessage={handleSendMessage}
                            />
                        )}
                    </Motion.div>
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            {view === 'manager' && !isLoading && (
                <MobileBottomNav 
                    activeTab={activeTabForNav} 
                    setActiveTab={setActiveTabForNav} 
                    tenantMessages={filteredMessages}
                    onLogout={logout}
                />
            )}
        </div>
    );
}

function MobileBottomNav({ activeTab, setActiveTab, tenantMessages, onLogout }) {
    const tabs = [
        { id: 'rents', icon: <Receipt className="w-5 h-5" />, label: 'Rents' },
        { id: 'inventory', icon: <LayoutGrid className="w-5 h-5" />, label: 'Units' },
        { id: 'tasks', icon: <Wrench className="w-5 h-5" />, label: 'Tasks' },
        { id: 'messages', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat', badge: tenantMessages?.length > 0 },
        { id: 'utilities', icon: <Droplets className="w-5 h-5" />, label: 'Utils' },
        { id: 'logout', icon: <LogOut className="w-5 h-5 text-red-500" />, label: 'Exit', action: onLogout }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 px-2 pt-3 flex justify-around items-center shadow-[0_-20px_40px_rgba(0,0,0,0.5)]" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => tab.action ? tab.action() : setActiveTab(tab.id)}
                    className={`relative flex flex-col items-center gap-1 transition-all flex-1 min-w-0 ${
                        activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <div className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-500/10' : ''}`}>
                        {tab.icon}
                        {tab.badge && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{tab.label}</span>
                    {activeTab === tab.id && (
                        <Motion.div 
                            layoutId="activeTabUnderline"
                            className="absolute -bottom-2 w-8 h-1 bg-indigo-500 rounded-full"
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

// --- Manager Components ---

function ManagerDashboard({ activeProperty, tenants, payments, propertyUnits, utilityBills, tasks, vendors, tenantMessages, currency = 'USD', onAddUnit, onEditUnit, onDeleteUnit, onAddTenant, onEditTenant, onUpdateFittings, onAddBill, onAddTask, onAddVendor, onEditVendor, onDeleteVendor, onMarkPaid, onUpdateLeaseDoc, onMoveOut, onUpdateMessage, activeManager, activeTab: externalActiveTab, setActiveTab: setExternalActiveTab }) {
    const [internalActiveTab, setInternalActiveTab] = useState('rents');
    const activeTab = externalActiveTab || internalActiveTab;
    const setActiveTab = setExternalActiveTab || setInternalActiveTab;
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [selectedUnitForLease, setSelectedUnitForLease] = useState(null);
    const [offboardingSession, setOffboardingSession] = useState(null);
    const [viewerImage, setViewerImage] = useState(null);

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

    // Currency tag helper -?prepends ISO code as a label
    const cur = (amount) => `${currency} ${Number(amount || 0).toLocaleString()}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <VendorModal 
                isOpen={showVendorModal} 
                onClose={() => { setShowVendorModal(false); setEditingVendor(null); }} 
                onSubmit={editingVendor ? handleUpdateVendor : handleAddVendor} 
                editingVendor={editingVendor} 
            />
            {viewerImage && (
                <div className="fixed inset-0 z-[250] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in transition-all" onClick={() => setViewerImage(null)}>
                    <button className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white bg-white/5 rounded-2xl border border-white/5 transition-all"><X className="w-8 h-8" /></button>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={viewerImage} alt="Fullscreen View" className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl border border-white/10" />
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tap anywhere to return</div>
                    </div>
                </div>
            )}
            <CompactStatsBar 
                stats={[
                    { title: "Revenue", value: cur(totalRevenue), icon: <CreditCard className="text-emerald-400" /> },
                    { title: "Occupancy", value: totalUnits > 0 ? `${Math.round((occupiedUnits / totalUnits) * 100)}%` : '0%', icon: <Users className="text-blue-400" /> },
                    { title: "Available", value: vacantUnits || 0, icon: <Building2 className="text-sky-400" /> },
                    { title: "Maintenance", value: (tasksCount || 0).toString(), icon: <Wrench className="text-amber-400" /> }
                ]}
            />

            <div className="hidden md:flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto no-scrollbar snap-x relative backdrop-blur-md">
                {(Array.isArray(tenants) ? [
                    { id: 'rents', icon: <Receipt className="w-3.5 h-3.5" />, label: 'My Collections' },
                    { id: 'inventory', icon: <Building2 className="w-3.5 h-3.5" />, label: 'My Property Assets' },
                    { id: 'utilities', icon: <Droplets className="w-3.5 h-3.5" />, label: 'Utility Ledger' },
                    { id: 'tasks', icon: <Hammer className="w-3.5 h-3.5" />, label: 'Maintenance Desk' },
                    { id: 'messages', icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Communications', badge: (tenantMessages?.length > 0) }
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
                                className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/40 glow-indigo"
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
                    {activeTab === 'rents' && <RentSummaryTab tenants={tenants} payments={payments.filter(p => !p.propertyName || p.propertyName === activeProperty)} currency={currency} onMarkPaid={onMarkPaid} propertyName={activeProperty} tenantMessages={tenantMessages} activeManager={activeManager} />}
                    {activeTab === 'messages' && <MessagesManager tenants={tenants} messages={tenantMessages} onUpdateMessage={onUpdateMessage} activeManager={activeManager} />}
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
                                        onMoveOut={() => setOffboardingSession({ unit, tenant })}
                                        onViewImage={(url) => setViewerImage(url)}
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
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Catalog a New Unit for me</span>
                            </Motion.button>
                        </div>
                    )}
                    {activeTab === 'utilities' && (
                        <UtilityManager tenants={tenants} utilityBills={utilityBills} onAddBill={onAddBill} currency={currency} />
                    )}
                </Motion.div>
            </AnimatePresence>

            {showUnitModal && <UnitModal onClose={() => setShowUnitModal(false)} onSubmit={async (data) => { await onAddUnit(data); setShowUnitModal(false); }} />}
            {editingUnit && (
                <UnitModal 
                    initialData={editingUnit} 
                    onClose={() => setEditingUnit(null)} 
                    onSubmit={async (data) => { 
                        await onEditUnit(data); 
                        setEditingUnit(null); 
                    }} 
                />
            )}
            {offboardingSession && (
                <OffboardingModal 
                    tenant={offboardingSession.tenant}
                    unit={offboardingSession.unit}
                    utilityBills={utilityBills.filter(b => b.unit === offboardingSession.unit.unitNumber && b.status !== 'Paid')}
                    currency={currency}
                    onClose={() => setOffboardingSession(null)}
                    onSubmit={(data) => {
                        onMoveOut(offboardingSession.unit, offboardingSession.tenant, data);
                        setOffboardingSession(null);
                    }}
                />
            )}
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
function PaymentConfirmModal({ tenant, currency, activeManager, onConfirm, onClose }) {
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
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">{tenant?.unit} - {tenant?.name}</p>
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
                        <p className="text-[11px] font-black text-slate-300 flex items-center gap-1.5 font-mono-data">
                            {bp.from ? formatDate(bp.from) : 'N/A'}
                            <span className="text-indigo-400">/</span>
                            {bp.to ? formatDate(bp.to) : 'N/A'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">Amount Due</p>
                        <p className="text-xl font-black text-emerald-400 tracking-tighter font-mono-data">{currency} {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Admin Audit Trail */}
                <div className="p-8 bg-slate-950/20 border-b border-white/5">
                    <div className="flex items-center gap-4 py-6 border-2 border-dashed border-indigo-500/20 rounded-3xl bg-indigo-500/5 px-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated Admin</p>
                            <p className="text-sm font-black text-white italic tracking-tight">{activeManager?.name || 'System Administrator'}</p>
                            <p className="text-[9px] text-indigo-400/60 font-medium mt-0.5">Authorization logged for audit trail</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex gap-3">
                    <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        Cancel
                    </Motion.button>
                    <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
                        className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 glow-emerald">
                        <CheckCircle2 className="w-4 h-4" /> Confirm & Mark Paid
                    </Motion.button>
                </div>
            </Motion.div>
        </div>
    );
}

// --- Rent Summary Tab ---
function RentSummaryTab({ tenants, payments, currency = 'USD', onMarkPaid, propertyName, tenantMessages = [], activeManager }) {
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
            } catch (_ /* eslint-disable-line no-unused-vars */) {
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
                    activeManager={activeManager}
                    onConfirm={() => {
                        onMarkPaid(confirmTenant.id, (Number(confirmTenant.baseRent) + Number(confirmTenant.utilityShare || 0)).toFixed(2), activeManager?.name);
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
                            {currentMonthLabel} - Sorted by urgency
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
                        const dueDateStr = (rent.dueDate instanceof Date && !isNaN(rent.dueDate)) ? formatDate(rent.dueDate) : 'N/A';
                        return (
                            <Motion.div 
                                key={rent.id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`rounded-3xl p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${
                                    isPaidThisMonth(rent.lastPaymentDate) ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-600/5 glow-emerald' :
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
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5 font-mono-data">
                                                    <CalendarRange className="w-3 h-3 text-indigo-400/60 shrink-0" />
                                                    {formatDate(bp.from)}
                                                    <span className="text-indigo-400/60">/</span>
                                                    {formatDate(bp.to)}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 font-mono-data">Lease Start: {fmtDate(rent.leaseStart)}</p>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Right: info + action */}
                                <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto">
                                    <div className="text-left md:text-right">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Due</p>
                                        <p className={`text-sm font-black tracking-tight font-mono-data ${
                                            isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-slate-300'
                                        }`}>{dueDateStr}</p>
                                        <p className={`text-[9px] font-black uppercase mt-0.5 ${
                                            isPaidThisMonth(rent.lastPaymentDate) ? 'text-emerald-500' :
                                            isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-slate-600'
                                        }`}>
                                            {isPaidThisMonth(rent.lastPaymentDate) ? '-?Paid & Verified' : rent.daysUntil === 0 ? '-- Due Today' : isOverdue ? `${Math.abs(rent.daysUntil)}d overdue` : `${rent.daysUntil}d left`}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Monthly Rent</p>
                                        <p className="text-xl font-black text-emerald-400 tracking-tighter font-mono-data">{currency} {Number(rent.baseRent).toLocaleString()}</p>
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
                                                    : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 glow-emerald'
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
                                    <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Verified By</th>
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
                                            <td className="px-8 py-6 text-xs text-slate-400 font-bold font-mono-data">{formatDate(pay.date)}</td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">{pay.confirmedBy || 'Admin'}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-sm font-black text-emerald-400 tabular-nums font-mono-data">{currency} {Number(pay.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
        id: '',
        name: '',
        mobile: '',
        type: '',
        rating: 5,
        email: ''
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (editingVendor) setVendorForm(editingVendor);
        else setVendorForm({ id: '', name: '', mobile: '', type: '', rating: 5, email: '' });
    }, [editingVendor, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[155] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in transition-all">
            <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-10 pb-6 border-b border-white/5 bg-slate-900/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20"><Briefcase className="w-6 h-6 text-indigo-400" /></div>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{editingVendor ? 'Modify Partner' : 'Enlist Partner'}</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 opacity-60">Service Network Registration</p>
                </div>

                <div className="flex-1 overflow-y-auto p-10 pb-32 md:pb-10 space-y-8 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Contractor Name</label>
                            <input type="text" className="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500 focus:bg-slate-950 transition-all font-bold" placeholder="e.g. Acme Plumbing" value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Primary Specialization</label>
                                <input type="text" className="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500 font-black uppercase text-[10px] tracking-widest" placeholder="e.g. Roof Repair" value={vendorForm.type} onChange={e => setVendorForm({ ...vendorForm, type: e.target.value })} />
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
                    <button onClick={() => onSubmit(vendorForm)} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all transform active:scale-95 glow-indigo">
                        {editingVendor ? <RefreshCcw className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        {editingVendor ? 'Process my Modifications' : 'Enlist a New Partner'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function MessagesManager({ tenants, messages, onUpdateMessage, activeManager }) {
    const [filter, setFilter] = useState('ACTIVE'); // 'ACTIVE' or 'RESOLVED'

    const activeMessages = messages.filter(m => m.status !== 'RESOLVED');
    const resolvedMessages = messages.filter(m => m.status === 'RESOLVED');
    const currentList = filter === 'ACTIVE' ? activeMessages : resolvedMessages;

    const handleReply = (msg, tenant) => {
        if (!msg.status || msg.status === 'UNREAD') {
            onUpdateMessage(msg.id, { status: 'IN PROGRESS', handledBy: activeManager?.name || 'Admin' });
        }
        const waLink = `https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${String(tenant.name || 'Tenant').split(' ')[0]}, received your message: "${msg.content}". \n\n`)}`;
        window.open(waLink, '_blank', 'noopener,noreferrer');
    };

    const handleResolve = (msgId) => {
        if (!window.confirm("Archive this message as resolved?")) return;
        onUpdateMessage(msgId, { status: 'RESOLVED', handledBy: activeManager?.name || 'Admin', resolvedAt: new Date().toISOString() });
    };

    return (
        <div className="space-y-6">
            <div className="premium-card rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-white/5 gap-4">
                    <div>
                        <h3 className="font-black text-2xl text-white italic tracking-tight flex items-center gap-3">
                            <MessageSquare className="w-7 h-7 text-indigo-400" />
                            My Helpdesk Tickets
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Manage tenant communications</p>
                    </div>
                    
                    <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                        <button onClick={() => setFilter('ACTIVE')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ACTIVE' ? 'bg-indigo-600 shadow-lg text-white glow-indigo' : 'text-slate-500 hover:text-white'}`}>
                            Action Required <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-md">{activeMessages.length}</span>
                        </button>
                        <button onClick={() => setFilter('RESOLVED')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'RESOLVED' ? 'bg-emerald-600 shadow-lg text-white glow-emerald' : 'text-slate-500 hover:text-white'}`}>
                            Resolved <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-md">{resolvedMessages.length}</span>
                        </button>
                    </div>
                </div>

                {currentList.length === 0 ? (
                    <div className="text-center py-24 text-slate-600">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <CheckCircle2 className="w-10 h-10 opacity-30 text-emerald-400" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.3em]">{filter === 'ACTIVE' ? 'Inbox Zero achieved!' : 'No resolved tickets'}</p>
                        <p className="text-[10px] text-slate-700 font-bold mt-2">All caught up here.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {currentList.map((msg, idx) => {
                            const tenant = tenants.find(t => t.id === msg.tenantId);
                            const initials = (tenant?.name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                            const status = msg.status || 'UNREAD';

                            return (
                                <Motion.div 
                                    key={msg.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`rounded-3xl p-6 border transition-all group ${
                                        status === 'RESOLVED' ? 'bg-emerald-950/20 border-emerald-500/10 opacity-80' :
                                        status === 'IN PROGRESS' ? 'bg-slate-900 border-amber-500/20 shadow-lg shadow-amber-500/5' :
                                        'bg-white/[0.03] border-indigo-500/30 shadow-lg shadow-indigo-600/5'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 ${
                                                    status === 'RESOLVED' ? 'bg-emerald-600/50' : 'bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-600/20'
                                                }`}>
                                                    {initials}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className={`font-black tracking-tight ${status === 'RESOLVED' ? 'text-slate-400' : 'text-white'}`}>{tenant?.name || 'Unknown Tenant'}</h4>
                                                        <span className="text-[9px] text-indigo-400 font-black uppercase bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">Unit {tenant?.unit}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest font-mono-data">{formatDate(msg.timestamp, true)}</p>
                                                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-opacity-10 border-opacity 30">
                                                            {status === 'UNREAD' && <span className="text-red-400 border-red-500 bg-red-500 px-2 rounded-full">-- UNREAD</span>}
                                                            {status === 'IN PROGRESS' && <span className="text-amber-400 border-amber-500 bg-amber-500 px-2 rounded-full">-- IN PROGRESS</span>}
                                                            {status === 'RESOLVED' && <span className="text-emerald-400 border-emerald-500 bg-emerald-500 px-2 rounded-full">-?RESOLVED</span>}
                                                        </span>
                                                        {msg.handledBy && (
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                                                Handled by: {msg.handledBy}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 text-slate-300 text-sm italic leading-relaxed">
                                                <span className="text-slate-600 mr-1 text-lg leading-none">"</span>
                                                {msg.content}
                                                <span className="text-slate-600 ml-1 text-lg leading-none">"</span>
                                            </div>

                                            {msg.photoUrl && (
                                                <div className="mt-4">
                                                    <a href={msg.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative">
                                                        <img src={msg.photoUrl} alt="Attachment" className={`h-24 w-auto rounded-2xl border border-white/10 shadow-xl transition-all ${status !== 'RESOLVED' && 'group-hover:scale-[1.02]'}`} />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                            <span className="bg-slate-900/80 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white border border-white/10">View Image</span>
                                                        </div>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="w-full md:w-auto self-end flex flex-col md:flex-row gap-2 md:gap-3 flex-shrink-0 pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
                                            {tenant && status !== 'RESOLVED' && (
                                                <>
                                                    <Motion.button
                                                        whileHover={{ scale: 1.04 }}
                                                        whileTap={{ scale: 0.96 }}
                                                        onClick={() => handleResolve(msg.id)}
                                                        className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all glow-emerald"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
                                                    </Motion.button>
                                                    
                                                    <Motion.button
                                                        whileHover={{ scale: 1.04 }}
                                                        whileTap={{ scale: 0.96 }}
                                                        onClick={() => handleReply(msg, tenant)}
                                                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                                                    >
                                                        <MessageSquare className="w-4 h-4" /> Reply to Tenant
                                                    </Motion.button>
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
        } catch(_ /* eslint-disable-line no-unused-vars */) {} // eslint-disable-line no-empty

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
    const dueDate = formatDate(calculateNextRentDue(tenant.leaseStart));
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
                <button onClick={() => setActiveTab('new')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 glow-indigo' : 'text-slate-500 hover:text-slate-300'}`}><PlusCircle className="w-4 h-4" /> Process a New Bill</button>
                <button onClick={() => setActiveTab('monthly')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 glow-indigo' : 'text-slate-500 hover:text-slate-300'}`}><Calendar className="w-4 h-4" /> My Monthly Summary</button>
                <button onClick={() => setActiveTab('history')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 glow-indigo' : 'text-slate-500 hover:text-slate-300'}`}><Clock className="w-4 h-4" /> My Bill History</button>
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
                                    <input type="date" style={{ colorScheme: 'dark' }} className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none font-mono-data" value={billDate} onChange={e => setBillDate(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Amount ($)</label>
                                    <input type="number" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none font-mono-data" placeholder="0.00" value={billAmount} onChange={e => setBillAmount(e.target.value)} />
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
                                <button onClick={() => setMode('equal')} className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${mode === 'equal' ? 'bg-indigo-600/10 border-indigo-500/40 glow-indigo' : 'bg-white/5 border-transparent opacity-60'}`}>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">Standard Share</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Split equally by active tenants</p>
                                    </div>
                                    {mode === 'equal' && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <button onClick={() => setMode('designated')} className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${mode === 'designated' ? 'bg-indigo-600/10 border-indigo-500/40 glow-indigo' : 'bg-white/5 border-transparent opacity-60'}`}>
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
                                    <p className="text-xl font-black text-white tracking-tighter font-mono-data">{currency} {totalBill.toFixed(2)}</p>
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
                                                        <input type="date" style={{ colorScheme: 'dark' }} className="w-[110px] bg-slate-800 border-none rounded-lg p-1.5 text-[10px] font-black text-white outline-none focus:ring-1 ring-indigo-500 uppercase tracking-widest font-mono-data" value={tenantDates[t.id].start} onChange={e => setTenantDates(prev => ({ ...prev, [t.id]: { ...prev[t.id], start: e.target.value } }))} />
                                                        <span className="text-slate-500 text-xs">to</span>
                                                        <input type="date" style={{ colorScheme: 'dark' }} className="w-[110px] bg-slate-800 border-none rounded-lg p-1.5 text-[10px] font-black text-white outline-none focus:ring-1 ring-indigo-500 uppercase tracking-widest font-mono-data" value={tenantDates[t.id].end} onChange={e => setTenantDates(prev => ({ ...prev, [t.id]: { ...prev[t.id], end: e.target.value } }))} />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">{tenantDays[t.id]} Days</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-right min-w-[80px]">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Share Amount</p>
                                                <p className="text-lg font-black text-indigo-400 tracking-tighter font-mono-data">{currency} {calculatedAmt.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button disabled={totalBill <= 0 || (mode === 'designated' && totalDays <= 0)} onClick={handleApply} className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 glow-indigo">
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
                                <Calendar className="w-6 h-6 text-indigo-400" /> My Monthly Utility Breakdown
                            </h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Bills per tenant - {new Date(effectiveMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hidden md:inline">Period</span>
                            <select className="bg-slate-950/60 border border-white/10 hover:border-indigo-500/40 rounded-2xl px-5 py-3 text-white text-xs font-black outline-none cursor-pointer transition-all font-mono-data" value={effectiveMonth} onChange={e => setSelectedMonth(e.target.value)}>
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
                                                        <span className="text-white font-black text-sm font-mono-data">{currency} {b.amount.toFixed(2)}</span>
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
                                            <span className={`text-2xl font-black tracking-tighter font-mono-data ${totalOwed > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{currency} {totalOwed.toFixed(2)}</span>
                                        </div>
                                        {t.mobile && totalOwed > 0 && (
                                            <Motion.a
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                href={`https://wa.me/${String(t.mobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${String(t.name || 'Tenant').split(' ')[0]},\n\nYour utility bill summary for ${new Date(effectiveMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })} is:\n${breakdowns.map(b => `- ${b.type}: ${currency} ${b.amount.toFixed(2)}`).join('\n')}\n\n*Total Due: ${currency} ${totalOwed.toFixed(2)}*`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-600/5 glow-emerald"
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
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white italic mb-8"><Receipt className="w-5 h-5 text-indigo-400" /> My Bill History</h3>
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
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 font-mono-data"><span className="text-indigo-400">{fmtDate(bill.date)}</span> -?{bill.mode === 'equal' ? 'Standard Split' : 'Designated Split'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-3xl font-black text-white tracking-tighter font-mono-data">{currency} {bill.amount.toFixed(2)}</p>
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
                                                        <span className="text-lg font-black text-indigo-400 tracking-tighter font-mono-data">{currency} {alloc.amount.toFixed(2)}</span>
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

function TasksManager({ tenants, tasks, vendors, onAddTask, onAddVendor, onEditVendor, onDeleteVendor, currency: _currency = 'USD' /* eslint-disable-line no-unused-vars */ }) {
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
                    { id: 'active', icon: <Hammer className="w-3.5 h-3.5" />, label: 'My Work Orders' },
                    { id: 'vendors', icon: <Briefcase className="w-3.5 h-3.5" />, label: 'My Service Network' }
                ].map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${subTab === t.id ? 'bg-indigo-600 text-white shadow-lg glow-indigo' : 'text-slate-500 hover:text-slate-300'}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {subTab === 'active' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-sm font-black text-white italic mb-8 flex items-center gap-2">
                                <PlusCircle className="w-4 h-4 text-indigo-400" /> Dispatch a New Order
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
                                            <input type="date" style={{ colorScheme: 'dark' }} className="flex-1 bg-slate-800 border-none rounded-xl p-3 text-white text-xs outline-none focus:ring-1 ring-indigo-500 font-mono-data" value={opt.date} onChange={e => { const n = [...dateOptions]; n[i].date = e.target.value; setDateOptions(n); }} />
                                            <input type="time" style={{ colorScheme: 'dark' }} className="flex-1 bg-slate-800 border-none rounded-xl p-3 text-white text-xs outline-none focus:ring-1 ring-indigo-500 font-mono-data" value={opt.time} onChange={e => { const n = [...dateOptions]; n[i].time = e.target.value; setDateOptions(n); }} />
                                        </div>
                                    ))}
                                    <button onClick={() => setDateOptions([...dateOptions, { date: '', time: '' }])} className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] px-2 py-1 hover:text-white transition-all">+ Add Option</button>
                                </div>
                                <button onClick={handleAdd} className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-[10px] glow-indigo">Generate Work Order</button>
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
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Unit {tenant.unit} -?{tenant.name}</p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {task.dateOptions?.map((d, idx) => <span key={idx} className="bg-slate-950/40 text-slate-400 text-[9px] font-bold px-3 py-1.5 rounded-lg border border-white/5 font-mono-data">{d}</span>)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[160px]">
                                        <div className="px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Status</p>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{task.status}</p>
                                        </div>
                                        <a href={`https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all glow-emerald">Notify Tenant</a>
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
                            <a href={`https://wa.me/${String(v.mobile || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all glow-emerald">
                                <Phone className="w-4 h-4" /> DISPATCH VENDOR
                            </a>
                        </div>
                    ))}
                    <div onClick={onAddVendor} className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-600 hover:text-indigo-400 hover:border-indigo-500/40 transition-all cursor-pointer group bg-white/[0.02]">
                        <PlusSquare className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Enlist a New Partner</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Tenant Dashboard (unchanged logic, showing for completeness) ---

function TenantDashboard({ tenant, unit, tenantMessages = [], onSendMessage, currency = 'USD' }) {
    const [showMsgModal, setShowMsgModal] = useState(false);
    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Accessing MyDay OS Resident Portal...</p>
            </div>
        );
    }
    const totalDue = (Number(tenant.baseRent) || 0) + (Number(tenant.utilityShare) || 0);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-white/5">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic">Greetings, {String(tenant.name || 'Resident').split(' ')[0]}</h2>
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
                    Contact Assistant
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CreditCard className="w-24 h-24" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Outstanding</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter italic font-mono-data">{currency} {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">Balanced Due</span>
                            </div>
                        </div>

                        {/* Visual Progress Ring */}
                        {totalDue > 0 ? (
                            <div className="relative w-16 h-16 shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle className="text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                    <circle className="text-red-500 stroke-current drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="60" style={{ transition: 'stroke-dashoffset 1s ease-out' }}></circle>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-16 h-16 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                        )}
                    </div>
 
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">Base Monthly Rent</span>
                            <span className="text-white font-mono-data">{currency} {(Number(tenant.baseRent) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Utility Share <Droplets className="w-3 h-3 text-blue-400" />
                            </span>
                            <span className="text-white font-mono-data">{currency} {(Number(tenant.utilityShare) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowMsgModal(true)}
                        className="w-full bg-indigo-600 text-white font-black py-4 md:py-5 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 text-[11px] md:text-xs uppercase tracking-widest mt-8 flex items-center justify-center gap-2 active:scale-95 glow-indigo"
                    >
                        Verify my Rent Payment <ArrowUpRight className="w-5 h-5" />
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
                                    <p className="text-sm font-bold text-white tracking-tight font-mono-data">{fmtDate(tenant.leaseStart)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Lease End</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <p className="text-sm font-bold text-white tracking-tight font-mono-data">{fmtDate(tenant.leaseEnd)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Security Deposit</p>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <p className="text-sm font-black text-white tracking-tight font-mono-data">{currency} {Number(tenant.deposit || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="col-span-2 mt-2">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Document Status</p>
                                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                                    {tenant.leaseDocument && typeof tenant.leaseDocument === 'string' && !tenant.leaseDocument.includes('[object') ? (
                                        <>
                                            <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1.5">
                                                <FileCheck className="w-4 h-4" /> Verified Contract
                                            </span>
                                            <a href={tenant.leaseDocument} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 glow-indigo">
                                                -- Download Access
                                            </a>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> Pending Execution
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

            {/* Support Tickets System */}
            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            My Service Requests
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Communication Log</p>
                    </div>
                    <button
                        onClick={() => setShowMsgModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20 glow-indigo"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        New Assistance Request
                    </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {tenantMessages.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                            <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">No support tickets found.</p>
                        </div>
                    ) : (
                        tenantMessages.map(msg => (
                            <div key={msg.id} className="bg-slate-950/50 border border-white/5 p-5 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                            msg.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            msg.status === 'IN PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                            {msg.status === 'RESOLVED' ? '-?Resolved' : msg.status === 'IN PROGRESS' ? '-- In Progress' : '-- Unread'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono-data">
                                            {new Date(msg.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {msg.handledBy && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-[9px] font-black uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3" /> {msg.handledBy}
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-slate-300 text-sm leading-relaxed font-medium bg-black/20 p-4 rounded-xl border border-white/5 mb-2">
                                    "{msg.content}"
                                </p>

                                {msg.photoUrl && (
                                    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 md:w-1/2">
                                        <img src={msg.photoUrl} alt="Attachment" className="w-full h-auto object-cover hover:scale-105 transition-transform" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
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
        <div className="fixed inset-0 z-[155] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <Motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 pb-32 md:pb-8 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white italic flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        My Message Manager
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"></button>
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

                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 glow-indigo">
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
        <div className="fixed inset-0 z-[155] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <Motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white italic flex items-center gap-3">
                        <Box className="w-6 h-6 text-indigo-500" /> My Inventory & Fittings
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"></button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex gap-2 mb-4">
                        <input type="text" className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 ring-indigo-500" placeholder="E.g. Smart TV..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
                        <button onClick={addItem} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-all glow-indigo"><Plus className="w-5 h-5 text-white" /></button>
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
                <button onClick={() => onSave(localFittings)} className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] glow-emerald">Save Changes</button>
            </Motion.div>
        </div>
    );
}

function UnitCard({ unit, tenant, currency = 'USD', history, onUpdateFittings, onEditUnit, onDeleteUnit, onAddLease, onEditLease, onUpdateLeaseDoc, onMoveOut, onViewImage }) {
    const images = useMemo(() => {
        if (!unit.image) return [];
        try {
            const parsed = JSON.parse(unit.image);
            return Array.isArray(parsed) ? parsed : [String(unit.image)];
        } catch (e) {
            return [String(unit.image)];
        }
    }, [unit.image]);
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
            className={`premium-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group flex flex-col h-full bg-slate-900 shadow-2xl shadow-black/50 border transition-colors duration-500 ${
                leaseStatus?.pulse ? 'border-red-500/30' : 'border-white/5'
            }`}
        >
            <div className={`h-32 md:h-36 relative flex items-center justify-center overflow-hidden bg-slate-950/40 border-b border-white/5`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent_70%)]" />
                
                <div className="relative group/thumb cursor-pointer" onClick={() => images[0] && onViewImage(images[0])}>
                    {images.length > 0 ? (
                        <div className="relative">
                            <img src={images[0]} alt="" className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-3xl border-2 border-white/10 group-hover/thumb:border-indigo-500/50 group-hover/thumb:scale-105 transition-all duration-500 shadow-2xl" />
                            {images.length > 1 && (
                                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                                    +{images.length - 1} MORE
                                </div>
                            )}
                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                <Maximize className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-800 transition-colors group-hover/thumb:border-white/20">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                            <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-20">NO VISUALS</span>
                        </div>
                    )}
                </div>

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
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 glow-emerald' 
                        : 'bg-indigo-600/30 text-indigo-400 border-indigo-500/30 glow-indigo'
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

            <div className="p-6 md:p-8 flex-1 flex flex-col relative">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h4 className="text-xl md:text-2xl font-black text-white tracking-tighter italic">Unit {unit.unitNumber}</h4>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mt-2 opacity-60">
                            <Maximize className="w-4 h-4" /> {unit.size} SQFT Space
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-800/40 p-1 rounded-2xl border border-white/5 mb-6 backdrop-blur-md">
                    {[
                        { id: 'info', icon: <CreditCard className="w-3.5 h-3.5" />, label: 'My Financials' },
                        { id: 'activity', icon: <Activity className="w-3.5 h-3.5" />, label: 'My Activity' },
                        { id: 'inventory', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'My Inventory' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 glow-indigo' : 'text-slate-500 hover:text-slate-300'
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
                                            <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20 space-y-1.5 glow-indigo">
                                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Base Rent</p>
                                                <p className="text-white font-black text-lg tracking-tighter font-mono-data">
                                                    <span className="text-xs text-indigo-500 mr-0.5">{currency}</span>{Number(actualRent).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Security Deposit</p>
                                                    <p className="text-white font-bold text-xs mt-0.5 font-mono-data">{currency} {Number(tenant.deposit || 0).toLocaleString()}</p>
                                                </div>
                                                <Lock className="w-3.5 h-3.5 text-slate-700" />
                                            </div>
                                            <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Utilities Allocation</p>
                                                    <p className="text-white font-bold text-xs mt-0.5 font-mono-data">{currency} {Number(tenant.utilityShare || 0).toLocaleString()}</p>
                                                </div>
                                                <Droplets className="w-3.5 h-3.5 text-blue-500/50" />
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/20 rounded-2xl border border-white/5 p-4 space-y-4">
                                            <div className="flex items-center justify-between text-[9px] font-bold uppercase text-slate-500 border-b border-white/5 pb-3">
                                                <span className="flex items-center gap-2 font-mono-data"><Calendar className="w-3 h-3" /> Tenure</span>
                                                <span className="text-indigo-400 font-mono-data">{fmtDate(tenant.leaseStart)} - {fmtDate(tenant.leaseEnd)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    {tenant.leaseDocument && typeof tenant.leaseDocument === 'string' && !tenant.leaseDocument.includes('[object') ? (
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
                                            <a href={`https://wa.me/${String(tenant.mobile || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-500 font-black rounded-2xl py-3.5 flex items-center justify-center gap-2.5 text-[10px] uppercase tracking-widest transition-all glow-emerald">
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
                                                    <div className="flex items-center gap-2.5 text-emerald-500 font-black bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/10 glow-emerald">
                                                        <LayoutGrid className="w-4 h-4" />
                                                        <span className="text-[9px] uppercase tracking-widest">Market Ready Status</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Target Revenue</p>
                                                    <p className="text-3xl font-black text-white tracking-tighter font-mono-data">
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
    const parseInitialImages = () => {
        if (!initialData?.image) return [];
        try {
            const parsed = JSON.parse(initialData.image);
            return Array.isArray(parsed) ? parsed : [String(initialData.image)];
        } catch (e) {
            return [String(initialData.image)];
        }
    };

    const [form, setForm] = useState(initialData || { unitNumber: '', size: '', expectedRent: '', status: 'Available', image: '[]' });
    const [images, setImages] = useState(parseInitialImages());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Save as JSON string
            await onSubmit({ ...form, image: JSON.stringify(images) });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[155] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent_70%)] pointer-events-none" />
            
            <Motion.div 
                initial={{ y: "100%", opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="bg-slate-900 border-t md:border border-white/10 w-full max-w-lg rounded-t-[3rem] md:rounded-[3.5rem] p-8 pb-32 md:p-12 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col"
            >
                {/* Drag Handle for Mobile */}
                <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-10 md:hidden shrink-0" />
                
                <div className="flex justify-between items-center mb-12 shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic flex items-center gap-4 tracking-tighter">
                            {initialData ? <Settings className="w-8 h-8 text-indigo-500" /> : <PlusCircle className="w-8 h-8 text-indigo-500" />}
                            {initialData ? 'Edit Asset' : 'New Unit'}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-1 opacity-60">Inventory Cataloging</p>
                    </div>
                    <Motion.button 
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose} 
                        className="p-3 text-slate-500 hover:text-white bg-white/5 rounded-2xl border border-white/5 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </Motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 flex-1">
                    {/* Hero Image Upload Gallery */}
                    <div className="section-animate" style={{ animationDelay: '0.1s' }}>
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-2 mb-4 flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5" /> Unit Visuals Catalog
                        </label>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 bg-slate-800">
                                    <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                <PlusCircle className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Add Photo</span>
                                <input 
                                    type="file" 
                                    multiple
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2 section-animate" style={{ animationDelay: '0.2s' }}>
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                <LayoutGrid className="w-3.5 h-3.5" /> Reference Label
                            </label>
                            <input 
                                required 
                                className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/40 rounded-[1.5rem] p-5 md:p-6 text-white text-base md:text-lg font-bold outline-none transition-all placeholder:text-slate-800 shadow-inner" 
                                placeholder="Unit 402, Penthouse A..." 
                                value={form.unitNumber} 
                                onChange={e => setForm({ ...form, unitNumber: e.target.value })} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5 md:gap-8 section-animate" style={{ animationDelay: '0.3s' }}>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <Maximize className="w-3.5 h-3.5" /> Total SQFT
                                </label>
                                <input 
                                    required 
                                    type="number" 
                                    className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/40 rounded-[1.5rem] p-5 md:p-6 text-white text-base md:text-lg font-bold outline-none transition-all placeholder:text-slate-800 shadow-inner" 
                                    placeholder="850" 
                                    value={form.size} 
                                    onChange={e => setForm({ ...form, size: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5" /> Target Rent
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-lg">$</span>
                                    <input 
                                        required 
                                        type="number" 
                                        className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/40 rounded-[1.5rem] p-5 md:p-6 pl-12 text-white text-base md:text-lg font-bold outline-none transition-all placeholder:text-slate-800 shadow-inner" 
                                        placeholder="2000" 
                                        value={form.expectedRent} 
                                        onChange={e => setForm({ ...form, expectedRent: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 pb-4 md:pb-0 section-animate" style={{ animationDelay: '0.4s' }}>
                        <Motion.button 
                            type="submit" 
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[2rem] uppercase tracking-[0.25em] text-xs shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:shadow-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'glow-indigo'}`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5" />
                            )}
                            {isSubmitting ? 'Processing Asset...' : (initialData ? 'Apply Transformations' : 'Catalog Asset')}
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
        <div className="fixed inset-0 z-[155] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-hidden">
            <Motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-slate-900 border-t md:border border-white/10 w-full max-w-xl rounded-t-[2.5rem] md:rounded-[3rem] p-8 pb-32 md:p-12 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar"
            >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 md:hidden" />
                
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white italic flex items-center gap-4 tracking-tighter">
                            {initialData?.id ? <Settings className="w-8 h-8 text-indigo-500" /> : <PlusCircle className="w-8 h-8 text-emerald-500" />}
                            {initialData?.id ? 'Adjust my Agreement' : 'Register a New Lease'}
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
                                {leaseForm.leaseFile || (leaseForm.leaseDocument && typeof leaseForm.leaseDocument === 'string' && !leaseForm.leaseDocument.includes('[object')) ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-4 bg-sky-600 rounded-2xl shadow-lg shadow-sky-600/30">
                                            <FileCheck className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{leaseForm.leaseFile ? "Document Ready" : "Document Attached"}</p>
                                        {!leaseForm.leaseFile && <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Tap/Click to Replace</p>}
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
                            {initialData?.id ? 'Update my Lease Agreement' : 'Finalize & Create Lease'}
                        </Motion.button>
                    </div>
                </form>
            </Motion.div>
        </div>
    );
}

function CompactStatsBar({ stats }) {
    return (
        <div className="sticky top-[72px] z-30 -mx-4 md:-mx-12 px-4 md:px-12 py-3 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20 overflow-x-auto no-scrollbar snap-x">
            <div className="flex items-center gap-5 md:gap-12 min-w-max">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-3 snap-start group">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                            {React.cloneElement(stat.icon, { className: "w-3.5 h-3.5" })}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 group-hover:text-slate-400 transition-colors">{stat.title}</span>
                            <span className="text-sm font-black text-white italic tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, index, trend }) {
    // Legacy big card if needed elsewhere, but currently replaced by compact bar
    return (
        <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="premium-card p-5 md:p-6 lg:p-8 rounded-[2rem] flex flex-col gap-3 md:gap-4 relative overflow-hidden group h-full"
        >
            <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                {React.cloneElement(icon, { className: "w-12 h-12 md:w-16 md:h-16" })}
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/5">
                    {React.cloneElement(icon, { className: "w-4 h-4 md:w-5 md:h-5" })}
                </div>
                <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em] leading-tight">{title}</p>
            </div>
            <div className="relative z-10">
                <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter italic">{value}</h4>
                {trend && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] md:text-[11px] font-black text-emerald-400 uppercase tracking-widest">{trend}</span>
                    </div>
                )}
            </div>
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
                        <div className="relative flex items-center justify-center">
                            <Shield className="w-20 h-20 text-white fill-indigo-600" strokeWidth={3} />
                            <span className="absolute text-white text-3xl font-black select-none pointer-events-none drop-shadow-2xl">M</span>
                        </div>
                    </Motion.div>
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-3 leading-none uppercase">MDO</h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] opacity-70">Command Your Day</p>
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
                            Access my Dashboard
                        </Motion.button>
                    </form>

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
export class ErrorBoundary extends React.Component {
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
        isArchived: false,
        ...initialData
    });

    const currentCurrencyInfo = ISO_CURRENCIES.find(c => c.code === form.currency);

    return (
        <div className="fixed inset-0 z-[155] flex items-center justify-center p-6 sm:p-8 bg-slate-950/80 backdrop-blur-md overflow-hidden">
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
                                    {initialData?.id ? 'Configure my Property' : 'Register a New Property'}
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
                <div className="p-8 pb-32 md:pb-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
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
                        
                        {initialData?.id && (
                            <div className="pt-4 flex items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Archive Property</p>
                                    <p className="text-[9px] text-slate-600 mt-1 max-w-[200px]">Hide this property from your active dashboard without deleting any data.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={form.isArchived} onChange={e => setForm({ ...form, isArchived: e.target.checked })} />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 border border-white/10"></div>
                                </label>
                            </div>
                        )}
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
                        {initialData?.id ? 'Apply my Updates' : 'Confirm Registration'}
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
                                <h2 className="text-lg font-black text-white tracking-tight">My Property Settings</h2>
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
                        <CheckCircle2 className="w-4 h-4" /> Save my Settings
                    </Motion.button>
                </div>
            </Motion.div>
        </div>
    );
}

function OffboardingModal({ tenant, unit: _unit = null /* eslint-disable-line no-unused-vars */, utilityBills, currency, onClose, onSubmit }) {
    const [data, setData] = useState({
        refundAmount: tenant?.deposit || 0,
        deductionAmount: 0,
        hasDamages: false,
        keysReturned: false,
        accessRevoked: true // Visual indicator
    });

    const unpaidUtilities = utilityBills.reduce((acc, bill) => acc + Number(bill.amount || 0), 0);

    return (
        <div className="fixed inset-0 z-[155] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in transition-all">
            <Motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-xl bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-10 pb-6 border-b border-white/5 bg-slate-900/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-4 bg-red-600/10 rounded-2xl border border-red-500/20"><LogOut className="w-6 h-6 text-red-400" /></div>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Settle & Offboard</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 opacity-60">Tenant Move-Out Checklist</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 pb-32 md:p-10 space-y-8 custom-scrollbar">
                    {unpaidUtilities > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                            <div>
                                <h4 className="text-red-400 font-black text-sm uppercase tracking-widest">Unpaid Utilities Warning</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">This tenant has {currency} {unpaidUtilities.toLocaleString()} in unpaid utility bills. Ensure you deduct this from the security deposit.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 space-y-2">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Initial Deposit</p>
                                <p className="text-xl font-black text-white">{currency} {Number(tenant?.deposit || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 space-y-2">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Monthly Rent</p>
                                <p className="text-xl font-black text-slate-300">{currency} {Number(tenant?.baseRent || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Deposit Refunded</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currency}</span>
                                    <input type="number" className="w-full bg-slate-950/50 border border-white/5 py-4 pl-12 pr-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500 font-black" value={data.refundAmount} onChange={e => setData({ ...data, refundAmount: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Deposit Retained</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currency}</span>
                                    <input type="number" className="w-full bg-slate-950/50 border border-white/5 py-4 pl-12 pr-5 rounded-2xl text-white outline-none focus:ring-2 ring-indigo-500 font-black" value={data.deductionAmount} onChange={e => setData({ ...data, deductionAmount: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <label className="flex items-center justify-between bg-white/[0.02] p-5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all group">
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-3"><Hammer className="w-5 h-5 text-amber-500"/> Retaining for Damages</span>
                                <input type="checkbox" checked={data.hasDamages} onChange={e => setData({...data, hasDamages: e.target.checked})} className="w-5 h-5 rounded-lg border-white/10 bg-slate-950 text-indigo-500 focus:ring-indigo-500 cursor-pointer" />
                            </label>
                            
                            <label className="flex items-center justify-between bg-white/[0.02] p-5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all group">
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-3"><Key className="w-5 h-5 text-indigo-400"/> Keys Returned</span>
                                <input type="checkbox" checked={data.keysReturned} onChange={e => setData({...data, keysReturned: e.target.checked})} className="w-5 h-5 rounded-lg border-white/10 bg-slate-950 text-indigo-500 focus:ring-indigo-500 cursor-pointer" />
                            </label>

                            <label className="flex items-center justify-between bg-white/[0.02] p-5 rounded-2xl border border-white/5 transition-all opacity-50 cursor-not-allowed">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Lock className="w-5 h-5 text-emerald-500"/> Portal Access Revoked</span>
                                <input type="checkbox" checked={data.accessRevoked} readOnly className="w-5 h-5 rounded-lg border-white/10 bg-slate-950 text-indigo-500 pointer-events-none" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-0 border-t border-white/5 bg-slate-900/50 flex flex-col pt-8 space-y-4">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">By clicking execute, the tenant's portal login will be permanently disabled, and a maintenance turnover task will be generated.</p>
                    <button onClick={() => onSubmit(data)} className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black rounded-3xl shadow-xl shadow-red-600/30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all transform active:scale-95">
                        <LogOut className="w-5 h-5" /> Finalize Move-out Protocol
                    </button>
                </div>
            </Motion.div>
        </div>
    );
}

export function CommandProcessingOverlay({ message }) {
    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-2 border-indigo-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-0 w-16 h-16 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent flex items-center justify-center">
                        <Terminal className="w-6 h-6 text-indigo-400" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 animate-pulse font-heading">COMMAND_IN_PROGRESS</p>
                    <p className="text-sm font-black text-white italic tracking-tighter uppercase font-mono-data opacity-80">{message}...</p>
                </div>
            </div>
        </Motion.div>
    );
}

export default App;

