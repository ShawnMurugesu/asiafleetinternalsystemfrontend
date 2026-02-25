import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-blue-600">Asia Fleet</span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                        {user ? (
                            <>
                                {['Super admin', 'Manager', 'admin', 'sales person', 'MD'].includes(user.role) && (
                                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                )}
                                {['Super admin', 'Manager', 'admin', 'MD'].includes(user.role) && (
                                    <Link to="/admin/users" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Users</Link>
                                )}
                                <Link to="/change-password" title="Change Password" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ml-2">
                                    <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    {user.username}
                                </Link>
                                <button onClick={handleLogout} className="ml-4 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="ml-4 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
