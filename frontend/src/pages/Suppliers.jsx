import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Truck, Plus, Search, Edit2, Trash2, Phone, Mail, X, Save, Loader2, Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMPTY = { name: '', phone: '', email: '', address: '', contact_person: '' };

const Avatar = ({ name }) => {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700', 'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-xs font-black flex-shrink-0`}>
            {initials}
        </div>
    );
};

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
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
            const res = await api.get(`/suppliers?search=${search}`);
            setSuppliers(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [search]);

    const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (s) => {
        setEditing(s);
        setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', contact_person: s.contact_person || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) await api.put(`/suppliers/${editing.id}`, form);
            else await api.post('/suppliers', form);
            setShowModal(false);
            fetch();
        } catch (err) { alert(err.response?.data?.error || t('suppliers.errors.save_failed')); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('suppliers.delete_confirm'))) return;
        try { await api.delete(`/suppliers/${id}`); fetch(); }
        catch (err) { alert(err.response?.data?.error || t('suppliers.errors.delete_failed')); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-violet-600">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="page-title">{t('suppliers.title')}</h1>
                        <p className="page-subtitle">{suppliers.length} {t('common.registered')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                        <Search className="input-icon" />
                        <input className="input-with-icon text-sm" placeholder={t('suppliers.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button onClick={openAdd} className="btn-primary flex-shrink-0">
                        <Plus className="w-4 h-4" /> {t('suppliers.add_new')}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('common.company_name')}</th>
                                <th>{t('common.contact_person')}</th>
                                <th>{t('common.phone')}</th>
                                <th>{t('common.email')}</th>
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
                            ) : suppliers.length === 0 ? (
                                <tr><td colSpan={5}>
                                    <div className="empty-state">
                                        <div className="empty-icon"><Truck className="w-5 h-5" /></div>
                                        <p className="empty-title">{search ? t('suppliers.no_results') : t('suppliers.no_data')}</p>
                                        <p className="empty-sub">{t('suppliers.empty_sub')}</p>
                                    </div>
                                </td></tr>
                            ) : (
                                suppliers.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={s.name} />
                                                <span className="font-semibold text-gray-900">{s.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {s.contact_person ? (
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Link2 className="w-3.5 h-3.5" />
                                                    <span>{s.contact_person}</span>
                                                </div>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td>
                                            {s.phone ? (
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <span>{s.phone}</span>
                                                </div>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td>
                                            {s.email ? (
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span>{s.email}</span>
                                                </div>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(s)} className="btn-icon"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(s.id)} className="btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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
                            <h2 className="modal-title">{editing ? t('suppliers.edit') : t('suppliers.add_new')}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">{t('suppliers.name')}</label>
                                    <input className="input-field" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('suppliers.placeholder')} />
                                </div>
                                <div>
                                    <label className="form-label">{t('common.contact_person')}</label>
                                    <input className="input-field" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder={t('suppliers.contact_placeholder')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">{t('common.phone')}</label>
                                        <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+971 00 000 0000" />
                                    </div>
                                    <div>
                                        <label className="form-label">{t('common.email')}</label>
                                        <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="supplier@company.com" />
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
                                    {editing ? t('common.save_changes') : t('suppliers.add_new')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
