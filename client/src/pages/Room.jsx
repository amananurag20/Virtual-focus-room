import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    HiVideoCamera,
    HiUserGroup,
    HiChatBubbleLeftRight,
    HiSun,
    HiMoon,
    HiMicrophone,
    HiPhone,
    HiSignal
} from 'react-icons/hi2';
import { useSocket } from '@/context/SocketContext';
import { useTheme } from '@/context/ThemeContext';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useWebRTC } from '@/hooks/useWebRTC';
import VideoGrid from '@/components/VideoGrid';
import ChatPanel from '@/components/ChatPanel';
import UserList from '@/components/UserList';
import PingOverlay from '@/components/PingOverlay';
import { Button } from '@/components/ui/button';

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { theme, toggleTheme } = useTheme();
    const { stream, isAudioOn, isVideoOn, startStream, stopStream, toggleAudio, toggleVideo } = useMediaStream();
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

    useEffect(() => {
        if (!socket || !isConnected || hasJoinedRef.current) return;
        const initRoom = async () => {
            const mediaStream = await startStream();
            if (mediaStream) toast.success('Camera and microphone ready!');
            else toast.error('Could not access camera/microphone');

            socket.emit('room:join', { roomId, username }, (response) => {
                if (response.success) {
                    setRoomInfo(response.room);
                    hasJoinedRef.current = true;
                    const initialParticipants = {};
                    response.room.participants.forEach(p => {
                        if (p.socketId !== socket.id) initialParticipants[p.socketId] = p;
                    });
                    setParticipants(initialParticipants);
                    if (response.existingUsers?.length > 0) setExistingUsers(response.existingUsers);
                } else {
                    toast.error(response.error || 'Failed to join room');
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

    useEffect(() => {
        if (!stream || existingUsers.length === 0 || hasCalledPeersRef.current) return;
        hasCalledPeersRef.current = true;
        existingUsers.forEach((user, index) => {
            setTimeout(() => initiateCall(user.socketId, user.username), 500 + (index * 500));
        });
    }, [stream, existingUsers, initiateCall]);

    useEffect(() => {
        if (localVideoRef.current && stream) localVideoRef.current.srcObject = stream;
    }, [stream]);

    useEffect(() => {
        if (!socket) return;
        const handleUserJoined = ({ socketId, username }) => {
            toast.success(`${username} joined`);
            setParticipants(prev => ({ ...prev, [socketId]: { socketId, username, isAudioOn: true, isVideoOn: true } }));
        };
        const handleUserLeft = ({ socketId }) => {
            const user = participants[socketId];
            if (user) toast(`${user.username} left`, { icon: '👋' });
            setParticipants(prev => { const u = { ...prev }; delete u[socketId]; return u; });
        };
        const handleMediaToggle = ({ socketId, type, enabled }) => {
            setParticipants(prev => ({ ...prev, [socketId]: { ...prev[socketId], [type === 'audio' ? 'isAudioOn' : 'isVideoOn']: enabled } }));
        };
        const handleChatMessage = (message) => {
            setMessages(prev => [...prev, message]);
            if (!isChatOpen && message.socketId !== socket.id) setUnreadCount(prev => prev + 1);
        };
        const handlePinged = ({ username }) => {
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

    const handleToggleAudio = useCallback(() => { const e = toggleAudio(); socket?.emit('media:toggle', { type: 'audio', enabled: e }); }, [socket, toggleAudio]);
    const handleToggleVideo = useCallback(() => { const e = toggleVideo(); socket?.emit('media:toggle', { type: 'video', enabled: e }); }, [socket, toggleVideo]);
    const handleLeaveRoom = useCallback(() => { socket?.emit('room:leave'); closeAllConnections(); stopStream(); toast('Left the room', { icon: '👋' }); navigate('/'); }, [socket, closeAllConnections, stopStream, navigate]);
    const handleSendMessage = useCallback((message) => { socket?.emit('chat:message', { message }); }, [socket]);
    const handlePingUser = useCallback((targetSocketId) => { socket?.emit('user:ping', { targetSocketId }); toast.success(`Pinged!`); }, [socket]);
    const handleOpenChat = () => { setIsChatOpen(true); setUnreadCount(0); };

    const participantCount = Object.keys(participants).length + 1;

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="h-16 border-b bg-card/50 backdrop-blur-xl px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <HiVideoCamera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-foreground">{roomInfo?.name || 'Focus Room'}</h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Live
                                </span>
                                <span>•</span>
                                <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                        {theme === 'dark' ? <HiSun className="w-5 h-5 text-amber-400" /> : <HiMoon className="w-5 h-5 text-indigo-500" />}
                    </Button>

                    {/* Participants */}
                    <Button
                        variant={isUserListOpen ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setIsUserListOpen(!isUserListOpen)}
                        className="rounded-full"
                    >
                        <HiUserGroup className={`w-5 h-5 ${isUserListOpen ? '' : 'text-sky-500'}`} />
                    </Button>

                    {/* Chat */}
                    <Button
                        variant={isChatOpen ? 'default' : 'ghost'}
                        size="icon"
                        onClick={handleOpenChat}
                        className="rounded-full relative"
                    >
                        <HiChatBubbleLeftRight className={`w-5 h-5 ${isChatOpen ? '' : 'text-emerald-500'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold text-white shadow-lg">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden bg-muted/30">
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
                {isUserListOpen && <UserList participants={participants} username={username} socketId={socket?.id} onPingUser={handlePingUser} onClose={() => setIsUserListOpen(false)} />}
                {isChatOpen && <ChatPanel messages={messages} currentSocketId={socket?.id} onSendMessage={handleSendMessage} onClose={() => setIsChatOpen(false)} />}
            </main>

            {/* Media Controls */}
            <footer className="h-20 border-t bg-card flex items-center justify-center gap-4 shrink-0">
                {/* Mic Button */}
                <Button
                    variant={isAudioOn ? 'secondary' : 'destructive'}
                    size="lg"
                    onClick={handleToggleAudio}
                    className="w-14 h-14 rounded-full shadow-lg"
                >
                    <HiMicrophone className="w-6 h-6" />
                    {!isAudioOn && <span className="absolute w-8 h-0.5 bg-current rotate-45"></span>}
                </Button>

                {/* Camera Button */}
                <Button
                    variant={isVideoOn ? 'secondary' : 'destructive'}
                    size="lg"
                    onClick={handleToggleVideo}
                    className="w-14 h-14 rounded-full shadow-lg"
                >
                    <HiVideoCamera className="w-6 h-6" />
                    {!isVideoOn && <span className="absolute w-8 h-0.5 bg-current rotate-45"></span>}
                </Button>

                {/* Leave Button */}
                <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleLeaveRoom}
                    className="px-8 h-14 rounded-full shadow-lg gap-2"
                >
                    <HiPhone className="w-5 h-5 rotate-[135deg]" />
                    <span className="font-semibold">Leave</span>
                </Button>
            </footer>

            {/* Ping Overlay */}
            {pingTarget?.socketId === 'local' && <PingOverlay username={pingTarget.username} />}
        </div>
    );
}
