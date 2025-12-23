import { useRef, useEffect, useState } from 'react';
import { HiMicrophone, HiVideoCamera, HiBellAlert, HiNoSymbol } from 'react-icons/hi2';

export default function VideoPlayer({
    videoRef,
    stream,
    username,
    isLocal = false,
    isAudioOn = true,
    isVideoOn = true,
    isPinged = false,
    onPing
}) {
    const internalVideoRef = useRef(null);
    const actualRef = videoRef || internalVideoRef;
    const [showPingButton, setShowPingButton] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        if (actualRef.current && stream) {
            console.log('Setting video srcObject:', stream.id, 'tracks:', stream.getTracks().length);
            actualRef.current.srcObject = stream;

            actualRef.current.onloadedmetadata = () => {
                console.log('Video metadata loaded');
                setIsVideoReady(true);
                actualRef.current.play().catch(err => {
                    console.log('Autoplay prevented:', err);
                });
            };

            actualRef.current.onplay = () => {
                console.log('Video playing');
                setIsVideoReady(true);
            };
        }
    }, [stream, actualRef]);

    const hasVideoTrack = stream?.getVideoTracks()?.length > 0;
    const videoTrackEnabled = hasVideoTrack && stream.getVideoTracks()[0]?.enabled;
    const shouldShowVideo = isVideoOn && hasVideoTrack && videoTrackEnabled;

    return (
        <div
            className={`video-tile relative group ${isPinged ? 'animate-ping-effect' : ''}`}
            onMouseEnter={() => setShowPingButton(true)}
            onMouseLeave={() => setShowPingButton(false)}
        >
            {/* Video Element */}
            {shouldShowVideo ? (
                <video
                    ref={actualRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className="w-full h-full object-cover scale-x-[-1]"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
                    <div className="w-24 h-24 rounded-full gradient-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {username.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            {/* Overlay Info */}
            <div className="video-tile-overlay">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate max-w-[140px]">
                            {username} {isLocal && '(You)'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {/* Audio Status */}
                        <div className={`p-1.5 rounded-full transition-colors ${isAudioOn ? 'bg-white/20' : 'bg-[var(--accent-danger)]'
                            }`}>
                            {isAudioOn ? (
                                <HiMicrophone className="w-3.5 h-3.5 text-white" />
                            ) : (
                                <div className="relative">
                                    <HiMicrophone className="w-3.5 h-3.5 text-white" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-0.5 bg-white rotate-45"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Video Status */}
                        <div className={`p-1.5 rounded-full transition-colors ${isVideoOn ? 'bg-white/20' : 'bg-[var(--accent-danger)]'
                            }`}>
                            {isVideoOn ? (
                                <HiVideoCamera className="w-3.5 h-3.5 text-white" />
                            ) : (
                                <div className="relative">
                                    <HiVideoCamera className="w-3.5 h-3.5 text-white" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-0.5 bg-white rotate-45"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ping Button */}
            {!isLocal && showPingButton && onPing && (
                <button
                    onClick={onPing}
                    className="absolute top-3 right-3 btn btn-icon btn-secondary bg-black/40 hover:bg-white/20 backdrop-blur-sm"
                    title="Ping user"
                >
                    <HiBellAlert className="w-4 h-4" />
                </button>
            )}

            {/* Ping Animation Overlay */}
            {isPinged && (
                <div className="absolute inset-0 border-4 border-[var(--accent-primary)] rounded-xl pointer-events-none animate-glow"></div>
            )}

            {/* Local Badge */}
            {isLocal && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full gradient-accent text-xs font-semibold shadow-lg">
                    You
                </div>
            )}
        </div>
    );
}
