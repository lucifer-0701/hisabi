import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Megaphone as AnnouncementIcon, Ticket, LogOut, Plus, Trash2, Edit2,
    CheckCircle2, XCircle, Layout, Chrome, BarChart2, DollarSign,
    Save, X, Image as ImageIcon, Link as LinkIcon, Calendar,
    Users, Activity, Store, AlertCircle, Info
} from 'lucide-react';
import api from '../api/axios';

const SuperAdminDashboard = () => {
    const [view, setView] = useState('analytics'); // analytics, shops, ads, discounts, announcements, logs
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const navigate = useNavigate();

    // Data States
    const [analytics, setAnalytics] = useState({ shops: { total: 0, active: 0 }, usage: { invoices: 0, products: 0 }, revenue: 0 });
    const [shops, setShops] = useState([]);
    const [ads, setAds] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [logs, setLogs] = useState([]);

    // Form States
    const [adForm, setAdForm] = useState({ title: '', image_url: '', link_url: '', placement: 'dashboard_banner', active: true });
    const [discountForm, setDiscountForm] = useState({ code: '', type: 'percent', value: 0, expires_at: '', active: true });
    const [announcementForm, setAnnouncementForm] = useState({ message: '', type: 'info', active: true });

    useEffect(() => {
        const token = localStorage.getItem('superAdminToken');
        if (!token) { navigate('/super-admin-login'); return; }
        fetchData();
        setupInactivityTimer();
    }, [view]);

    // Session Inactivity Timer
    const setupInactivityTimer = () => {
        let timer;
        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            // 15 minutes = 15 * 60 * 1000 ms
            timer = setTimeout(() => {
                handleLogout();
            }, 15 * 60 * 1000);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(evt => window.addEventListener(evt, resetTimer));

        resetTimer(); // Initialize timer

        return () => {
            if (timer) clearTimeout(timer);
            events.forEach(evt => window.removeEventListener(evt, resetTimer));
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'analytics') {
                const res = await api.get('/super-admin/analytics');
                setAnalytics(res.data);
            } else if (view === 'shops') {
                const res = await api.get('/super-admin/shops');
                setShops(res.data);
            } else if (view === 'ads') {
                const res = await api.get('/super-admin/ads');
                setAds(res.data);
            } else if (view === 'discounts') {
                const res = await api.get('/super-admin/discounts');
                setDiscounts(res.data);
            } else if (view === 'announcements') {
                const res = await api.get('/super-admin/announcements');
                setAnnouncements(res.data);
            } else if (view === 'logs') {
                const res = await api.get('/super-admin/logs');
                setLogs(res.data);
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('superAdminToken');
                navigate('/super-admin-login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('superAdminToken');
        navigate('/super-admin-login');
    };

    // Generic Submit Handler (for Ads, Discounts, Announcements)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            let data = {};
            if (view === 'ads') { endpoint = '/super-admin/ads'; data = adForm; }
            else if (view === 'discounts') { endpoint = '/super-admin/discounts'; data = discountForm; }
            else if (view === 'announcements') { endpoint = '/super-admin/announcements'; data = announcementForm; }

            if (editItem) {
                await api.put(`${endpoint}/${editItem.id}`, data);
            } else {
                await api.post(endpoint, data);
            }
            setIsModalOpen(false);
            setEditItem(null);
            fetchData();
        } catch (err) { alert('Failed to save data'); }
    };

    const handleToggleShop = async (shopId, active, plan) => {
        try {
            await api.put(`/super-admin/shops/${shopId}`, { active, plan });
            fetchData();
        } catch (err) { alert('Failed to update shop'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            let endpoint = '';
            if (view === 'ads') endpoint = `/super-admin/ads/${id}`;
            else if (view === 'discounts') endpoint = `/super-admin/discounts/${id}`;
            else if (view === 'announcements') endpoint = `/super-admin/announcements/${id}`;
            await api.delete(endpoint);
            fetchData();
        } catch (err) { alert('Delete failed'); }
    };

    const renderAnalytics = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `${analytics.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Platform Shops', value: analytics.shops.total, sub: `${analytics.shops.active} active`, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Invoices', value: analytics.usage.invoices, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Product Catalog', value: analytics.usage.products, icon: Layout, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</h3>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                        {stat.sub && <p className="text-[10px] font-bold text-slate-400 mt-1">{stat.sub}</p>}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                <h3 className="text-lg font-black text-slate-900 mb-2">Platform Growth</h3>
                <p className="text-sm font-bold text-slate-500 mb-6">Aggregate metrics across all registered shops.</p>
                <div className="h-64 flex items-end justify-between gap-4">
                    {/* Simulated Chart Bars */}
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl relative group hover:bg-slate-100 transition-colors">
                            <div
                                style={{ height: `${h}%` }}
                                className="absolute bottom-0 w-full bg-blue-600/20 group-hover:bg-blue-600 rounded-t-2xl transition-all duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderShops = () => (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Shop Name</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Stats</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {shops.map(shop => (
                        <tr key={shop.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-black text-slate-900">{shop.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">ID: {shop.id.slice(0, 8)}</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-xs font-bold text-slate-600">{shop.email || 'No email'}</p>
                                <p className="text-[10px] text-slate-400">{shop.phone || 'No phone'}</p>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-3">
                                    <div className="text-center">
                                        <p className="text-xs font-black text-slate-900">{shop.productCount || 0}</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Products</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-slate-900">{shop.invoiceCount || 0}</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Invoices</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <select
                                    value={shop.plan}
                                    onChange={(e) => handleToggleShop(shop.id, shop.active, e.target.value)}
                                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none
                                        ${shop.plan === 'gold' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                            shop.plan === 'premium' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'}
                                    `}
                                >
                                    <option value="free">FREE</option>
                                    <option value="gold">GOLD</option>
                                    <option value="premium">PREMIUM</option>
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => handleToggleShop(shop.id, !shop.active, shop.plan)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
                                        ${shop.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}
                                    `}
                                >
                                    {shop.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {shop.active ? 'Active' : 'Suspended'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderLogs = () => (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" /> Recent Admin Actions
                </h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {logs.map(log => (
                    <div key={log.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{log.action}</p>
                                <p className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                            </div>
                            <p className="text-xs font-bold text-slate-500 truncate">
                                {log.admin_username} performed action
                            </p>
                            {log.details && (
                                <div className="mt-2 text-[10px] bg-slate-50 p-2 rounded-lg font-mono text-slate-600">
                                    {JSON.stringify(log.details)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight">Super Admin</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Management</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'analytics', label: 'Overview', icon: BarChart2 },
                        { id: 'shops', label: 'Shops Control', icon: Users },
                        { id: 'announcements', label: 'Push Notices', icon: AnnouncementIcon },
                        { id: 'ads', label: 'Advertisements', icon: Layout },
                        { id: 'discounts', label: 'Tier Codes', icon: Ticket },
                        { id: 'logs', label: 'Activity Logs', icon: Activity },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all group ${view === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <item.icon className={`w-4 h-4 ${view === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} /> {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-64 overflow-y-auto min-h-screen">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                        {view} portal
                    </h2>

                    {['ads', 'discounts', 'announcements'].includes(view) && (
                        <button
                            onClick={() => {
                                setEditItem(null);
                                if (view === 'ads') setAdForm({ title: '', image_url: '', link_url: '', placement: 'dashboard_banner', active: true });
                                if (view === 'discounts') setDiscountForm({ code: '', type: 'percent', value: 0, expires_at: '', active: true });
                                if (view === 'announcements') setAnnouncementForm({ message: '', type: 'info', active: true });
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" /> Create New
                        </button>
                    )}
                </header>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing System...</p>
                        </div>
                    ) : (
                        <>
                            {view === 'analytics' && renderAnalytics()}
                            {view === 'shops' && renderShops()}
                            {view === 'logs' && renderLogs()}

                            {view === 'ads' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {ads.map(ad => (
                                        <div key={ad.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
                                            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                                <img src={ad.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ad.active ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                                                    {ad.active ? 'Live' : 'Hidden'}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{ad.placement.replace('_', ' ')}</p>
                                                <h3 className="font-black text-slate-800 line-clamp-1 mb-4">{ad.title || 'Ad Asset'}</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditItem(ad); setAdForm(ad); setIsModalOpen(true); }} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 p-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold border border-slate-100 italic">
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(ad.id)} className="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition-all border border-red-100">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {view === 'announcements' && (
                                <div className="space-y-4 max-w-3xl">
                                    {announcements.map(notice => (
                                        <div key={notice.id} className={`p-6 rounded-3xl border flex items-start gap-4 transition-all
                                            ${notice.type === 'info' ? 'bg-blue-50/50 border-blue-100' :
                                                notice.type === 'warning' ? 'bg-amber-50/50 border-amber-100' :
                                                    notice.type === 'danger' ? 'bg-red-50/50 border-red-100' :
                                                        'bg-emerald-50/50 border-emerald-100'}
                                        `}>
                                            <div className={`p-2.5 rounded-xl
                                                ${notice.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                                    notice.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                        notice.type === 'danger' ? 'bg-red-100 text-red-600' :
                                                            'bg-emerald-100 text-emerald-600'}
                                            `}>
                                                {notice.type === 'info' && <Info className="w-5 h-5" />}
                                                {notice.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                                                {notice.type === 'danger' && <XCircle className="w-5 h-5" />}
                                                {notice.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Created {new Date(notice.created_at).toLocaleDateString()}</p>
                                                    <button onClick={() => handleDelete(notice.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{notice.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {view === 'discounts' && (
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Code</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Expiry</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {discounts.map(d => (
                                                <tr key={d.id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4"><span className="text-xs font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100">{d.code}</span></td>
                                                    <td className="px-6 py-4 text-xs font-black text-slate-600">{d.value}{d.type === 'percent' ? '%' : ' AED'}</td>
                                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'Evergreen'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Comprehensive Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50">
                            <h3 className="text-xl font-black text-slate-900 uppercase">Create {view}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {view === 'ads' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Campaign Title</label>
                                        <input type="text" required value={adForm.title} onChange={e => setAdForm({ ...adForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:border-blue-500 outline-none" placeholder="Summer Growth Pack..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Asset URL</label>
                                        <input type="text" required value={adForm.image_url} onChange={e => setAdForm({ ...adForm, image_url: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:border-blue-500 outline-none" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Placement Area</label>
                                        <select value={adForm.placement} onChange={e => setAdForm({ ...adForm, placement: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-black focus:border-blue-500 outline-none appearance-none">
                                            <option value="dashboard_banner">Dashboard Main</option>
                                            <option value="billing_banner">Billing & Invoices</option>
                                            <option value="reports_banner">Advanced Reports</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {view === 'announcements' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notice Content</label>
                                        <textarea
                                            required rows={4}
                                            value={announcementForm.message}
                                            onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:border-blue-500 outline-none resize-none"
                                            placeholder="System update scheduled for 2 AM tonight..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notice Type</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['info', 'success', 'warning', 'danger'].map(t => (
                                                <button
                                                    key={t} type="button"
                                                    onClick={() => setAnnouncementForm({ ...announcementForm, type: t })}
                                                    className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all
                                                        ${announcementForm.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200'}
                                                    `}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'discounts' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Code Name</label>
                                        <input type="text" required value={discountForm.code} onChange={e => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-black focus:border-blue-500 outline-none" placeholder="LAUNCH2026" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount</label>
                                        <input type="number" required value={discountForm.value} onChange={e => setDiscountForm({ ...discountForm, value: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit</label>
                                        <select value={discountForm.type} onChange={e => setDiscountForm({ ...discountForm, type: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-black focus:border-blue-500 outline-none">
                                            <option value="percent">% Off</option>
                                            <option value="fixed">AED Off</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm uppercase">
                                <Save className="w-4 h-4" /> Finalize & Push to Platform
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
