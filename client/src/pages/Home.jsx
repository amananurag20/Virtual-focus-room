import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiVideoCamera, HiArrowRight, HiUserGroup, HiSparkles, HiSun, HiMoon, HiGlobeAlt } from 'react-icons/hi2';
import { useSocket } from '@/context/SocketContext';
import { useTheme } from '@/context/ThemeContext';

// Shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Home() {
    const { socket, isConnected, rooms } = useSocket();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

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
            document.getElementById('username-input')?.focus();
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

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        toast.success(authMode === 'login' ? 'Logged in!' : 'Account created!');
        setAuthDialogOpen(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                            <HiVideoCamera className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">FocusRoom</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                        </Button>

                        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => { setAuthMode('login'); setAuthDialogOpen(true); }}>Log In</Button>
                            </DialogTrigger>
                            <DialogTrigger asChild>
                                <Button onClick={() => { setAuthMode('signup'); setAuthDialogOpen(true); }}>Sign Up</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
                                    <DialogDescription>
                                        {authMode === 'login' ? 'Login to save your progress.' : 'Sign up to track your focus hours.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAuthSubmit} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="you@example.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" type="password" placeholder="••••••••" required />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        {authMode === 'login' ? 'Log In' : 'Sign Up'}
                                    </Button>
                                    <p className="text-center text-sm text-muted-foreground">
                                        {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                        <button type="button" className="text-primary underline" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                                            {authMode === 'login' ? 'Sign Up' : 'Log In'}
                                        </button>
                                    </p>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 py-16 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left: Hero + Form */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            {rooms.reduce((a, r) => a + (r.participantCount || 0), 0) + 124} people focusing now
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight">
                            Your virtual <br />
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">focus sanctuary.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                            Join a community of focused individuals. No distractions, just pure productivity in a shared virtual space.
                        </p>

                        <Card>
                            <CardHeader>
                                <CardTitle>Start a Session</CardTitle>
                                <CardDescription>No signup required. Just enter your name and go.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username-input">Display Name</Label>
                                    <Input
                                        id="username-input"
                                        placeholder="Enter your name"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        maxLength={25}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="room-name">Room Name <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                    <Input
                                        id="room-name"
                                        placeholder="e.g. Deep Work Session"
                                        value={roomName}
                                        onChange={e => setRoomName(e.target.value)}
                                        maxLength={40}
                                    />
                                </div>
                                <Button onClick={handleCreateRoom} disabled={isCreating} className="w-full" size="lg">
                                    {isCreating ? 'Creating...' : (
                                        <span className="flex items-center gap-2">Start Focusing <HiArrowRight className="w-4 h-4" /></span>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Room List */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HiSparkles className="w-5 h-5 text-primary" />
                                    <CardTitle>Live Sessions</CardTitle>
                                </div>
                                <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{rooms.length} active</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {rooms.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                        <HiGlobeAlt className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground">No active rooms yet.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Create the first one!</p>
                                    </div>
                                ) : (
                                    rooms.map(room => (
                                        <div
                                            key={room.id}
                                            onClick={() => handleJoinRoom(room.id)}
                                            className="group p-4 rounded-xl border hover:border-primary hover:shadow-lg transition-all cursor-pointer flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{room.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold group-hover:text-primary transition-colors">{room.name}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <HiUserGroup className="w-4 h-4" /> {room.participantCount}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                Join <HiArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="py-6 text-center text-sm text-muted-foreground border-t">
                <p>&copy; 2025 FocusRoom • Designed for productivity</p>
            </footer>
        </div>
    );
}
