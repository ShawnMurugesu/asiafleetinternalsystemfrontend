import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const BrandManagement = () => {
    const [brands, setBrands] = useState([]);
    const [newBrand, setNewBrand] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [newModel, setNewModel] = useState('');
    const [brandAdding, setBrandAdding] = useState(false);
    const [modelAdding, setModelAdding] = useState(false);
    const [brandDeleting, setBrandDeleting] = useState(null);
    const [modelDeleting, setModelDeleting] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await api.get('/brands');
            setBrands(res.data);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Error fetching brands');
        }
    };

    const handleAddBrand = async (e) => {
        e.preventDefault();
        setBrandAdding(true);
        try {
            await api.post('/brands', { name: newBrand });
            setNewBrand('');
            fetchBrands();
            toast.success('Brand added successfully');
        } catch (error) {
            console.error('Error adding brand:', error);
            toast.error(`Failed to add brand: ${error.response?.data?.error || error.message}`);
        } finally {
            setBrandAdding(false);
        }
    };

    const handleDeleteBrand = async (id) => {
        if (!confirm('Are you sure? This will delete the brand.')) return;
        setBrandDeleting(id);
        try {
            await api.delete(`/brands/${id}`);
            if (selectedBrand && selectedBrand._id === id) setSelectedBrand(null);
            fetchBrands();
            toast.success('Brand deleted successfully');
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Error deleting brand');
        } finally {
            setBrandDeleting(null);
        }
    };

    const handleAddModel = async (e) => {
        e.preventDefault();
        if (!selectedBrand) return;
        setModelAdding(true);
        try {
            const res = await api.post(`/brands/${selectedBrand._id}/models`, { model: newModel });
            setNewModel('');
            const updatedBrand = res.data;
            setBrands(brands.map(b => b._id === updatedBrand._id ? updatedBrand : b));
            setSelectedBrand(updatedBrand);
            toast.success('Model added successfully');
        } catch (error) {
            console.error('Error adding model:', error);
            toast.error(`Failed to add model: ${error.response?.data?.error || error.message}`);
        } finally {
            setModelAdding(false);
        }
    };

    const handleDeleteModel = async (modelName) => {
        if (!selectedBrand) return;
        setModelDeleting(modelName);
        try {
            const res = await api.delete(`/brands/${selectedBrand._id}/models/${modelName}`);
            const updatedBrand = res.data;
            setBrands(brands.map(b => b._id === updatedBrand._id ? updatedBrand : b));
            setSelectedBrand(updatedBrand);
            toast.success('Model removed successfully');
        } catch (error) {
            console.error('Error deleting model:', error);
            toast.error('Error removing model');
        } finally {
            setModelDeleting(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand List */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Brands</h2>
                <form onSubmit={handleAddBrand} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        placeholder="New Brand Name"
                        className="border p-2 rounded flex-1"
                        required
                    />
                    <button type="submit" disabled={brandAdding} className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300">
                        {brandAdding ? 'Adding...' : 'Add'}
                    </button>
                </form>
                <ul className="divide-y">
                    {brands.map(brand => (
                        <li
                            key={brand._id}
                            className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${selectedBrand?._id === brand._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                            onClick={() => setSelectedBrand(brand)}
                        >
                            <span className="font-medium">{brand.name}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand._id); }}
                                disabled={brandDeleting === brand._id}
                                className="text-red-500 hover:text-red-700 text-sm disabled:text-red-300"
                            >
                                {brandDeleting === brand._id ? 'Deleting...' : 'Delete'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Model List (Dependent on Selection) */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {selectedBrand ? `Models for ${selectedBrand.name}` : 'Select a Brand to Manage Models'}
                </h2>

                {selectedBrand ? (
                    <>
                        <form onSubmit={handleAddModel} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newModel}
                                onChange={(e) => setNewModel(e.target.value)}
                                placeholder="New Model Name"
                                className="border p-2 rounded flex-1"
                                required
                            />
                            <button type="submit" disabled={modelAdding} className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300">
                                {modelAdding ? 'Adding...' : 'Add Model'}
                            </button>
                        </form>

                        {selectedBrand.models && selectedBrand.models.length > 0 ? (
                            <ul className="divide-y">
                                {selectedBrand.models.map((model, index) => (
                                    <li key={index} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                        <span>{model}</span>
                                        <button
                                            onClick={() => handleDeleteModel(model)}
                                            disabled={modelDeleting === model}
                                            className="text-red-500 hover:text-red-700 text-sm disabled:text-red-300"
                                        >
                                            {modelDeleting === model ? 'Removing...' : 'Remove'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No models added yet.</p>
                        )}
                    </>
                ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded border-dashed border-2 border-gray-200">
                        Select a brand from the list
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandManagement;
