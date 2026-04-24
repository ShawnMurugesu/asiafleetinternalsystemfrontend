import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LogNote = () => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);

    // Filters
    const [selectedUser, setSelectedUser] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEntity, setSelectedEntity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [groupBy, setGroupBy] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchLogs();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchLogs = async () => {
        setFetching(true);
        try {
            const params = new URLSearchParams();
            if (selectedUser) params.append('user', selectedUser);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (selectedEntity) params.append('entityType', selectedEntity);

            const res = await api.get(`/logs?${params.toString()}`);
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    const handleReset = () => {
        setSelectedUser('');
        setStartDate('');
        setEndDate('');
        setSelectedEntity('');
        // We can't immediately fetch because state updates are async, 
        // but we can call fetchLogs with empty params if we want immediate feedback
    };

    useEffect(() => {
        if (!loading) fetchLogs();
    }, [selectedUser, startDate, endDate, selectedEntity]);

    if (loading) return <div className="p-6 text-gray-500">Loading audit logs...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Audit Logs (Log Note)</h2>
                {fetching && <span className="text-sm text-blue-600 animate-pulse font-medium">Updating...</span>}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 gap-x-6">
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Filter by User</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">All Users</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Entity Type</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                            value={selectedEntity}
                            onChange={(e) => setSelectedEntity(e.target.value)}
                        >
                            <option value="">All Entities</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Vendor">Vendor</option>
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">End Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Search Details</label>
                        <input
                            type="text"
                            placeholder="Search in log details..."
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Group By</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                        >
                            <option value="">No Grouping</option>
                            <option value="user">User</option>
                            <option value="entityType">Entity Type</option>
                            <option value="action">Action</option>
                        </select>
                    </div>

                    <div className="md:col-span-12 flex justify-end gap-4">
                        <button
                            onClick={() => {
                                handleReset();
                                setSearchTerm('');
                                setGroupBy('');
                            }}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 px-2 group"
                        >
                            <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reset All
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {(() => {
                            // Client-side filtering
                            let processedLogs = (logs || []).filter(log => {
                                if (!searchTerm) return true;
                                const s = searchTerm.toLowerCase();
                                const detailsStr = JSON.stringify(log.details || {}).toLowerCase();
                                const entityStr = (log.entityType || '').toLowerCase();
                                const actionStr = (log.action || '').toLowerCase();
                                const userStr = (log.user?.username || '').toLowerCase();
                                return detailsStr.includes(s) ||
                                    entityStr.includes(s) ||
                                    actionStr.includes(s) ||
                                    userStr.includes(s);
                            });

                            if (!groupBy) {
                                return processedLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {log.user?.username || 'System'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${log.action === 'Create' ? 'bg-green-100 text-green-700' :
                                                log.action === 'Update' ? 'bg-yellow-100 text-yellow-700' :
                                                    log.action === 'Delete' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {log.action || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.entityType || 'General'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <pre className="text-xs">{log.details ? JSON.stringify(log.details, null, 2) : '{}'}</pre>
                                        </td>
                                    </tr>
                                ));
                            }

                            // Grouping logic
                            const groups = processedLogs.reduce((acc, log) => {
                                let key = 'Unspecified';
                                if (groupBy === 'user') key = log.user?.username || 'System';
                                else if (groupBy === 'entityType') key = log.entityType || 'General';
                                else if (groupBy === 'action') key = log.action || 'Default';

                                if (!acc[key]) acc[key] = [];
                                acc[key].push(log);
                                return acc;
                            }, {});

                            return Object.entries(groups).map(([groupName, groupLogs]) => (
                                <React.Fragment key={groupName}>
                                    <tr className="bg-gray-100/50">
                                        <td colSpan="5" className="px-6 py-2 text-xs font-black text-gray-500 uppercase tracking-widest">
                                            {groupBy.toUpperCase()}: {groupName} ({groupLogs.length})
                                        </td>
                                    </tr>
                                    {groupLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-l-4 border-blue-500/10">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {log.user?.username || 'System'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action === 'Create' ? 'bg-green-100 text-green-700' :
                                                    log.action === 'Update' ? 'bg-yellow-100 text-yellow-700' :
                                                        log.action === 'Delete' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {log.action || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.entityType || 'General'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <pre className="text-xs">{log.details ? JSON.stringify(log.details, null, 2) : '{}'}</pre>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ));
                        })()}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic">
                        No activity logs found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogNote;
