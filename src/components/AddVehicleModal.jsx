import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddVehicleModal = ({ onClose, refreshFleets }) => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [vendors, setVendors] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        make: '', model: '', category: '', year: '', price: '',
        status: 'Available', licensePlate: '', kmPerDay: '',
        capacity: '', fuelType: 'Petrol', transmission: 'Automatic',
        description: '', owner: ''
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const [catRes, brandRes, vendorRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands'),
                api.get('/vendors').catch(() => ({ data: [] }))
            ]);
            setCategories(catRes.data);
            setBrands(brandRes.data);
            setVendors(vendorRes.data);
        } catch (error) {
            console.error('Error fetching resources', error);
        }
    };

    const handleBrandChange = (e) => {
        const brandName = e.target.value;
        const brand = brands.find(b => b.name === brandName);
        setFormData({ ...formData, make: brandName, model: '' });
        setAvailableModels(brand ? brand.models : []);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 6) {
            toast.error('You can only upload up to 6 images.');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);

        // Reset main image index if needed, or keep it valid
        if (mainImageIndex >= newImages.length) setMainImageIndex(0);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
        if (mainImageIndex >= newImages.length) setMainImageIndex(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validations
        if (!formData.make || !formData.model || !formData.year || !formData.price || !formData.category) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (formData.year.toString().length !== 4) {
            toast.error('Please enter a valid 4-digit year.');
            return;
        }

        if (images.length === 0) {
            toast.error('Please upload at least one image.');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('mainImageIndex', mainImageIndex);

        // Append form fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // Append images
        images.forEach(image => {
            data.append('images', image);
        });

        try {
            await api.post('/fleets', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Vehicle added successfully!');
            refreshFleets();
            onClose();
        } catch (error) {
            console.error('Error creating fleet:', error);
            toast.error(`Failed to create vehicle: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Add New Vehicle</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Section: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vehicle Details</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Make (Brand)</label>
                                    <select name="make" value={formData.make} onChange={handleBrandChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">Select Brand</option>
                                        {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                    <select name="model" value={formData.model} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required disabled={!formData.make}>
                                        <option value="">Select Model</option>
                                        {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required placeholder="2024" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                    <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" placeholder="ABC-1234" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Km / Day</label>
                                    <input type="number" name="kmPerDay" value={formData.kmPerDay} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" placeholder="100" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Specs & Pricing */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Specs & Pricing</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate ($)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required placeholder="50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                                        <option value="Available">Available</option>
                                        <option value="Rented">Rented</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Transmission</label>
                                    <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm">
                                        <option value="Automatic">Auto</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fuel</label>
                                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm">
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Seats</label>
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm" placeholder="5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 h-20 placeholder-gray-400" placeholder="Additional details..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Owner (Vendor)</label>
                                <select name="owner" value={formData.owner} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Owner</option>
                                    {vendors.map(v => <option key={v._id} value={v._id}>{v.name} ({v.nicPassport})</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Section: Images (Full Width) */}
                        <div className="md:col-span-2 space-y-2 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vehicle Photos ({images.length}/6)</h3>

                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition cursor-pointer relative">
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={images.length >= 6} />
                                <div className="text-gray-400 text-center">
                                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <span className="text-xs block text-gray-400">Max 6 images</span>
                                </div>
                            </div>

                            {/* Previews & Main Image Selection */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-6 gap-4 mt-4">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer ${mainImageIndex === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`} onClick={() => setMainImageIndex(index)}>
                                            <img src={src} alt={`Preview ${index}`} className="w-full h-24 object-cover" />

                                            {/* Main Image Badge */}
                                            {mainImageIndex === index && (
                                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">MAIN</div>
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <p className="text-white text-xs font-semibold">Set Main</p>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 transition">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 font-medium transition disabled:bg-blue-300">
                        {loading ? 'Saving...' : 'Create Vehicle'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddVehicleModal;
