import { useState, useEffect } from 'react';
import api from '../services/api';

import FleetDetailsModal from './FleetDetailsModal';
import AddVehicleModal from './AddVehicleModal';
import VehicleImage from './VehicleImage';

const FleetManagement = () => {
    const [fleets, setFleets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedVendorOfFleet, setSelectedVendorOfFleet] = useState('');
    const [selectedFleetForModal, setSelectedFleetForModal] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Fleets
                const fleetsRes = await api.get('/fleets');
                setFleets(fleetsRes.data);
            } catch (error) {
                console.error('Error fetching fleets:', error);
            }

            try {
                // Fetch Categories, Brands, and Vendors
                const [categoriesRes, brandsRes, vendorRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/brands'),
                    api.get('/vendors')
                ]);
                setCategories(categoriesRes.data);
                setBrands(brandsRes.data);
                setVendors(vendorRes.data);

                // Handle 'owner' query param from VendorManagement
                const params = new URLSearchParams(window.location.search);
                const ownerId = params.get('owner');
                if (ownerId) {
                    setSelectedVendorOfFleet(ownerId);
                }
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }

            try {
                // Fetch Users
                const usersRes = await api.get('/users');
                setUsers(usersRes.data);
            } catch (error) {
                console.warn('Error fetching users:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchFleets = async () => {
        const res = await api.get('/fleets');
        setFleets(res.data);
    };

    const handleDelete = async (id) => {
        if (confirm('A deletion request will be sent to the manager for approval. Proceed?')) {
            try {
                await api.post(`/fleets/${id}/delete-request`);
                alert('Deletion request sent correctly.');
                fetchFleets();
            } catch (error) {
                alert(error.response?.data?.message || 'Error sending deletion request');
            }
        }
    };

    const filteredFleets = fleets.filter(fleet => {
        const matchesSearch = searchTerm ? (fleet.make + ' ' + fleet.model + ' ' + (fleet.licensePlate || '')).toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const matchesCategory = selectedCategory ? (fleet.category?._id === selectedCategory || fleet.category === selectedCategory) : true;
        const matchesBrand = selectedBrand ? fleet.make === selectedBrand : true;
        const matchesModel = selectedModel ? fleet.model === selectedModel : true;
        const matchesMinPrice = minPrice ? fleet.price >= parseFloat(minPrice) : true;
        const matchesMaxPrice = maxPrice ? fleet.price <= parseFloat(maxPrice) : true;
        const matchesVendor = selectedVendorOfFleet ? (fleet.owner?._id === selectedVendorOfFleet || fleet.owner === selectedVendorOfFleet) : true;
        return matchesSearch && matchesCategory && matchesBrand && matchesModel && matchesMinPrice && matchesMaxPrice && matchesVendor;
    });

    const availableModels = selectedBrand
        ? brands.find(b => b.name === selectedBrand)?.models || []
        : [];

    if (loading) return <div className="p-6">Loading Fleet...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Fleet Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 font-bold text-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add New Vehicle
                </button>
            </div>

            {/* Advanced Filters - Consistent Pattern */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 gap-x-6">
                    {/* Top Row */}
                    <div className="md:col-span-6">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Search Vehicle</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search make, model, or plate..."
                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Category</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 whitespace-nowrap">Min ($)</label>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 whitespace-nowrap">Max ($)</label>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Brand (Make)</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            value={selectedBrand}
                            onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); }}
                        >
                            <option value="">All Brands</option>
                            {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Model</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={!selectedBrand}
                        >
                            <option value="">All Models</option>
                            {availableModels.map((m, i) => <option key={i} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Owner (Vendor)</label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            value={selectedVendorOfFleet}
                            onChange={(e) => setSelectedVendorOfFleet(e.target.value)}
                        >
                            <option value="">All Vendors</option>
                            {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-4 flex items-end pb-1.5">
                        <button
                            onClick={() => {
                                setSearchTerm(''); setSelectedCategory(''); setSelectedBrand('');
                                setSelectedModel(''); setMinPrice(''); setMaxPrice('');
                                setSelectedVendorOfFleet('');
                                // Also clear query params if present
                                if (window.location.search) {
                                    window.history.replaceState({}, '', window.location.pathname);
                                }
                            }}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 px-2 group"
                        >
                            <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Code remains same */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFleets.map(fleet => (
                            <tr key={fleet._id} onClick={() => setSelectedFleetForModal(fleet)} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-full">
                                            <VehicleImage
                                                className="h-10 w-10 object-cover"
                                                src={fleet.mainImage || (fleet.images && fleet.images.length > 0 ? fleet.images[0] : '')}
                                                alt={`${fleet.make} ${fleet.model}`}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{fleet.make} {fleet.model}</div>
                                            <div className="text-sm text-gray-500">{fleet.year}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                                    {fleet.licensePlate || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fleet.category?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fleet.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fleet.status === 'Available' ? 'bg-green-100 text-green-800' : fleet.status === 'Rented' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {fleet.status}
                                    </span>
                                    {fleet.assignedTo && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Assigned: {fleet.assignedTo.username}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(fleet._id); }} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <AddVehicleModal
                    onClose={() => setShowAddModal(false)}
                    refreshFleets={fetchFleets}
                />
            )}

            {selectedFleetForModal && (
                <FleetDetailsModal
                    fleet={selectedFleetForModal}
                    onClose={() => setSelectedFleetForModal(null)}
                    users={users}
                    isAdmin={true}
                    refreshFleets={fetchFleets}
                />
            )}
            {/* Debug Info */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                <p className="font-bold">Debug Info</p>
                <p>Fleets Loaded: {fleets.length}</p>
                <p>Loading Status: {loading ? 'Loading...' : 'Done'}</p>
                <p>Error: {loading ? 'None' : (fleets.length === 0 ? 'No fleets found' : 'None')}</p>
            </div>
        </div>
    );
};

export default FleetManagement;
