import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Approvals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/approvals';

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
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        const note = prompt('Enter a note for this decision (optional):');
        try {
            await api.post(`/approvals/${id}/handle`, { status, managerNote: note });
            alert(`Request ${status.toLowerCase()} successfully`);
            fetchRequests();
        } catch (error) {
            alert('Error handling request');
        }
    };

    if (loading) return <div className="p-6">Loading approval requests...</div>;

    const pendingRequests = requests.filter(r => r.status === 'Pending');

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Pending Approvals</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pendingRequests.map(request => (
                            <tr key={request._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${request.entityType === 'Vehicle' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {request.entityType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{request.entityName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{request.requestedBy?.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button
                                        onClick={() => handleAction(request._id, 'Approved')}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        Approve & Delete
                                    </button>
                                    <button
                                        onClick={() => handleAction(request._id, 'Rejected')}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pendingRequests.length === 0 && (
                    <div className="p-10 text-center text-gray-500 italic">
                        No pending approval requests.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Approvals;
