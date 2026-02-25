import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import VehicleImage from './VehicleImage';

const FleetModal = ({ fleet, onClose }) => {
    const { user } = useContext(AuthContext);
    const [activeImage, setActiveImage] = useState(fleet.mainImage || (fleet.images?.length > 0 ? fleet.images[0] : ''));

    useEffect(() => {
        if (fleet) {
            setActiveImage(fleet.mainImage || (fleet.images?.length > 0 ? fleet.images[0] : ''));
        }
    }, [fleet]);

    if (!fleet) return null;

    const allImages = fleet.images || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] animate-scale-in">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur shadow-md rounded-full p-2 text-gray-600 hover:text-black hover:bg-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Left Section: Gallery */}
                <div className="w-full md:w-3/5 bg-gray-50 flex flex-col border-r border-gray-100">
                    <div className="relative flex-1 min-h-[300px] flex items-center justify-center bg-gray-100 overflow-hidden">
                        {activeImage ? (
                            <VehicleImage
                                src={activeImage}
                                alt={fleet.model}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-gray-400">No images available</div>
                        )}
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                            {fleet.category?.name || 'Vehicle'}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="p-4 flex gap-2 overflow-x-auto bg-white border-t border-gray-100">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <VehicleImage
                                        src={img}
                                        alt={`Thumb ${idx}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Section: Details */}
                <div className="w-full md:w-2/5 p-8 flex flex-col bg-white">
                    <div className="mb-6">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{fleet.make} {fleet.model}</h2>
                        <span className="text-gray-400 font-medium">{fleet.year} Model • {fleet.licensePlate || 'Available Now'}</span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-4xl font-black text-blue-600">${fleet.price}</span>
                        <span className="text-gray-500 font-medium">/ per day</span>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Capacity</p>
                                <p className="text-sm font-bold text-gray-800">{fleet.capacity || 5} Seats</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Transmission</p>
                                <p className="text-sm font-bold text-gray-800">{fleet.transmission || 'Auto'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fuel</p>
                                <p className="text-sm font-bold text-gray-800">{fleet.fuelType || 'Petrol'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.172a2 2 0 01.586-1.414l5-5c1.26-1.26 3.414-.367 3.414 1.415v10.316a2 2 0 01-.586 1.414l-5 5z"></path></svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Included Km</p>
                                <p className="text-sm font-bold text-gray-800">{fleet.kmPerDay ? `${fleet.kmPerDay}km/d` : 'Unlimited'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Vehicle Description</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{fleet.description || 'No description available for this vehicle.'}</p>
                    </div>

                    {/* Admin Only Contact Info */}
                    {user && user.role === 'admin' && (
                        <div className="mt-auto bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2">Internal Owner Info</h4>
                            {fleet.owner ? (
                                <>
                                    <p className="text-xs text-amber-700 flex justify-between"><span>Owner:</span> <span className="font-bold">{fleet.owner.name}</span></p>
                                    <p className="text-xs text-amber-700 flex justify-between mt-1"><span>NIC/Passport:</span> <span className="font-bold">{fleet.owner.nicPassport}</span></p>
                                    <p className="text-xs text-amber-700 flex justify-between mt-1"><span>Contact:</span> <span className="font-bold">{fleet.owner.mobile} / {fleet.owner.landline}</span></p>
                                </>
                            ) : (
                                <p className="text-xs text-amber-700 italic text-center">No owner assigned to this vehicle.</p>
                            )}
                            <div className="mt-3 pt-2 border-t border-amber-200 text-[10px] text-amber-600">ID: {fleet._id}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FleetModal;
