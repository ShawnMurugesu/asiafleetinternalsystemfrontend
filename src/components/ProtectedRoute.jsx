import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.mustChangePassword && window.location.pathname !== '/change-password') {
        return <Navigate to="/change-password" />;
    }

    // viewer restriction: No access to administrative dashboard
    if (user.role === 'viewer' && window.location.pathname.startsWith('/admin')) {
        return <Navigate to="/" />;
    }

    // If allowedRoles is provided, check against user role
    if (allowedRoles) {
        // Super admin always has access
        if (user.role === 'Super admin') return children;

        if (!allowedRoles.includes(user.role)) {
            return <Navigate to="/" />;
        }
    }

    return children;
};

export default ProtectedRoute;
