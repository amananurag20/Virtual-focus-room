import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    HiVideoCamera,
    HiUserGroup,
    HiChatBubbleLeftRight,
    HiMicrophone,
    HiPhone,
    HiClipboardDocumentList,
    HiPlus,
    HiCheck,
    HiXMark
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
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { theme } = useTheme();
    const { stream, isAudioOn, isVideoOn, startStream, stopStream, toggleAudio, toggleVideo } = useMediaStream();
    const { remoteStreams, initiateCall, closeAllConnections } = useWebRTC(socket, stream);

    const [roomInfo, setRoomInfo] = useState(null);
    const [participants, setParticipants] = useState({});
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [isTodoOpen, setIsTodoOpen] = useState(false);
    const [pingTarget, setPingTarget] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [existingUsers, setExistingUsers] = useState([]);

    // Todo state
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');

    const username = localStorage.getItem('focusroom_username') || 'Anonymous';
    const localVideoRef = useRef(null);
    const hasJoinedRef = useRef(false);
    const hasCalledPeersRef = useRef(false);

    // Theme-aware colors
    const isDark = theme === 'dark';

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

    // Toggle handlers - now properly toggle
    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
        if (!isChatOpen) setUnreadCount(0);
        setIsUserListOpen(false);
        setIsTodoOpen(false);
    };
    const toggleUserList = () => {
        setIsUserListOpen(prev => !prev);
        setIsChatOpen(false);
        setIsTodoOpen(false);
    };
    const toggleTodo = () => {
        setIsTodoOpen(prev => !prev);
        setIsChatOpen(false);
        setIsUserListOpen(false);
    };

    // Todo handlers
    const addTodo = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        setTodos(prev => [...prev, { id: Date.now(), text: newTodo.trim(), done: false }]);
        setNewTodo('');
    };
    const toggleTodoDone = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };
    const deleteTodo = (id) => {
        setTodos(prev => prev.filter(t => t.id !== id));
    };

    const participantCount = Object.keys(participants).length + 1;

    return (
        <div className={`h-screen flex flex-col ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-white to-slate-100'}`}>
            {/* Header */}
            <header className={`h-14 px-5 flex items-center justify-between shrink-0 ${isDark ? '' : 'border-b border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <HiVideoCamera className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{roomInfo?.name || 'Focus Room'}</h1>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                {participantCount} online
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Right: Todo Button */}
                <Button
                    variant={isTodoOpen ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleTodo}
                    className="gap-2"
                >
                    <HiClipboardDocumentList className="w-4 h-4" />
                    <span className="hidden sm:inline">Tasks</span>
                    {todos.filter(t => !t.done).length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                            {todos.filter(t => !t.done).length}
                        </span>
                    )}
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
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

                {/* Side Panels */}
                {isUserListOpen && <UserList participants={participants} username={username} socketId={socket?.id} onPingUser={handlePingUser} onClose={() => setIsUserListOpen(false)} />}
                {isChatOpen && <ChatPanel messages={messages} currentSocketId={socket?.id} onSendMessage={handleSendMessage} onClose={() => setIsChatOpen(false)} />}

                {/* Todo Panel */}
                {isTodoOpen && (
                    <Card className="w-80 h-full border-l rounded-none flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between py-4 border-b shrink-0">
                            <CardTitle className="text-base font-semibold">My Tasks</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsTodoOpen(false)} className="h-8 w-8 rounded-full">
                                <HiXMark className="w-5 h-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 p-3 overflow-y-auto">
                            <form onSubmit={addTodo} className="flex gap-2 mb-4">
                                <Input
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    placeholder="Add a task..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon"><HiPlus className="w-4 h-4" /></Button>
                            </form>

                            <div className="space-y-2">
                                {todos.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">No tasks yet. Add one above!</p>
                                ) : (
                                    todos.map(todo => (
                                        <div
                                            key={todo.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border ${todo.done ? 'bg-muted/50 opacity-60' : 'bg-card'}`}
                                        >
                                            <button
                                                onClick={() => toggleTodoDone(todo.id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${todo.done ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground'
                                                    }`}
                                            >
                                                {todo.done && <HiCheck className="w-3 h-3" />}
                                            </button>
                                            <span className={`flex-1 text-sm ${todo.done ? 'line-through text-muted-foreground' : ''}`}>{todo.text}</span>
                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <HiXMark className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Unified Control Bar */}
            <footer className="py-4 flex items-center justify-center shrink-0">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-xl border shadow-2xl ${isDark
                        ? 'bg-slate-800/90 border-white/10'
                        : 'bg-white/90 border-slate-200'
                    }`}>
                    {/* Mic */}
                    <button
                        onClick={handleToggleAudio}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${isAudioOn
                                ? isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                        title={isAudioOn ? 'Mute' : 'Unmute'}
                    >
                        <HiMicrophone className="w-5 h-5" />
                    </button>

                    {/* Camera */}
                    <button
                        onClick={handleToggleVideo}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${isVideoOn
                                ? isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                        title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                        <HiVideoCamera className="w-5 h-5" />
                    </button>

                    <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`}></div>

                    {/* Participants */}
                    <button
                        onClick={toggleUserList}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${isUserListOpen
                                ? 'bg-sky-500 text-white'
                                : isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                        title="Participants"
                    >
                        <HiUserGroup className="w-5 h-5" />
                    </button>

                    {/* Chat */}
                    <button
                        onClick={toggleChat}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 relative ${isChatOpen
                                ? 'bg-emerald-500 text-white'
                                : isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                        title="Chat"
                    >
                        <HiChatBubbleLeftRight className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`}></div>

                    {/* Leave */}
                    <button
                        onClick={handleLeaveRoom}
                        className="h-11 px-5 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all duration-200"
                    >
                        <HiPhone className="w-4 h-4 rotate-[135deg]" />
                        <span className="text-sm">Leave</span>
                    </button>
                </div>
            </footer>

            {pingTarget?.socketId === 'local' && <PingOverlay username={pingTarget.username} />}
        </div>
    );
}
