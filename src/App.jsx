import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Zap,
    Flame,
    PieChart
} from 'lucide-react';

// --- Mock Initial Data ---
const INITIAL_TENANTS = [
    {
        id: 'T1',
        name: 'Alice Wong',
        unit: '12-A',
        email: 'alice@example.com',
        mobile: '+1234567890',
        password: 'password123',
        baseRent: 2200,
        deposit: 4400,
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31',
        maintenanceSelection: null,
        utilityShare: 45.50,
        notifications: [],
        leaseDocument: null,
        propertyName: 'Skyline Residency'
    },
    {
        id: 'T2',
        name: 'Bob Smith',
        unit: '12-B',
        email: 'bob@example.com',
        mobile: '+1987654321',
        password: 'password123',
        baseRent: 1800,
        deposit: 3600,
        leaseStart: '2024-02-15',
        leaseEnd: '2025-02-14',
        maintenanceSelection: null,
        utilityShare: 32.20,
        notifications: [],
        leaseDocument: 'lease_agreement_B.pdf',
        propertyName: 'Skyline Residency'
    }
];

const INITIAL_UNITS = [
    { id: 'U1', unitNumber: '12-A', size: 850, expectedRent: 2200, status: 'Occupied', image: null, fittings: ['Aircon x2', 'Fridge (Samsung)', 'Washing Machine'], propertyName: 'Skyline Residency' },
    { id: 'U2', unitNumber: '12-B', size: 720, expectedRent: 1800, status: 'Occupied', image: null, fittings: ['Aircon x1', 'Microwave'], propertyName: 'Skyline Residency' },
    { id: 'U3', unitNumber: '14-C', size: 1100, expectedRent: 3100, status: 'Available', image: null, fittings: [], propertyName: 'Skyline Residency' },
    { id: 'U4', unitNumber: '08-G', size: 650, expectedRent: 1550, status: 'Available', image: null, fittings: [], propertyName: 'Skyline Residency' },
];

const INITIAL_BILLS = [];

// --- Global Configuration ---
const APP_TIMEZONE = 'Asia/Kuala_Lumpur'; // GMT+8
const LOCALE = 'en-MY'; // Or your preferred region for GMT+8

// --- Helper Functions ---
const getLocalDate = () => {
    // Return a date object adjusted to the targeted timezone if needed, 
    // or just use this for formatting consistency.
    return new Date(new Date().toLocaleString("en-US", { timeZone: APP_TIMEZONE }));
};

const formatDate = (date, includeTime = false) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(LOCALE, {
        timeZone: APP_TIMEZONE,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        ...(includeTime ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : {})
    });
};
const calculateNextRentDue = (leaseStart) => {
    const today = getLocalDate();
    const lStart = new Date(leaseStart);
    const day = lStart.getDate();
    
    // Rent is due one day before the period starts.
    // Period starts on 'day' of each month.
    let dueDate = new Date(today.getFullYear(), today.getMonth(), day - 1);
    
    // If this month's due date has already passed, compute for the next cycle
    if (dueDate < today) {
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, day - 1);
    }
    
    return dueDate;
};

const getDaysUntilDue = (leaseStart) => {
    const today = getLocalDate();
    today.setHours(0, 0, 0, 0);
    const dueDate = calculateNextRentDue(leaseStart);
    dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
};


const MANAGER_CREDENTIALS = {
    email: import.meta.env.VITE_MANAGER_EMAIL || 'admin@propmanage.com',
    password: import.meta.env.VITE_MANAGER_PASSWORD || 'admin',
    mobile: import.meta.env.VITE_MANAGER_MOBILE || '+1555000111'
};

// --- API Service Management ---
const API_URL = import.meta.env.VITE_API_URL;

const API = {
    async uploadToDrive(fileData, fileName) {
        if (!API_URL) return { success: false, message: 'API URL missing in .env' };
        try {
            const resp = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'UPLOAD', fileData, fileName })
            });
            return await resp.json();
        } catch (err) {
            console.error('Drive Upload Error:', err);
            return { success: false, message: 'Upload failed' };
        }
    },

    async saveToSheet(action, sheetName, data) {
        if (!API_URL) return { success: false, message: 'API URL missing in .env' };
        try {
            const resp = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action, sheetName, data })
            });
            return await resp.json();
        } catch (err) {
            console.error('Sheet Save Error:', err);
            return { success: false, message: 'Save failed' };
        }
    },

    async getAllData() {
        if (!API_URL || API_URL.includes("PASTE_YOUR")) return null;
        try {
            const resp = await fetch(API_URL);
            return await resp.json();
        } catch (err) {
            console.error('Fetch Data Error:', err);
            return null;
        }
    }
};

