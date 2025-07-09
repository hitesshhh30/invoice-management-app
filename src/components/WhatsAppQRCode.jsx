import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const WhatsAppQRCode = ({ onConnectionSuccess }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected

    useEffect(() => {
        generateQRCode();
    }, []);

    const generateQRCode = async () => {
        try {
            setIsLoading(true);
            // Generate a realistic WhatsApp Web-like QR code
            // In real implementation, this would be from WhatsApp Web API
            const qrData = `whatsapp-web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            
            setQrCodeUrl(qrCodeDataUrl);
            setIsLoading(false);
            
            // Simulate connection process
            setTimeout(() => {
                setConnectionStatus('connecting');
                setTimeout(() => {
                    setConnectionStatus('connected');
                    onConnectionSuccess();
                }, 2000);
            }, 3000);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            setIsLoading(false);
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connecting': return 'text-yellow-600';
            case 'connected': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connecting': return 'Connecting to WhatsApp...';
            case 'connected': return 'Connected successfully!';
            default: return 'Scan QR code with WhatsApp';
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center mb-4 relative">
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <>
                        <img 
                            src={qrCodeUrl} 
                            alt="WhatsApp QR Code" 
                            className="w-full h-full object-contain rounded-lg"
                        />
                        {connectionStatus === 'connected' && (
                            <div className="absolute inset-0 bg-green-100 bg-opacity-90 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-green-700 font-semibold">Connected!</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <div className="text-center">
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                </p>
                {connectionStatus === 'disconnected' && (
                    <div className="mt-2">
                        <button
                            onClick={generateQRCode}
                            className="text-green-600 hover:text-green-700 text-xs underline"
                        >
                            Refresh QR Code
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhatsAppQRCode;
