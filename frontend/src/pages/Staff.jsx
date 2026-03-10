import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, Trash2, Shield, Search, X, Lock, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { usePlan } from '../hooks/usePlan';

const Staff = () => {
    const { t } = useTranslation();
    const { limits } = usePlan();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const maxStaff = limits?.maxStaff || 2;
    const isLimitReached = staff.length >= maxStaff;

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await api.get('/auth/staff');
            setStaff(data);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        if (isLimitReached) {
            alert(`Limit reached. ${maxStaff} staff max.`);
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/auth/staff', formData);
            setFormData({ username: '', password: '' });
            setShowModal(false);
            fetchStaff();
        } catch (error) {
            console.error('Add Staff Error:', error);
            alert(error.response?.data?.error || t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('staff.delete_confirm'))) return;
        try {
            await api.delete(`/auth/staff/${id}`);
            fetchStaff();
        } catch (error) {
            console.error('Delete Staff Error:', error);
            alert(t('common.error'));
        }
    };

    const filteredStaff = staff.filter(s =>
        s.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('staff.title')}</h1>
                    <p className="text-sm text-slate-500 font-medium">{t('staff.subtitle')}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={isLimitReached}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 ${isLimitReached
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                            }`}
                    >
                        {isLimitReached ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {t('staff.add_button')}
                    </button>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isLimitReached ? 'text-red-500' : 'text-slate-400'}`}>
                        Usage: {staff.length} / {maxStaff === Infinity ? '∞' : maxStaff}
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('staff.total_staff')}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{staff.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('staff.active_roles')}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">Staff</p>
                </div>
            </div>

            {/* Table / List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('staff.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('staff.table.username')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('staff.table.role')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('staff.table.date_added')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('staff.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        {t('staff.no_results')}
                                    </td>
                                </tr>
                            ) : filteredStaff.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                                                {s.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{s.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                                            {s.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-left text-sm text-slate-500 font-medium">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-pricing-pop overflow-hidden">
                        <div className="px-8 pt-8 pb-6 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{t('staff.modal.title')}</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">{t('staff.modal.subtitle')}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStaff} className="p-8 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">{t('staff.modal.username')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="e.g. rahul_sales"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">{t('staff.modal.password')}</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('staff.modal.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