export default function App() {
    const [view, setView] = useState('login');
    const [isLoading, setIsLoading] = useState(true);
    const [tenants, setTenants] = useState(INITIAL_TENANTS);
    const [propertyUnits, setPropertyUnits] = useState(INITIAL_UNITS);
    const [utilityBills, setUtilityBills] = useState(INITIAL_BILLS);
    const [tasks, setTasks] = useState([]);
    const [activeTenantId, setActiveTenantId] = useState(null);
    const [activeProperty, setActiveProperty] = useState(null);
    const [globalMessage, setGlobalMessage] = useState(null);
    const [tenantMessages, setTenantMessages] = useState([
        { id: 'M1', tenantId: 'T1', content: 'The aircon in the master bedroom is leaking slightly.', timestamp: '2026-03-18T10:30:00Z', propertyName: 'Skyline Residency' },
        { id: 'M2', tenantId: 'T2', content: 'When will the utility bills for March be posted?', timestamp: '2026-03-18T14:45:00Z', propertyName: 'Skyline Residency' }
    ]);

    // Computed filtered lists based on selected property
    const filteredTenants = useMemo(() => activeProperty ? tenants.filter(t => t.propertyName === activeProperty) : [], [tenants, activeProperty]);
    const filteredUnits = useMemo(() => activeProperty ? propertyUnits.filter(u => u.propertyName === activeProperty) : [], [propertyUnits, activeProperty]);
    const filteredMessages = useMemo(() => activeProperty ? tenantMessages.filter(m => m.propertyName === activeProperty) : [], [tenantMessages, activeProperty]);
    const filteredBills = useMemo(() => activeProperty ? utilityBills.filter(b => b.propertyName === activeProperty) : [], [utilityBills, activeProperty]);
    const filteredTasks = useMemo(() => activeProperty ? tasks.filter(t => t.propertyName === activeProperty) : [], [tasks, activeProperty]);

    // Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            const data = await API.getAllData();
            if (data) {
                if (data.tenants?.length) setTenants(data.tenants);
                if (data.units?.length) setPropertyUnits(data.units);
                if (data.bills?.length) setUtilityBills(data.bills);
                if (data.tasks?.length) setTasks(data.tasks);
                if (data.messages?.length) setTenantMessages(data.messages);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    const [maintenanceEvent] = useState({
        active: false,
        title: 'Routine Aircon Cleaning',
        options: ['2024-04-10 (AM)', '2024-04-10 (PM)', '2024-04-11 (AM)']
    });

    const handleLogin = (email, password, property) => {
        setActiveProperty(property);
        if (email === MANAGER_CREDENTIALS.email && password === MANAGER_CREDENTIALS.password) {
            setView('manager');
            return { success: true };
        }
        const tenant = tenants.find(t => t.email.toLowerCase() === email.toLowerCase() && t.password === password);
        if (tenant) {
            setActiveTenantId(tenant.id);
            setView('tenant');
            return { success: true };
        }
        return { success: false, message: 'Invalid email or password' };
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
            await API.saveToSheet('UPDATE', 'Units', updatedUnit);
        }
        setGlobalMessage({ type: 'success', text: `Inventory updated successfully` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleAddBill = async (newBillData, updatedTenants) => {
        const newBill = { ...newBillData, propertyName: activeProperty };
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

    const handleAddTask = async (newTask) => {
        const taskData = { ...newTask, propertyName: activeProperty };
        setTasks([...tasks, taskData]);
        await API.saveToSheet('ADD', 'Tasks', taskData);
        setGlobalMessage({ type: 'success', text: `Maintenance task created for ${activeProperty}!` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const addUnitToCatalog = async (unitData) => {
        const newUnit = { ...unitData, id: `U${Date.now()}`, fittings: [], propertyName: activeProperty };
        setPropertyUnits([...propertyUnits, newUnit]);
        await API.saveToSheet('ADD', 'Units', newUnit);
        setGlobalMessage({ type: 'success', text: `Unit ${unitData.unitNumber} added to catalog` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const addTenant = async (newTenant) => {
        const tenantData = {
            ...newTenant,
            id: `T${Date.now()}`,
            maintenanceSelection: null,
            utilityShare: 0,
            notifications: [],
            leaseDocument: null,
            propertyName: activeProperty
        };
        setTenants([...tenants, tenantData]);
        setPropertyUnits(prev => prev.map(u => u.unitNumber === newTenant.unit ? { ...u, status: 'Occupied' } : u));
        
        // Save tenant
        await API.saveToSheet('ADD', 'Tenants', tenantData);
        // Update unit status
        const unit = propertyUnits.find(u => u.unitNumber === newTenant.unit);
        if (unit) await API.saveToSheet('UPDATE', 'Units', { ...unit, status: 'Occupied' });

        setGlobalMessage({ type: 'success', text: `New lease for Unit ${newTenant.unit} added!` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const editTenant = async (updatedTenant) => {
        setTenants(prev => prev.map(t => t.id === updatedTenant.id ? { ...t, ...updatedTenant } : t));
        if (updatedTenant.unit) {
            setPropertyUnits(prev => prev.map(u => u.unitNumber === updatedTenant.unit ? { ...u, status: 'Occupied' } : u));
            const unit = propertyUnits.find(u => u.unitNumber === updatedTenant.unit);
            if (unit) await API.saveToSheet('UPDATE', 'Units', { ...unit, status: 'Occupied' });
        }
        await API.saveToSheet('UPDATE', 'Tenants', updatedTenant);
        setGlobalMessage({ type: 'success', text: `Lease updated!` });
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleSendMessage = async (msg, photoData = null) => {
        let photoUrl = null;
        
        if (photoData) {
            setGlobalMessage({ type: 'info', text: "Uploading attachment to Drive..." });
            const uploadRes = await API.uploadToDrive(photoData, `msg_${Date.now()}.png`);
            if (uploadRes.success) {
                photoUrl = uploadRes.url;
            }
        }

        const newMessage = {
            id: `MSG${Date.now()}`,
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

    if (view === 'login') return <LoginPage onLogin={handleLogin} />;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Connecting to Cloud Service...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 premium-gradient selection:text-white">
            <AnimatePresence>
            {globalMessage && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[200]"
                >
                    <div className="bg-emerald-600/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-black italic tracking-tight">{globalMessage.text}</span>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <Home className="w-5 h-5" />
                        </div>
                        <span>{import.meta.env.VITE_APP_NAME || "PropManage"} <span className="text-indigo-400 font-normal italic">Pro</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={logout} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 font-black">
                            <Power className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view + activeTenantId}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {view === 'manager' ? (
                            <ManagerDashboard
                                tenants={filteredTenants}
                                propertyUnits={filteredUnits}
                                utilityBills={filteredBills}
                                tasks={filteredTasks}
                                tenantMessages={filteredMessages}
                                onAddUnit={addUnitToCatalog}
                                onAddTenant={addTenant}
                                onEditTenant={editTenant}
                                onUpdateFittings={updateUnitFittings}
                                onAddBill={handleAddBill}
                                onAddTask={handleAddTask}
                                maintenanceEvent={maintenanceEvent}
                            />
                        ) : (
                            <TenantDashboard
                                tenant={tenants.find(t => t.id === activeTenantId)}
                                unit={propertyUnits.find(u => u.unitNumber === tenants.find(t => t.id === activeTenantId)?.unit)}
                                onSendMessage={handleSendMessage}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- Manager Components ---

function ManagerDashboard({ tenants, propertyUnits, utilityBills, tasks, tenantMessages, onAddUnit, onAddTenant, onEditTenant, onUpdateFittings, onAddBill, onAddTask, maintenanceEvent }) {
    const [activeTab, setActiveTab] = useState('rents');
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [showUnitModal, setShowUnitModal] = useState(false);

    const totalRevenue = useMemo(() => tenants.reduce((a, b) => a + (Number(b.baseRent) || 0), 0), [tenants]);
    const vacantUnits = useMemo(() => propertyUnits.filter(u => u.status === 'Available').length, [propertyUnits]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard index={0} title="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<CreditCard className="text-emerald-400" />} />
                <StatCard index={1} title="Occupancy Rate" value={`${Math.round(((propertyUnits.length - vacantUnits) / propertyUnits.length) * 100)}%`} icon={<Users className="text-blue-400" />} />
                <StatCard index={2} title="Available Units" value={vacantUnits} icon={<Building2 className="text-sky-400" />} />
                <StatCard index={3} title="Active Maintenance" value={tasks.length.toString()} icon={<Wrench className="text-amber-400" />} />
            </div>

            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 w-fit overflow-x-auto max-w-full relative">
                {[
                    { id: 'rents', icon: <Receipt className="w-4 h-4" />, label: 'Rent Summary' },
                    { id: 'leases', icon: <FileText className="w-4 h-4" />, label: 'Lease Directory' },
                    { id: 'inventory', icon: <Building2 className="w-4 h-4" />, label: 'Property Catalog' },
                    { id: 'utilities', icon: <Droplets className="w-4 h-4" />, label: 'Utilities Share' },
                    { id: 'tasks', icon: <Hammer className="w-4 h-4" />, label: 'Maintenance' },
                    { id: 'messages', icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', badge: tenantMessages.length > 0 }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`relative px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab.icon} {tab.label}
                        {tab.badge && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'rents' && <RentSummaryTab tenants={tenants} />}
            {activeTab === 'messages' && <MessagesManager tenants={tenants} messages={tenantMessages} />}

            {activeTab === 'tasks' && <TasksManager tenants={tenants} tasks={tasks} onAddTask={onAddTask} />}

            {activeTab === 'leases' && (
                <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6 backdrop-blur-sm shadow-xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-white italic">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Active Leases
                        </h3>
                        <button onClick={() => setShowLeaseModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/10">
                            <PlusCircle className="w-3.5 h-3.5" /> Create Lease
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase text-slate-500 font-black tracking-widest border-b border-white/5">
                                    <th className="pb-4 pl-2">Tenant</th>
                                    <th className="pb-4">Unit</th>
                                    <th className="pb-4">Contract End</th>
                                    <th className="pb-4 text-center">Next Rent Due</th>
                                    <th className="pb-4 text-right">Base Rent</th>
                                    <th className="pb-4 text-right pr-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tenants.map(t => (
                                    <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2 font-bold text-white">{t.name}</td>
                                        <td className="py-4"><span className="text-indigo-400 font-mono text-xs">{t.unit}</span></td>
                                        <td className="py-4 text-slate-400 text-xs">{t.leaseEnd}</td>
                                        <td className="py-4 text-center">
                                            {(() => {
                                                const daysUntil = getDaysUntilDue(t.leaseStart);
                                                const dueDate = calculateNextRentDue(t.leaseStart).toISOString().split('T')[0];
                                                return (
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-[10px] font-black uppercase tracking-tight ${daysUntil <= 3 ? 'text-orange-400 animate-pulse' : 'text-slate-400'}`}>
                                                            {dueDate}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-slate-600 uppercase">
                                                            {daysUntil === 0 ? 'Due Today' : `${daysUntil} days left`}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-4 text-right font-black text-white">${t.baseRent}</td>
                                        <td className="py-4 text-right pr-2">
                                            <div className="flex items-center justify-end gap-2">
                                                {t.mobile && (
                                                    <WhatsAppRentButton tenant={t} />
                                                )}
                                                <button onClick={() => setEditingTenant(t)} className="text-slate-500 hover:text-indigo-400 text-[10px] uppercase font-black tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all flex items-center gap-1.5">
                                                    <Settings className="w-3 h-3" /> Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {propertyUnits.map(unit => {
                        const tenant = tenants.find(t => t.unit === unit.unitNumber);
                        return (
                            <UnitCard
                                key={unit.id}
                                unit={unit}
                                actualRent={tenant?.baseRent}
                                tenantName={tenant?.name}
                                onUpdateFittings={(newFittings) => onUpdateFittings(unit.id, newFittings)}
                            />
                        );
                    })}
                    <button onClick={() => setShowUnitModal(true)} className="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all group">
                        <PlusCircle className="w-10 h-10 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-black uppercase tracking-widest">Add New Unit</span>
                    </button>
                </div>
            )}

            {activeTab === 'utilities' && (
                <UtilityManager tenants={tenants} utilityBills={utilityBills} onAddBill={onAddBill} />
            )}

            {showUnitModal && <UnitModal onClose={() => setShowUnitModal(false)} onSubmit={onAddUnit} />}
            {showLeaseModal && <LeaseModal availableUnits={propertyUnits.filter(u => u.status === 'Available')} onClose={() => setShowLeaseModal(false)} onSubmit={onAddTenant} />}
            {editingTenant && <LeaseModal initialData={editingTenant} availableUnits={propertyUnits.filter(u => u.status === 'Available' || u.unitNumber === editingTenant.unit)} onClose={() => setEditingTenant(null)} onSubmit={(data) => { onEditTenant(data); setEditingTenant(null); }} />}
        </div>
    );
}

// --- Rent Summary Tab ---
function RentSummaryTab({ tenants }) {
    const today = getLocalDate();
    const currentMonthLabel = today.toLocaleString(LOCALE, { month: 'long', year: 'numeric', timeZone: APP_TIMEZONE });

    const upcomingRents = useMemo(() => {
        return tenants.map(t => {
            const dueDate = calculateNextRentDue(t.leaseStart);
            const daysUntil = getDaysUntilDue(t.leaseStart);
            return { ...t, dueDate, daysUntil };
        }).sort((a, b) => a.dueDate - b.dueDate);
    }, [tenants]);

    const totalRevenueThisCycle = useMemo(() => upcomingRents.reduce((a, b) => a + b.baseRent, 0), [upcomingRents]);
    const soonDueCount = upcomingRents.filter(r => r.daysUntil <= 3).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Expected Revenue" value={`$${totalRevenueThisCycle.toLocaleString()}`} icon={<DollarSign className="text-emerald-400" />} />
                <StatCard title="Upcoming Collections" value={upcomingRents.length} icon={<CalendarRange className="text-blue-400" />} />
                <StatCard title="Action Required" value={soonDueCount} icon={<BellRing className={soonDueCount > 0 ? "text-orange-400 animate-bounce" : "text-slate-500"} />} />
            </div>

            <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-8 backdrop-blur-sm shadow-xl">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                    <div>
                        <h3 className="font-bold text-xl text-white italic flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-indigo-400" />
                            Monthly Rent Summary: <span className="text-indigo-400 underline decoration-indigo-400/30 decoration-dashed">{currentMonthLabel}</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                             <Info className="w-3 h-3" /> Rents are generated based on lease start days
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {upcomingRents.map(rent => (
                        <div key={rent.id} className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row items-center justify-between group hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-600/20">{rent.unit}</div>
                                <div>
                                    <p className="text-sm font-black text-white">{rent.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lease Cycle Started: {rent.leaseStart}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-center md:text-right">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Due Date</p>
                                    <p className={`text-lg font-black tracking-tighter ${rent.daysUntil <= 3 ? 'text-orange-400' : 'text-slate-300'}`}>
                                        {rent.dueDate.toISOString().split('T')[0]}
                                    </p>
                                    <p className="text-[8px] font-black text-slate-500 uppercase">{rent.daysUntil === 0 ? 'TODAY' : rent.daysUntil < 0 ? 'OVERDUE' : `${rent.daysUntil} days left`}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Rent Amount</p>
                                    <p className="text-2xl font-black text-emerald-400 tracking-tighter">${rent.baseRent.toLocaleString()}</p>
                                </div>

                                <div className="pl-4 border-l border-white/5 flex items-center gap-2">
                                    {rent.mobile && <WhatsAppRentButton tenant={rent} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MessagesManager({ tenants, messages }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-sm shadow-xl">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                    <h3 className="font-bold text-xl text-white italic flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-indigo-400" />
                        Tenant Communications
                    </h3>
                    <div className="bg-indigo-600/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                        {messages.length} Total Messages
                    </div>
                </div>

                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">No messages from tenants</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const tenant = tenants.find(t => t.id === msg.tenantId);
                            const waReplyLink = tenant ? `https://wa.me/${tenant.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${tenant.name.split(' ')[0]}, received your message: "${msg.content}". \n\n`)}` : '#';

                            return (
                                <div key={msg.id} className="bg-white/5 rounded-3xl p-6 border border-white/5 group hover:border-indigo-500/30 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] text-white">
                                                    {tenant?.unit || '??'}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white text-sm">{tenant?.name || 'Unknown Tenant'}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                        {formatDate(msg.timestamp, true)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-slate-300 text-sm italic leading-relaxed mb-4">
                                                "{msg.content}"
                                            </div>
                                            {msg.photoUrl && (
                                                 <div className="mb-4">
                                                     <a href={msg.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative group">
                                                         <img 
                                                             src={msg.photoUrl} 
                                                             alt="Attachment" 
                                                             className="h-32 w-auto rounded-2xl border border-white/10 shadow-lg group-hover:scale-[1.02] transition-transform" 
                                                         />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                            <ExternalLink className="w-5 h-5 text-white" />
                                                        </div>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full md:w-auto self-end md:self-center">
                                            {tenant && (
                                                <a
                                                    href={waReplyLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all"
                                                >
                                                    <MessageSquare className="w-4 h-4" /> Reply via WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

function WhatsAppRentButton({ tenant }) {
    const dueDate = calculateNextRentDue(tenant.leaseStart).toISOString().split('T')[0];
    const daysUntil = getDaysUntilDue(tenant.leaseStart);
    
    const message = encodeURIComponent(`Hi ${tenant.name.split(' ')[0]},\n\nJust a friendly reminder that your monthly rent of *$${tenant.baseRent.toLocaleString()}* for Unit *${tenant.unit}* is due on *${dueDate}*.\n\nPlease ensure payment is made before the deadline to avoid any late fees.\n\nThank you!`);
    const waLink = `https://wa.me/${tenant.mobile.replace(/\D/g, '')}?text=${message}`;

    const isUrgent = daysUntil <= 3;

    return (
        <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
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

function UtilityManager({ tenants, utilityBills, onAddBill }) {
    const [activeTab, setActiveTab] = useState('new'); // 'new', 'monthly', or 'history'

    const uniqueMonths = Array.from(new Set(utilityBills.map(b => b.date.substring(0, 7)))).sort().reverse();
    if (uniqueMonths.length === 0) {
        uniqueMonths.push(new Date().toISOString().substring(0, 7));
    }
    const [selectedMonth, setSelectedMonth] = useState(uniqueMonths[0]);

    useEffect(() => {
        if (!selectedMonth && uniqueMonths.length > 0) {
            setSelectedMonth(uniqueMonths[0]);
        }
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
                                            <Upload className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
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
                                    <p className="text-xl font-black text-white tracking-tighter">${totalBill.toFixed(2)}</p>
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
                                                <p className="text-lg font-black text-indigo-400 tracking-tighter">${calculatedAmt.toFixed(2)}</p>
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
                <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-white italic"><Calendar className="w-5 h-5 text-indigo-400" /> Monthly Summary</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Month</span>
                            <select className="bg-slate-800 border border-white/10 hover:border-indigo-500/50 rounded-xl px-4 py-2 text-white text-sm font-bold outline-none cursor-pointer" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                                {uniqueMonths.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tenants.map(t => {
                            const billsInMonth = utilityBills.filter(b => b.date.startsWith(selectedMonth));
                            const breakdowns = billsInMonth.reduce((acc, bill) => {
                                const alloc = bill.allocations.find(a => a.tenantId === t.id);
                                if (alloc && alloc.amount > 0) acc.push({ type: bill.type, amount: alloc.amount });
                                return acc;
                            }, []);
                            const totalOwed = breakdowns.reduce((sum, item) => sum + item.amount, 0);

                            return (
                                <div key={t.id} className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center font-black text-sm">{t.unit}</div>
                                        <div>
                                            <p className="text-sm font-black text-white">{t.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.mobile || 'No Contact'}</p>
                                        </div>
                                    </div>
                                    {breakdowns.length > 0 ? (
                                        <div className="space-y-2 mb-6 flex-1">
                                            {breakdowns.map((b, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{b.type}</span>
                                                    <span className="text-slate-300 font-black">${b.amount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center py-4 mb-6">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Bills Allocated</p>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-white/5">
                                        <div className={`${t.mobile && totalOwed > 0 ? 'mb-4' : ''} flex justify-between items-end`}>
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Due</span>
                                            <span className="text-xl font-black text-emerald-400 tracking-tighter">${totalOwed.toFixed(2)}</span>
                                        </div>
                                        {t.mobile && totalOwed > 0 && (
                                            <a
                                                href={`https://wa.me/${t.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${t.name.split(' ')[0]},\n\nYour utility bill summary for ${new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })} is:\n${breakdowns.map(b => `- ${b.type}: $${b.amount.toFixed(2)}`).join('\n')}\n\n*Total Due: $${totalOwed.toFixed(2)}*`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
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
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"><span className="text-indigo-400">{bill.date}</span> • {bill.mode === 'equal' ? 'Standard Split' : 'Designated Split'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-3xl font-black text-white tracking-tighter">${bill.amount.toFixed(2)}</p>
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
                                                        <span className="text-lg font-black text-indigo-400 tracking-tighter">${alloc.amount.toFixed(2)}</span>
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

function TasksManager({ tenants, tasks, onAddTask }) {
    const [title, setTitle] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [dateOptions, setDateOptions] = useState([{ date: '', time: '' }]);

    const handleAddOption = () => {
        setDateOptions([...dateOptions, { date: '', time: '' }]);
    };

    const handleRemoveOption = (index) => {
        setDateOptions(dateOptions.filter((_, i) => i !== index));
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...dateOptions];
        newOptions[index][field] = value;
        setDateOptions(newOptions);
    };

    const isFormValid = title && tenantId && dateOptions.every(opt => opt.date && opt.time);

    const handleAdd = () => {
        if (!isFormValid) return;
        const formattedOptions = dateOptions.map(opt => `${opt.date} ${opt.time}`);
        const newTask = {
            id: `TSK${Date.now()}`,
            title,
            tenantId,
            dateOptions: formattedOptions,
            status: 'Pending Tenant'
        };
        onAddTask(newTask);
        setTitle('');
        setDateOptions([{ date: '', time: '' }]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-sm font-black text-white italic mb-6 flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-indigo-400" /> New Maintenance Task
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Task Title</label>
                            <input type="text" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none focus:ring-1 ring-indigo-500" placeholder="e.g. Aircon Service" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Select Tenant</label>
                            <select className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none focus:ring-1 ring-indigo-500" value={tenantId} onChange={e => setTenantId(e.target.value)}>
                                <option value="">-- Choose Tenant --</option>
                                <option value="ALL">All Tenants (Broadcast)</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Date Options</label>
                            {dateOptions.map((opt, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="date" style={{ colorScheme: 'dark' }} className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none focus:ring-1 ring-indigo-500 min-w-0" value={opt.date} onChange={e => updateOption(index, 'date', e.target.value)} />
                                    <input type="time" style={{ colorScheme: 'dark' }} className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none focus:ring-1 ring-indigo-500 min-w-0" value={opt.time} onChange={e => updateOption(index, 'time', e.target.value)} />
                                    {dateOptions.length > 1 && (
                                        <button onClick={() => handleRemoveOption(index)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div className="flex px-1 mt-1">
                                <button onClick={handleAddOption} className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1 hover:text-indigo-300 transition-colors p-1">
                                    <Plus className="w-3 h-3" /> Add Option
                                </button>
                            </div>
                        </div>
                        <button disabled={!isFormValid} onClick={handleAdd} className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                            <PlusCircle className="w-4 h-4" /> Create Task
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {tasks.slice().reverse().map(task => {
                    const isAll = task.tenantId === 'ALL';
                    const tenant = isAll ? { name: 'All Tenants', unit: 'All', mobile: '' } : tenants.find(t => t.id === task.tenantId);
                    if (!tenant) return null;

                    const waMessage = encodeURIComponent(`Hi ${isAll ? 'there' : tenant.name.split(' ')[0]},\n\nA new maintenance task is required: *${task.title}*.\n\nPlease let me know which of the following time slots works best for you:\n${task.dateOptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nThank you!`);
                    const waLink = `https://wa.me/${tenant.mobile?.replace(/\D/g, '') || ''}?text=${waMessage}`;
                    const waCheckLink = `https://wa.me/${tenant.mobile?.replace(/\D/g, '') || ''}`;

                    return (
                        <div key={task.id} className="bg-slate-900/50 rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h4 className="text-lg font-black text-white flex items-center gap-2">{task.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tenant: <span className="text-indigo-400">{tenant.name}</span> • Unit {tenant.unit}</p>
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {task.dateOptions.map((opt, i) => (
                                        <span key={i} className="bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-white/5">{opt}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all whitespace-nowrap">
                                    <MessageSquare className="w-3.5 h-3.5" /> Notify Tenant
                                </a>
                                <a href={waCheckLink} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all whitespace-nowrap">
                                    <MessageSquare className="w-3.5 h-3.5" /> Check Messages
                                </a>
                            </div>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                    <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-12 text-center text-slate-500 h-full flex flex-col justify-center">
                        <Hammer className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No maintenance tasks scheduled</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Tenant Dashboard (unchanged logic, showing for completeness) ---

function TenantDashboard({ tenant, unit, onSendMessage }) {
    const [showMsgModal, setShowMsgModal] = useState(false);
    const totalDue = tenant.baseRent + tenant.utilityShare;

    if (!tenant) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-white/5">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic">Howdy, {tenant.name.split(' ')[0]}</h2>
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
                        <span className="text-5xl font-black text-white tracking-tighter">${totalDue.toFixed(2)}</span>
                        <span className="text-xs text-slate-500 font-bold">Due now</span>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Base Monthly Rent</span>
                            <span className="text-white font-black">${tenant.baseRent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold flex items-center gap-2">
                                Utility Share <Droplets className="w-3 h-3 text-blue-400" />
                            </span>
                            <span className="text-white font-black">${tenant.utilityShare.toFixed(2)}</span>
                        </div>
                    </div>

                    <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                        Make Instant Payment <ArrowUpRight className="w-4 h-4" />
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
                                    <p className="text-sm font-bold text-white tracking-tight">{tenant.leaseStart}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Lease End</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <p className="text-sm font-bold text-white tracking-tight">{tenant.leaseEnd}</p>
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
            <motion.div 
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
            </motion.div>
        </div>
    );
}

function FittingsModal({ fittings, onClose, onSave }) {
    const [localFittings, setLocalFittings] = useState([...fittings]);
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

function UnitCard({ unit, actualRent, tenantName, onUpdateFittings }) {
    const [activeSubTab, setActiveSubTab] = useState('info');
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const isOccupied = unit.status === 'Occupied';

    return (
        <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl flex flex-col">
            <div className="h-44 bg-slate-800 relative flex items-center justify-center">
                <div className="text-slate-700 flex flex-col items-center gap-2">
                    <ImageIcon className="w-12 h-12 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Unit {unit.unitNumber} Preview</span>
                </div>
                <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${unit.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900/60 text-indigo-300 border-white/5'
                    }`}>
                    {unit.status}
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-2xl font-black text-white tracking-tighter italic">Unit {unit.unitNumber}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1"><Maximize className="w-3.5 h-3.5" /> {unit.size} SQFT</p>
                    </div>
                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                        <button onClick={() => setActiveSubTab('info')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase ${activeSubTab === 'info' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Finance</button>
                        <button onClick={() => setActiveSubTab('fittings')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase ${activeSubTab === 'fittings' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Fittings</button>
                    </div>
                </div>

                <div className="flex-1">
                    {activeSubTab === 'info' ? (
                        <div className="flex justify-between items-center h-full">
                            <div className="space-y-3">
                                {isOccupied && <div className="flex items-center gap-2 text-indigo-400 font-bold bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10 w-fit"><User className="w-4 h-4" /><span className="text-xs">{tenantName}</span></div>}
                            </div>
                            <div className="text-right flex items-center gap-6">
                                <div className="flex flex-col items-end"><p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Target</p><p className="text-xl font-black text-slate-500">${unit.expectedRent}</p></div>
                                {isOccupied && <div className="flex flex-col items-end bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20"><p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Actual</p><p className="text-2xl font-black text-white">${actualRent}</p></div>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="flex flex-wrap gap-2">
                                {unit.fittings?.map((fit, idx) => (<span key={idx} className="bg-white/5 border border-white/5 text-slate-400 text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-tight flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5 text-indigo-500" />{fit}</span>))}
                            </div>
                            <button onClick={() => setShowInventoryModal(true)} className="w-full py-3 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 mt-auto"><PlusCircle className="w-3.5 h-3.5" /> Manage Inventory</button>
                        </div>
                    )}
                </div>
            </div>
            {showInventoryModal && <FittingsModal fittings={unit.fittings || []} onClose={() => setShowInventoryModal(false)} onSave={(newFittings) => { onUpdateFittings(newFittings); setShowInventoryModal(false); }} />}
        </div>
    );
}

function UnitModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({ unitNumber: '', size: '', expectedRent: '', status: 'Available', image: null });
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white italic mb-6 flex items-center gap-3"><Building2 className="w-6 h-6 text-indigo-500" /> Add Unit</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-5">
                    <input required className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" placeholder="Unit Number" value={form.unitNumber} onChange={e => setForm({ ...form, unitNumber: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" placeholder="Size (SQFT)" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} />
                        <input required type="number" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" placeholder="Target Rent ($)" value={form.expectedRent} onChange={e => setForm({ ...form, expectedRent: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">Save Unit</button>
                </form>
            </div>
        </div>
    );
}

function LeaseModal({ initialData, availableUnits, onClose, onSubmit }) {
    const [leaseForm, setLeaseForm] = useState(initialData || { name: '', unit: '', email: '', mobile: '', password: 'password123', baseRent: '', deposit: '', leaseStart: '', leaseEnd: '' });
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white italic flex items-center gap-3">
                        {initialData ? <Settings className="w-6 h-6 text-indigo-500" /> : <PlusCircle className="w-6 h-6 text-emerald-500" />}
                        {initialData ? 'Edit Lease' : 'New Lease'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(leaseForm); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm" placeholder="Name" value={leaseForm.name} onChange={e => setLeaseForm({ ...leaseForm, name: e.target.value })} />
                        <select required className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" value={leaseForm.unit} onChange={e => setLeaseForm({ ...leaseForm, unit: e.target.value })}>
                            <option value="" disabled>Select Unit</option>
                            {availableUnits.map(u => <option key={u.id} value={u.unitNumber}>{u.unitNumber}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="email" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm" placeholder="Email Address" value={leaseForm.email} onChange={e => setLeaseForm({ ...leaseForm, email: e.target.value })} />
                        <input required type="tel" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm" placeholder="WhatsApp Number" value={leaseForm.mobile} onChange={e => setLeaseForm({ ...leaseForm, mobile: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm" placeholder="Rent ($)" value={leaseForm.baseRent} onChange={e => setLeaseForm({ ...leaseForm, baseRent: Number(e.target.value) })} />
                        <input type="number" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm" placeholder="Deposit ($)" value={leaseForm.deposit} onChange={e => setLeaseForm({ ...leaseForm, deposit: Number(e.target.value) })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Lease Start</label>
                            <input required type="date" style={{ colorScheme: 'dark' }} className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" value={leaseForm.leaseStart} onChange={e => setLeaseForm({ ...leaseForm, leaseStart: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Lease End</label>
                            <input required type="date" style={{ colorScheme: 'dark' }} className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm outline-none" value={leaseForm.leaseEnd} onChange={e => setLeaseForm({ ...leaseForm, leaseEnd: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className={`w-full py-4 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] ${initialData ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>{initialData ? 'Save Changes' : 'Create Lease'}</button>
                </form>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, index }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm shadow-xl hover:bg-slate-900/60 hover:border-indigo-500/30 transition-colors"
        >
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
                <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-white/5 shadow-inner">{icon}</div>
            </div>
            <p className="text-3xl font-black text-white tracking-tighter leading-none">{value}</p>
        </motion.div>
    );
}

function LoginPage({ onLogin }) {
    const [property, setProperty] = useState('Skyline Residency');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e) => { 
        e.preventDefault(); 
        const res = onLogin(email, password, property); 
        if (!res.success) setError(res.message); 
    };

    const properties = [
        "Skyline Residency",
        "Parkview Apartments",
        "Emerald Heights",
        "Oakwood Terrace"
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 3 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        className="bg-gradient-to-tr from-indigo-600 to-violet-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40"
                    >
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">PropManage</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Premium Property Suite</p>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-[10px] font-bold border border-red-500/20 text-center uppercase tracking-widest"
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Select Property</label>
                            <div className="relative group">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <select 
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-5 text-white outline-none focus:ring-2 ring-indigo-500/50 transition-all appearance-none cursor-pointer text-sm font-medium"
                                    value={property}
                                    onChange={(e) => setProperty(e.target.value)}
                                >
                                    {properties.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Email Access</label>
                            <input 
                                type="email" 
                                required 
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 px-5 text-white outline-none focus:ring-2 ring-indigo-500/50 transition-all placeholder:text-slate-600" 
                                placeholder="admin@propmanage.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Secure Pin</label>
                            <input 
                                type="password" 
                                required 
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 px-5 text-white outline-none focus:ring-2 ring-indigo-500/50 transition-all placeholder:text-slate-600" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl mt-4 hover:bg-slate-200 transition-all uppercase tracking-widest text-[11px] shadow-xl active:scale-[0.98]"
                        >
                            Launch Dashboard
                        </button>
                    </form>

                    <div className="pt-8 border-t border-white/5 space-y-4">
                        <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-widest">Quick Access Demo</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => { setEmail('admin@propmanage.com'); setPassword('admin') }} className="flex-1 py-3 rounded-xl bg-indigo-500/5 text-indigo-400 text-[9px] font-black border border-indigo-500/10 hover:bg-indigo-500/10 uppercase transition-all tracking-tighter">Manager</button>
                            <button type="button" onClick={() => { setEmail('alice@example.com'); setPassword('password123') }} className="flex-1 py-3 rounded-xl bg-emerald-500/5 text-emerald-400 text-[9px] font-black border border-emerald-500/10 hover:bg-emerald-500/10 uppercase transition-all tracking-tighter">Tenant</button>
                        </div>
                    </div>
                </div>
                
                <p className="text-center mt-10 text-[9px] text-slate-700 font-bold uppercase tracking-widest">
                    &copy; 2026 PROPMANAGE PRO &bull; ENTERPRISE GRADE
                </p>
            </motion.div>
        </div>
    );
}
