import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetsing password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-black text-gray-800 uppercase tracking-tight">Set New Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-400 font-medium lowercase tracking-wide">
                        Enter your new password below.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                placeholder="Repeat password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold">{message} Redirecting...</div>}
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-sm uppercase tracking-widest ${loading ? 'opacity-50' : ''}`}
                        >
                            {loading ? 'Reseting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
