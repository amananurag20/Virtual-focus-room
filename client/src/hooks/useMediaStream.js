import { useState, useCallback, useRef, useEffect } from 'react';

export function useMediaStream() {
    const [stream, setStream] = useState(null);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [error, setError] = useState(null);
    const streamRef = useRef(null);

    const startStream = useCallback(async () => {
        try {
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

            streamRef.current = mediaStream;
            setStream(mediaStream);
            setError(null);
            return mediaStream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            setError(err.message);
            return null;
        }
    }, []);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
        }
    }, []);

    const toggleAudio = useCallback(() => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
                return audioTrack.enabled;
            }
        }
        return isAudioOn;
    }, [isAudioOn]);

    const toggleVideo = useCallback(() => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
                return videoTrack.enabled;
            }
        }
        return isVideoOn;
    }, [isVideoOn]);

    useEffect(() => {
        return () => {
            stopStream();
        };
    }, [stopStream]);

    return {
        stream,
        isAudioOn,
        isVideoOn,
        error,
        startStream,
        stopStream,
        toggleAudio,
        toggleVideo
    };
}
