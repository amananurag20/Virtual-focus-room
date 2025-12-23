import { useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({
    localStream,
    localVideoRef,
    isLocalAudioOn,
    isLocalVideoOn,
    username,
    participants,
    remoteStreams,
    pingTarget,
    onPingUser
}) {
    const participantIds = Object.keys(participants);
    const totalCount = participantIds.length + 1; // +1 for local

    // Determine grid columns based on participant count
    const getGridClass = () => {
        if (totalCount === 1) return 'grid-cols-1 max-w-2xl mx-auto';
        if (totalCount === 2) return 'grid-cols-1 md:grid-cols-2';
        if (totalCount <= 4) return 'grid-cols-2';
        if (totalCount <= 6) return 'grid-cols-2 md:grid-cols-3';
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    };

    return (
        <div className={`grid ${getGridClass()} gap-4 h-full`}>
            {/* Local Video */}
            <VideoPlayer
                videoRef={localVideoRef}
                stream={localStream}
                username={username}
                isLocal={true}
                isAudioOn={isLocalAudioOn}
                isVideoOn={isLocalVideoOn}
                isPinged={pingTarget?.socketId === 'local'}
            />

            {/* Remote Videos */}
            {participantIds.map(socketId => {
                const participant = participants[socketId];
                const remoteStream = remoteStreams[socketId];

                return (
                    <VideoPlayer
                        key={socketId}
                        stream={remoteStream}
                        username={participant?.username || 'User'}
                        isLocal={false}
                        isAudioOn={participant?.isAudioOn}
                        isVideoOn={participant?.isVideoOn}
                        isPinged={pingTarget?.socketId === socketId}
                        onPing={() => onPingUser(socketId)}
                    />
                );
            })}
        </div>
    );
}
