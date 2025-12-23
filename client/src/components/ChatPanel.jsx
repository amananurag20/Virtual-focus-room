import { useState, useRef, useEffect } from 'react';
import { HiXMark, HiChatBubbleLeftRight, HiPaperAirplane } from 'react-icons/hi2';

export default function ChatPanel({ messages, currentSocketId, onSendMessage, onClose }) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-80 glass border-l border-[var(--border-color)] flex flex-col animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HiChatBubbleLeftRight className="w-5 h-5 text-[var(--accent-primary)]" />
                    <h3 className="font-semibold">Chat</h3>
                </div>
                <button
                    onClick={onClose}
                    className="btn btn-icon btn-secondary w-8 h-8"
                >
                    <HiXMark className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] py-8">
                        <HiChatBubbleLeftRight className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.socketId === currentSocketId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-[var(--text-muted)]">
                                        {isOwn ? 'You' : msg.username}
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)] opacity-60">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                                <div
                                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${isOwn
                                            ? 'gradient-accent text-white rounded-br-md'
                                            : 'bg-[var(--bg-tertiary)] text-white rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border-color)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input flex-1"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        maxLength={500}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={!inputValue.trim()}
                    >
                        <HiPaperAirplane className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
