import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Approvals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [handling, setHandling] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState({ id: null, status: '' });
    const [note, setNote] = useState('');

    // Search & Group By state
    const [searchTerm, setSearchTerm] = useState('');
    const [groupBy, setGroupBy] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/approvals');
            setRequests(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Error fetching requests');
            setLoading(false);
        }
    };

    const handleAction = (id, status) => {
        setModalAction({ id, status });
        setNote('');
        setShowModal(true);
    };

    const handleConfirm = async () => {
        const { id, status } = modalAction;
        setHandling(id);
        setShowModal(false);
        try {
            await api.post(`/approvals/${id}/handle`, { status, managerNote: note });
            toast.success(`Request ${status.toLowerCase()} successfully`);
            fetchRequests();
        } catch (error) {
            toast.error('Error handling request');
        } finally {
            setHandling(null);
        }
    };

    if (loading) return <div className="p-6">Loading approval requests...</div>;

    const pendingRequests = requests.filter(r => r.status === 'Pending');

    return (
        <div className="p-6">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-8">Pending Approvals</h2>

            {/* Controls Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-8">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Search Requests</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or requester..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    <div className="md:col-span-4 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Group By</label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                            >
                                <option value="">No Grouping</option>
                                <option value="entityType">Entity Type</option>
                                <option value="requestedBy">Requester</option>
                            </select>
                        </div>
                        <button
                            onClick={() => { setSearchTerm(''); setGroupBy(''); }}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 pt-6 group"
                        >
                            <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested By</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(() => {
                            let processed = pendingRequests.filter(r => {
                                if (!searchTerm) return true;
                                const s = searchTerm.toLowerCase();
                                return r.entityName.toLowerCase().includes(s) ||
                                    r.requestedBy?.username?.toLowerCase().includes(s);
                            });

                            if (!groupBy) {
                                return processed.map(request => (
                                    <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${request.entityType === 'Vehicle' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {request.entityType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 text-sm tracking-tight">{request.entityName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{request.requestedBy?.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => handleAction(request._id, 'Approved')}
                                                disabled={handling === request._id}
                                                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-green-100 hover:bg-green-700 disabled:bg-green-200 transition-all"
                                            >
                                                {handling === request._id ? '...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleAction(request._id, 'Rejected')}
                                                disabled={handling === request._id}
                                                className="bg-white text-red-600 border border-red-100 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-red-50 disabled:text-red-200 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ));
                            }

                            const groups = processed.reduce((acc, r) => {
                                let key = '';
                                if (groupBy === 'entityType') key = r.entityType;
                                else if (groupBy === 'requestedBy') key = r.requestedBy?.username || 'Unknown';

                                if (!acc[key]) acc[key] = [];
                                acc[key].push(r);
                                return acc;
                            }, {});

                            return Object.entries(groups).map(([groupName, groupRequests]) => (
                                <React.Fragment key={groupName}>
                                    <tr className="bg-gray-50/50">
                                        <td colSpan="4" className="px-6 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                            {groupBy.toUpperCase()}: {groupName} ({groupRequests.length})
                                        </td>
                                    </tr>
                                    {groupRequests.map(request => (
                                        <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap border-l-4 border-blue-500/10">
                                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${request.entityType === 'Vehicle' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {request.entityType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 text-sm tracking-tight">{request.entityName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{request.requestedBy?.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                <button
                                                    onClick={() => handleAction(request._id, 'Approved')}
                                                    disabled={handling === request._id}
                                                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-green-100 hover:bg-green-700 disabled:bg-green-200 transition-all"
                                                >
                                                    {handling === request._id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request._id, 'Rejected')}
                                                    disabled={handling === request._id}
                                                    className="bg-white text-red-600 border border-red-100 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-red-50 disabled:text-red-200 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ));
                        })()}
                    </tbody>
                </table>
                {pendingRequests.length === 0 && (
                    <div className="p-10 text-center text-gray-500 italic">
                        No pending approval requests.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] animate-fadeIn backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-[450px] shadow-2xl transform transition-all animate-scale-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl ${modalAction.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {modalAction.status === 'Approved' ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {modalAction.status === 'Approved' ? 'Approve Request' : 'Reject Request'}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                You are about to {modalAction.status.toLowerCase()} this request. Please provide an optional note for the user regarding your decision.
                            </p>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Decision Note</label>
                                <textarea
                                    className="w-full border-none bg-gray-50 p-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none h-32"
                                    placeholder="Enter your reason or comments here..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-8 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${modalAction.status === 'Approved'
                                    ? 'bg-green-600 shadow-green-100 hover:bg-green-700'
                                    : 'bg-red-600 shadow-red-100 hover:bg-red-700'
                                    }`}
                            >
                                {modalAction.status === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Approvals;
