import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../api/axios';

const SuperAdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        secret_key: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/super-admin/login', credentials);
            localStorage.setItem('superAdminToken', response.data.token);
            navigate('/super-admin-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Security breach logged.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-white text-center mb-2">Internal Access</h1>
                        <p className="text-slate-400 text-sm text-center mb-8">Authorization Required for System Operations</p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-3 rounded-xl mb-6 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Login Identity</label>
                                <div className="relative">
                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        required
                                        value={credentials.username}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Username"
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Security Credentials</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={credentials.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-12"
                                        placeholder="Password"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="secret_key" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Authority Key</label>
                                <div className="relative">
                                    <input
                                        id="secret_key"
                                        type={showSecret ? "text" : "password"}
                                        name="secret_key"
                                        required
                                        value={credentials.secret_key}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-12"
                                        placeholder="Secret Authority Key"
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                                    >
                                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-4 h-4" /> Authenticate Session</>}
                            </button>
                        </form>
                    </div>
                </div>
                <p className="text-center text-slate-600 text-[10px] mt-8 font-medium uppercase tracking-[0.2em]">Hisabi Internal Management System v2.0</p>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
