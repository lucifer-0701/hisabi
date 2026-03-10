import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
    DollarSign, FileText, AlertTriangle, Wallet, Package,
    TrendingUp, ShoppingCart, BarChart2, ArrowUpRight,
    Award, Medal, Target, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';


const SkeletonCard = () => (
    <div className="kpi-card">
        <div className="skeleton w-10 h-10 rounded-xl mb-3" />
        <div className="skeleton h-2.5 w-20 rounded mb-2" />
        <div className="skeleton h-5 w-28 rounded" />
    </div>
);

const KpiCard = memo(({ label, value, icon: Icon, iconBg, sub, subColor = 'text-slate-400' }) => (
    <div className="kpi-card group">
        <div className={`kpi-icon ${iconBg} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
        </div>
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        <p className={`kpi-sub ${subColor}`}>{sub}</p>
    </div>
));

const RankBadge = ({ rank }) => {
    if (rank === 1) return <span className="text-lg">🥇</span>;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return (
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">
            {rank}
        </span>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const { isLocked } = usePlan();
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [targetData, setTargetData] = useState(null);
    const [dashError, setDashError] = useState(null);
    const currency = user?.shop?.currency || 'AED';

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        setDashError(null);
        try {
            const isFullStatsLocked = isLocked('/reports');
            const isTargetsLocked = isLocked('/targets');

            const calls = [];
            if (!isFullStatsLocked) {
                calls.push(api.get('/reports/fullstats'));
            } else {
                calls.push(Promise.resolve({
                    data: {
                        todayRevenue: 0,
                        totalInvoices: 0,
                        lowStockCount: 0,
                        todayExpenses: 0,
                        totalProducts: 0,
                        topProducts: []
                    }, isLocked: true
                }));
            }

            if (!isTargetsLocked) {
                calls.push(api.get('/targets'));
            } else {
                calls.push(Promise.resolve({ data: null, isLocked: true }));
            }

            const results = await Promise.allSettled(calls);

            if (results[0].status === 'fulfilled') {
                setStats(results[0].value.data);
            } else {
                console.error('Full Stats Fetch Error:', results[0].reason);
                // Don't show hard error for 403, just stay empty/locked
                if (results[0].reason?.response?.status !== 403) {
                    setDashError(results[0].reason?.response?.data?.error || 'Failed to load dashboard stats');
                }
            }

            if (results[1] && results[1].status === 'fulfilled') {
                setTargetData(results[1].value.data);
            }
        } catch (err) {
            console.error('Dashboard combined error:', err);
            setDashError('An unexpected error occurred while loading the dashboard.');
        } finally {
            setLoading(false);
        }
    };


    const kpis = stats ? [
        {
            label: t('dashboard.kpi.today_revenue'),
            value: `${currency} ${Number(stats.todayRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            iconBg: 'bg-blue-600',
            sub: t('dashboard.kpi.today_revenue_sub'),
        },
        {
            label: t('dashboard.kpi.total_invoices'),
            value: Number(stats.totalInvoices).toLocaleString(),
            icon: FileText,
            iconBg: 'bg-indigo-500',
            sub: t('dashboard.kpi.total_invoices_sub'),
        },
        {
            label: t('dashboard.kpi.low_stock'),
            value: stats.lowStockCount,
            icon: AlertTriangle,
            iconBg: stats.lowStockCount > 0 ? 'bg-red-500' : 'bg-emerald-500',
            sub: stats.lowStockCount > 0 ? t('dashboard.kpi.low_stock_required') : t('dashboard.kpi.low_stock_healthy'),
            subColor: stats.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-600',
        },
        {
            label: t('dashboard.kpi.today_expenses'),
            value: `${currency} ${Number(stats.todayExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: Wallet,
            iconBg: 'bg-amber-500',
            sub: t('dashboard.kpi.today_expenses_sub'),
        },
        {
            label: t('dashboard.kpi.total_products'),
            value: Number(stats.totalProducts).toLocaleString(),
            icon: Package,
            iconBg: 'bg-slate-700',
            sub: t('dashboard.kpi.total_products_sub'),
        },
    ] : [];

    const quickActions = [
        {
            label: t('dashboard.actions.start_selling'),
            desc: t('dashboard.actions.start_selling_desc'),
            href: '/pos',
            icon: ShoppingCart,
            color: 'from-blue-600 to-blue-500',
        },
        {
            label: t('dashboard.actions.inventory'),
            desc: t('dashboard.actions.inventory_desc'),
            href: '/products',
            icon: Package,
            color: 'from-indigo-600 to-indigo-500',
        },
        {
            label: t('dashboard.actions.analytics'),
            desc: t('dashboard.actions.analytics_desc'),
            href: '/reports',
            icon: TrendingUp,
            color: 'from-slate-800 to-slate-700',
        },
    ];

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return t('dashboard.greetings.morning');
        if (h < 18) return t('dashboard.greetings.afternoon');
        return t('dashboard.greetings.evening');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ── Hero ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white">
                {/* decorative blobs */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{greeting()}</p>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 leading-tight">
                            {user?.username} <span className="text-blue-400">👋</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm max-w-sm">
                            {user?.shop?.name} — {t('dashboard.hero_subtitle')}
                        </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <Link to="/pos"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/30 active:scale-95">
                            <ShoppingCart className="w-4 h-4" /> {t('dashboard.open_pos')}
                        </Link>
                        <Link to="/reports"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors border border-white/10 active:scale-95">
                            <BarChart2 className="w-4 h-4" /> {t('dashboard.reports')}
                        </Link>
                    </div>
                </div>
            </div>
            {/* ── Error State ── */}
            {dashError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Dashboard Error</p>
                        <p className="text-xs text-red-600/80 font-medium">{dashError}</p>
                        <button onClick={fetchAll} className="mt-2 text-xs font-black text-red-700 hover:underline">Try Again</button>
                    </div>
                </div>
            )}

            {/* ── Sales Target ── */}
            {targetData?.currentMonth && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('dashboard.monthly_target')}</span>
                        </div>
                        <Link to="/targets" className="text-xs font-bold text-blue-600 hover:text-blue-700">{t('common.manage')} →</Link>
                    </div>
                    {targetData.currentMonth.target ? (
                        <>
                            <div className="flex justify-between text-sm font-black mb-2">
                                <span className="text-slate-700">{currency} {Number(targetData.currentMonth.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className="text-slate-400">of {currency} {Number(targetData.currentMonth.target).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(100, (targetData.currentMonth.revenue / targetData.currentMonth.target) * 100)}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                                {Math.round((targetData.currentMonth.revenue / targetData.currentMonth.target) * 100)}% {t('dashboard.achieved_this_month')}
                            </p>
                        </>
                    ) : (
                        <Link to="/targets" className="text-xs text-slate-400 hover:text-blue-600 font-medium">{t('dashboard.set_target')} →</Link>
                    )}
                </div>
            )}

            {/* ── KPI Cards ── */}
            <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('dashboard.live_overview')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {loading
                        ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        : kpis.map((k, i) => <KpiCard key={i} {...k} />)
                    }
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('dashboard.quick_actions')}</h2>
                    {quickActions.map((a) => {
                        const Icon = a.icon;
                        return (
                            <Link key={a.href} to={a.href}
                                className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900">{a.label}</p>
                                    <p className="text-xs text-slate-400">{a.desc}</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </Link>
                        );
                    })}
                </div>

                {/* Top Products */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                                <Award className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">{t('dashboard.top_selling')}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{t('dashboard.top_selling_sub')}</p>
                            </div>
                        </div>
                        <Link to="/reports" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            {t('common.details')} <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="space-y-3">
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="skeleton w-7 h-7 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="skeleton h-3 w-3/4 rounded" />
                                            <div className="skeleton h-2 w-1/4 rounded" />
                                        </div>
                                        <div className="skeleton h-4 w-16 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : !stats?.topProducts?.length ? (
                            <div className="empty-state">
                                <div className="empty-icon"><Medal className="w-5 h-5" /></div>
                                <p className="empty-title">{t('dashboard.no_data')}</p>
                                <p className="empty-sub">{t('dashboard.no_data_sub')}</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {stats.topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-7 flex-shrink-0 flex justify-center">
                                            <RankBadge rank={i + 1} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                                            <p className="text-[11px] text-slate-400">{p.quantity} {t('dashboard.units_sold')}</p>
                                        </div>
                                        <span className="text-sm font-black text-blue-600 flex-shrink-0">
                                            {currency} {Number(p.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
