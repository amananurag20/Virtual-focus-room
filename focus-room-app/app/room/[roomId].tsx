import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSocket, ChatMessage, Participant } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { useCamera, CameraView } from "@/context/CameraContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RoomScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ roomId: string; roomName: string }>();
    const { currentRoom, participants, messages, leaveRoom, sendMessage, isConnected, socket } = useSocket();
    const { user, isLoggedIn } = useAuth();
    const {
        hasPermission,
        isAudioEnabled,
        isVideoEnabled,
        cameraType,
        toggleAudio,
        toggleVideo,
        switchCamera,
    } = useCamera();

    const [messageText, setMessageText] = useState("");
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Filter unique participants by socketId
    const uniqueParticipants = useMemo(() => {
        const seen = new Set<string>();
        return participants.filter((p) => {
            if (seen.has(p.socketId)) {
                return false;
            }
            seen.add(p.socketId);
            return true;
        });
    }, [participants]);

    // Handle leaving room
    const handleLeave = () => {
        Alert.alert("Leave Room", "Are you sure you want to leave this room?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Leave",
                style: "destructive",
                onPress: () => {
                    // Emit media toggle to notify others
                    socket?.emit("media:toggle", { type: "video", enabled: false });
                    socket?.emit("media:toggle", { type: "audio", enabled: false });
                    leaveRoom();
                    router.back();
                },
            },
        ]);
    };

    // Send message
    const handleSend = () => {
        if (messageText.trim() && isLoggedIn) {
            sendMessage(messageText.trim());
            setMessageText("");
        }
    };

    // Notify others about media status
    useEffect(() => {
        if (socket && isConnected) {
            socket.emit("media:toggle", { type: "audio", enabled: isAudioEnabled });
        }
    }, [isAudioEnabled, socket, isConnected]);

    useEffect(() => {
        if (socket && isConnected) {
            socket.emit("media:toggle", { type: "video", enabled: isVideoEnabled });
        }
    }, [isVideoEnabled, socket, isConnected]);

    // Auto scroll to bottom on new messages
    useEffect(() => {
        if (showChat) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages, showChat]);

    const roomName = currentRoom?.name || params.roomName || "Focus Room";

    // Calculate video grid layout
    const getGridLayout = () => {
        const count = uniqueParticipants.length;
        if (count <= 1) return { cols: 1, rows: 1 };
        if (count === 2) return { cols: 2, rows: 1 };
        if (count <= 4) return { cols: 2, rows: 2 };
        if (count <= 6) return { cols: 2, rows: 3 };
        return { cols: 3, rows: Math.ceil(count / 3) };
    };

    const { cols, rows } = getGridLayout();
    const GRID_GAP = 8;
    const cellWidth = (SCREEN_WIDTH - GRID_GAP * (cols + 1) - 16) / cols;
    const videoContainerHeight = showChat || showParticipants ? SCREEN_HEIGHT * 0.35 : SCREEN_HEIGHT * 0.55;
    const cellHeight = Math.min((videoContainerHeight - GRID_GAP * (rows + 1)) / rows, cellWidth * 1.2);

    // Render participant video cell
    const renderParticipantCell = (participant: Participant, index: number) => {
        const isMe = participant.socketId === socket?.id;
        const showVideo = isMe ? (hasPermission && isVideoEnabled) : participant.isVideoEnabled !== false;

        return (
            <View key={`${participant.socketId}-${index}`} style={[styles.videoCell, { width: cellWidth, height: cellHeight }]}>
                {isMe && hasPermission && isVideoEnabled ? (
                    <CameraView
                        style={styles.videoStream}
                        facing={cameraType}
                    />
                ) : (
                    <LinearGradient colors={["#1e1e3f", "#0f0f2a"]} style={styles.noVideoPlaceholder}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{participant.username?.charAt(0).toUpperCase() || "?"}</Text>
                        </View>
                        {!showVideo && (
                            <View style={styles.cameraOffBadge}>
                                <Ionicons name="videocam-off" size={14} color="#fff" />
                            </View>
                        )}
                    </LinearGradient>
                )}

                {/* Overlay info */}
                <View style={styles.videoOverlay}>
                    <View style={styles.videoInfoRow}>
                        <Text style={styles.videoName} numberOfLines={1}>
                            {isMe ? "You" : participant.username}
                        </Text>
                        {(isMe ? !isAudioEnabled : participant.isAudioEnabled === false) && (
                            <View style={styles.mutedBadge}>
                                <Ionicons name="mic-off" size={12} color="#fff" />
                            </View>
                        )}
                    </View>
                </View>

                {/* Switch camera for local video */}
                {isMe && hasPermission && isVideoEnabled && (
                    <Pressable style={styles.switchCameraBtn} onPress={switchCamera}>
                        <Ionicons name="camera-reverse" size={16} color="#fff" />
                    </Pressable>
                )}
            </View>
        );
    };

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backBtn} onPress={handleLeave}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <Text style={styles.roomName} numberOfLines={1}>{roomName}</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
                            <Text style={styles.statusText}>{isConnected ? "Connected" : "Reconnecting..."}</Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <Pressable
                            style={[styles.headerBtn, showParticipants && styles.headerBtnActive]}
                            onPress={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
                        >
                            <Ionicons name="people" size={18} color="#a78bfa" />
                            <Text style={styles.participantCount}>{uniqueParticipants.length}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Live Session Banner */}
                <LinearGradient colors={["rgba(139,92,246,0.15)", "rgba(99,102,241,0.1)"]} style={styles.infoBanner}>
                    <Ionicons name="videocam" size={18} color="#a78bfa" />
                    <Text style={styles.infoText}>Focus session in progress</Text>
                    <View style={styles.liveTag}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </LinearGradient>

                {/* Video Grid */}
                <View style={[styles.videoContainer, { height: videoContainerHeight }]}>
                    <ScrollView contentContainerStyle={styles.videoGrid} showsVerticalScrollIndicator={false}>
                        <View style={styles.gridRow}>
                            {uniqueParticipants.map((participant, index) => renderParticipantCell(participant, index))}
                        </View>
                    </ScrollView>
                </View>

                {/* Media Controls */}
                <View style={styles.controls}>
                    <Pressable
                        style={styles.controlBtn}
                        onPress={toggleAudio}
                    >
                        <LinearGradient
                            colors={isAudioEnabled ? ["#374151", "#1f2937"] : ["#ef4444", "#dc2626"]}
                            style={styles.controlBtnGrad}
                        >
                            <Ionicons name={isAudioEnabled ? "mic" : "mic-off"} size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.controlLabel}>{isAudioEnabled ? "Mute" : "Unmute"}</Text>
                    </Pressable>

                    <Pressable
                        style={styles.controlBtn}
                        onPress={toggleVideo}
                    >
                        <LinearGradient
                            colors={isVideoEnabled ? ["#374151", "#1f2937"] : ["#ef4444", "#dc2626"]}
                            style={styles.controlBtnGrad}
                        >
                            <Ionicons name={isVideoEnabled ? "videocam" : "videocam-off"} size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.controlLabel}>{isVideoEnabled ? "Stop Video" : "Start Video"}</Text>
                    </Pressable>

                    <Pressable
                        style={styles.controlBtn}
                        onPress={() => { setShowChat(!showChat); setShowParticipants(false); }}
                    >
                        <LinearGradient
                            colors={showChat ? ["#6366f1", "#8b5cf6"] : ["#374151", "#1f2937"]}
                            style={styles.controlBtnGrad}
                        >
                            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                            {messages.length > 0 && !showChat && (
                                <View style={styles.chatBadge}>
                                    <Text style={styles.chatBadgeText}>{messages.length > 99 ? "99+" : messages.length}</Text>
                                </View>
                            )}
                        </LinearGradient>
                        <Text style={styles.controlLabel}>Chat</Text>
                    </Pressable>

                    <Pressable style={styles.endBtn} onPress={handleLeave}>
                        <LinearGradient colors={["#ef4444", "#dc2626"]} style={styles.endBtnGrad}>
                            <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
                        </LinearGradient>
                        <Text style={[styles.controlLabel, { color: "#ef4444" }]}>Leave</Text>
                    </Pressable>
                </View>

                {/* Participants Panel */}
                {showParticipants && (
                    <View style={styles.sidePanel}>
                        <View style={styles.panelHeader}>
                            <Text style={styles.panelTitle}>Participants ({uniqueParticipants.length})</Text>
                            <Pressable onPress={() => setShowParticipants(false)}>
                                <Ionicons name="close" size={24} color="#9ca3af" />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
                            {uniqueParticipants.map((p, idx) => (
                                <View key={`panel-${p.socketId}-${idx}`} style={styles.participantRow}>
                                    <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.participantAvatar}>
                                        <Text style={styles.participantInitial}>{p.username?.charAt(0).toUpperCase() || "?"}</Text>
                                    </LinearGradient>
                                    <View style={styles.participantInfo}>
                                        <Text style={styles.participantName} numberOfLines={1}>
                                            {p.username} {p.socketId === socket?.id ? "(You)" : ""}
                                        </Text>
                                        <Text style={styles.participantTier}>{p.userTier}</Text>
                                    </View>
                                    <View style={styles.participantStatus}>
                                        <Ionicons
                                            name={p.isAudioEnabled !== false ? "mic" : "mic-off"}
                                            size={16}
                                            color={p.isAudioEnabled !== false ? "#10b981" : "#ef4444"}
                                        />
                                        <Ionicons
                                            name={p.isVideoEnabled !== false ? "videocam" : "videocam-off"}
                                            size={16}
                                            color={p.isVideoEnabled !== false ? "#10b981" : "#ef4444"}
                                            style={{ marginLeft: 8 }}
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Chat Panel */}
                {showChat && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.sidePanel}
                        keyboardVerticalOffset={100}
                    >
                        <View style={styles.panelHeader}>
                            <Text style={styles.panelTitle}>Chat</Text>
                            <Pressable onPress={() => setShowChat(false)}>
                                <Ionicons name="close" size={24} color="#9ca3af" />
                            </Pressable>
                        </View>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.panelContent}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.length === 0 ? (
                                <View style={styles.emptyChat}>
                                    <Ionicons name="chatbubbles-outline" size={32} color="#6b7280" />
                                    <Text style={styles.emptyChatText}>No messages yet</Text>
                                </View>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.username === user?.name;
                                    return (
                                        <View key={msg.id} style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
                                            {!isMe && <Text style={styles.messageAuthor}>{msg.username}</Text>}
                                            <Text style={styles.messageText}>{msg.message}</Text>
                                            <Text style={styles.messageTime}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </Text>
                                        </View>
                                    );
                                })
                            )}
                        </ScrollView>

                        {/* Message Input */}
                        {isLoggedIn ? (
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Type a message..."
                                        placeholderTextColor="#6b7280"
                                        value={messageText}
                                        onChangeText={setMessageText}
                                        onSubmitEditing={handleSend}
                                        returnKeyType="send"
                                    />
                                    <Pressable style={styles.sendBtn} onPress={handleSend} disabled={!messageText.trim()}>
                                        <LinearGradient
                                            colors={messageText.trim() ? ["#6366f1", "#8b5cf6"] : ["#374151", "#374151"]}
                                            style={styles.sendBtnGrad}
                                        >
                                            <Ionicons name="send" size={16} color="#fff" />
                                        </LinearGradient>
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.guestBanner}>
                                <Ionicons name="lock-closed-outline" size={16} color="#f59e0b" />
                                <Text style={styles.guestText}>Sign in to chat</Text>
                            </View>
                        )}
                    </KeyboardAvoidingView>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Header
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    headerCenter: { flex: 1, marginHorizontal: 12 },
    roomName: { color: "#fff", fontSize: 18, fontWeight: "600" },
    statusRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    online: { backgroundColor: "#10b981" },
    offline: { backgroundColor: "#f59e0b" },
    statusText: { color: "#9ca3af", fontSize: 12 },
    headerActions: { flexDirection: "row", gap: 8 },
    headerBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(139,92,246,0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 4 },
    headerBtnActive: { backgroundColor: "rgba(139,92,246,0.35)", borderWidth: 1, borderColor: "#a78bfa" },
    participantCount: { color: "#a78bfa", fontSize: 14, fontWeight: "600" },

    // Info Banner
    infoBanner: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: "rgba(139,92,246,0.3)" },
    infoText: { flex: 1, color: "#fff", fontSize: 14 },
    liveTag: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" },
    liveText: { color: "#ef4444", fontSize: 10, fontWeight: "700" },

    // Video Container
    videoContainer: { margin: 8, borderRadius: 16, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.2)" },
    videoGrid: { padding: 4 },
    gridRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, padding: 4 },
    videoCell: { borderRadius: 12, overflow: "hidden", backgroundColor: "#1a1a35" },
    videoStream: { width: "100%", height: "100%" },
    noVideoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
    avatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(139,92,246,0.3)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(139,92,246,0.5)" },
    avatarText: { color: "#fff", fontSize: 22, fontWeight: "600" },
    cameraOffBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(239,68,68,0.8)", borderRadius: 12, padding: 4 },
    videoOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 8, paddingVertical: 4 },
    videoInfoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    videoName: { color: "#fff", fontSize: 11, fontWeight: "500", flex: 1 },
    mutedBadge: { backgroundColor: "rgba(239,68,68,0.8)", borderRadius: 10, padding: 2 },
    switchCameraBtn: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 14, width: 28, height: 28, alignItems: "center", justifyContent: "center" },

    // Controls
    controls: { flexDirection: "row", justifyContent: "center", alignItems: "flex-start", paddingVertical: 12, paddingHorizontal: 8, gap: 16 },
    controlBtn: { alignItems: "center" },
    controlBtnGrad: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    controlLabel: { color: "#9ca3af", fontSize: 10, marginTop: 4 },
    endBtn: { alignItems: "center" },
    endBtnGrad: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    chatBadge: { position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
    chatBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

    // Side Panels
    sidePanel: { position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: SCREEN_HEIGHT * 0.4, backgroundColor: "rgba(15,15,42,0.98)", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderBottomWidth: 0 },
    panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
    panelTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
    panelContent: { flex: 1, paddingHorizontal: 16 },

    // Participants
    participantRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
    participantAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    participantInitial: { color: "#fff", fontSize: 16, fontWeight: "600" },
    participantInfo: { flex: 1, marginLeft: 12 },
    participantName: { color: "#fff", fontSize: 14, fontWeight: "500" },
    participantTier: { color: "#6b7280", fontSize: 11, textTransform: "capitalize", marginTop: 2 },
    participantStatus: { flexDirection: "row", alignItems: "center" },

    // Chat
    messagesContent: { paddingVertical: 12, flexGrow: 1 },
    emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },
    emptyChatText: { color: "#6b7280", fontSize: 14, marginTop: 8 },
    messageBubble: { maxWidth: "85%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginBottom: 8 },
    myMessage: { alignSelf: "flex-end", backgroundColor: "rgba(99,102,241,0.3)", borderBottomRightRadius: 4 },
    otherMessage: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.1)", borderBottomLeftRadius: 4 },
    messageAuthor: { color: "#a78bfa", fontSize: 11, fontWeight: "600", marginBottom: 4 },
    messageText: { color: "#fff", fontSize: 15, lineHeight: 20 },
    messageTime: { color: "#9ca3af", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
    inputContainer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
    inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 24, paddingLeft: 16, paddingRight: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 10 },
    sendBtn: { marginLeft: 8 },
    sendBtnGrad: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    guestBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(245,158,11,0.1)", marginHorizontal: 16, marginVertical: 12, paddingVertical: 12, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: "rgba(245,158,11,0.3)" },
    guestText: { color: "#f59e0b", fontSize: 13 },
});
