import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, X, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMPTY = { name: '', phone: '', email: '', address: '' };

const Avatar = ({ name }) => {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-xs font-black flex-shrink-0`}>
            {initials}
        </div>
    );
};

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const { t } = useTranslation();

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/customers?search=${search}`);
            setCustomers(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [search]);

    const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) await api.put(`/customers/${editing.id}`, form);
            else await api.post('/customers', form);
            setShowModal(false);
            fetch();
        } catch (err) { alert(err.response?.data?.error || t('customers.errors.save_failed')); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('customers.delete_confirm'))) return;
        try { await api.delete(`/customers/${id}`); fetch(); }
        catch (err) { alert(err.response?.data?.error || t('customers.errors.delete_failed')); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="page-title">{t('customers.title')}</h1>
                        <p className="page-subtitle">{customers.length} {t('common.registered')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                        <Search className="input-icon" />
                        <input className="input-with-icon text-sm" placeholder={t('customers.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button onClick={openAdd} className="btn-primary flex-shrink-0">
                        <Plus className="w-4 h-4" /> {t('customers.add_new')}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('common.name')}</th>
                                <th>{t('common.phone')}</th>
                                <th>{t('common.email')}</th>
                                <th>{t('common.address')}</th>
                                <th className="text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5}>
                                        <div className="flex items-center gap-3"><div className="skeleton w-9 h-9 rounded-xl" /><div className="skeleton h-3 w-40 rounded flex-1" /></div>
                                    </td></tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={5}>
                                    <div className="empty-state">
                                        <div className="empty-icon"><Users className="w-5 h-5" /></div>
                                        <p className="empty-title">{search ? t('customers.no_results') : t('customers.no_data')}</p>
                                        <p className="empty-sub">{t('customers.empty_sub')}</p>
                                    </div>
                                </td></tr>
                            ) : (
                                customers.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={c.name} />
                                                <span className="font-semibold text-gray-900">{c.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {c.phone ? (
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <span>{c.phone}</span>
                                                </div>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td>
                                            {c.email ? (
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span>{c.email}</span>
                                                </div>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="max-w-[180px] truncate text-gray-500">{c.address || <span className="text-gray-300">—</span>}</td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(c)} className="btn-icon"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(c.id)} className="btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box max-w-lg">
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? t('customers.edit') : t('customers.add_new')}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">{t('common.name')}</label>
                                    <input className="input-field" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('customers.placeholder')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">{t('common.phone')}</label>
                                        <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+971 00 000 0000" />
                                    </div>
                                    <div>
                                        <label className="form-label">{t('common.email')}</label>
                                        <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">{t('common.address')}</label>
                                    <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('common.address')} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">{t('common.cancel')}</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editing ? t('common.save_changes') : t('customers.add_new')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
