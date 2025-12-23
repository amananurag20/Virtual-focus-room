import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useMediaStream } from '../hooks/useMediaStream';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoGrid from '../components/VideoGrid';
import MediaControls from '../components/MediaControls';
import ChatPanel from '../components/ChatPanel';
import UserList from '../components/UserList';
import PingOverlay from '../components/PingOverlay';

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { stream, isAudioOn, isVideoOn, startStream, stopStream, toggleAudio, toggleVideo } = useMediaStream();
    const { peers, remoteStreams, initiateCall, closeAllConnections } = useWebRTC(socket, stream);

    const [roomInfo, setRoomInfo] = useState(null);
    const [participants, setParticipants] = useState({});
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [pingTarget, setPingTarget] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const username = localStorage.getItem('focusroom_username') || 'Anonymous';
    const localVideoRef = useRef(null);
    const hasJoinedRef = useRef(false);

    // Initialize media and join room
    useEffect(() => {
        if (!socket || !isConnected || hasJoinedRef.current) return;

        const initRoom = async () => {
            const mediaStream = await startStream();
            if (!mediaStream) {
                console.error('Failed to get media stream');
            }

            socket.emit('room:join', { roomId, username }, (response) => {
                if (response.success) {
                    setRoomInfo(response.room);
                    hasJoinedRef.current = true;

                    // Initialize participants
                    const initialParticipants = {};
                    response.room.participants.forEach(p => {
                        if (p.socketId !== socket.id) {
                            initialParticipants[p.socketId] = p;
                        }
                    });
                    setParticipants(initialParticipants);

                    // Initiate calls to existing users
                    response.existingUsers?.forEach(user => {
                        setTimeout(() => {
                            initiateCall(user.socketId, user.username);
                        }, 500);
                    });
                } else {
                    navigate('/');
                }
            });
        };

        initRoom();

        return () => {
            if (hasJoinedRef.current) {
                socket.emit('room:leave');
                closeAllConnections();
                stopStream();
            }
        };
    }, [socket, isConnected, roomId]);

    // Set local video ref
    useEffect(() => {
        if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        const handleUserJoined = ({ socketId, username }) => {
            setParticipants(prev => ({
                ...prev,
                [socketId]: { socketId, username, isAudioOn: true, isVideoOn: true }
            }));
        };

        const handleUserLeft = ({ socketId }) => {
            setParticipants(prev => {
                const updated = { ...prev };
                delete updated[socketId];
                return updated;
            });
        };

        const handleMediaToggle = ({ socketId, type, enabled }) => {
            setParticipants(prev => ({
                ...prev,
                [socketId]: {
                    ...prev[socketId],
                    [type === 'audio' ? 'isAudioOn' : 'isVideoOn']: enabled
                }
            }));
        };

        const handleChatMessage = (message) => {
            setMessages(prev => [...prev, message]);
            if (!isChatOpen && message.socketId !== socket.id) {
                setUnreadCount(prev => prev + 1);
            }
        };

        const handlePinged = ({ from, username }) => {
            setPingTarget({ socketId: 'local', username });
            setTimeout(() => setPingTarget(null), 3000);
        };

        socket.on('user:joined', handleUserJoined);
        socket.on('user:left', handleUserLeft);
        socket.on('user:media-toggle', handleMediaToggle);
        socket.on('chat:message', handleChatMessage);
        socket.on('user:pinged', handlePinged);

        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('user:left', handleUserLeft);
            socket.off('user:media-toggle', handleMediaToggle);
            socket.off('chat:message', handleChatMessage);
            socket.off('user:pinged', handlePinged);
        };
    }, [socket, isChatOpen]);

    const handleToggleAudio = useCallback(() => {
        const enabled = toggleAudio();
        socket?.emit('media:toggle', { type: 'audio', enabled });
    }, [socket, toggleAudio]);

    const handleToggleVideo = useCallback(() => {
        const enabled = toggleVideo();
        socket?.emit('media:toggle', { type: 'video', enabled });
    }, [socket, toggleVideo]);

    const handleLeaveRoom = useCallback(() => {
        socket?.emit('room:leave');
        closeAllConnections();
        stopStream();
        navigate('/');
    }, [socket, closeAllConnections, stopStream, navigate]);

    const handleSendMessage = useCallback((message) => {
        socket?.emit('chat:message', { message });
    }, [socket]);

    const handlePingUser = useCallback((targetSocketId) => {
        socket?.emit('user:ping', { targetSocketId });
    }, [socket]);

    const handleOpenChat = () => {
        setIsChatOpen(true);
        setUnreadCount(0);
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="glass px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-semibold text-white">{roomInfo?.name || 'Focus Room'}</h1>
                        <p className="text-xs text-[var(--text-muted)]">
                            {Object.keys(participants).length + 1} participant{Object.keys(participants).length !== 0 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* User List Toggle */}
                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={() => setIsUserListOpen(!isUserListOpen)}
                        title="Participants"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {/* Chat Toggle */}
                    <button
                        className="btn btn-icon btn-secondary relative"
                        onClick={handleOpenChat}
                        title="Chat"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] text-xs flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Video Grid */}
                <div className="flex-1 p-4 overflow-auto">
                    <VideoGrid
                        localStream={stream}
                        localVideoRef={localVideoRef}
                        isLocalAudioOn={isAudioOn}
                        isLocalVideoOn={isVideoOn}
                        username={username}
                        participants={participants}
                        remoteStreams={remoteStreams}
                        pingTarget={pingTarget}
                        onPingUser={handlePingUser}
                    />
                </div>

                {/* User List Sidebar */}
                {isUserListOpen && (
                    <UserList
                        participants={participants}
                        username={username}
                        socketId={socket?.id}
                        onPingUser={handlePingUser}
                        onClose={() => setIsUserListOpen(false)}
                    />
                )}

                {/* Chat Panel */}
                {isChatOpen && (
                    <ChatPanel
                        messages={messages}
                        currentSocketId={socket?.id}
                        onSendMessage={handleSendMessage}
                        onClose={() => setIsChatOpen(false)}
                    />
                )}
            </main>

            {/* Media Controls */}
            <MediaControls
                isAudioOn={isAudioOn}
                isVideoOn={isVideoOn}
                onToggleAudio={handleToggleAudio}
                onToggleVideo={handleToggleVideo}
                onLeave={handleLeaveRoom}
            />

            {/* Ping Overlay */}
            {pingTarget?.socketId === 'local' && (
                <PingOverlay username={pingTarget.username} />
            )}
        </div>
    );
}
