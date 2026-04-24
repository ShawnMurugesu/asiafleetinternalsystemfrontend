import { useState, useEffect } from 'react';
import api from '../services/api';
import FleetModal from '../components/FleetModal';
import VehicleImage from '../components/VehicleImage';

const Home = () => {
    const [fleets, setFleets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedFleet, setSelectedFleet] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fleetsRes, categoriesRes, brandsRes] = await Promise.all([
                    api.get('/fleets'),
                    api.get('/categories'),
                    api.get('/brands')
                ]);
                setFleets(fleetsRes.data);
                setCategories(categoriesRes.data);
                setBrands(brandsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredFleets = fleets.filter(fleet => {
        const matchesSearch = searchTerm ? (fleet.make + ' ' + fleet.model).toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const matchesCategory = selectedCategory ? fleet.category?._id === selectedCategory : true;
        const matchesBrand = selectedBrand ? fleet.make === selectedBrand : true;
        const matchesModel = selectedModel ? fleet.model === selectedModel : true;
        const matchesMinPrice = minPrice ? fleet.price >= parseFloat(minPrice) : true;
        const matchesMaxPrice = maxPrice ? fleet.price <= parseFloat(maxPrice) : true;

        return matchesSearch && matchesCategory && matchesBrand && matchesModel && matchesMinPrice && matchesMaxPrice;
    });

    // Models for selected brand
    const availableModels = selectedBrand
        ? brands.find(b => b.name === selectedBrand)?.models || []
        : [];

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Find Your Perfect Ride</h1>
            <p className="text-gray-500 mb-8">Premium fleet management at your fingertips.</p>

            {/* Advanced Search Panel - Matched to reference image pattern */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8">
                    {/* Top Row */}
                    <div className="md:col-span-6">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 leading-none tracking-tight">Search Vehicle</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute left-3 top-3 text-gray-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFleets.map((fleet) => (
                    <div key={fleet._id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 flex flex-col cursor-pointer transition hover:shadow-lg" onClick={() => setSelectedFleet(fleet)}>
                        <div className="h-48 w-full bg-gray-200">
                            <VehicleImage
                                src={fleet.images && fleet.images.length > 0 ? fleet.images[0] : ''}
                                alt={fleet.model}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-semibold text-gray-900">{fleet.make} {fleet.model}</h3>
                            <p className="text-sm text-gray-500 mb-2">{fleet.category?.name || 'Uncategorized'}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-lg font-bold text-blue-600">${fleet.price}/day</span>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">View Details</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredFleets.length === 0 && <p className="text-center text-gray-500 mt-10">No vehicles found matching your criteria.</p>}

            {selectedFleet && <FleetModal fleet={selectedFleet} onClose={() => setSelectedFleet(null)} />}
        </div>
    );
};

export default Home;
