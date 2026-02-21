import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { RotateCcw, Plus, X, Save, Loader2, Package, Info } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];
const EMPTY = { product_id: '', quantity: 1, reason: '', refund_amount: '', invoice_ref: '', return_date: today() };

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [retRes, prodRes] = await Promise.all([api.get('/returns'), api.get('/products')]);
            setReturns(retRes.data);
            setProducts(prodRes.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/returns', form);
            setShowModal(false);
            setForm(EMPTY);
            fetchAll();
        } catch (err) { alert(err.response?.data?.error || 'Failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-rose-500">
                        <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="page-title">Returns</h1>
                        <p className="page-subtitle">Process customer returns & refunds</p>
                    </div>
                </div>
                <button onClick={() => { setForm(EMPTY); setShowModal(true); }} className="btn-primary flex-shrink-0">
                    <Plus className="w-4 h-4" /> Process Return
                </button>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <span className="font-medium">Stock levels are automatically restored when a return is processed.</span>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Reason</th>
                                <th>Invoice Ref</th>
                                <th>Date</th>
                                <th className="text-right">Refund</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={6}><div className="skeleton h-3 w-full rounded" /></td></tr>
                                ))
                            ) : returns.length === 0 ? (
                                <tr><td colSpan={6}>
                                    <div className="empty-state">
                                        <div className="empty-icon"><RotateCcw className="w-5 h-5" /></div>
                                        <p className="empty-title">No returns recorded</p>
                                        <p className="empty-sub">Process a return using the button above</p>
                                    </div>
                                </td></tr>
                            ) : (
                                returns.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-3.5 h-3.5 text-rose-500" />
                                                </div>
                                                <span className="font-medium text-gray-900">{r.product?.name || `Product #${r.product_id}`}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge-red">{r.quantity} units</span></td>
                                        <td className="text-gray-500 max-w-[160px] truncate">{r.reason || '—'}</td>
                                        <td className="text-gray-500">{r.invoice_ref || '—'}</td>
                                        <td className="text-gray-500">
                                            {new Date(r.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="text-right font-black text-gray-900">
                                            {parseFloat(r.refund_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                    <div className="modal-box max-w-md">
                        <div className="modal-header">
                            <h2 className="modal-title">Process Return</h2>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">Product *</label>
                                    <select className="input-field" required value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}>
                                        <option value="">Select a product...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Quantity *</label>
                                        <input className="input-field" type="number" min="1" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="form-label">Refund Amount</label>
                                        <input className="input-field" type="number" step="0.01" value={form.refund_amount} onChange={e => setForm({ ...form, refund_amount: e.target.value })} placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Invoice Reference</label>
                                    <input className="input-field" value={form.invoice_ref} onChange={e => setForm({ ...form, invoice_ref: e.target.value })} placeholder="Original invoice #" />
                                </div>
                                <div>
                                    <label className="form-label">Return Reason</label>
                                    <textarea className="input-field resize-none" rows={2} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Describe the reason..." />
                                </div>
                                <div>
                                    <label className="form-label">Return Date</label>
                                    <input className="input-field" type="date" value={form.return_date} onChange={e => setForm({ ...form, return_date: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                    Process Return
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Returns;
