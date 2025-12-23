import { useRef, useEffect, useState } from 'react';
import { HiMicrophone, HiVideoCamera, HiBellAlert, HiComputerDesktop } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

export default function VideoPlayer({
    videoRef,
    stream,
    username,
    isLocal = false,
    isAudioOn = true,
    isVideoOn = true,
    isScreenSharing = false,
    isPinged = false,
    onPing
}) {
    const internalVideoRef = useRef(null);
    const actualRef = videoRef || internalVideoRef;
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        const videoElement = actualRef.current;
        if (videoElement && stream) {
            videoElement.srcObject = stream;
            videoElement.play().catch(() => { });
        }
    }, [stream, actualRef, isVideoOn, isScreenSharing]);

    const hasVideoTrack = stream?.getVideoTracks()?.length > 0;
    const videoTrackEnabled = hasVideoTrack && stream.getVideoTracks()[0]?.enabled;
    const shouldShowVideo = (isVideoOn || isScreenSharing) && hasVideoTrack && videoTrackEnabled;

    const initials = username.slice(0, 2).toUpperCase();

    return (
        <div
            className={`relative rounded-2xl overflow-hidden bg-card border border-border shadow-lg group transition-all duration-300 ${isPinged ? 'ring-4 ring-primary ring-offset-2 ring-offset-background animate-pulse' : ''}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            style={{ aspectRatio: '16/9' }}
        >
            <video
                ref={actualRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover ${isScreenSharing ? '' : 'scale-x-[-1]'} ${shouldShowVideo ? 'block' : 'hidden'}`}
            />

            {!shouldShowVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                        {initials}
                    </div>
                </div>
            )}

            {isLocal && (
                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 ${isScreenSharing ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                    {isScreenSharing && <HiComputerDesktop className="w-3 h-3" />}
                    {isScreenSharing ? 'Screen' : 'You'}
                </div>
            )}

            {!isLocal && onPing && (
                <div className={`absolute top-3 right-3 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <Button size="icon" variant="secondary" onClick={onPing} className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground">
                        <HiBellAlert className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white truncate max-w-[150px]">{username}</span>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isAudioOn ? 'bg-white/20' : 'bg-red-500'}`}>
                            <HiMicrophone className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isVideoOn ? 'bg-white/20' : 'bg-red-500'}`}>
                            <HiVideoCamera className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
