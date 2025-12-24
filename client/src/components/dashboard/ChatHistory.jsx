import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HiChatBubbleLeftRight, HiPhoto } from 'react-icons/hi2';

export default function ChatHistory({ messages }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HiChatBubbleLeftRight className="w-5 h-5 text-green-500" />
                    Chat History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {messages && messages.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {messages.map((msg, idx) => (
                            <div
                                key={msg._id || idx}
                                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-sm">{msg.userId?.name || 'You'}</p>
                                            <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
                                        </div>
                                        <p className="text-sm">{msg.content}</p>
                                        {msg.mediaUrl && (
                                            <div className="mt-2">
                                                {msg.mediaType === 'image' ? (
                                                    <img
                                                        src={msg.mediaUrl}
                                                        alt="Attachment"
                                                        className="max-w-xs rounded-lg border"
                                                    />
                                                ) : (
                                                    <a
                                                        href={msg.mediaUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                                    >
                                                        <HiPhoto className="w-4 h-4" />
                                                        View attachment
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No messages yet</p>
                )}
            </CardContent>
        </Card>
    );
}
