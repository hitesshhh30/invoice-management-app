import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

const DesignImage = ({ 
    imagePath, 
    alt, 
    className = "w-full h-full object-cover",
    fallbackIcon = Palette,
    fallbackIconSize = 20,
    fallbackIconColor = "text-purple-400"
}) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImage = async () => {
            if (!imagePath) {
                setLoading(false);
                return;
            }

            try {
                const result = await window.electronAPI.getImageUrl(imagePath);
                
                if (result.success) {
                    setImageUrl(result.url);
                    setImageError(false);
                } else {
                    setImageError(true);
                }
            } catch (error) {
                console.error('DesignImage: Exception while loading image:', error);
                setImageError(true);
            } finally {
                setLoading(false);
            }
        };

        loadImage();
    }, [imagePath]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="animate-pulse">
                    <Palette className="text-gray-300" size={fallbackIconSize} />
                </div>
            </div>
        );
    }

    if (!imageUrl || imageError) {
        const FallbackIcon = fallbackIcon;
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <FallbackIcon className={fallbackIconColor} size={fallbackIconSize} />
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={() => setImageError(true)}
        />
    );
};

export default DesignImage;
