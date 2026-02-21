import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Wallet, Plus, Trash2, X, Save, Loader2, Filter, DollarSign, Tag } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

const CATEGORY_COLORS = {
    utilities: 'badge-blue',
    rent: 'badge-amber',
    salaries: 'badge-green',
    marketing: 'badge-blue',
    supplies: 'badge-gray',
    maintenance: 'badge-amber',
    other: 'badge-gray',
};

const EMPTY = { description: '', amount: '', category: 'other', expense_date: today() };

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: monthStart(), endDate: today() });
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/expenses?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
            setExpenses(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [dateRange]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/expenses', form);
            setShowModal(false);
            setForm(EMPTY);
            fetch();
        } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try { await api.delete(`/expenses/${id}`); fetch(); }
        catch (err) { alert('Failed to delete'); }
    };

    const categories = ['utilities', 'rent', 'salaries', 'marketing', 'supplies', 'maintenance', 'other'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-amber-500">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="page-title">Expenses</h1>
                        <p className="page-subtitle">Track business running costs</p>
                    </div>
                </div>
                <button onClick={() => { setForm(EMPTY); setShowModal(true); }} className="btn-primary flex-shrink-0">
                    <Plus className="w-4 h-4" /> Log Expense
                </button>
            </div>

            {/* Summary + Filter row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1 kpi-card">
                    <div className="kpi-icon bg-amber-500">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="kpi-label">Period Total</p>
                    <p className="kpi-value">{loading ? '—' : total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="kpi-sub">{expenses.length} expense records</p>
                </div>

                <div className="sm:col-span-2 card p-5 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="form-label">From</label>
                        <input type="date" className="input-field" value={dateRange.startDate}
                            onChange={e => setDateRange(r => ({ ...r, startDate: e.target.value }))} />
                    </div>
                    <div className="flex-1">
                        <label className="form-label">To</label>
                        <input type="date" className="input-field" value={dateRange.endDate}
                            onChange={e => setDateRange(r => ({ ...r, endDate: e.target.value }))} />
                    </div>
                    <button onClick={fetch} className="btn-ghost flex-shrink-0 h-[38px]">
                        <Filter className="w-4 h-4" /> Apply
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th className="text-right">Amount</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5}><div className="skeleton h-3 w-full rounded" /></td></tr>
                                ))
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan={5}>
                                    <div className="empty-state">
                                        <div className="empty-icon"><Wallet className="w-5 h-5" /></div>
                                        <p className="empty-title">No expenses in this period</p>
                                        <p className="empty-sub">Log an expense to track business costs</p>
                                    </div>
                                </td></tr>
                            ) : (
                                expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td className="font-medium text-gray-900">{exp.description}</td>
                                        <td>
                                            <span className={CATEGORY_COLORS[exp.category] || 'badge-gray'}>
                                                <Tag className="w-2.5 h-2.5" />
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="text-gray-500">
                                            {new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="text-right font-black text-gray-900">
                                            {parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-right">
                                            <button onClick={() => handleDelete(exp.id)} className="btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {expenses.length > 0 && !loading && (
                            <tfoot>
                                <tr className="border-t-2 border-slate-100 bg-slate-50/60">
                                    <td colSpan={3} className="px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Total</td>
                                    <td className="px-5 py-3 text-right text-sm font-black text-slate-900">
                                        {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box max-w-md">
                        <div className="modal-header">
                            <h2 className="modal-title">Log Expense</h2>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">Description *</label>
                                    <input className="input-field" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly office rent" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Amount *</label>
                                        <input className="input-field" type="number" step="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="form-label">Date *</label>
                                        <input className="input-field" type="date" required value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Category</label>
                                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Log Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
