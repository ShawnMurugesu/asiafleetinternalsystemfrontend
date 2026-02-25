import React, { useState, useEffect } from 'react';
import api from '../services/api';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'inactive'
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', nicPassport: '', address: '', mobile: '', landline: ''
    });

    const API_URL = 'http://localhost:5000/api/vendors';

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
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vendors', formData);
            setShowModal(false);
            setFormData({ name: '', nicPassport: '', address: '', mobile: '', landline: '' });
            fetchVendors();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating vendor');
        }
    };

    const handleArchive = async (id) => {
        try {
            await api.put(`/vendors/${id}/archive`);
            fetchVendors();
        } catch (error) {
            alert('Error archiving vendor');
        }
    };

    const handleDeleteRequest = async (id) => {
        try {
            const res = await api.delete(`/vendors/${id}/request`);
            alert(res.data.message);
            fetchVendors();
        } catch (error) {
            alert(error.response?.data?.message || 'Error requested deletion');
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

            <div className="flex space-x-4 mb-4 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'active' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Vendors
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
                    onClick={() => setActiveTab('inactive')}
                >
                    Inactive Vendors
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIC/Passport</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredVendors.map(vendor => (
                            <tr key={vendor._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{vendor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{vendor.nicPassport}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>{vendor.mobile}</div>
                                    <div className="text-xs text-gray-500">{vendor.landline}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => window.location.href = `/admin/fleets?owner=${vendor._id}`}
                                        className="underline cursor-pointer text-blue-600 hover:text-blue-800"
                                    >
                                        {vendor.ownedVehicles?.length || 0} Vehicles
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    {vendor.status === 'Active' ? (
                                        <button
                                            onClick={() => handleArchive(vendor._id)}
                                            className="text-orange-600 hover:underline"
                                        >
                                            Archive
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDeleteRequest(vendor._id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete (Request)
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Create New Vendor</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full border p-2 rounded"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">NIC/Passport Number</label>
                                <input
                                    type="text" required
                                    className="w-full border p-2 rounded"
                                    value={formData.nicPassport}
                                    onChange={(e) => setFormData({ ...formData, nicPassport: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Address</label>
                                <textarea
                                    required
                                    className="w-full border p-2 rounded"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium">Mobile</label>
                                    <input
                                        type="text" required
                                        className="w-full border p-2 rounded"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Landline</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        value={formData.landline}
                                        onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorManagement;
