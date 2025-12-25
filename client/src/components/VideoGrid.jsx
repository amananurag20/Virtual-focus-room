import { useMemo } from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({
    localStream,
    localVideoRef,
    isLocalAudioOn,
    isLocalVideoOn,
    isScreenSharing,
    username,
    participants,
    remoteStreams,
    pingTarget,
    onPingUser,
    isGuest = false
}) {
    const participantList = Object.values(participants);
    const totalParticipants = participantList.length + 1;

    // Dynamic grid layout calculation based on participant count
    const gridConfig = useMemo(() => {
        // Return responsive grid configuration based on participant count
        if (totalParticipants === 1) {
            // Single user - very large centered video
            return {
                className: 'grid-cols-1',
                maxWidth: 'max-w-3xl',
                gap: 'gap-4',
                containerClass: 'h-[70vh] max-h-[600px]',
                itemClass: ''
            };
        }
        if (totalParticipants === 2) {
            // 2 users - large side by side videos
            return {
                className: 'grid-cols-1 md:grid-cols-2',
                maxWidth: 'max-w-6xl',
                gap: 'gap-4',
                containerClass: 'h-[60vh] max-h-[500px]',
                itemClass: ''
            };
        }
        if (totalParticipants === 3) {
            // 3 users - 3 in a row, larger
            return {
                className: 'grid-cols-1 sm:grid-cols-3',
                maxWidth: 'max-w-6xl',
                gap: 'gap-3',
                containerClass: 'h-auto',
                itemClass: ''
            };
        }
        if (totalParticipants === 4) {
            // 4 users - 2x2 grid
            return {
                className: 'grid-cols-2',
                maxWidth: 'max-w-4xl',
                gap: 'gap-3',
                containerClass: 'h-auto',
                itemClass: ''
            };
        }
        if (totalParticipants <= 6) {
            // 5-6 users - 3 columns
            return {
                className: 'grid-cols-2 sm:grid-cols-3',
                maxWidth: 'max-w-5xl',
                gap: 'gap-2',
                containerClass: 'h-auto',
                itemClass: ''
            };
        }
        if (totalParticipants <= 9) {
            // 7-9 users - 3 columns compact
            return {
                className: 'grid-cols-2 sm:grid-cols-3',
                maxWidth: 'max-w-5xl',
                gap: 'gap-2',
                containerClass: 'h-auto',
                itemClass: ''
            };
        }
        if (totalParticipants <= 12) {
            // 10-12 users - 4 columns
            return {
                className: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
                maxWidth: 'max-w-6xl',
                gap: 'gap-1.5',
                containerClass: 'h-auto',
                itemClass: ''
            };
        }
        // 13+ participants - compact view
        return {
            className: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
            maxWidth: 'max-w-full',
            gap: 'gap-1',
            containerClass: 'h-auto',
            itemClass: ''
        };
    }, [totalParticipants]);

    // Calculate dynamic sizing for video players
    const getVideoSize = () => {
        if (totalParticipants === 1) return 'extra-large';
        if (totalParticipants === 2) return 'large';
        if (totalParticipants <= 4) return 'medium-large';
        if (totalParticipants <= 6) return 'medium';
        if (totalParticipants <= 9) return 'small';
        return 'compact';
    };

    return (
        <div
            className={`
                grid ${gridConfig.className} ${gridConfig.gap} 
                ${gridConfig.maxWidth} w-full mx-auto
                ${gridConfig.containerClass}
                transition-all duration-300 ease-out
                p-2 sm:p-0
            `}
        >
            <VideoPlayer
                videoRef={localVideoRef}
                stream={localStream}
                username={username}
                isLocal={true}
                isAudioOn={isLocalAudioOn}
                isVideoOn={isLocalVideoOn || isScreenSharing}
                isScreenSharing={isScreenSharing}
                isGuest={isGuest}
                size={getVideoSize()}
                totalParticipants={totalParticipants}
            />
            {participantList.map((participant) => (
                <VideoPlayer
                    key={participant.socketId}
                    stream={remoteStreams[participant.socketId]}
                    username={participant.username || 'Anonymous'}
                    isLocal={false}
                    isAudioOn={participant.isAudioOn}
                    isVideoOn={participant.isVideoOn}
                    isPinged={pingTarget?.socketId === participant.socketId}
                    onPing={() => onPingUser(participant.socketId)}
                    userTier={participant.userTier}
                    size={getVideoSize()}
                    totalParticipants={totalParticipants}
                />
            ))}
        </div>
    );
}
