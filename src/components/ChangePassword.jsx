import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChangePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, { password });
            toast.success('Password updated successfully. Please login again.');
            logout();
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {user?.mustChangePassword ? 'Reset Your Password' : 'Change Your Password'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter a new password to continue.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
