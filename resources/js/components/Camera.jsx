import React, { useRef, useState, useCallback } from 'react';
import { Camera as CameraIcon, X, RotateCcw, Check } from 'lucide-react';
import { Button } from './ui';

export function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('user');

    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsCapturing(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
        }
    }, [facingMode]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCapturing(false);
    }, [stream]);

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(imageData);
            stopCamera();
        }
    }, [stopCamera]);

    const retake = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

    const confirmCapture = useCallback(() => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    }, [capturedImage, onCapture]);

    const switchCamera = useCallback(() => {
        stopCamera();
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        setTimeout(startCamera, 100);
    }, [stopCamera, startCamera]);

    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
                <h3 className="text-white font-medium">Ambil Foto</h3>
                <button
                    onClick={() => {
                        stopCamera();
                        onClose();
                    }}
                    className="p-2 rounded-full hover:bg-white/10"
                >
                    <X className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {error ? (
                    <div className="text-center p-4">
                        <CameraIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
                        <p className="text-red-400">{error}</p>
                        <Button
                            variant="primary"
                            className="mt-4"
                            onClick={startCamera}
                        >
                            Coba Lagi
                        </Button>
                    </div>
                ) : capturedImage ? (
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="max-w-full max-h-full object-contain"
                        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="p-6 bg-black/50">
                {capturedImage ? (
                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={retake}
                            className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <RotateCcw className="w-8 h-8 text-white" />
                        </button>
                        <button
                            onClick={confirmCapture}
                            className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center glow-primary"
                        >
                            <Check className="w-10 h-10 text-white" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={switchCamera}
                            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={capturePhoto}
                            disabled={!isCapturing}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
                        >
                            <div className="w-14 h-14 rounded-full bg-white" />
                        </button>
                        <div className="w-12 h-12" /> {/* Spacer */}
                    </div>
                )}
            </div>
        </div>
    );
}

export function PhotoPreview({ src, onRemove, className = '' }) {
    if (!src) return null;

    return (
        <div className={`relative ${className}`}>
            <img
                src={src}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
            />
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
                <X className="w-4 h-4 text-white" />
            </button>
        </div>
    );
}
