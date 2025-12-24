import { HiXMark, HiBellAlert, HiEye, HiStar } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function UserList({ participants, username, socketId, onPingUser, onClose }) {
    const { tier, isPremium, isGuest } = useAuth();
    const participantList = Object.values(participants);

    // Get tier badge for participants
    const getTierBadge = (userTier) => {
        if (userTier === 'premium') {
            return (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                    <HiStar className="w-2.5 h-2.5" /> Pro
                </span>
            );
        }
        if (userTier === 'guest') {
            return (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-500 text-white font-semibold">
                    <HiEye className="w-2.5 h-2.5" /> Guest
                </span>
            );
        }
        return null;
    };

    // Get avatar gradient based on tier
    const getAvatarGradient = (userTier) => {
        if (userTier === 'premium') return 'from-amber-500 to-orange-500';
        if (userTier === 'guest') return 'from-slate-500 to-slate-600';
        return 'from-emerald-500 to-teal-600';
    };

    return (
        <Card className="w-80 h-full border-l rounded-none animate-in slide-in-from-right-5 duration-300">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
                <CardTitle className="text-base font-semibold">Participants ({participantList.length + 1})</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <HiXMark className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent className="p-3 space-y-2 overflow-y-auto h-[calc(100%-65px)]">
                {/* Current User */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${isPremium ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30' : 'bg-primary/10 border-primary/20'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${isPremium ? 'from-amber-500 to-orange-500' : isGuest ? 'from-slate-500 to-slate-600' : 'from-indigo-500 to-purple-600'} flex items-center justify-center text-sm font-bold text-white shadow`}>
                            {username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{username}</p>
                                {isPremium && (
                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                                        <HiStar className="w-2.5 h-2.5" /> Pro
                                    </span>
                                )}
                                {isGuest && (
                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-500 text-white font-semibold">
                                        <HiEye className="w-2.5 h-2.5" /> Guest
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">You</p>
                        </div>
                    </div>
                </div>

                {/* Other Participants */}
                {participantList.map(participant => {
                    const isParticipantGuest = participant.userTier === 'guest';

                    return (
                        <div
                            key={participant.socketId}
                            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(participant.userTier)} flex items-center justify-center text-sm font-bold text-white shadow`}>
                                    {participant.username?.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm">{participant.username}</p>
                                        {getTierBadge(participant.userTier)}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {isParticipantGuest ? (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <HiEye className="w-3 h-3" /> View only
                                            </span>
                                        ) : (
                                            <>
                                                <span className={`w-2 h-2 rounded-full ${participant.isAudioOn ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="text-xs text-muted-foreground">{participant.isAudioOn ? 'Mic on' : 'Muted'}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!isParticipantGuest && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onPingUser(participant.socketId)}
                                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                                >
                                    <HiBellAlert className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    );
                })}

                {participantList.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No other participants yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
