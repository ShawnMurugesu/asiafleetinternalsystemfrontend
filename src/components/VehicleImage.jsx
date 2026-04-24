import { useState, useEffect } from 'react';

const VehicleImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [hasError, setHasError] = useState(false);

    const getProcessedSrc = (source) => {
        if (!source) return '';
        if (source.startsWith('http')) return source;

        // Handle local uploads path formatting
        const cleanPath = source.replace(/\\/g, '/');
        if (cleanPath.includes('uploads/')) {
            return `http://localhost:5000/${cleanPath.replace(/^.*uploads\//, 'uploads/')}`;
        }
        return `http://localhost:5000/${cleanPath}`;
    };

    useEffect(() => {
        setImgSrc(getProcessedSrc(src));
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // Fallback to backend placeholder API
            const placeholderFallback = `http://localhost:5000/api/placeholder?text=${encodeURIComponent(alt || 'Vehicle')}`;
            setImgSrc(placeholderFallback);
        }
    };

    if (!imgSrc && !hasError) {
        return <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-xs`}>No Image</div>;
    }

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
};

export default VehicleImage;
