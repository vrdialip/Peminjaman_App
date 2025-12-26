import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera as CameraIcon, X, RotateCcw, Check } from 'lucide-react';
import { Button } from './ui';

export function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('user');
    const [devices, setDevices] = useState([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

    const startCamera = useCallback(async (targetDeviceId = null) => {
        setIsLoading(true);
        try {
            setError(null);

            // 1. Check for Secure Context first (HTTPS or localhost)
            // Browsers often remove navigator.mediaDevices entirely in insecure contexts,
            // so we must check this first to give a helpful error.
            if (!window.isSecureContext) {
                const hostname = window.location.hostname;
                if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                    throw new Error('Akses kamera diblokir oleh browser karena koneksi tidak aman (HTTP). Harap gunakan localhost atau HTTPS.');
                }
            }

            // 2. Check if browser supports mediaDevices
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser ini tidak mendukung akses kamera.');
            }

            // check permissions API if available
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const perm = await navigator.permissions.query({ name: 'camera' });
                    if (perm.state === 'denied') {
                        throw new Error('Izin kamera ditolak. Harap reset izin kamera di address bar browser Anda.');
                    }
                } catch (e) {
                    // Ignore, some browsers don't support this
                }
            }

            // Build constraints
            let constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            };

            // Apply device ID if specific target provided, otherwise use facingMode
            if (targetDeviceId && typeof targetDeviceId === 'string') {
                constraints.video.deviceId = { exact: targetDeviceId };
            } else if (!targetDeviceId) {
                constraints.video.facingMode = facingMode;
            }

            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (initialErr) {
                console.warn('Initial constraints failed, retrying...', initialErr);

                // Fallback 1: Try without facingMode 
                if (constraints.video.facingMode) {
                    delete constraints.video.facingMode;
                    try {
                        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                    } catch (e2) { }
                }

                if (!mediaStream) {
                    // Fallback 2: relax constraints completely
                    try {
                        mediaStream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: false
                        });
                    } catch (fallbackErr) {
                        throw fallbackErr;
                    }
                }
            }

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsCapturing(true);

                // Enumerate devices
                try {
                    const allDevices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
                    setDevices(videoDevices);

                    const track = mediaStream.getVideoTracks()[0];
                    const currentId = track.getSettings().deviceId;
                    const idx = videoDevices.findIndex(d => d.deviceId === currentId);
                    if (idx !== -1) setCurrentDeviceIndex(idx);
                } catch (e) {
                    console.warn('Failed to enumerate devices', e);
                }
            }
        } catch (err) {
            console.error('Camera error:', err);
            let msg = 'Tidak dapat mengakses kamera.';

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message.includes('permission denied')) {
                msg = 'Akses kamera ditolak. Browser memblokir akses ini. Silakan klik ikon gembok/pengaturan di sebelah URL bar, izinkan kamera, lalu muat ulang halaman.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera yang terhubung.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                msg = 'Kamera sedang digunakan aplikasi lain atau error hardware. Tutup aplikasi lain yang menggunakan kamera.';
            } else if (err.message && (err.message.includes('HTTPS') || err.message.includes('HTTP'))) {
                msg = err.message;
            }

            setError(msg);
            setIsLoading(false);
        }
        // finally block removed to let onCanPlay handle success state
    }, [facingMode]);

    // Safety timeout: If loading takes > 10s, show error
    useEffect(() => {
        let timeout;
        if (isLoading && !error && !capturedImage) {
            timeout = setTimeout(() => {
                setError("Kamera tidak merespon (timeout). Coba refresh halaman atau cek koneksi kamera.");
                setIsLoading(false);
            }, 10000);
        }
        return () => clearTimeout(timeout);
    }, [isLoading, error, capturedImage]);

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

        if (devices.length > 1) {
            const nextIndex = (currentDeviceIndex + 1) % devices.length;
            setCurrentDeviceIndex(nextIndex);
            const nextDevice = devices[nextIndex];
            setTimeout(() => startCamera(nextDevice.deviceId), 100);
        } else {
            setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
            setTimeout(() => startCamera(), 100);
        }
    }, [stopCamera, startCamera, devices, currentDeviceIndex]);

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
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                        <p className="text-white/80 text-sm">Menyiapkan kamera...</p>
                    </div>
                )}

                {error ? (
                    <div className="text-center p-6 max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <CameraIcon className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-white font-medium mb-2">Gagal Memuat Kamera</p>
                        <p className="text-red-400 text-sm mb-6 leading-relaxed">{error}</p>
                        <Button
                            variant="primary"
                            onClick={() => startCamera()}
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
                        onCanPlay={() => {
                            console.log("Video can play event fired.");
                            setIsLoading(false); // Video is ready to play, so stop loading
                            videoRef.current?.play().catch(e => console.error("Video play error:", e)); // Explicitly call play
                        }}
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
                            disabled={isLoading || !!error}
                            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50"
                        >
                            <RotateCcw className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={capturePhoto}
                            disabled={!isCapturing || isLoading || !!error}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 hover:bg-white/10 transition-colors"
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
