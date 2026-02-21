import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    BarChart3,
    LineChart as LineChartIcon,
    TrendingUp,
    DollarSign,
    Package,
    ShoppingCart,
    AlertCircle,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Wallet
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const Reports = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const currency = user?.shop?.currency || 'AED';
    const isRTL = i18n.language === 'ar';

    const [stats, setStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        netProfit: 0,
        profitMargin: 0,
        totalDue: 0,
        salesChange: 5.2 // Mocked for design
    });

    const [trendData, setTrendData] = useState([]);
    const [summary, setSummary] = useState({
        bestCategory: 'Electronics',
        totalOrders: 0,
        avgOrderValue: 0,
        lowStock: 0
    });

    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = dateRange;

            const [profitRes, trendRes, salesRes, dueStatsRes] = await Promise.all([
                api.get(`/reports/profit?startDate=${startDate}&endDate=${endDate}`),
                api.get(`/reports/trend?startDate=${startDate}&endDate=${endDate}`),
                api.get(`/reports/daily?startDate=${startDate}&endDate=${endDate}`),
                api.get('/due-payments/stats')
            ]);

            const dueStats = dueStatsRes.data;

            setStats({
                totalSales: salesRes.data.totalSales,
                totalRevenue: profitRes.data.totalRevenue,
                netProfit: profitRes.data.totalProfit,
                profitMargin: profitRes.data.margin,
                totalDue: profitRes.data.totalDue || 0,
                totalDueCollected: dueStats.totalCollected,
                totalPendingDues: dueStats.totalPending,
                dueCollectedToday: dueStats.dueToday,
                dueCollectedWeek: dueStats.dueWeek,
                salesChange: 5.2 // Placeholder
            });

            setTrendData(trendRes.data);

            const totalOrders = profitRes.data.invoiceCount || 0;
            setSummary(prev => ({
                ...prev,
                totalOrders,
                avgOrderValue: totalOrders > 0 ? (salesRes.data.totalSales / totalOrders) : 0,
            }));

        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const exportData = () => {
        const headers = [t('common.date'), t('reports.total_sales'), t('reports.total_orders'), t('reports.total_revenue'), t('common.expense'), t('reports.net_profit')].join(',');
        const rows = trendData.map(d => {
            const profit = d.revenue - d.expense;
            return `${d.date},${d.revenue},0,${d.revenue},${d.expense},${profit}`;
        }).join('\n');

        const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        a.click();
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 text-slate-900 overflow-x-hidden">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t('reports.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('reports.subtitle')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className={`flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="w-4 h-4 text-slate-400 mx-2" />
                        <input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="text-sm bg-transparent border-none focus:ring-0 p-0 w-32"
                        />
                        <span className="mx-2 text-slate-300">→</span>
                        <input
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="text-sm bg-transparent border-none focus:ring-0 p-0 w-32"
                        />
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" /> {t('common.export')}
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: t('reports.total_sales'), value: stats.totalSales, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: t('reports.total_revenue'), value: stats.totalRevenue, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: t('reports.net_profit'), value: stats.netProfit, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: t('reports.total_due'), value: stats.totalDue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: t('reports.profit_margin'), value: `${stats.profitMargin.toFixed(1)}%`, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', noCurrency: true }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${kpi.bg}`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <span className={`flex items-center text-xs font-medium ${stats.salesChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stats.salesChange >= 0 ? <ArrowUpRight className="w-3 h-3 mx-1" /> : <ArrowDownRight className="w-3 h-3 mx-1" />}
                                {Math.abs(stats.salesChange)}%
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                            <h3 className="text-2xl font-bold mt-1 tracking-tight">
                                {!kpi.noCurrency && <span className="text-sm font-medium text-slate-400 mx-1">{currency}</span>}
                                {typeof kpi.value === 'number' ? formatCurrency(kpi.value) : kpi.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                            <h3 className="text-lg font-semibold text-slate-900">{t('reports.sales_trend')}</h3>
                            <p className="text-sm text-slate-500">{t('reports.sales_trend_sub')}</p>
                        </div>
                        <LineChartIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' });
                                    }}
                                />
                                <YAxis
                                    orientation={isRTL ? 'right' : 'left'}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: isRTL ? 'right' : 'left' }}
                                    formatter={(val) => [`${currency} ${formatCurrency(val)}`, t('reports.total_revenue')]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0d9488"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                            <h3 className="text-lg font-semibold text-slate-900">{t('reports.revenue_vs_expense')}</h3>
                            <p className="text-sm text-slate-500">{t('reports.revenue_vs_expense_sub')}</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' });
                                    }}
                                />
                                <YAxis
                                    orientation={isRTL ? 'right' : 'left'}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: isRTL ? 'right' : 'left' }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} name={t('reports.total_revenue')} />
                                <Bar dataKey="expense" fill="#94a3b8" radius={[4, 4, 0, 0]} name={t('common.expense')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Summary & Table Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Summary Box */}
                <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 h-fit">
                    <h3 className={`text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 ${isRTL ? 'text-right' : ''}`}>{t('reports.summary')}</h3>
                    <div className="space-y-5">
                        <div className={`flex justify-between items-center text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-slate-500">{t('reports.best_category')}</span>
                            <span className="font-semibold">{summary.bestCategory}</span>
                        </div>
                        <div className={`flex justify-between items-center text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-slate-500">{t('reports.total_orders')}</span>
                            <span className="font-semibold">{summary.totalOrders}</span>
                        </div>
                        <div className={`flex justify-between items-center text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-slate-500">{t('reports.avg_order_value')}</span>
                            <span className="font-semibold">{currency} {formatCurrency(summary.avgOrderValue)}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-bold uppercase text-amber-600">{t('reports.inventory_alerts')}</span>
                            </div>
                            <p className={`text-xs text-slate-500 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                                {summary.lowStock > 0
                                    ? `${summary.lowStock} ${t('products.low_stock_msg')}`
                                    : t('products.stock_safe_msg')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Financial Table */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('invoices.log')}</h3>
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black tracking-widest uppercase">{t('invoices.audited')}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                                <thead>
                                    <tr className="border-b border-slate-100 bg-white">
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('common.date')}</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('reports.total_revenue')}</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('common.expense')}</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('reports.net_profit')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {trendData.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-sm">{t('reports.no_data')}</td></tr>
                                    ) : (
                                        [...trendData].reverse().map((row, idx) => (
                                            <tr key={idx} className={`${idx % 2 === 1 ? 'bg-slate-50/30' : ''} hover:bg-slate-50 transition-colors`}>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-700">
                                                    {new Date(row.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-semibold text-slate-900">{formatCurrency(row.revenue)}</td>
                                                <td className="px-6 py-4 text-xs text-red-500 font-medium">-{formatCurrency(row.expense)}</td>
                                                <td className={`px-6 py-4 text-xs font-bold ${row.revenue - row.expense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {formatCurrency(row.revenue - row.expense)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Due Payment Reports Section */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('reports.due_reports')}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <p className={`text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ${isRTL ? 'text-right' : ''}`}>{t('reports.collection_summary')}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <p className={`text-[10px] font-black text-blue-400 uppercase ${isRTL ? 'text-right' : ''}`}>{t('reports.this_period')}</p>
                                        <p className={`text-xl font-black text-blue-600 mt-1 ${isRTL ? 'text-right' : ''}`}>{currency} {formatCurrency(stats.totalDueCollected || 0)}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <p className={`text-[10px] font-black text-slate-400 uppercase ${isRTL ? 'text-right' : ''}`}>{t('reports.pending_total')}</p>
                                        <p className={`text-xl font-black text-slate-900 mt-1 ${isRTL ? 'text-right' : ''}`}>{currency} {formatCurrency(stats.totalPendingDues || 0)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                                <p className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 inline-block ${isRTL ? 'w-full text-right' : ''}`}>{t('reports.collection_trends')}</p>
                                <div className="space-y-3">
                                    <div className={`flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-xs font-bold text-slate-600">{t('reports.today_collection')}</span>
                                        <span className="text-sm font-black text-slate-900">{currency} {formatCurrency(stats.dueCollectedToday || 0)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-xs font-bold text-slate-600">{t('reports.this_week')}</span>
                                        <span className="text-sm font-black text-slate-900">{currency} {formatCurrency(stats.dueCollectedWeek || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
