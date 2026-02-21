import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Target, Plus, Pencil, TrendingUp, X
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SalesTargets = () => {
    const { user } = useAuth();
    const currency = user?.shop?.currency || 'AED';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const isAdmin = user?.role === 'admin';

    useEffect(() => { fetchTargets(); }, []);

    const fetchTargets = async () => {
        try {
            const res = await api.get('/targets');
            setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!amount) return;
        setSaving(true);
        try {
            const now = new Date();
            await api.post('/targets', {
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                target_amount: parseFloat(amount)
            });
            fetchTargets();
            setEditing(false);
            setAmount('');
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const current = data?.currentMonth;
    const pct = current?.target ? Math.min(100, (current.revenue / current.target) * 100) : 0;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-blue-600"><Target className="w-5 h-5" /></div>
                    <div>
                        <h1 className="page-title">Sales Targets</h1>
                        <p className="page-subtitle">Track monthly goal progress</p>
                    </div>
                </div>
                {isAdmin && !editing && (
                    <button onClick={() => setEditing(true)} className="btn-primary">
                        <Pencil className="w-4 h-4" /> {current?.target ? 'Update Target' : 'Set Target'}
                    </button>
                )}
            </div>

            {/* Set target modal */}
            {editing && (
                <div className="card">
                    <h3 className="text-sm font-black text-gray-900 mb-4">
                        Set target for {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
                    </h3>
                    <div className="flex gap-3">
                        <input
                            type="number" step="0.01" min="0"
                            placeholder={`Target amount (${currency})`}
                            className="input-field flex-1"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        <button onClick={handleSave} disabled={saving} className="btn-primary">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditing(false)} className="btn-ghost"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* Current month progress */}
            {!loading && current && (
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900">
                            {MONTHS[(current.month || new Date().getMonth() + 1) - 1]} {current.year || new Date().getFullYear()}
                        </h3>
                        <span className={`badge ${pct >= 100 ? 'badge-green' : pct >= 70 ? 'badge-blue' : 'badge-gray'}`}>
                            {pct >= 100 ? '🎯 Goal Reached!' : `${pct.toFixed(0)}% of target`}
                        </span>
                    </div>

                    {current.target ? (
                        <>
                            <div className="flex justify-between text-sm font-black text-gray-700 mb-3">
                                <span>{currency} {Number(current.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })} earned</span>
                                <span className="text-gray-400">Goal: {currency} {Number(current.target).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <div className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                    style={{ width: `${pct}%` }} />
                            </div>
                            {current.target > current.revenue && (
                                <p className="text-xs text-gray-400">
                                    {currency} {(current.target - current.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })} more needed to reach goal
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon"><Target className="w-5 h-5" /></div>
                            <p className="empty-title">No target set</p>
                            {isAdmin && <p className="empty-sub">Click "Set Target" to create a monthly goal</p>}
                        </div>
                    )}
                </div>
            )}

            {/* Target history */}
            {!loading && data?.targets?.length > 0 && (
                <div className="card overflow-hidden">
                    <h3 className="text-sm font-black text-gray-900 px-2 pb-4">Target History</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th className="text-right">Target</th>
                                <th className="text-right">Actual</th>
                                <th className="text-right">Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.targets.map(t => {
                                const isCurrentMonth = t.month === current?.month && t.year === current?.year;
                                const rev = isCurrentMonth ? current?.revenue : null;
                                return (
                                    <tr key={t.id}>
                                        <td className="font-bold text-gray-900">{MONTHS[t.month - 1]} {t.year}</td>
                                        <td className="text-right font-mono text-sm">{currency} {Number(t.target_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="text-right font-mono text-sm text-gray-400">
                                            {rev != null ? `${currency} ${Number(rev).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td className="text-right">
                                            {rev != null ? (
                                                <span className={`badge ${rev >= t.target_amount ? 'badge-green' : 'badge-gray'}`}>
                                                    {Math.round((rev / t.target_amount) * 100)}%
                                                </span>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SalesTargets;
