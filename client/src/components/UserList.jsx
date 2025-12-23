import { HiXMark, HiUserGroup, HiBellAlert, HiMicrophone, HiVideoCamera } from 'react-icons/hi2';

export default function UserList({ participants, username, socketId, onPingUser, onClose }) {
    const participantList = Object.values(participants);

    return (
        <div className="w-72 glass border-l border-[var(--border-color)] flex flex-col animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HiUserGroup className="w-5 h-5 text-[var(--accent-primary)]" />
                    <h3 className="font-semibold">Participants</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-xs">
                        {participantList.length + 1}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="btn btn-icon btn-secondary w-8 h-8"
                >
                    <HiXMark className="w-4 h-4" />
                </button>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Self */}
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--accent-primary)]/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-sm font-bold shadow-md">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{username}</p>
                            <p className="text-xs text-[var(--accent-primary)]">You</p>
                        </div>
                    </div>
                </div>

                {/* Other Participants */}
                {participantList.map((participant) => (
                    <div
                        key={participant.socketId}
                        className="p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-sm font-bold">
                                    {participant.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--accent-success)] border-2 border-[var(--bg-secondary)]"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{participant.username || 'User'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {/* Audio Status */}
                                    <div className={`relative ${participant.isAudioOn ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
                                        <HiMicrophone className="w-3.5 h-3.5" />
                                        {!participant.isAudioOn && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-full h-px bg-current rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Video Status */}
                                    <div className={`relative ${participant.isVideoOn ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
                                        <HiVideoCamera className="w-3.5 h-3.5" />
                                        {!participant.isVideoOn && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-full h-px bg-current rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Ping Button */}
                            <button
                                onClick={() => onPingUser(participant.socketId)}
                                className="btn btn-icon btn-secondary w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Ping user"
                            >
                                <HiBellAlert className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {participantList.length === 0 && (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        <HiUserGroup className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">No other participants</p>
                        <p className="text-xs mt-1">Share the room link!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
