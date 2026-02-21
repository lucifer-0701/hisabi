import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    ShoppingBag, Plus, X, Save, Loader2, Package, ChevronDown, ChevronRight,
    Truck, Calendar
} from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];
const EMPTY_ITEM = { product_id: '', quantity: 1, unit_cost: '' };

const Purchases = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ supplier_id: '', order_date: today(), notes: '', items: [{ ...EMPTY_ITEM }] });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [ordRes, prodRes, supRes] = await Promise.all([
                api.get('/purchases'),
                api.get('/products'),
                api.get('/suppliers'),
            ]);
            setOrders(ordRes.data);
            setProducts(prodRes.data);
            setSuppliers(supRes.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const updateItem = (i, key, val) => {
        const items = [...form.items];
        items[i] = { ...items[i], [key]: val };
        setForm({ ...form, items });
    };
    const addItem = () => setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] });
    const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

    const orderTotal = form.items.reduce((s, it) => s + (parseFloat(it.unit_cost) || 0) * (parseInt(it.quantity) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/purchases', form);
            setShowModal(false);
            setForm({ supplier_id: '', order_date: today(), notes: '', items: [{ ...EMPTY_ITEM }] });
            fetchAll();
        } catch (err) { alert(err.response?.data?.error || 'Failed'); }
        finally { setSaving(false); }
    };

    const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-teal-600">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="page-title">Purchase Orders</h1>
                        <p className="page-subtitle">{orders.length} orders</p>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex-shrink-0">
                    <Plus className="w-4 h-4" /> New Order
                </button>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="card p-5 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="skeleton w-9 h-9 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="skeleton h-3 w-40 rounded" />
                                    <div className="skeleton h-2 w-24 rounded" />
                                </div>
                                <div className="skeleton h-5 w-20 rounded" />
                            </div>
                        </div>
                    ))
                ) : orders.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-icon"><ShoppingBag className="w-5 h-5" /></div>
                            <p className="empty-title">No purchase orders yet</p>
                            <p className="empty-sub">Create a new order to restock inventory</p>
                        </div>
                    </div>
                ) : (
                    orders.map(order => {
                        const isOpen = expanded === order.id;
                        return (
                            <div key={order.id} className="card overflow-hidden">
                                {/* Summary row */}
                                <button
                                    onClick={() => setExpanded(isOpen ? null : order.id)}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors text-left"
                                >
                                    <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ShoppingBag className="w-4 h-4 text-teal-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900">PO-{String(order.id).padStart(4, '0')}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            {order.Supplier && (
                                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                    <Truck className="w-3 h-3" /> {order.Supplier.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                <Calendar className="w-3 h-3" /> {fmt(order.order_date)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 flex-shrink-0">
                                        {parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                </button>

                                {/* Expanded items */}
                                {isOpen && (
                                    <div className="border-t border-slate-100 bg-slate-50/50">
                                        {order.notes && (
                                            <div className="px-5 py-3 border-b border-slate-100">
                                                <p className="text-xs text-slate-500"><span className="font-bold">Notes:</span> {order.notes}</p>
                                            </div>
                                        )}
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="text-right">Qty</th>
                                                    <th className="text-right">Unit Cost</th>
                                                    <th className="text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(order.items || []).map((it, idx) => (
                                                    <tr key={idx}>
                                                        <td className="font-medium text-gray-900">{it.product?.name || `Product #${it.product_id}`}</td>
                                                        <td className="text-right">{it.quantity}</td>
                                                        <td className="text-right">{parseFloat(it.unit_cost).toFixed(2)}</td>
                                                        <td className="text-right font-bold">{(it.quantity * parseFloat(it.unit_cost)).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="modal-header sticky top-0 bg-white z-10">
                            <h2 className="modal-title">New Purchase Order</h2>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Supplier</label>
                                        <select className="input-field" value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
                                            <option value="">No supplier</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Order Date</label>
                                        <input className="input-field" type="date" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Notes</label>
                                    <input className="input-field" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes or instructions" />
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="form-label mb-0">Order Items *</label>
                                        <button type="button" onClick={addItem} className="btn-ghost py-1 px-2.5 text-xs">
                                            <Plus className="w-3.5 h-3.5" /> Add Item
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {form.items.map((it, i) => (
                                            <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-5">
                                                    <select className="input-field" required value={it.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                                                        <option value="">Select product</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-3">
                                                    <input className="input-field" type="number" min="1" required placeholder="Qty" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                                                </div>
                                                <div className="col-span-3">
                                                    <input className="input-field" type="number" step="0.01" required placeholder="Cost" value={it.unit_cost} onChange={e => updateItem(i, 'unit_cost', e.target.value)} />
                                                </div>
                                                <button type="button" onClick={() => removeItem(i)} disabled={form.items.length === 1} className="col-span-1 btn p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {orderTotal > 0 && (
                                        <div className="mt-3 flex justify-end">
                                            <span className="text-sm font-black text-gray-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                Order Total: {orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
