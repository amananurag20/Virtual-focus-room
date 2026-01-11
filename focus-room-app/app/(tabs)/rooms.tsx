import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Modal, RefreshControl, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useSocket, Room } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

const categories = [
    { id: "all", label: "All", icon: "grid-outline" },
    { id: "study", label: "Study", icon: "book-outline" },
    { id: "coding", label: "Coding", icon: "code-slash-outline" },
    { id: "art", label: "Art", icon: "color-palette-outline" },
];

export default function RoomsScreen() {
    const router = useRouter();
    const { rooms, isConnected } = useSocket();
    const { user, isLoggedIn } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Filter rooms based on search
    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Rooms automatically refresh via socket
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleCreateRoom = () => {
        if (!isLoggedIn) {
            Alert.alert("Sign In Required", "Please sign in to create a room", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign In", onPress: () => router.push("/(auth)/login") },
            ]);
            return;
        }

        if (!newRoomName.trim()) {
            Alert.alert("Error", "Please enter a room name");
            return;
        }

        setIsModalOpen(false);
        // Navigate to pre-join screen for camera setup before creating room
        router.push({
            pathname: "/room/prejoin",
            params: { roomName: newRoomName.trim(), action: "create" },
        });
        setNewRoomName("");
    };

    const handleJoinRoom = (room: Room) => {
        if (!isLoggedIn) {
            Alert.alert("Sign In Required", "Please sign in to join a room", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign In", onPress: () => router.push("/(auth)/login") },
            ]);
            return;
        }

        // Navigate to pre-join screen for camera setup before joining room
        router.push({
            pathname: "/room/prejoin",
            params: { roomId: room.id, roomName: room.name, action: "join" },
        });
    };

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Focus Rooms</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
                            <Text style={styles.statusText}>{isConnected ? "Connected" : "Connecting..."}</Text>
                        </View>
                    </View>
                    <Pressable style={styles.createBtn} onPress={() => setIsModalOpen(true)}>
                        <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.createBtnGrad}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#6b7280" />
                        <TextInput style={styles.searchInput} placeholder="Search rooms..." placeholderTextColor="#6b7280" value={searchQuery} onChangeText={setSearchQuery} />
                    </View>
                </View>

                {/* Categories Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <Pressable key={category.id} style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]} onPress={() => setSelectedCategory(category.id)}>
                            <Ionicons name={category.icon as any} size={18} color={selectedCategory === category.id ? "#fff" : "#9ca3af"} />
                            <Text style={[styles.categoryLabel, selectedCategory === category.id && styles.categoryLabelActive]}>{category.label}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Rooms List */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.roomsContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}>
                    {filteredRooms.length === 0 ? (
                        <View style={styles.emptyState}>
                            <LinearGradient colors={["rgba(139,92,246,0.2)", "rgba(99,102,241,0.1)"]} style={styles.emptyIcon}>
                                <Ionicons name="videocam-outline" size={48} color="#a78bfa" />
                            </LinearGradient>
                            <Text style={styles.emptyTitle}>No active rooms</Text>
                            <Text style={styles.emptySubtitle}>Be the first to create a focus session!</Text>
                            <Pressable style={styles.createFirstBtn} onPress={() => setIsModalOpen(true)}>
                                <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.createFirstBtnGrad}>
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.createFirstBtnText}>Create Room</Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    ) : (
                        filteredRooms.map((room) => (
                            <Pressable key={room.id} style={styles.roomCard} onPress={() => handleJoinRoom(room)}>
                                <View style={styles.roomHeader}>
                                    <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.roomIcon}>
                                        <Ionicons name="videocam" size={20} color="#fff" />
                                    </LinearGradient>
                                    <View style={styles.roomInfo}>
                                        <View style={styles.roomTitleRow}>
                                            <Text style={styles.roomName}>{room.name}</Text>
                                            <View style={styles.liveTag}>
                                                <View style={styles.liveDot} />
                                                <Text style={styles.liveText}>LIVE</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.roomDescription}>Focus session</Text>
                                    </View>
                                </View>
                                <View style={styles.roomMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="people-outline" size={14} color="#6b7280" />
                                        <Text style={styles.metaText}>{room.participantCount}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time-outline" size={14} color="#6b7280" />
                                        <Text style={styles.metaText}>{new Date(room.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                                    </View>
                                </View>
                                <Pressable style={styles.joinBtn} onPress={() => handleJoinRoom(room)}>
                                    <Text style={styles.joinBtnText}>Join</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#a78bfa" />
                                </Pressable>
                            </Pressable>
                        ))
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Create Room Modal */}
                <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={() => setIsModalOpen(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <LinearGradient colors={["#0f0f2a", "#1a1a35"]} style={styles.modalGradient}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Create Room</Text>
                                    <Pressable style={styles.closeBtn} onPress={() => setIsModalOpen(false)}>
                                        <Ionicons name="close" size={24} color="#9ca3af" />
                                    </Pressable>
                                </View>
                                <View style={styles.modalBody}>
                                    <Text style={styles.inputLabel}>Room Name</Text>
                                    <TextInput style={styles.modalInput} placeholder="e.g., Deep Work Session" placeholderTextColor="#6b7280" value={newRoomName} onChangeText={setNewRoomName} maxLength={40} />
                                    <Pressable style={styles.modalCreateBtn} onPress={handleCreateRoom}>
                                        <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.modalCreateBtnGrad}>
                                            <Text style={styles.modalCreateBtnText}>Continue</Text>
                                        </LinearGradient>
                                    </Pressable>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
    statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    online: { backgroundColor: "#10b981" },
    offline: { backgroundColor: "#f59e0b" },
    statusText: { color: "#9ca3af", fontSize: 12 },
    createBtn: { overflow: "hidden", borderRadius: 22 },
    createBtnGrad: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    searchInput: { flex: 1, color: "#fff", fontSize: 16, marginLeft: 12 },
    categoriesContainer: { paddingHorizontal: 20, gap: 10, marginBottom: 16 },
    categoryChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    categoryChipActive: { backgroundColor: "rgba(139,92,246,0.3)", borderColor: "#8b5cf6" },
    categoryLabel: { color: "#9ca3af", fontSize: 14, fontWeight: "500" },
    categoryLabelActive: { color: "#fff" },
    roomsContainer: { paddingHorizontal: 20 },
    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "600" },
    emptySubtitle: { color: "#9ca3af", fontSize: 14, marginTop: 8 },
    createFirstBtn: { marginTop: 24, borderRadius: 30, overflow: "hidden" },
    createFirstBtnGrad: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 14, gap: 8 },
    createFirstBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    roomCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    roomHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    roomIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    roomInfo: { flex: 1, marginLeft: 14 },
    roomTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    roomName: { color: "#fff", fontSize: 16, fontWeight: "600", flex: 1 },
    liveTag: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" },
    liveText: { color: "#ef4444", fontSize: 10, fontWeight: "700" },
    roomDescription: { color: "#9ca3af", fontSize: 13, marginTop: 2 },
    roomMeta: { flexDirection: "row", gap: 16, marginBottom: 12 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { color: "#6b7280", fontSize: 12 },
    joinBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(139,92,246,0.15)", borderRadius: 12, paddingVertical: 12, gap: 4 },
    joinBtnText: { color: "#a78bfa", fontSize: 14, fontWeight: "600" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
    modalGradient: { padding: 24 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    modalTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    modalBody: { gap: 16 },
    inputLabel: { color: "#9ca3af", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    modalInput: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    modalCreateBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
    modalCreateBtnGrad: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
    modalCreateBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
