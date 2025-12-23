import { useState, useCallback, useRef } from 'react';

export function useMediaStream() {
    const [stream, setStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [error, setError] = useState(null);

    const startStream = useCallback(async () => {
        try {
            console.log('[useMediaStream] Requesting media stream...');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Default: audio off
            mediaStream.getAudioTracks().forEach(track => {
                track.enabled = false;
            });

            setStream(mediaStream);
            setIsAudioOn(false);
            setIsVideoOn(true);
            setError(null);
            console.log('[useMediaStream] Stream started successfully');
            return mediaStream;
        } catch (err) {
            console.error('[useMediaStream] Error getting media:', err);
            setError(err.message);
            return null;
        }
    }, []);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }
        setIsScreenSharing(false);
        console.log('[useMediaStream] Streams stopped');
    }, [stream, screenStream]);

    const toggleAudio = useCallback(() => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            const newState = audioTracks[0]?.enabled ?? false;
            setIsAudioOn(newState);
            return newState;
        }
        return false;
    }, [stream]);

    const toggleVideo = useCallback(() => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            const newState = videoTracks[0]?.enabled ?? false;
            setIsVideoOn(newState);
            return newState;
        }
        return isVideoOn;
    }, [stream, isVideoOn]);

    const startScreenShare = useCallback(async () => {
        try {
            console.log('[useMediaStream] Starting screen share...');
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: false
            });

            const screenTrack = displayStream.getVideoTracks()[0];

            // Handle when user stops sharing via browser UI
            screenTrack.onended = () => {
                console.log('[useMediaStream] Screen share ended by user');
                setScreenStream(null);
                setIsScreenSharing(false);
            };

            setScreenStream(displayStream);
            setIsScreenSharing(true);
            console.log('[useMediaStream] Screen share started');
            return displayStream;
        } catch (err) {
            console.error('[useMediaStream] Screen share error:', err);
            if (err.name !== 'AbortError') {
                setError(err.message);
            }
            return null;
        }
    }, []);

    const stopScreenShare = useCallback(() => {
        console.log('[useMediaStream] Stopping screen share...');
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }
        setIsScreenSharing(false);
    }, [screenStream]);

    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
            stopScreenShare();
            return false;
        } else {
            const result = await startScreenShare();
            return !!result;
        }
    }, [isScreenSharing, startScreenShare, stopScreenShare]);

    return {
        stream,           // Camera stream
        screenStream,     // Screen share stream (separate)
        isAudioOn,
        isVideoOn,
        isScreenSharing,
        error,
        startStream,
        stopStream,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        startScreenShare,
        stopScreenShare
    };
}
