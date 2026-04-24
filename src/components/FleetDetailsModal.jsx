import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import VehicleImage from './VehicleImage';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FleetDetailsModal = ({ fleet, onClose, users, isAdmin, refreshFleets }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...fleet });
    const [mainImage, setMainImage] = useState(fleet.mainImage || (fleet.images?.length > 0 ? fleet.images[0] : ''));
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setFormData({
            ...fleet,
            assignedTo: fleet.assignedTo?._id || fleet.assignedTo || '',
            owner: fleet.owner?._id || fleet.owner || '',
            category: fleet.category?._id || fleet.category || ''
        });
        setMainImage(fleet.mainImage || (fleet.images?.length > 0 ? fleet.images[0] : ''));
        setNewImages([]);
        setNewImagePreviews([]);
        setRemovedImages([]);
        fetchVendors();
    }, [fleet]);

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors');
            setVendors(res.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    if (!fleet) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + (fleet.images?.length || 0) - removedImages.length + newImages.length > 6) {
            toast.error('Max 6 images allowed');
            return;
        }
        setNewImages([...newImages, ...files]);
        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews([...newImagePreviews, ...previews]);
    };

    const removeExistingImage = (img) => {
        setRemovedImages([...removedImages, img]);
        if (img === mainImage) {
            // Find another one to be main
            const remaining = fleet.images.filter(i => i !== img && !removedImages.includes(i));
            if (remaining.length > 0) setMainImage(remaining[0]);
            else if (newImages.length > 0) setMainImage('NEW_0'); // Temporary placeholder logic or similar
        }
    };

    const removeNewImage = (index) => {
        const updatedNewImages = newImages.filter((_, i) => i !== index);
        const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
        setNewImages(updatedNewImages);
        setNewImagePreviews(updatedPreviews);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const data = new FormData();

            // Basic Fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Image Selection
            data.append('mainImage', mainImage);
            data.append('removedImages', JSON.stringify(removedImages));

            // New Uploads
            newImages.forEach(img => {
                data.append('images', img);
            });

            await api.put(`/fleets/${fleet._id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Vehicle updated successfully');
            setIsEditing(false);
            if (refreshFleets) refreshFleets();
            onClose();
        } catch (error) {
            console.error('Error updating fleet:', error);
            toast.error('Failed to update vehicle: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('A deletion request will be sent to the manager for approval. Proceed?')) return;
        setDeleting(true);
        try {
            await api.post(`/fleets/${fleet._id}/delete-request`);
            toast.success('Deletion request sent correctly.');
            if (refreshFleets) refreshFleets();
            onClose();
        } catch (error) {
            console.error('Error deleting fleet:', error);
            toast.error('Failed to send deletion request');
        } finally {
            setDeleting(false);
        }
    };

    const ribbonColor = (formData.status || fleet.status) === 'Available' ? 'bg-green-500' : (formData.status || fleet.status) === 'Rented' ? 'bg-red-500' : 'bg-yellow-500';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden relative animate-fade-in-up flex flex-col md:flex-row max-h-[90vh] overflow-y-auto`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 bg-white rounded-full p-1 border border-gray-200"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Left: Images */}
                <div className="w-full md:w-1/2 bg-gray-100 p-4 flex flex-col">
                    <div className="relative h-64 md:h-80 mb-2 rounded overflow-hidden shadow-sm bg-white">
                        {mainImage && !mainImage.startsWith('NEW_') ? (
                            <VehicleImage
                                src={mainImage}
                                alt="Main"
                                className="w-full h-full object-contain"
                            />
                        ) : mainImage.startsWith('NEW_') ? (
                            <img
                                src={newImagePreviews[parseInt(mainImage.split('_')[1])]}
                                alt="Main New"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        <div className={`absolute top-0 left-0 ${ribbonColor} text-white px-3 py-1 rounded-br-lg font-bold shadow`}>
                            {formData.status}
                        </div>
                    </div>

                    {/* Thumbnail Grid & Management */}
                    <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto py-2">
                            {/* Existing Images */}
                            {fleet.images?.filter(img => !removedImages.includes(img)).map((img, idx) => (
                                <div key={`old-${idx}`} className="relative flex-shrink-0">
                                    <VehicleImage
                                        src={img}
                                        className={`h-16 w-16 object-cover cursor-pointer border-2 rounded ${mainImage === img ? 'border-blue-500' : 'border-transparent'}`}
                                        onClick={() => setMainImage(img)}
                                        alt={`Old Thumb ${idx}`}
                                    />
                                    {isEditing && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeExistingImage(img); }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* New Previews */}
                            {newImagePreviews.map((src, idx) => (
                                <div key={`new-${idx}`} className="relative flex-shrink-0">
                                    <img
                                        src={src}
                                        className={`h-16 w-16 object-cover cursor-pointer border-2 rounded ${mainImage === `NEW_${idx}` ? 'border-blue-500' : 'border-transparent'}`}
                                        onClick={() => setMainImage(`NEW_${idx}`)}
                                        alt={`New Thumb ${idx}`}
                                    />
                                    {isEditing && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeNewImage(idx); }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Upload More (Only in Edit Mode) */}
                        {isEditing && (fleet.images.length - removedImages.length + newImages.length < 6) && (
                            <div className="border-t pt-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Add More Photos</label>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Details & Edit Form */}
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Vehicle' : `${fleet.make} ${fleet.model}`}
                        </h2>
                        {isAdmin && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-900 text-sm font-semibold">
                                Edit Details
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isEditing ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Make</label>
                                        <input name="make" value={formData.make} onChange={handleChange} className="border p-2 rounded w-full" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Model</label>
                                        <input name="model" value={formData.model} onChange={handleChange} className="border p-2 rounded w-full" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Price ($/day)</label>
                                        <input name="price" type="number" value={formData.price} onChange={handleChange} className="border p-2 rounded w-full" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Year</label>
                                        <input name="year" type="number" value={formData.year} onChange={handleChange} className="border p-2 rounded w-full" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">License Plate</label>
                                        <input name="licensePlate" value={formData.licensePlate || ''} onChange={handleChange} className="border p-2 rounded w-full" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Km / Day</label>
                                        <input name="kmPerDay" type="number" value={formData.kmPerDay || ''} onChange={handleChange} className="border p-2 rounded w-full" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="border p-2 rounded w-full">
                                        <option value="Available">Available</option>
                                        <option value="Rented">Rented</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>

                                {isAdmin && users && users.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Allocate to User</label>
                                        <select
                                            name="assignedTo"
                                            value={formData.assignedTo || ''}
                                            onChange={handleChange}
                                            className="border p-2 rounded w-full bg-blue-50"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1">Assigning a user will set status to 'Rented'.</p>
                                    </div>
                                )}

                                <div>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="border p-2 rounded w-full h-20"></textarea>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600">Vehicle Owner (Vendor)</label>
                                    <select name="owner" value={formData.owner || ''} onChange={handleChange} className="border p-2 rounded w-full">
                                        <option value="">Select Owner</option>
                                        {vendors.map(v => <option key={v._id} value={v._id}>{v.name} ({v.nicPassport})</option>)}
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex-1 bg-green-600 text-white py-2 rounded shadow hover:bg-green-700 disabled:bg-green-300"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400">Cancel</button>
                                </div>
                                <div className="pt-2 text-center">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="text-red-500 text-sm hover:underline disabled:text-red-300"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete Vehicle'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-500 mb-4">{fleet.year} • {fleet.category?.name}</p>

                                <p className="text-3xl font-bold text-blue-600 mb-6">${fleet.price}<span className="text-base font-normal text-gray-500">/day</span></p>

                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                                    <div>
                                        <span className="font-semibold block text-gray-800">Status</span>
                                        <span className={`px-2 py-0.5 rounded text-xs text-white ${ribbonColor}`}>{formData.status}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-gray-800">Assigned To</span>
                                        {fleet.assignedTo ? (
                                            <span className="text-blue-600 font-medium">{fleet.assignedTo.username}</span>
                                        ) : (
                                            <span className="text-gray-400">Unassigned</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-gray-800">Transmission</span>
                                        {fleet.transmission || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-gray-800">Fuel Type</span>
                                        {fleet.fuelType || 'N/A'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6 border-t pt-4">
                                    <div>
                                        <span className="font-semibold block text-gray-800">License Plate</span>
                                        {fleet.licensePlate || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-gray-800">Included Km/Day</span>
                                        {fleet.kmPerDay ? `${fleet.kmPerDay} km` : 'Unlimited'}
                                    </div>
                                </div>

                                {fleet.description && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{fleet.description}</p>
                                    </div>
                                )}

                                {user && user.role?.toLowerCase() !== 'viewer' && fleet.owner && (
                                    <div className="mt-6 pt-6 border-t">
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            Owner Details (Vendor)
                                        </h3>
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-blue-900">{fleet.owner.name}</span>
                                                <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-[10px] font-bold uppercase">{fleet.owner.category || 'Vendor'}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 text-xs text-blue-800">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                    {fleet.owner.mobile || 'No Mobile'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                    {fleet.owner.email || 'No Email'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    {fleet.owner.address || 'No Address'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FleetDetailsModal;
