import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiVideoCamera, HiPlus, HiUserGroup, HiCube, HiSparkles } from 'react-icons/hi2';
import { useSocket } from '../context/SocketContext';

export default function Home() {
    const { socket, isConnected, rooms } = useSocket();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateRoom = () => {
        if (!username.trim()) {
            toast.error('Please enter your name');
            return;
        }

        if (!isConnected) {
            toast.error('Not connected to server');
            return;
        }

        setIsCreating(true);
        socket.emit('room:create', {
            roomName: roomName.trim() || `${username}'s Room`,
            username: username.trim()
        }, (response) => {
            setIsCreating(false);
            if (response.success) {
                localStorage.setItem('focusroom_username', username);
                toast.success('Room created successfully!');
                navigate(`/room/${response.roomId}`);
            } else {
                toast.error(response.error || 'Failed to create room');
            }
        });
    };

    const handleJoinRoom = (roomId) => {
        if (!username.trim()) {
            toast.error('Please enter your name first');
            return;
        }

        socket.emit('room:join', {
            roomId,
            username: username.trim()
        }, (response) => {
            if (response.success) {
                localStorage.setItem('focusroom_username', username);
                toast.success('Joined room!');
                navigate(`/room/${roomId}`);
            } else {
                toast.error(response.error || 'Failed to join room');
            }
        });
    };

    return (
        <div className="min-h-screen gradient-bg flex flex-col">
            {/* Header */}
            <header className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
                        <HiVideoCamera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">FocusRoom</h1>
                        <p className="text-sm text-[var(--text-muted)]">Virtual Study Space</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
                    {/* Left: Join/Create Panel */}
                    <div className="card p-8 animate-fade-in">
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-3">
                                <HiSparkles className="w-5 h-5 text-[var(--accent-primary)]" />
                                <span className="text-sm font-medium text-[var(--accent-primary)]">Stay Focused Together</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-3">Welcome to FocusRoom</h2>
                            <p className="text-[var(--text-secondary)]">
                                Join a virtual study room and stay focused with others around the world
                            </p>
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                            <div className={`status-dot ${isConnected ? 'status-online' : 'status-offline'}`}></div>
                            <span className="text-sm text-[var(--text-muted)]">
                                {isConnected ? 'Connected to server' : 'Connecting...'}
                            </span>
                        </div>

                        {/* Username Input */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                                Your Display Name
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter your name..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                maxLength={30}
                            />
                        </div>

                        {/* Room Name Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                                Room Name <span className="text-[var(--text-muted)]">(optional)</span>
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="My Study Session..."
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        {/* Create Room Button */}
                        <button
                            className="btn btn-primary w-full text-base py-4"
                            onClick={handleCreateRoom}
                            disabled={!isConnected || isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Creating Room...
                                </>
                            ) : (
                                <>
                                    <HiPlus className="w-5 h-5" />
                                    Create New Room
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right: Active Rooms */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <HiCube className="w-5 h-5 text-[var(--accent-secondary)]" />
                                <h3 className="text-lg font-semibold">Active Rooms</h3>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[var(--bg-tertiary)] text-sm text-[var(--text-muted)]">
                                {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                            {rooms.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-4 flex items-center justify-center">
                                        <HiCube className="w-10 h-10 text-[var(--text-muted)]" />
                                    </div>
                                    <p className="font-medium text-[var(--text-secondary)]">No active rooms</p>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Be the first to create one!</p>
                                </div>
                            ) : (
                                rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="card card-hover p-4 cursor-pointer group"
                                        onClick={() => handleJoinRoom(room.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium mb-1 truncate">{room.name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                                    <HiUserGroup className="w-4 h-4" />
                                                    <span>{room.participantCount} participant{room.participantCount !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary text-sm py-2 px-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Join
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-sm text-[var(--text-muted)]">
                <p>Focus better together • Built with 💜</p>
            </footer>
        </div>
    );
}
