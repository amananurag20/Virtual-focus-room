import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiVideoCamera, HiUserGroup, HiChatBubbleLeftRight } from 'react-icons/hi2';
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
    const { stream, isAudioOn, isVideoOn, error: mediaError, startStream, stopStream, toggleAudio, toggleVideo } = useMediaStream();
    const { remoteStreams, initiateCall, closeAllConnections } = useWebRTC(socket, stream);

    const [roomInfo, setRoomInfo] = useState(null);
    const [participants, setParticipants] = useState({});
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [pingTarget, setPingTarget] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [existingUsers, setExistingUsers] = useState([]);

    const username = localStorage.getItem('focusroom_username') || 'Anonymous';
    const localVideoRef = useRef(null);
    const hasJoinedRef = useRef(false);
    const hasCalledPeersRef = useRef(false);

    // Initialize media and join room
    useEffect(() => {
        if (!socket || !isConnected || hasJoinedRef.current) return;

        const initRoom = async () => {
            console.log('[Room] Initializing room...');

            // Start media stream first
            const mediaStream = await startStream();

            if (mediaStream) {
                console.log('[Room] Media stream ready');
                toast.success('Camera and microphone ready!');
            } else {
                console.log('[Room] No media stream available');
                toast.error('Could not access camera/microphone');
            }

            // Join the room
            socket.emit('room:join', { roomId, username }, (response) => {
                if (response.success) {
                    console.log('[Room] Joined room successfully');
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

                    // Store existing users to call them once stream is ready
                    if (response.existingUsers?.length > 0) {
                        console.log('[Room] Existing users to call:', response.existingUsers);
                        setExistingUsers(response.existingUsers);
                    }
                } else {
                    toast.error(response.error || 'Failed to join room');
                    navigate('/');
                }
            });
        };

        initRoom();

        return () => {
            if (hasJoinedRef.current) {
                console.log('[Room] Leaving room...');
                socket.emit('room:leave');
                closeAllConnections();
                stopStream();
            }
        };
    }, [socket, isConnected, roomId]);

    // Call existing users AFTER stream is ready
    useEffect(() => {
        if (!stream || existingUsers.length === 0 || hasCalledPeersRef.current) return;

        console.log('[Room] Stream ready, calling existing users...');
        hasCalledPeersRef.current = true;

        existingUsers.forEach((user, index) => {
            setTimeout(() => {
                console.log('[Room] Calling user:', user.username);
                initiateCall(user.socketId, user.username);
            }, 500 + (index * 500)); // Stagger calls
        });
    }, [stream, existingUsers, initiateCall]);

    // Set local video ref
    useEffect(() => {
        if (localVideoRef.current && stream) {
            console.log('[Room] Setting local video srcObject');
            localVideoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        const handleUserJoined = ({ socketId, username }) => {
            console.log('[Room] User joined:', username, socketId);
            toast.success(`${username} joined the room`);
            setParticipants(prev => ({
                ...prev,
                [socketId]: { socketId, username, isAudioOn: true, isVideoOn: true }
            }));
            // The new user will send us an offer, we don't need to call them
        };

        const handleUserLeft = ({ socketId }) => {
            const user = participants[socketId];
            console.log('[Room] User left:', user?.username || socketId);
            if (user) {
                toast(`${user.username || 'User'} left the room`, { icon: '👋' });
            }
            setParticipants(prev => {
                const updated = { ...prev };
                delete updated[socketId];
                return updated;
            });
        };

        const handleMediaToggle = ({ socketId, type, enabled }) => {
            console.log('[Room] Media toggle:', socketId, type, enabled);
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
            toast(`${username} pinged you!`, { icon: '🔔' });
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
    }, [socket, isChatOpen, participants]);

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
        toast('Left the room', { icon: '👋' });
        navigate('/');
    }, [socket, closeAllConnections, stopStream, navigate]);

    const handleSendMessage = useCallback((message) => {
        socket?.emit('chat:message', { message });
    }, [socket]);

    const handlePingUser = useCallback((targetSocketId) => {
        const user = participants[targetSocketId];
        socket?.emit('user:ping', { targetSocketId });
        toast.success(`Pinged ${user?.username || 'user'}!`);
    }, [socket, participants]);

    const handleOpenChat = () => {
        setIsChatOpen(true);
        setUnreadCount(0);
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="glass px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center shadow-md">
                        <HiVideoCamera className="w-5 h-5 text-white" />
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
                        className={`btn btn-icon btn-secondary ${isUserListOpen ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)]' : ''}`}
                        onClick={() => setIsUserListOpen(!isUserListOpen)}
                        title="Participants"
                    >
                        <HiUserGroup className="w-5 h-5" />
                    </button>

                    {/* Chat Toggle */}
                    <button
                        className={`btn btn-icon btn-secondary relative ${isChatOpen ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)]' : ''}`}
                        onClick={handleOpenChat}
                        title="Chat"
                    >
                        <HiChatBubbleLeftRight className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-accent text-xs flex items-center justify-center font-medium">
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
