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

    const getGridStyle = () => {
        if (totalParticipants === 1) {
            return { display: 'grid', gridTemplateColumns: '1fr', maxWidth: '800px', gap: '16px' };
        }
        if (totalParticipants === 2) {
            return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '1200px', gap: '16px' };
        }
        if (totalParticipants === 3) {
            return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '1400px', gap: '12px' };
        }
        if (totalParticipants === 4) {
            return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '1000px', gap: '12px' };
        }
        if (totalParticipants <= 6) {
            return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '1200px', gap: '10px' };
        }
        return { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' };
    };

    return (
        <div style={getGridStyle()} className="w-full h-fit">
            <VideoPlayer
                videoRef={localVideoRef}
                stream={localStream}
                username={username}
                isLocal={true}
                isAudioOn={isLocalAudioOn}
                isVideoOn={isLocalVideoOn || isScreenSharing}
                isScreenSharing={isScreenSharing}
                isGuest={isGuest}
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
                />
            ))}
        </div>
    );
}
