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
    const participantList = Object.values(participants);
    const totalParticipants = participantList.length + 1;

    // Better grid layout for different participant counts
    const getGridStyle = () => {
        if (totalParticipants === 1) {
            return {
                display: 'grid',
                gridTemplateColumns: '1fr',
                maxWidth: '800px',
                gap: '16px'
            };
        }
        if (totalParticipants === 2) {
            return {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                maxWidth: '1200px',
                gap: '16px'
            };
        }
        if (totalParticipants === 3) {
            return {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                maxWidth: '1400px',
                gap: '12px'
            };
        }
        if (totalParticipants === 4) {
            return {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                maxWidth: '1000px',
                gap: '12px'
            };
        }
        // 5-6 participants: 3 columns
        if (totalParticipants <= 6) {
            return {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                maxWidth: '1200px',
                gap: '10px'
            };
        }
        // 7+ participants: 4 columns
        return {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px'
        };
    };

    return (
        <div style={getGridStyle()} className="w-full h-fit">
            {/* Local Video */}
            <VideoPlayer
                videoRef={localVideoRef}
                stream={localStream}
                username={username}
                isLocal={true}
                isAudioOn={isLocalAudioOn}
                isVideoOn={isLocalVideoOn}
            />

            {/* Remote Videos */}
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
                />
            ))}
        </div>
    );
}
