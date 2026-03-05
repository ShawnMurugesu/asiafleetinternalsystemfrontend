import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [archiving, setArchiving] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'inactive'
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: '', id: null, name: '' });
    const [formData, setFormData] = useState({
        name: '', nicPassport: '', address: '', mobile: '', landline: ''
    });

    // Search & Group By state
    const [searchTerm, setSearchTerm] = useState('');
    const [groupBy, setGroupBy] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors');
            setVendors(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error('Error fetching vendors');
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/vendors', formData);
            toast.success('Vendor created successfully!');
            setShowModal(false);
            setFormData({ name: '', nicPassport: '', address: '', mobile: '', landline: '' });
            fetchVendors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating vendor');
        } finally {
            setCreating(false);
        }
    };

    const triggerArchive = (id, name) => {
        setConfirmAction({ type: 'Archive', id, name });
        setShowConfirmModal(true);
    };

    const triggerDelete = (id, name) => {
        setConfirmAction({ type: 'Delete', id, name });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        const { type, id } = confirmAction;
        setShowConfirmModal(false);
        if (type === 'Archive') {
            setArchiving(id);
            try {
                await api.put(`/vendors/${id}/archive`);
                toast.success('Vendor archived successfully');
                fetchVendors();
            } catch (error) {
                toast.error('Error archiving vendor');
            } finally {
                setArchiving(null);
            }
        } else if (type === 'Delete') {
            setDeleting(id);
            try {
                const res = await api.delete(`/vendors/${id}/request`);
                toast.success(res.data.message);
                fetchVendors();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error requested deletion');
            } finally {
                setDeleting(null);
            }
        }
    };

    const filteredVendors = vendors.filter(v =>
        activeTab === 'active' ? v.status === 'Active' : v.status === 'Inactive'
    );

    if (loading) return <div>Loading vendors...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Vendor Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Create Vendor
                </button>
            </div>

            <div className="flex space-x-4 mb-8 border-b border-gray-100">
                <button
                    className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Vendors
                </button>
                <button
                    className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('inactive')}
                >
                    Inactive Vendors
                </button>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-6">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Search Vendors</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name, NIC, or mobile..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Group By</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                        >
                            <option value="">No Grouping</option>
                            <option value="address">Address (Area)</option>
                            <option value="hasVehicles">With Vehicles</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            onClick={() => { setSearchTerm(''); setGroupBy(''); }}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 px-2 group"
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
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">NIC/Passport</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicles</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(() => {
                            let processed = (filteredVendors || []).filter(v => {
                                if (!searchTerm) return true;
                                const s = searchTerm.toLowerCase();
                                const name = (v.name || '').toLowerCase();
                                const nic = (v.nicPassport || '').toLowerCase();
                                const mobile = (v.mobile || '');
                                return name.includes(s) || nic.includes(s) || mobile.includes(s);
                            });

                            if (!groupBy) {
                                return processed.map(vendor => (
                                    <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{vendor.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.nicPassport || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-700">{vendor.mobile || 'N/A'}</div>
                                            <div className="text-[10px] text-gray-400 font-bold">{vendor.landline || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => window.location.href = `/admin/fleets?owner=${vendor._id}`}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase hover:bg-blue-100 transition-colors"
                                            >
                                                {vendor.ownedVehicles?.length || 0} Vehicles
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {vendor.status === 'Active' ? (
                                                <button
                                                    onClick={() => triggerArchive(vendor._id, vendor.name)}
                                                    disabled={archiving === vendor._id}
                                                    className="text-orange-600 font-bold hover:text-orange-700 disabled:text-orange-200"
                                                >
                                                    {archiving === vendor._id ? '...' : 'Archive'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => triggerDelete(vendor._id, vendor.name)}
                                                    disabled={deleting === vendor._id}
                                                    className="text-red-600 font-bold hover:text-red-700 disabled:text-red-200"
                                                >
                                                    {deleting === vendor._id ? '...' : 'Delete'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ));
                            }

                            const groups = processed.reduce((acc, v) => {
                                let key = 'Other';
                                if (groupBy === 'address') key = v.address?.split(',')[0] || 'Unknown';
                                else if (groupBy === 'hasVehicles') key = (v.ownedVehicles?.length > 0) ? 'With Vehicles' : 'No Vehicles';

                                if (!acc[key]) acc[key] = [];
                                acc[key].push(v);
                                return acc;
                            }, {});

                            return Object.entries(groups).map(([groupName, groupVendors]) => (
                                <React.Fragment key={groupName}>
                                    <tr className="bg-gray-50/50">
                                        <td colSpan="5" className="px-6 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                            {groupBy.toUpperCase()}: {groupName} ({groupVendors.length})
                                        </td>
                                    </tr>
                                    {groupVendors.map(vendor => (
                                        <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 border-l-4 border-blue-500/10 tracking-tight">{vendor.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.nicPassport || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-700">{vendor.mobile || 'N/A'}</div>
                                                <div className="text-[10px] text-gray-400 font-bold">{vendor.landline || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => window.location.href = `/admin/fleets?owner=${vendor._id}`}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase hover:bg-blue-100 transition-colors"
                                                >
                                                    {vendor.ownedVehicles?.length || 0} Vehicles
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                {vendor.status === 'Active' ? (
                                                    <button
                                                        onClick={() => triggerArchive(vendor._id, vendor.name)}
                                                        disabled={archiving === vendor._id}
                                                        className="text-orange-600 font-bold hover:text-orange-700 disabled:text-orange-200"
                                                    >
                                                        {archiving === vendor._id ? '...' : 'Archive'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => triggerDelete(vendor._id, vendor.name)}
                                                        disabled={deleting === vendor._id}
                                                        className="text-red-600 font-bold hover:text-red-700 disabled:text-red-200"
                                                    >
                                                        {deleting === vendor._id ? '...' : 'Delete'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ));
                        })()}
                    </tbody>
                </table>
            </div>

            {/* Create Vendor Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] animate-fadeIn backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-[450px] shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 uppercase tracking-tight">Create New Vendor</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">NIC/Passport Number</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={formData.nicPassport}
                                    onChange={(e) => setFormData({ ...formData, nicPassport: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Address</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none h-24 resize-none"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Mobile</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Landline</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={formData.landline}
                                        onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Cancel</button>
                                <button type="submit" disabled={creating} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 disabled:bg-blue-300">
                                    {creating ? 'Creating...' : 'Create Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal (Wizard) */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] animate-fadeIn backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-[450px] shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl ${confirmAction.type === 'Archive' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                                {confirmAction.type === 'Archive' ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {confirmAction.type === 'Archive' ? 'Archive Vendor' : 'Delete Vendor Request'}
                            </h3>
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed mb-8">
                            Are you sure you want to {confirmAction.type.toLowerCase()} <strong>{confirmAction.name}</strong>?
                            {confirmAction.type === 'Delete' && ' This will send a deletion request to the Manager for approval.'}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Cancel</button>
                            <button
                                onClick={handleConfirmAction}
                                className={`px-8 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg ${confirmAction.type === 'Archive' ? 'bg-orange-600 shadow-orange-100 hover:bg-orange-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'
                                    }`}
                            >
                                Confirm {confirmAction.type}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorManagement;
