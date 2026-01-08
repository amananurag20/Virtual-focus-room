import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const friends = [
    { id: 1, name: "Sarah Johnson", status: "Studying React", online: true, streak: 15 },
    { id: 2, name: "Mike Chen", status: "Deep Focus Mode", online: true, streak: 22 },
    { id: 3, name: "Emma Wilson", status: "Taking a break", online: false, streak: 8 },
    { id: 4, name: "Alex Turner", status: "Coding Session", online: true, streak: 30 },
    { id: 5, name: "Lisa Park", status: "Away", online: false, streak: 5 },
];

const pendingRequests = [
    { id: 1, name: "David Brown", mutualFriends: 3 },
    { id: 2, name: "Sophie Miller", mutualFriends: 5 },
];

export default function FriendsScreen() {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<"friends" | "requests">("friends");

    const filtered = friends.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    const online = filtered.filter((f) => f.online);
    const offline = filtered.filter((f) => !f.online);

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Friends</Text>
                    <Pressable style={styles.addBtn}>
                        <Ionicons name="person-add-outline" size={22} color="#a78bfa" />
                    </Pressable>
                </View>

                <View style={styles.searchWrap}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#6b7280" />
                        <TextInput style={styles.searchInput} placeholder="Search friends..." placeholderTextColor="#6b7280" value={search} onChangeText={setSearch} />
                    </View>
                </View>

                <View style={styles.tabs}>
                    <Pressable style={[styles.tab, tab === "friends" && styles.tabActive]} onPress={() => setTab("friends")}>
                        <Text style={[styles.tabText, tab === "friends" && styles.tabTextActive]}>Friends ({friends.length})</Text>
                    </Pressable>
                    <Pressable style={[styles.tab, tab === "requests" && styles.tabActive]} onPress={() => setTab("requests")}>
                        <Text style={[styles.tabText, tab === "requests" && styles.tabTextActive]}>Requests ({pendingRequests.length})</Text>
                        {pendingRequests.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{pendingRequests.length}</Text></View>}
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                    {tab === "friends" ? (
                        <>
                            {online.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Online — {online.length}</Text>
                                    {online.map((f) => (
                                        <Pressable key={f.id} style={styles.friendCard}>
                                            <View style={styles.avatarWrap}>
                                                <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.avatar}>
                                                    <Text style={styles.avatarText}>{f.name.charAt(0)}</Text>
                                                </LinearGradient>
                                                <View style={styles.onlineDot} />
                                            </View>
                                            <View style={styles.friendInfo}>
                                                <Text style={styles.friendName}>{f.name}</Text>
                                                <Text style={styles.friendStatus}>{f.status}</Text>
                                            </View>
                                            <View style={styles.streak}>
                                                <Ionicons name="flame" size={16} color="#f59e0b" />
                                                <Text style={styles.streakText}>{f.streak}</Text>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                            {offline.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Offline — {offline.length}</Text>
                                    {offline.map((f) => (
                                        <Pressable key={f.id} style={styles.friendCard}>
                                            <View style={styles.avatarWrap}>
                                                <View style={[styles.avatar, styles.avatarOffline]}>
                                                    <Text style={styles.avatarText}>{f.name.charAt(0)}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.friendInfo}>
                                                <Text style={styles.friendName}>{f.name}</Text>
                                                <Text style={styles.friendStatus}>{f.status}</Text>
                                            </View>
                                            <View style={styles.streak}>
                                                <Ionicons name="flame" size={16} color="#f59e0b" />
                                                <Text style={styles.streakText}>{f.streak}</Text>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.section}>
                            {pendingRequests.map((r) => (
                                <View key={r.id} style={styles.requestCard}>
                                    <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.avatar}>
                                        <Text style={styles.avatarText}>{r.name.charAt(0)}</Text>
                                    </LinearGradient>
                                    <View style={styles.requestInfo}>
                                        <Text style={styles.friendName}>{r.name}</Text>
                                        <Text style={styles.mutualText}>{r.mutualFriends} mutual friends</Text>
                                    </View>
                                    <View style={styles.requestActions}>
                                        <Pressable style={styles.acceptBtn}><Ionicons name="checkmark" size={20} color="#fff" /></Pressable>
                                        <Pressable style={styles.declineBtn}><Ionicons name="close" size={20} color="#ef4444" /></Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(139,92,246,0.15)", alignItems: "center", justifyContent: "center" },
    searchWrap: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    searchInput: { flex: 1, color: "#fff", fontSize: 16, marginLeft: 12 },
    tabs: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20, gap: 12 },
    tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", gap: 6 },
    tabActive: { backgroundColor: "rgba(139,92,246,0.2)" },
    tabText: { color: "#9ca3af", fontSize: 14, fontWeight: "500" },
    tabTextActive: { color: "#fff" },
    badge: { backgroundColor: "#ef4444", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
    list: { paddingHorizontal: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { color: "#9ca3af", fontSize: 13, fontWeight: "600", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
    friendCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    avatarWrap: { position: "relative", marginRight: 14 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    avatarOffline: { backgroundColor: "rgba(107,114,128,0.3)" },
    avatarText: { color: "#fff", fontSize: 18, fontWeight: "600" },
    onlineDot: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#10b981", borderWidth: 2, borderColor: "#0f0f2a" },
    friendInfo: { flex: 1 },
    friendName: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
    friendStatus: { color: "#9ca3af", fontSize: 13 },
    streak: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
    streakText: { color: "#f59e0b", fontSize: 13, fontWeight: "600" },
    requestCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    requestInfo: { flex: 1, marginLeft: 14 },
    mutualText: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
    requestActions: { flexDirection: "row", gap: 8 },
    acceptBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(16,185,129,0.3)", alignItems: "center", justifyContent: "center" },
    declineBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(239,68,68,0.2)", alignItems: "center", justifyContent: "center" },
});
