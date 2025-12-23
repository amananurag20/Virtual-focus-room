import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Home() {
    const { socket, isConnected, rooms } = useSocket();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    const handleCreateRoom = () => {
        if (!username.trim()) {
            setError('Please enter your name');
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
                navigate(`/room/${response.roomId}`);
            } else {
                setError(response.error || 'Failed to create room');
            }
        });
    };

    const handleJoinRoom = (roomId) => {
        if (!username.trim()) {
            setError('Please enter your name first');
            return;
        }

        socket.emit('room:join', {
            roomId,
            username: username.trim()
        }, (response) => {
            if (response.success) {
                localStorage.setItem('focusroom_username', username);
                navigate(`/room/${roomId}`);
            } else {
                setError(response.error || 'Failed to join room');
            }
        });
    };

    return (
        <div className="min-h-screen gradient-bg flex flex-col">
            {/* Header */}
            <header className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">FocusRoom</h1>
                        <p className="text-xs text-[var(--text-muted)]">Virtual Study Space</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
                    {/* Left: Join/Create Panel */}
                    <div className="card p-8 animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Welcome to FocusRoom</h2>
                            <p className="text-[var(--text-secondary)]">
                                Join a virtual study room and stay focused with others
                            </p>
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className={`status-dot ${isConnected ? 'status-online' : 'status-offline'}`}></div>
                            <span className="text-sm text-[var(--text-muted)]">
                                {isConnected ? 'Connected' : 'Connecting...'}
                            </span>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/30 text-[var(--accent-danger)] text-sm">
                                {error}
                            </div>
                        )}

                        {/* Username Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                                Your Name
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter your name..."
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                                maxLength={30}
                            />
                        </div>

                        {/* Room Name Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                                Room Name (optional)
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="My Study Room..."
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        {/* Create Room Button */}
                        <button
                            className="btn btn-primary w-full"
                            onClick={handleCreateRoom}
                            disabled={!isConnected || isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create New Room
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right: Active Rooms */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Active Rooms</h3>
                            <span className="text-sm text-[var(--text-muted)]">{rooms.length} rooms</span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {rooms.length === 0 ? (
                                <div className="card p-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-4 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <p className="text-[var(--text-muted)]">No active rooms</p>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Be the first to create one!</p>
                                </div>
                            ) : (
                                rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="card card-hover p-4 cursor-pointer"
                                        onClick={() => handleJoinRoom(room.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium mb-1">{room.name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span>{room.participantCount} participant{room.participantCount !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            <button className="btn btn-secondary text-sm py-2 px-4">
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
                Focus better together • Built with 💜
            </footer>
        </div>
    );
}
