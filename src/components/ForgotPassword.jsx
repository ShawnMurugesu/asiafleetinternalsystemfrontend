import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await api.post('/auth/forgot-password', { username });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-black text-gray-800 uppercase tracking-tight">Forgot Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-400 font-medium lowercase tracking-wide">
                        Enter your username (email) to receive a reset link.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Username (Email)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="user@example.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold">{message}</div>}
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-sm uppercase tracking-widest ${loading ? 'opacity-50' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/login" className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
