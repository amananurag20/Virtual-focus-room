import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    HiVideoCamera,
    HiArrowRight,
    HiUserGroup,
    HiSparkles,
    HiSun,
    HiMoon,
    HiGlobeAlt,
    HiShieldCheck
} from 'react-icons/hi2';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
    const { socket, isConnected, rooms } = useSocket();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // State
    const [username, setUsername] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('join'); // 'join' or 'rooms'

    // Handlers
    const handleCreateRoom = () => {
        if (!username.trim()) return toast.error('Please enter your name');
        if (!isConnected) return toast.error('Connection lost. Reconnecting...');

        setIsCreating(true);
        socket.emit('room:create', {
            roomName: roomName.trim() || `${username}'s Space`,
            username: username.trim()
        }, (response) => {
            setIsCreating(false);
            if (response.success) {
                localStorage.setItem('focusroom_username', username);
                navigate(`/room/${response.roomId}`);
            } else {
                toast.error(response.error || 'Failed to create room');
            }
        });
    };

    const handleJoinRoom = (roomId) => {
        if (!username.trim()) {
            document.getElementById('username-input').focus();
            return toast.error('Please enter your name first');
        }

        socket.emit('room:join', { roomId, username: username.trim() }, (response) => {
            if (response.success) {
                localStorage.setItem('focusroom_username', username);
                navigate(`/room/${roomId}`);
            } else {
                toast.error(response.error);
            }
        });
    };

    return (
        <div className="min-h-screen gradient-bg flex flex-col relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[var(--accent-primary)]/5 to-transparent pointer-events-none" />

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20">
                        <HiVideoCamera className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">FocusRoom</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                    >
                        {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                    </button>
                    <button className="hidden sm:inline-flex text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        Log In
                    </button>
                    <button className="hidden sm:inline-flex btn btn-primary py-2 px-5 text-sm rounded-full">
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col justify-center px-6 py-10 relative z-10">
                <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Input & Actions */}
                    <div className="space-y-8 animate-enter">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-sm font-medium mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]"></span>
                                </span>
                                {rooms.reduce((acc, r) => acc + (r.participantCount || 0), 0) + 124} people focusing now
                            </div>

                            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] mb-6">
                                Your virtual <br />
                                <span className="gradient-text">focus sanctuary.</span>
                            </h1>
                            <p className="text-lg text-[var(--text-secondary)] max-w-md leading-relaxed">
                                Join a community of focused individuals. No distractions, just pure productivity in a shared virtual space.
                            </p>
                        </div>

                        <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 w-fit mb-8">
                            <button
                                onClick={() => setActiveTab('join')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'join'
                                        ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                Start Session
                            </button>
                            <button
                                onClick={() => setActiveTab('rooms')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'rooms'
                                        ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                Browse Rooms
                            </button>
                        </div>

                        {activeTab === 'join' ? (
                            <div className="space-y-4 max-w-md animate-enter">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 ml-1">Display Name</label>
                                    <input
                                        id="username-input"
                                        type="text"
                                        className="input-premium"
                                        placeholder="Enter your name"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        maxLength={25}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 ml-1">Room Name <span className="opacity-50 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        className="input-premium"
                                        placeholder="e.g. Deep Work Session"
                                        value={roomName}
                                        onChange={e => setRoomName(e.target.value)}
                                        maxLength={40}
                                    />
                                </div>
                                <button
                                    onClick={handleCreateRoom}
                                    disabled={isCreating}
                                    className="btn btn-primary w-full py-4 text-lg mt-2 group"
                                >
                                    {isCreating ? 'Creating Space...' : (
                                        <span className="flex items-center gap-2">
                                            Start Focusing <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                                <p className="text-center text-xs text-[var(--text-muted)] mt-4">
                                    By joining, you agree to our <a href="#" className="underline decoration-[var(--border-color)] hover:text-[var(--text-primary)]">Community Guidelines</a>.
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-md animate-enter">
                                <div className="space-y-3 h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                    {rooms.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                                            <HiGlobeAlt className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                                            <p className="text-[var(--text-secondary)]">No active rooms yet.</p>
                                            <button onClick={() => setActiveTab('join')} className="text-[var(--accent-primary)] text-sm font-medium mt-2 hover:underline">
                                                Create the first one
                                            </button>
                                        </div>
                                    ) : (
                                        rooms.map(room => (
                                            <div
                                                key={room.id}
                                                onClick={() => handleJoinRoom(room.id)}
                                                className="group p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:shadow-lg hover:shadow-[var(--accent-glow)]/10 transition-all cursor-pointer flex items-center justify-between"
                                            >
                                                <div>
                                                    <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{room.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">
                                                        <span className="flex items-center gap-1"><HiUserGroup className="w-4 h-4" /> {room.participantCount}</span>
                                                        <span>•</span>
                                                        <span>Just now</span>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-primary)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                    <HiArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Visuals/Stats */}
                    <div className="hidden lg:block relative">
                        {/* Abstract glow behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative grid grid-cols-2 gap-6 animate-float">
                            <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center aspect-square card-hoverable">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center mb-4 text-[var(--accent-primary)]">
                                    <HiShieldCheck className="w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{rooms.length + 84}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Active Sessions</p>
                            </div>

                            <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center aspect-square card-hoverable mt-12">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-secondary)]/10 flex items-center justify-center mb-4 text-[var(--accent-secondary)]">
                                    <HiSparkles className="w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">12k+</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Focus Hours</p>
                            </div>

                            {/* Floating User Cards */}
                            <div className="absolute top-1/4 -right-8 glass-panel py-3 px-5 rounded-2xl flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                                <span className="text-sm font-medium">Alex joined Deep Work</span>
                            </div>

                            <div className="absolute bottom-1/4 -left-8 glass-panel py-3 px-5 rounded-2xl flex items-center gap-3 animate-float" style={{ animationDelay: '2s' }}>
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)] shadow-lg shadow-[var(--accent-secondary)]/50"></div>
                                <span className="text-sm font-medium">Sarah started a session</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
                <p>&copy; 2025 FocusRoom • Designed for productivity</p>
            </footer>
        </div>
    );
}
