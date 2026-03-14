import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, megaphone, Ticket, LogOut, Plus, Trash2, Edit2,
    CheckCircle2, XCircle, Layout, Chrome, BarChart2, DollarSign,
    Save, X, Image as ImageIcon, Link as LinkIcon, Calendar
} from 'lucide-react';
import api from '../api/axios';

const SuperAdminDashboard = () => {
    const [view, setView] = useState('ads'); // 'ads' or 'discounts'
    const [ads, setAds] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const navigate = useNavigate();

    // Ad Form State
    const [adForm, setAdForm] = useState({
        title: '', image_url: '', link_url: '', placement: 'dashboard_banner', active: true
    });

    // Discount Form State
    const [discountForm, setDiscountForm] = useState({
        code: '', type: 'percent', value: 0, expires_at: '', active: true
    });

    useEffect(() => {
        const token = localStorage.getItem('superAdminToken');
        if (!token) {
            navigate('/super-admin-login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('superAdminToken');
            const headers = { Authorization: `Bearer ${token}` };
            const [adsRes, discsRes] = await Promise.all([
                api.get('/super-admin/ads', { headers }),
                api.get('/super-admin/discounts', { headers })
            ]);
            setAds(adsRes.data);
            setDiscounts(discsRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
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

    const handleAdSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('superAdminToken');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            if (editItem) {
                await api.put(`/super-admin/ads/${editItem.id}`, adForm, { headers });
            } else {
                await api.post('/super-admin/ads', adForm, { headers });
            }
            setIsModalOpen(false);
            setEditItem(null);
            fetchData();
        } catch (err) { alert('Failed to save ad'); }
    };

    const handleDiscountSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('superAdminToken');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            if (editItem) {
                await api.put(`/super-admin/discounts/${editItem.id}`, discountForm, { headers });
            } else {
                await api.post('/super-admin/discounts', discountForm, { headers });
            }
            setIsModalOpen(false);
            setEditItem(null);
            fetchData();
        } catch (err) { alert('Failed to save discount'); }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('superAdminToken');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const endpoint = type === 'ad' ? `/super-admin/ads/${id}` : `/super-admin/discounts/${id}`;
            await api.delete(endpoint, { headers });
            fetchData();
        } catch (err) { alert('Delete failed'); }
    };

    const openEditAd = (ad) => {
        setEditItem(ad);
        setAdForm({ title: ad.title, image_url: ad.image_url, link_url: ad.link_url, placement: ad.placement, active: ad.active });
        setIsModalOpen(true);
    };

    const openEditDiscount = (d) => {
        setEditItem(d);
        setDiscountForm({ code: d.code, type: d.type, value: d.value, expires_at: d.expires_at?.split('T')[0] || '', active: d.active });
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight">Super Admin</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Platform Owner</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setView('ads')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${view === 'ads' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <Layout className="w-4 h-4" /> Advertisements
                    </button>
                    <button
                        onClick={() => setView('discounts')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${view === 'discounts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <Ticket className="w-4 h-4" /> Discount Codes
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {view === 'ads' ? 'Platform Advertisements' : 'Platform Discount Codes'}
                    </h2>
                    <button
                        onClick={() => {
                            setEditItem(null);
                            if (view === 'ads') setAdForm({ title: '', image_url: '', link_url: '', placement: 'dashboard_banner', active: true });
                            else setDiscountForm({ code: '', type: 'percent', value: 0, expires_at: '', active: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New {view === 'ads' ? 'Ad' : 'Code'}
                    </button>
                </header>

                <div className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : view === 'ads' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ads.map(ad => (
                                <div key={ad.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                        <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ad.active ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                                            {ad.active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{ad.placement.replace('_', ' ')}</p>
                                        <h3 className="font-black text-slate-900 mb-4">{ad.title || 'Untitled Ad'}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditAd(ad)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 p-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold border border-slate-100">
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button onClick={() => handleDelete('ad', ad.id)} className="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition-all border border-red-100">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Code</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Expiry</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {discounts.map(d => (
                                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4"><span className="font-black text-slate-900 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">{d.code}</span></td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{d.value}{d.type === 'percent' ? '%' : ' Fixed'}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 capitalize">{d.type}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500">{d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'Never'}</td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${d.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {d.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {d.active ? 'Active' : 'Disabled'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditDiscount(d)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete('disc', d.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50">
                            <h3 className="text-xl font-black text-slate-900">{editItem ? 'Edit' : 'New'} {view === 'ads' ? 'Ad' : 'Discount'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={view === 'ads' ? handleAdSubmit : handleDiscountSubmit} className="p-8 space-y-5">
                            {view === 'ads' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Title</label>
                                        <input type="text" value={adForm.title} onChange={e => setAdForm({ ...adForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" placeholder="Ad Title" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Image URL</label>
                                        <input type="text" required value={adForm.image_url} onChange={e => setAdForm({ ...adForm, image_url: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><LinkIcon className="w-3 h-3" /> Link URL (Optional)</label>
                                        <input type="text" value={adForm.link_url} onChange={e => setAdForm({ ...adForm, link_url: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Placement</label>
                                        <select value={adForm.placement} onChange={e => setAdForm({ ...adForm, placement: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none">
                                            <option value="dashboard_banner">Dashboard Banner</option>
                                            <option value="billing_banner">Billing Banner</option>
                                            <option value="reports_banner">Reports Banner</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Code</label>
                                        <input type="text" required value={discountForm.code} onChange={e => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" placeholder="SAVE20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Type</label>
                                            <select value={discountForm.type} onChange={e => setDiscountForm({ ...discountForm, type: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none">
                                                <option value="percent">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Value</label>
                                            <input type="number" required value={discountForm.value} onChange={e => setDiscountForm({ ...discountForm, value: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Expiry Date</label>
                                        <input type="date" value={discountForm.expires_at} onChange={e => setDiscountForm({ ...discountForm, expires_at: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                                    </div>
                                </>
                            )}

                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={view === 'ads' ? adForm.active : discountForm.active}
                                    onChange={e => view === 'ads' ? setAdForm({ ...adForm, active: e.target.checked }) : setDiscountForm({ ...discountForm, active: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-slate-700">Set as Active</span>
                            </label>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save {view === 'ads' ? 'Advertisement' : 'Discount Code'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
