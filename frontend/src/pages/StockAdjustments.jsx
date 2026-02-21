import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    PackageCheck, Plus, Minus, RotateCcw, AlertTriangle,
    Search, ChevronDown, X, Check, ClipboardList
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TYPES = [
    { value: 'add', label: 'Add Stock', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'remove', label: 'Remove Stock', icon: Minus, color: 'text-red-600', bg: 'bg-red-50' },
    { value: 'correction', label: 'Correction', icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const AdjustModal = ({ products, onClose, onSaved }) => {
    const { t: trans } = useTranslation();
    const [productId, setProductId] = useState('');
    const [type, setType] = useState('add');
    const [qty, setQty] = useState('');
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );
    const selected = products.find(p => p.id === productId);
    const signedQty = type === 'remove' ? -Math.abs(parseInt(qty) || 0) : Math.abs(parseInt(qty) || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productId || !qty) return setError(trans('stock_adj.errors.select_product'));
        setSaving(true); setError('');
        try {
            await api.post('/stock-adjustments', { product_id: productId, quantity_change: signedQty, type, reason });
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || trans('stock_adj.errors.save_failed'));
        } finally { setSaving(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box max-w-lg">
                <div className="modal-header sticky top-0 bg-white">
                    <h2 className="modal-title">{trans('stock_adj.adjust_stock')}</h2>
                    <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-5">
                        {/* Product select */}
                        <div>
                            <label className="form-label">{trans('stock_adj.product_label')}</label>
                            <div className="relative mb-2">
                                <Search className="input-icon" />
                                <input className="input-with-icon text-sm" placeholder={trans('stock_adj.search_products')} value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                                {filtered.map(p => (
                                    <button key={p.id} type="button"
                                        onClick={() => { setProductId(p.id); setSearch(p.name); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${productId === p.id ? 'bg-blue-50 font-bold text-blue-700' : ''}`}
                                    >
                                        <span>{p.name}</span>
                                        <span className="text-xs text-gray-400">Stock: {p.stock_quantity}</span>
                                    </button>
                                ))}
                                {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-4">{trans('pos.no_products')}</p>}
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="form-label">{trans('stock_adj.type')}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {TYPES.map(t => {
                                    const Icon = t.icon;
                                    return (
                                        <button key={t.value} type="button"
                                            onClick={() => setType(t.value)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all ${type === t.value ? `border-blue-500 ${t.bg} ${t.color}` : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <Icon className="w-4 h-4" />{t.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="form-label">{trans('common.qty')}</label>
                            <input type="number" min="1" className="input-field" placeholder={trans('common.qty')} value={qty} onChange={e => setQty(e.target.value)} />
                            {selected && qty && (
                                <p className="text-xs text-gray-400 mt-1.5">
                                    {trans('stock_adj.new_stock')}: <span className={`font-bold ${selected.stock_quantity + signedQty < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {selected.stock_quantity + signedQty}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="form-label">{trans('stock_adj.reason_label')} <span className="text-gray-300 font-normal">({trans('common.optional')})</span></label>
                            <input type="text" className="input-field" placeholder={trans('stock_adj.reason_placeholder')} value={reason} onChange={e => setReason(e.target.value)} />
                        </div>

                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">{trans('common.cancel')}</button>
                        <button type="submit" disabled={saving} className="btn-primary flex-1">
                            {saving ? trans('stock_adj.saving') : trans('stock_adj.apply')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StockAdjustments = () => {
    const { user } = useAuth();
    const { t: trans } = useTranslation();
    const [adjustments, setAdjustments] = useState([]);
    const [products, setProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState('history'); // history | low-stock
    const isAdmin = user?.role === 'admin';

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [adjRes, prodRes, lowRes] = await Promise.all([
                api.get('/stock-adjustments'),
                api.get('/products'),
                api.get('/stock-adjustments/low-stock?threshold=5')
            ]);
            setAdjustments(adjRes.data);
            setProducts(prodRes.data);
            setLowStock(lowRes.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const typeInfo = (type) => TYPES.find(t => t.value === type) || TYPES[2];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-indigo-600"><PackageCheck className="w-5 h-5" /></div>
                    <div>
                        <h1 className="page-title">{trans('stock_adj.title')}</h1>
                        <p className="page-subtitle">{adjustments.length} {trans('stock_adj.adjustments')} · {lowStock.length} {trans('stock_adj.low_stock_alerts')}</p>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <Plus className="w-4 h-4" /> {trans('stock_adj.adjust_stock')}
                    </button>
                )}
            </div>

            {/* Low stock alert banner */}
            {lowStock.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-700">
                        {lowStock.length} {trans('stock_adj.low_stock_banner')}
                        <button onClick={() => setTab('low-stock')} className="ml-2 underline text-red-600">{trans('common.details')}</button>
                    </p>
                </div>
            )}

            {/* Tab switcher */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {[{ key: 'history', label: trans('stock_adj.history') }, { key: 'low-stock', label: `${trans('stock_adj.low_stock')} (${lowStock.length})` }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* History tab */}
            {tab === 'history' && (
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 text-sm">{trans('common.loading')}</div>
                    ) : adjustments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><ClipboardList className="w-6 h-6" /></div>
                            <p className="empty-title">{trans('common.no_data')}</p>
                            <p className="empty-sub">{trans('stock_adj.empty_sub')}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{trans('stock_adj.product_label')}</th>
                                    <th>{trans('stock_adj.type')}</th>
                                    <th className="text-right">{trans('stock_adj.change')}</th>
                                    <th>{trans('common.reason')}</th>
                                    <th>{trans('common.date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adjustments.map(adj => {
                                    const t = typeInfo(adj.type);
                                    return (
                                        <tr key={adj.id}>
                                            <td className="font-bold text-gray-900">{adj.product?.name || '—'}</td>
                                            <td>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${t.bg} ${t.color}`}>
                                                    {t.label}
                                                </span>
                                            </td>
                                            <td className={`text-right font-black ${adj.quantity_change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
                                            </td>
                                            <td className="text-gray-400">{adj.reason || '—'}</td>
                                            <td className="text-gray-400">{new Date(adj.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Low stock tab */}
            {tab === 'low-stock' && (
                <div className="card overflow-hidden">
                    {lowStock.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Check className="w-6 h-6 text-emerald-500" /></div>
                            <p className="empty-title text-emerald-600">{trans('stock_adj.stock_healthy')}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{trans('stock_adj.product_label')}</th>
                                    <th className="text-center">{trans('common.qty')}</th>
                                    <th>{trans('common.status_label')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map(p => (
                                    <tr key={p.id}>
                                        <td className="font-bold text-gray-900">{p.name}</td>
                                        <td className="text-center">
                                            <span className={`inline-flex items-center justify-center w-10 h-7 rounded-lg text-xs font-black ${p.stock_quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                                {p.stock_quantity}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.stock_quantity === 0 ? 'badge-red' : 'badge-amber'}`}>
                                                {p.stock_quantity === 0 ? `⚠ ${trans('pos.stock.out_of_stock')}` : `↓ ${trans('pos.stock.low_stock')}`}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {showModal && (
                <AdjustModal products={products} onClose={() => setShowModal(false)} onSaved={fetchAll} />
            )}
        </div>
    );
};

export default StockAdjustments;
