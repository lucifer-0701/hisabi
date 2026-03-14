import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const storedUser = localStorage.getItem('user');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If no user in state AND no user in storage, then redirect to login
    if (!user && !storedUser) {
        return <Navigate to="/login" />;
    }

    // Staff Restrictions
    const restrictedPaths = [
        '/reports', '/suppliers', '/purchases',
        '/expenses', '/end-of-day', '/discount-codes',
        '/targets', '/staff', '/profile'
    ];
    const currentPath = window.location.pathname;

    if (user?.role === 'staff' && restrictedPaths.includes(currentPath)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
