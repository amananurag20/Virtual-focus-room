import { useState, useRef, useEffect } from 'react';
import { HiXMark, HiPaperAirplane } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ChatPanel({ messages, currentSocketId, onSendMessage, onClose }) {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSendMessage(message.trim());
        setMessage('');
    };

    return (
        <Card className="w-80 h-full border-l rounded-none flex flex-col animate-in slide-in-from-right-5 duration-300">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b shrink-0">
                <CardTitle className="text-base font-semibold">Chat</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <HiXMark className="w-5 h-5" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-3 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwn = msg.socketId === currentSocketId;
                        return (
                            <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                                    {!isOwn && (
                                        <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.username}</p>
                                    )}
                                    <div className={`px-4 py-2.5 rounded-2xl ${isOwn
                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                            : 'bg-muted rounded-bl-md'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                    </div>
                                    <p className={`text-[10px] text-muted-foreground mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            <form onSubmit={handleSubmit} className="p-3 border-t shrink-0 flex gap-2">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    maxLength={500}
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                    <HiPaperAirplane className="w-4 h-4" />
                </Button>
            </form>
        </Card>
    );
}
