import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HiClock, HiCalendar } from 'react-icons/hi2';

export default function MeetingHistory({ sessions }) {
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HiCalendar className="w-5 h-5 text-indigo-500" />
                    Meeting History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {sessions && sessions.length > 0 ? (
                    <div className="space-y-3">
                        {sessions.map((session, idx) => (
                            <div
                                key={session._id || idx}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{session.roomName || 'Focus Room'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(session.joinedAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <HiClock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{formatTime(session.duration || 0)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No meetings yet</p>
                )}
            </CardContent>
        </Card>
    );
}
