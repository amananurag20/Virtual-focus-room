import { HiXMark, HiBellAlert, HiMicrophone, HiVideoCamera } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function UserList({ participants, username, socketId, onPingUser, onClose }) {
    const participantList = Object.values(participants);

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
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow">
                            {username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{username}</p>
                            <p className="text-xs text-muted-foreground">You</p>
                        </div>
                    </div>
                </div>

                {/* Other Participants */}
                {participantList.map(participant => (
                    <div
                        key={participant.socketId}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow">
                                {participant.username?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{participant.username}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${participant.isAudioOn ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-xs text-muted-foreground">{participant.isAudioOn ? 'Mic on' : 'Muted'}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPingUser(participant.socketId)}
                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                        >
                            <HiBellAlert className="w-4 h-4" />
                        </Button>
                    </div>
                ))}

                {participantList.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No other participants yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
