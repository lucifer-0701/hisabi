import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Search, Wallet, Filter, Calendar,
    User, FileText, ChevronRight, AlertCircle,
    CheckCircle2, Printer, Download, X,
    ArrowUpRight, Clock, DollarSign
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
    <div className={`bg-white p-6 rounded-[2rem] border ${border || 'border-slate-200'} shadow-sm flex items-center gap-5 hover:shadow-md transition-all`}>
        <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center flex-shrink-0 border border-current opacity-80`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
        </div>
    </div>
);

const DueCollection = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const currency = user?.shop?.currency || 'AED';

    const [activeTab, setActiveTab] = useState('pending');
    const [history, setHistory] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({ totalPending: 0, totalCollected: 0, overdueAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [invRes, statsRes, histRes] = await Promise.all([
                api.get(`/due-payments/pending?search=${searchTerm}&status=${filterStatus}`),
                api.get('/due-payments/stats'),
                api.get('/due-payments/history')
            ]);
            setInvoices(invRes.data);
            setStats(statsRes.data);
            setHistory(histRes.data);
        } catch (err) {
            console.error('Failed to fetch due data', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterStatus]);

    useEffect(() => {
        const handler = setTimeout(fetchData, 300);
        return () => clearTimeout(handler);
    }, [fetchData]);

    const handleDownloadReceipt = async (id, num) => {
        try {
            const res = await api.get(`/due-payments/${id}/receipt`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${num}.pdf`;
            a.click();
        } catch { alert(t('invoices.errors.download_failed')); }
    };

    const handleCollectPayment = async (e) => {
        e.preventDefault();
        if (!selectedInvoice || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

        setIsSubmitting(true);
        try {
            const res = await api.post('/due-payments/collect', {
                invoice_id: selectedInvoice.id,
                amount: parseFloat(paymentAmount),
                payment_method: paymentMethod,
                payment_date: paymentDate
            });

            const newPayment = res.data;
            if (window.confirm(t('dues.payment_recorded_confirm'))) {
                handleDownloadReceipt(newPayment.id, newPayment.due_invoice_number);
            }

            setSelectedInvoice(null);
            setPaymentAmount('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || t('dues.errors.collect_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6 lg:p-10 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('dues.title')}</h1>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{t('dues.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            className="w-full md:w-80 pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-bold text-slate-900 outline-none focus:border-blue-400 shadow-sm transition-all placeholder:text-slate-300"
                            placeholder={t('common.search')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center bg-white border border-slate-200 rounded-[1.25rem] p-1.5 shadow-sm">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t('dues.pending')}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t('dues.history')}
                        </button>
                    </div>

                    {activeTab === 'pending' && (
                        <div className="flex items-center bg-white border border-slate-200 rounded-[1.25rem] p-1.5 shadow-sm">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t('common.all')}
                            </button>
                            <button
                                onClick={() => setFilterStatus('partial')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'partial' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t('common.partial')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label={t('dues.total_pending')}
                    value={`${currency} ${formatCurrency(stats.totalPending)}`}
                    icon={Clock}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <StatCard
                    label={t('dues.total_collected')}
                    value={`${currency} ${formatCurrency(stats.totalCollected)}`}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    label={t('dues.overdue')}
                    value={`${currency} ${formatCurrency(stats.overdueAmount)}`}
                    icon={AlertCircle}
                    color="text-red-600"
                    bg="bg-red-50"
                    border={stats.overdueAmount > 0 ? "border-red-200" : ""}
                />
            </div>

            {/* Main Content Table */}
            {activeTab === 'pending' ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dues.customer')}</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dues.original_invoice')}</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dues.date')}</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dues.total_bill')}</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dues.remaining_due')}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dues.status')}</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dues.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-8 py-6 h-20 bg-slate-50/20" />
                                        </tr>
                                    ))
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <FileText className="w-10 h-10" />
                                                </div>
                                                <p className="font-bold text-sm uppercase tracking-widest">{t('dues.no_pending')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none">{inv.customer_name || t('pos.customer_name_default')}</p>
                                                        <div className="flex flex-col gap-0.5 mt-1">
                                                            {inv.customer_phone && <p className="text-[10px] text-slate-400 font-bold tabular-nums">📞 {inv.customer_phone}</p>}
                                                            {inv.customer_email && <p className="text-[10px] text-slate-400 font-bold truncate max-w-[120px]">✉️ {inv.customer_email}</p>}
                                                            {!inv.customer_phone && !inv.customer_email && <p className="text-[10px] text-slate-300 font-bold italic">{t('common.no_contact')}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">#{String(inv.invoice_number).padStart(5, '0')}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-bold text-slate-600">{new Date(inv.date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-slate-900 tabular-nums">
                                                {currency} {formatCurrency(inv.grand_total)}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="text-sm font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg inline-block tabular-nums">
                                                    {currency} {formatCurrency(inv.due_amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.status === 'partial' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedInvoice(inv);
                                                        setPaymentAmount(inv.due_amount);
                                                    }}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95"
                                                >
                                                    {t('dues.collect_due')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Receipt #</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Reference</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Date</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount Collected</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <p className="text-slate-300 font-bold text-sm uppercase tracking-widest">No collection history</p>
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((h) => (
                                        <tr key={h.id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                    <span className="text-xs font-black text-slate-900 tracking-tight">{h.due_invoice_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-black text-slate-900 leading-none">{h.Invoice?.customer_name || t('pos.customer_name_default')}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{t('invoices.invoice_ref')}: #{h.Invoice?.invoice_number}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-bold text-slate-600">{new Date(h.payment_date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-black uppercase tracking-widest text-slate-500">{h.payment_method}</span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-emerald-600 text-sm tabular-nums">
                                                {currency} {formatCurrency(h.amount)}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleDownloadReceipt(h.id, h.due_invoice_number)}
                                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 transition-all"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Collection Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black">{t('dues.collect_payment')}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{t('invoices.title')} #{selectedInvoice.invoice_number}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCollectPayment} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Customer</p>
                                    <p className="text-sm font-black text-slate-900 mt-1 truncate">{selectedInvoice.customer_name || 'Walk-in'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Pending Balance</p>
                                    <p className="text-sm font-black text-red-600 mt-1">{currency} {formatCurrency(selectedInvoice.due_amount)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Collecting Amount ({currency})</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:border-blue-400 transition-all tabular-nums"
                                            value={paymentAmount}
                                            onChange={e => setPaymentAmount(e.target.value)}
                                            required
                                            max={selectedInvoice.due_amount}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {['cash', 'card', 'upi'].map(method => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setPaymentMethod(method)}
                                            className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${paymentMethod === method ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-400 transition-all"
                                            value={paymentDate}
                                            onChange={e => setPaymentDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !paymentAmount}
                                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {t('dues.collect_payment')}
                                        <ArrowUpRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DueCollection;
