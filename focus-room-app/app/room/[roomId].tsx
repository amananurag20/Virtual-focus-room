import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform, FlatList, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSocket, ChatMessage, Participant } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

export default function RoomScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ roomId: string; roomName: string }>();
    const { currentRoom, participants, messages, leaveRoom, sendMessage, isConnected } = useSocket();
    const { user, isLoggedIn } = useAuth();
    const [messageText, setMessageText] = useState("");
    const [showParticipants, setShowParticipants] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Handle leaving room
    const handleLeave = () => {
        Alert.alert("Leave Room", "Are you sure you want to leave this room?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Leave",
                style: "destructive",
                onPress: () => {
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

    // Auto scroll to bottom on new messages
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const roomName = currentRoom?.name || params.roomName || "Focus Room";

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
                    <Pressable style={styles.participantsBtn} onPress={() => setShowParticipants(!showParticipants)}>
                        <Ionicons name="people" size={22} color="#a78bfa" />
                        <Text style={styles.participantCount}>{participants.length}</Text>
                    </Pressable>
                </View>

                {/* Room Info Banner */}
                <LinearGradient colors={["rgba(139,92,246,0.15)", "rgba(99,102,241,0.1)"]} style={styles.infoBanner}>
                    <Ionicons name="videocam" size={20} color="#a78bfa" />
                    <Text style={styles.infoText}>Focus session in progress</Text>
                    <View style={styles.liveTag}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </LinearGradient>

                {/* Participants Panel (collapsible) */}
                {showParticipants && (
                    <View style={styles.participantsPanel}>
                        <Text style={styles.panelTitle}>Participants ({participants.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.participantsList}>
                            {participants.map((p) => (
                                <View key={p.socketId} style={styles.participantCard}>
                                    <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.participantAvatar}>
                                        <Text style={styles.participantInitial}>{p.username?.charAt(0).toUpperCase() || "?"}</Text>
                                    </LinearGradient>
                                    <Text style={styles.participantName} numberOfLines={1}>{p.username}</Text>
                                    <Text style={styles.participantTier}>{p.userTier}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Chat Messages */}
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.chatContainer} keyboardVerticalOffset={100}>
                    <ScrollView ref={scrollViewRef} style={styles.messagesList} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
                        {messages.length === 0 ? (
                            <View style={styles.emptyChat}>
                                <Ionicons name="chatbubbles-outline" size={48} color="#6b7280" />
                                <Text style={styles.emptyChatTitle}>No messages yet</Text>
                                <Text style={styles.emptyChatSubtitle}>Start the conversation!</Text>
                            </View>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.username === user?.name;
                                return (
                                    <View key={msg.id} style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
                                        {!isMe && <Text style={styles.messageAuthor}>{msg.username}</Text>}
                                        <Text style={styles.messageText}>{msg.message}</Text>
                                        <Text style={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Message Input */}
                    {isLoggedIn ? (
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <TextInput style={styles.input} placeholder="Type a message..." placeholderTextColor="#6b7280" value={messageText} onChangeText={setMessageText} onSubmitEditing={handleSend} returnKeyType="send" />
                                <Pressable style={styles.sendBtn} onPress={handleSend} disabled={!messageText.trim()}>
                                    <LinearGradient colors={messageText.trim() ? ["#6366f1", "#8b5cf6"] : ["#374151", "#374151"]} style={styles.sendBtnGrad}>
                                        <Ionicons name="send" size={18} color="#fff" />
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.guestBanner}>
                            <Ionicons name="lock-closed-outline" size={18} color="#f59e0b" />
                            <Text style={styles.guestText}>Sign in to chat</Text>
                            <Pressable style={styles.guestBtn} onPress={() => router.push("/(auth)/login")}>
                                <Text style={styles.guestBtnText}>Sign In</Text>
                            </Pressable>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    headerCenter: { flex: 1, marginHorizontal: 16 },
    roomName: { color: "#fff", fontSize: 18, fontWeight: "600" },
    statusRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    online: { backgroundColor: "#10b981" },
    offline: { backgroundColor: "#f59e0b" },
    statusText: { color: "#9ca3af", fontSize: 12 },
    participantsBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(139,92,246,0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
    participantCount: { color: "#a78bfa", fontSize: 14, fontWeight: "600" },
    infoBanner: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: "rgba(139,92,246,0.3)" },
    infoText: { flex: 1, color: "#fff", fontSize: 14 },
    liveTag: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" },
    liveText: { color: "#ef4444", fontSize: 10, fontWeight: "700" },
    participantsPanel: { marginHorizontal: 16, marginTop: 12, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    panelTitle: { color: "#9ca3af", fontSize: 12, fontWeight: "600", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
    participantsList: { gap: 12 },
    participantCard: { alignItems: "center", width: 70 },
    participantAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    participantInitial: { color: "#fff", fontSize: 18, fontWeight: "600" },
    participantName: { color: "#fff", fontSize: 12, marginTop: 6, textAlign: "center" },
    participantTier: { color: "#6b7280", fontSize: 10, textTransform: "capitalize" },
    chatContainer: { flex: 1 },
    messagesList: { flex: 1, paddingHorizontal: 16 },
    messagesContent: { paddingVertical: 16, flexGrow: 1 },
    emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
    emptyChatTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 16 },
    emptyChatSubtitle: { color: "#9ca3af", fontSize: 14, marginTop: 4 },
    messageBubble: { maxWidth: "80%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginBottom: 8 },
    myMessage: { alignSelf: "flex-end", backgroundColor: "rgba(99,102,241,0.3)", borderBottomRightRadius: 4 },
    otherMessage: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.1)", borderBottomLeftRadius: 4 },
    messageAuthor: { color: "#a78bfa", fontSize: 11, fontWeight: "600", marginBottom: 4 },
    messageText: { color: "#fff", fontSize: 15, lineHeight: 20 },
    messageTime: { color: "#9ca3af", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
    inputContainer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
    inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 24, paddingLeft: 16, paddingRight: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 12 },
    sendBtn: { marginLeft: 8 },
    sendBtnGrad: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    guestBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(245,158,11,0.1)", marginHorizontal: 16, marginVertical: 12, paddingVertical: 14, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: "rgba(245,158,11,0.3)" },
    guestText: { color: "#f59e0b", fontSize: 14 },
    guestBtn: { backgroundColor: "rgba(245,158,11,0.2)", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
    guestBtnText: { color: "#f59e0b", fontSize: 13, fontWeight: "600" },
});
