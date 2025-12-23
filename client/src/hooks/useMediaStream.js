import { useState, useCallback, useRef, useEffect } from 'react';

export function useMediaStream() {
    const [stream, setStream] = useState(null);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [error, setError] = useState(null);
    const [permissionState, setPermissionState] = useState('prompt');
    const streamRef = useRef(null);

    const startStream = useCallback(async () => {
        try {
            // Request permissions with fallback
            const constraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            console.log('Requesting media stream...');
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Media stream obtained:', mediaStream.getTracks().map(t => `${t.kind}: ${t.label}`));

            streamRef.current = mediaStream;
            setStream(mediaStream);
            setError(null);
            setPermissionState('granted');

            // Ensure tracks are enabled
            mediaStream.getVideoTracks().forEach(track => {
                track.enabled = true;
                console.log('Video track enabled:', track.enabled, track.readyState);
            });
            mediaStream.getAudioTracks().forEach(track => {
                track.enabled = true;
                console.log('Audio track enabled:', track.enabled, track.readyState);
            });

            return mediaStream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            setError(err.message || 'Failed to access camera/microphone');
            setPermissionState('denied');

            // Try audio-only as fallback
            if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
                try {
                    console.log('Trying audio only...');
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    streamRef.current = audioStream;
                    setStream(audioStream);
                    setIsVideoOn(false);
                    return audioStream;
                } catch (audioErr) {
                    console.error('Audio also failed:', audioErr);
                }
            }

            return null;
        }
    }, []);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
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
                console.log('Audio toggled:', audioTrack.enabled);
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
                console.log('Video toggled:', videoTrack.enabled);
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
        permissionState,
        startStream,
        stopStream,
        toggleAudio,
        toggleVideo
    };
}
