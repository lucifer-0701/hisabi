import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    ClipboardList, Calendar, TrendingUp, TrendingDown, Package,
    DollarSign, BarChart3, X, MessageSquare
} from 'lucide-react';

const StatBox = ({ label, value, sub, accent }) => (
    <div className={`rounded-2xl p-5 border ${accent}`}>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

const EndOfDay = () => {
    const { user } = useAuth();
    const currency = user?.shop?.currency || 'AED';
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/end-of-day?date=${date}`);
            setReport(res.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const shareWhatsApp = () => {
        if (!report) return;
        const text = `📊 End of Day Report - ${report.date}

💰 Total Sales: ${currency} ${report.totalSales}
🧾 Invoices: ${report.invoiceCount}
📦 Items Sold: ${report.itemsSold}
🏷️ Discounts: ${currency} ${report.totalDiscount}
💵 Cash Collected: ${currency} ${report.cashCollected}
⏳ Outstanding: ${currency} ${report.outstanding}

${report.topProducts.length > 0 ? '🔝 Top Products:\n' + report.topProducts.map((p, i) => `${i + 1}. ${p.name} — ${p.qty} units`).join('\n') : ''}

— Sent from Hisabi POS`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon bg-teal-600"><ClipboardList className="w-5 h-5" /></div>
                    <div>
                        <h1 className="page-title">End-of-Day Report</h1>
                        <p className="page-subtitle">Daily sales summary and cash reconciliation</p>
                    </div>
                </div>
            </div>

            {/* Date picker + generate */}
            <div className="card">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="input-field flex-1" />
                    </div>
                    <button onClick={fetchReport} disabled={loading} className="btn-primary">
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                    {report && (
                        <button onClick={shareWhatsApp}
                            className="btn flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all">
                            <MessageSquare className="w-4 h-4" /> Share via WhatsApp
                        </button>
                    )}
                </div>
            </div>

            {report && (
                <>
                    {/* KPI grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatBox label="Total Sales" value={`${currency} ${report.totalSales}`} accent="border-blue-100 bg-blue-50" />
                        <StatBox label="Invoices" value={report.invoiceCount} sub="transactions" accent="border-indigo-100 bg-indigo-50" />
                        <StatBox label="Items Sold" value={report.itemsSold} sub="units" accent="border-purple-100 bg-purple-50" />
                        <StatBox label="Cash Collected" value={`${currency} ${report.cashCollected}`} accent="border-emerald-100 bg-emerald-50" />
                        <StatBox label="Outstanding" value={`${currency} ${report.outstanding}`} accent={parseFloat(report.outstanding) > 0 ? "border-red-100 bg-red-50" : "border-gray-100 bg-gray-50"} />
                        <StatBox label="Discounts Given" value={`${currency} ${report.totalDiscount}`} accent="border-amber-100 bg-amber-50" />
                    </div>

                    {/* Top products */}
                    {report.topProducts.length > 0 && (
                        <div className="card">
                            <h3 className="text-sm font-black text-gray-900 mb-4">Top Products Today</h3>
                            <div className="space-y-3">
                                {report.topProducts.map((p, i) => {
                                    const maxRev = report.topProducts[0].revenue;
                                    const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="w-5 h-5 flex items-center justify-center text-xs font-black text-gray-400">{i + 1}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-gray-800">{p.name}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{p.qty} units · {currency} {p.revenue.toFixed(2)}</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!report && !loading && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><BarChart3 className="w-6 h-6" /></div>
                        <p className="empty-title">Select a date and generate</p>
                        <p className="empty-sub">Your daily sales summary will appear here</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EndOfDay;
