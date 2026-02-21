import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Tag, Plus, Trash2, ToggleLeft, ToggleRight,
    Percent, DollarSign, Copy, Check, X, Ticket
} from 'lucide-react';

const CreateModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_order_amount: '', max_uses: '', expires_at: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            await api.post('/discount-codes', {
                ...form,
                value: parseFloat(form.value),
                min_order_amount: parseFloat(form.min_order_amount) || 0,
                max_uses: form.max_uses ? parseInt(form.max_uses) : null,
                expires_at: form.expires_at || null
            });
            onCreated(); onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create code');
        } finally { setSaving(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box max-w-md">
                <div className="modal-header sticky top-0 bg-white">
                    <h2 className="modal-title">New Discount Code</h2>
                    <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div>
                            <label className="form-label">Code</label>
                            <input name="code" value={form.code} onChange={handle} placeholder="e.g. SAVE20" className="input-field uppercase" required />
                        </div>
                        <div>
                            <label className="form-label">Discount Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[{ v: 'percent', l: '% Percentage', icon: Percent }, { v: 'fixed', l: 'Fixed Amount', icon: DollarSign }].map(t => {
                                    const Icon = t.icon;
                                    return (
                                        <button key={t.v} type="button"
                                            onClick={() => setForm({ ...form, type: t.v })}
                                            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${form.type === t.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500'}`}>
                                            <Icon className="w-4 h-4" />{t.l}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Value {form.type === 'percent' ? '(%)' : '(Amount)'}</label>
                            <input name="value" type="number" step="0.01" min="0" value={form.value} onChange={handle} className="input-field" placeholder={form.type === 'percent' ? '10' : '25.00'} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="form-label">Min Order</label>
                                <input name="min_order_amount" type="number" step="0.01" min="0" value={form.min_order_amount} onChange={handle} className="input-field" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="form-label">Max Uses</label>
                                <input name="max_uses" type="number" min="1" value={form.max_uses} onChange={handle} className="input-field" placeholder="Unlimited" />
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Expiry Date <span className="text-gray-300 font-normal">(optional)</span></label>
                            <input name="expires_at" type="date" value={form.expires_at} onChange={handle} className="input-field" />
                        </div>
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
                        <button type="submit" disabled={saving} className="btn-primary flex-1">
                            {saving ? 'Creating...' : 'Create Code'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DiscountCodes = () => {
    const { user } = useAuth();
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(null);
    const isAdmin = user?.role === 'admin';

    useEffect(() => { fetchCodes(); }, []);

    const fetchCodes = async () => {
        try {
            const res = await api.get('/discount-codes');
            setCodes(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleToggle = async (id) => {
        try {
            const res = await api.patch(`/discount-codes/${id}/toggle`);
            setCodes(codes.map(c => c.id === id ? res.data : c));
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this discount code?')) return;
        try {
            await api.delete(`/discount-codes/${id}`);
            setCodes(codes.filter(c => c.id !== id));
        } catch (err) { console.error(err); }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-purple-600"><Ticket className="w-5 h-5" /></div>
                    <div>
                        <h1 className="page-title">Discount Codes</h1>
                        <p className="page-subtitle">{codes.filter(c => c.active).length} active · {codes.length} total</p>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <Plus className="w-4 h-4" /> New Code
                    </button>
                )}
            </div>

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
                ) : codes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Ticket className="w-6 h-6" /></div>
                        <p className="empty-title">No discount codes yet</p>
                        <p className="empty-sub">Create codes to apply at checkout</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th className="text-center">Uses</th>
                                <th className="text-center">Status</th>
                                <th>Expires</th>
                                {isAdmin && <th className="text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {codes.map(code => (
                                <tr key={code.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg text-sm">{code.code}</span>
                                            <button onClick={() => copyCode(code.code)} className="btn-icon">
                                                {copied === code.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="font-bold text-blue-600">
                                        {code.type === 'percent' ? `${code.value}%` : `${user?.shop?.currency || ''} ${code.value}`} off
                                        {code.min_order_amount > 0 && <span className="text-xs text-gray-400 font-normal ml-1">(min {code.min_order_amount})</span>}
                                    </td>
                                    <td className="text-center text-gray-500">
                                        {code.used_count}{code.max_uses ? `/${code.max_uses}` : ''}
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge ${code.active ? 'badge-green' : 'badge-gray'}`}>
                                            {code.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="text-gray-400 text-sm">
                                        {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleToggle(code.id)} className="btn-icon" title={code.active ? 'Deactivate' : 'Activate'}>
                                                    {code.active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                                                </button>
                                                <button onClick={() => handleDelete(code.id)} className="btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && <CreateModal onClose={() => setShowModal(false)} onCreated={fetchCodes} />}
        </div>
    );
};

export default DiscountCodes;
