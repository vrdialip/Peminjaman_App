import React, { useRef, useState, useCallback, useEffect } from 'react';
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
    const [devices, setDevices] = useState([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

    const startCamera = useCallback(async (targetDeviceId = null) => {
        try {
            setError(null);

            // 1. Check if browser supports mediaDevices
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser tidak mendukung akses kamera audio/video.');
            }

            // 2. Check for Secure Context (HTTPS or localhost)
            // Note: window.isSecureContext is widely supported
            if (!window.isSecureContext) {
                const hostname = window.location.hostname;
                // Some browsers allow camera on localhost/127.0.0.1 even if not "Secure", but typically HTTP on IP (192.168.x.x) is blocked.
                if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                    throw new Error('Akses kamera memerlukan koneksi aman (HTTPS). Jika sedang development, gunakan localhost.');
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

            // Apply device ID if specific target provided, otherwise use facing mode
            if (targetDeviceId && typeof targetDeviceId === 'string') {
                constraints.video.deviceId = { exact: targetDeviceId };
            } else if (!targetDeviceId) {
                // Initial default: try facing mode if no specific device selected
                constraints.video.facingMode = facingMode;
            }

            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (initialErr) {
                console.warn('Initial constraints failed, retrying with looser constraints...', initialErr);

                // Fallback 1: Try without facingMode if that was the issue (common on laptops)
                if (constraints.video.facingMode) {
                    delete constraints.video.facingMode;
                    try {
                        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                    } catch (e2) {
                        // proceed to next fallback
                    }
                }

                if (!mediaStream) {
                    // Fallback 2: relax constraints completely (any video device)
                    try {
                        mediaStream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: false
                        });
                    } catch (fallbackErr) {
                        // Analyze the specific error from the fallback
                        throw fallbackErr;
                    }
                }
            }

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsCapturing(true);

                // Enumerate devices once we have permission
                // This is important because labels are often hidden until permission is granted
                try {
                    const allDevices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
                    setDevices(videoDevices);

                    // Sync current index with active track
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

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = 'Izin kamera ditolak. Harap izinkan akses kamera di browser Anda.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = 'Kamera tidak ditemukan pada perangkat ini.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                msg = 'Kamera sedang digunakan oleh aplikasi lain atau mengalami masalah hardware.';
            } else if (err.message && err.message.includes('HTTPS')) {
                msg = err.message;
            } else if (err.message && err.message.length < 100) {
                msg = msg + ' ' + err.message;
            }

            setError(msg);
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

        if (devices.length > 1) {
            // Cycle through available video devices
            const nextIndex = (currentDeviceIndex + 1) % devices.length;
            setCurrentDeviceIndex(nextIndex);
            const nextDevice = devices[nextIndex];
            // Use timeout to allow stream cleanup
            setTimeout(() => startCamera(nextDevice.deviceId), 100);
        } else {
            // Fallback for single recognized device (e.g. mobile toggle front/back)
            setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
            // Timeout managed by dependency change or explicit call? 
            // Since we rely on facingMode state for the startCamera call in this branch:
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
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {error ? (
                    <div className="text-center p-4">
                        <CameraIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
                        <p className="text-red-400">{error}</p>
                        <Button
                            variant="primary"
                            className="mt-4"
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
