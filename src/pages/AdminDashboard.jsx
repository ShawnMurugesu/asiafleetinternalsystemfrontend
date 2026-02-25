import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import FleetManagement from '../components/FleetManagement';
import CategoryManagement from '../components/CategoryManagement';
import UserManagement from '../components/UserManagement';
import BrandManagement from '../components/BrandManagement';
import FleetDetailsModal from '../components/FleetDetailsModal';
import VehicleImage from '../components/VehicleImage';
import VendorManagement from '../components/VendorManagement';
import LogNote from '../components/LogNote';
import Approvals from '../components/Approvals';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const canSeeApprovals = ['Super admin', 'Admin', 'Manager', 'MD'].includes(user?.role);
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex-shrink-0">
                <div className="p-4 border-b border-gray-800">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <nav className="mt-4">
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-800">Overview</Link>
                    <Link to="/admin/fleets" className="block px-4 py-2 hover:bg-gray-800">Fleets</Link>
                    <Link to="/admin/brands" className="block px-4 py-2 hover:bg-gray-800">Brands & Models</Link>
                    <Link to="/admin/vendors" className="block px-4 py-2 hover:bg-gray-800">Vendors</Link>
                    {['Super admin', 'Manager', 'admin', 'MD'].includes(user?.role) && (
                        <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-800">Users</Link>
                    )}
                    {canSeeApprovals && (
                        <Link to="/admin/approvals" className="block px-4 py-2 hover:bg-gray-800">Approvals</Link>
                    )}
                    <Link to="/admin/logs" className="block px-4 py-2 hover:bg-gray-800">Log Note</Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/fleets" element={<FleetManagement />} />
                        <Route path="/brands" element={<BrandManagement />} />
                        <Route path="/categories" element={<CategoryManagement />} />
                        <Route path="/users" element={['Super admin', 'Manager', 'admin', 'MD'].includes(user?.role) ? <UserManagement /> : <Overview />} />
                        <Route path="/vendors" element={<VendorManagement />} />
                        <Route path="/approvals" element={canSeeApprovals ? <Approvals /> : <Overview />} />
                        <Route path="/logs" element={<LogNote />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

const Overview = () => {
    const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, maintenance: 0 });
    const [fleets, setFleets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]); // Fetch users for allocation
    const [loading, setLoading] = useState(true);
    const [selectedFleet, setSelectedFleet] = useState(null);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const fetchData = async () => {
        try {
            const [statsRes, fleetsRes, categoriesRes, brandsRes, usersRes] = await Promise.all([
                api.get('/fleets/stats'),
                api.get('/fleets'),
                api.get('/categories'),
                api.get('/brands'),
                api.get('/users').catch(() => ({ data: [] })) // Fallback if user is not authorized to see users
            ]);
            setStats(statsRes.data);
            setFleets(fleetsRes.data);
            setCategories(categoriesRes.data);
            setBrands(brandsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredFleets = fleets.filter(fleet => {
        const matchesSearch = searchTerm ? (fleet.make + ' ' + fleet.model).toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const matchesCategory = selectedCategory ? (fleet.category?._id === selectedCategory || fleet.category === selectedCategory) : true;
        const matchesBrand = selectedBrand ? fleet.make === selectedBrand : true;
        const matchesModel = selectedModel ? fleet.model === selectedModel : true;
        const matchesMinPrice = minPrice ? fleet.price >= parseFloat(minPrice) : true;
        const matchesMaxPrice = maxPrice ? fleet.price <= parseFloat(maxPrice) : true;
        return matchesSearch && matchesCategory && matchesBrand && matchesModel && matchesMinPrice && matchesMaxPrice;
    });

    const availableModels = selectedBrand
        ? brands.find(b => b.name === selectedBrand)?.models || []
        : [];

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800">Dashboard Overview</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <DashboardCard title="Total Fleet" count={stats.total} color="bg-blue-600" />
                <DashboardCard title="Available" count={stats.available} color="bg-emerald-500" />
                <DashboardCard title="Booked" count={stats.rented} color="bg-rose-500" />
                <DashboardCard title="Maintenance" count={stats.maintenance} color="bg-amber-500" />
            </div>

            {/* Advanced Filters - Matched to reference image pattern */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8">
                    {/* Top Row */}
                    <div className="md:col-span-6">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 leading-none tracking-tight">Search Vehicle</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-4 h-4 absolute left-3 top-3.5 text-gray-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 leading-none tracking-tight">Category</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
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
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 leading-none tracking-tight whitespace-nowrap">Min Price ($)</label>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 leading-none tracking-tight whitespace-nowrap">Max Price ($)</label>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 leading-none tracking-tight">Brand (Make)</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            value={selectedBrand}
                            onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); }}
                        >
                            <option value="">All Brands</option>
                            {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 leading-none tracking-tight">Model</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={!selectedBrand}
                        >
                            <option value="">All Models</option>
                            {availableModels.map((m, i) => <option key={i} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-4 flex items-end pb-3">
                        <button
                            onClick={() => {
                                setSearchTerm(''); setSelectedCategory(''); setSelectedBrand('');
                                setSelectedModel(''); setMinPrice(''); setMaxPrice('');
                            }}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 h-10 px-2 group transition-all"
                        >
                            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reset All Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Vehicle Grid View */}
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Fleet Status ({filteredFleets.length})</h3>
            </div>

            {filteredFleets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFleets.map(fleet => (
                        <VehicleCard key={fleet._id} fleet={fleet} onClick={() => setSelectedFleet(fleet)} />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-medium">No vehicles match your search criteria.</p>
                </div>
            )}

            {/* Modal */}
            {selectedFleet && (
                <FleetDetailsModal
                    fleet={selectedFleet}
                    onClose={() => setSelectedFleet(null)}
                    refreshFleets={fetchData}
                    users={users}
                    isAdmin={true}
                />
            )}
        </div>
    );
};

const DashboardCard = ({ title, count, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-transparent hover:scale-105 transition-transform duration-300 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${color}`}></div>
        <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-gray-800">{count}</p>
    </div>
);

const VehicleCard = ({ fleet, onClick }) => {
    const isAvailable = fleet.status === 'Available';
    const isRented = fleet.status === 'Rented';

    let ribbonColor = 'bg-gray-500';
    if (isAvailable) ribbonColor = 'bg-green-500';
    if (isRented) ribbonColor = 'bg-red-500';

    return (
        <div onClick={onClick} className="bg-white rounded-lg shadow-md overflow-hidden relative group hover:shadow-xl transition-shadow duration-300 cursor-pointer">
            {/* Ribbon */}
            <div className={`absolute top-0 right-0 ${ribbonColor} text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 shadow-sm`}>
                {fleet.status}
            </div>

            {/* Image */}
            <div className="h-48 bg-gray-200 w-full relative overflow-hidden">
                <VehicleImage
                    src={fleet.images && fleet.images.length > 0 ? fleet.images[0] : ''}
                    alt={`${fleet.make} ${fleet.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {/* Details */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg text-gray-800">{fleet.make} {fleet.model}</h4>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-100">
                        {fleet.licensePlate || 'NO PLATE'}
                    </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{fleet.year} • {fleet.category?.name}</p>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-bold text-blue-600">${fleet.price}<span className="text-xs font-normal text-gray-500">/day</span></p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center">
                        <span className="font-semibold mr-1">Trans:</span> {fleet.transmission || 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold mr-1">Fuel:</span> {fleet.fuelType || 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold mr-1">Seats:</span> {fleet.capacity || 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
