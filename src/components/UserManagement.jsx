import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const UserManagement = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        username: '', password: '', role: 'viewer'
    });

    const ROLES = ['Super admin', 'Manager', 'sales person', 'MD', 'admin', 'viewer'];

    // Edit/Reset State
    const [resetId, setResetId] = useState(null);
    const [resetPassword, setResetPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (formData.role === 'Super admin') {
            alert('Cannot create Super admin users');
            return;
        }
        try {
            await api.post('/users', formData);
            alert(`User created successfully with temporary password. They will be forced to change it on first login.`);
            setFormData({ username: '', password: '', role: 'viewer' });
            fetchUsers();
        } catch (error) {
            alert('Error creating user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleResetPassword = async (id) => {
        try {
            await api.put(`/users/${id}`, { password: resetPassword });
            alert('Password reset successfully');
            setResetId(null);
            setResetPassword('');
        } catch (error) {
            alert('Error resetting password');
        }
    };

    const handleDeleteRequest = async (user) => {
        if (user.role === 'Super admin') {
            alert('Super admin cannot be deleted');
            return;
        }
        if (confirm(`Request deletion for user ${user.username}? This requires Manager approval.`)) {
            try {
                await api.delete(`/users/${user._id}/request`);
                alert('Deletion request sent to Manager');
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || 'Error requesting deletion');
            }
        }
    };

    if (loading && users.length === 0) return <div className="p-6">Loading Users...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-8">User Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                            Create New User
                        </h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Username (Email)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Temp password"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Role</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    {ROLES.filter(r => r !== 'Super admin').map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-sm mt-4"
                            >
                                Create User
                            </button>
                        </form>
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-tight rounded-lg 
                                                ${user.role === 'Super admin' ? 'bg-red-50 text-red-600' :
                                                    user.role === 'Manager' ? 'bg-purple-50 text-purple-600' :
                                                        'bg-blue-50 text-blue-600'}`}>
                                                {user.role}
                                            </span>
                                            {user.mustChangePassword && (
                                                <span className="ml-2 bg-amber-50 text-amber-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Must Reset</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                {['Super admin', 'admin'].includes(currentUser?.role) && (
                                                    resetId === user._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="password"
                                                                placeholder="New password"
                                                                className="px-3 py-1 bg-gray-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-200"
                                                                value={resetPassword}
                                                                onChange={(e) => setResetPassword(e.target.value)}
                                                            />
                                                            <button onClick={() => handleResetPassword(user._id)} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                                                            <button onClick={() => setResetId(null)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setResetId(user._id)} className="text-blue-600 hover:text-blue-900 border border-blue-100 px-3 py-1 rounded-lg text-xs hover:bg-blue-50 transition-all font-bold">
                                                            Reset Password
                                                        </button>
                                                    )
                                                )}
                                                <button
                                                    onClick={() => handleDeleteRequest(user)}
                                                    disabled={user.role === 'Super admin'}
                                                    className={`p-1.5 rounded-lg transition-all ${user.role === 'Super admin' ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 hover:text-red-700'}`}
                                                    title={user.role === 'Super admin' ? 'Super Admin cannot be deleted' : 'Request Deletion'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
