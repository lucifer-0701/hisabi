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
import { usePlan } from '../hooks/usePlan';


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
    const [ads, setAds] = useState([]);
    const [targetData, setTargetData] = useState(null);
    const [dashError, setDashError] = useState(null);
    const currency = user?.shop?.currency || 'AED';

    useEffect(() => {
        fetchAll();
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await api.get('/super-admin/public/ads');
            setAds(res.data.filter(ad => ad.placement === 'dashboard_banner'));
        } catch (err) {
            console.error('Ad fetch error:', err);
        }
    };

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
                        todayExpenses: 0,
                        totalProducts: 0,
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
                if (results[0].reason?.response?.status !== 403) {
                    setDashError(results[0].reason?.response?.data?.error || 'Failed to load dashboard stats');
                }
            }

            if (results[1] && results[1].status === 'fulfilled') {
                setTargetData(results[1].value.data);
            }
        } catch (err) {
            setDashError('An unexpected error occurred while loading the dashboard.');
        } finally {
            setLoading(false);
        }
    };


    const allKpis = stats ? [
        {
            id: 'today_revenue',
            label: t('dashboard.kpi.today_revenue'),
            value: `${currency} ${Number(stats.todayRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            iconBg: 'bg-blue-600',
            sub: t('dashboard.kpi.today_revenue_sub'),
        },
        {
            id: 'total_invoices',
            label: t('dashboard.kpi.total_invoices'),
            value: Number(stats.totalInvoices).toLocaleString(),
            icon: FileText,
            iconBg: 'bg-indigo-500',
            sub: t('dashboard.kpi.total_invoices_sub'),
        },
        {
            id: 'today_expenses',
            label: t('dashboard.kpi.today_expenses'),
            value: `${currency} ${Number(stats.todayExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: Wallet,
            iconBg: 'bg-amber-500',
            sub: t('dashboard.kpi.today_expenses_sub'),
        },
        {
            id: 'total_products',
            label: t('dashboard.kpi.total_products'),
            value: Number(stats.totalProducts).toLocaleString(),
            icon: Package,
            iconBg: 'bg-slate-700',
            sub: t('dashboard.kpi.total_products_sub'),
        },
    ] : [];

    const kpis = user?.role === 'staff'
        ? allKpis.filter(k => k.id !== 'today_expenses')
        : allKpis;

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
                        {user?.role !== 'staff' && (
                            <Link to="/reports"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors border border-white/10 active:scale-95">
                                <BarChart2 className="w-4 h-4" /> {t('dashboard.reports')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Ad Banner ── */}
            {ads.length > 0 && (
                <div className="w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group">
                    <a href={ads[0].link_url || '#'} target={ads[0].link_url ? "_blank" : "_self"} rel="noopener noreferrer">
                        <img src={ads[0].image_url} alt={ads[0].title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {ads[0].title && (
                            <div className="absolute bottom-4 left-6">
                                <p className="text-white font-black text-lg drop-shadow-md">{ads[0].title}</p>
                            </div>
                        )}
                    </a>
                </div>
            )}

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

            {/* ── KPI Cards ── */}
            <div className={`grid grid-cols-2 ${user?.role === 'staff' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                {loading
                    ? Array(user?.role === 'staff' ? 3 : 4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : kpis.map((k, i) => <KpiCard key={i} {...k} />)
                }
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Target */}
                {targetData?.currentMonth && (
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('dashboard.monthly_target')}</span>
                                </div>
                                <Link to="/targets" className="text-xs font-bold text-blue-600 hover:text-blue-700">{t('common.manage')} →</Link>
                            </div>
                            {targetData.currentMonth.target ? (
                                <>
                                    <div className="flex justify-between text-lg font-black mb-3">
                                        <span className="text-slate-700">{currency} {Number(targetData.currentMonth.revenue).toLocaleString()}</span>
                                        <span className="text-slate-400 text-sm font-bold">/ {Number(targetData.currentMonth.target).toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (targetData.currentMonth.revenue / targetData.currentMonth.target) * 100)}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 font-bold">
                                            {Math.round((targetData.currentMonth.revenue / targetData.currentMonth.target) * 100)}% {t('dashboard.achieved_this_month')}
                                        </p>
                                        <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-tighter">Live Progress</div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-6 text-center">
                                    <p className="text-slate-400 text-sm font-medium mb-4">No sales target set for this month</p>
                                    <Link to="/targets" className="btn-primary inline-flex text-xs px-6 py-2.5">Set Target</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className={`${targetData?.currentMonth ? 'lg:col-span-2' : 'lg:col-span-3'} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                    {quickActions.map((a) => {
                        const Icon = a.icon;
                        return (
                            <Link key={a.href} to={a.href}
                                className="group flex flex-col justify-between p-6 bg-white rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-lg shadow-blue-500/10 mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-lg font-black text-slate-900">{a.label}</p>
                                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-all" />
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">{a.desc}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
