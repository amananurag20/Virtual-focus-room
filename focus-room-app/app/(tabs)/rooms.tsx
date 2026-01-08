import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    StyleSheet,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const { width } = Dimensions.get("window");

const categories = [
    { id: "all", label: "All", icon: "grid-outline" },
    { id: "study", label: "Study", icon: "book-outline" },
    { id: "coding", label: "Coding", icon: "code-slash-outline" },
    { id: "art", label: "Art", icon: "color-palette-outline" },
];

const rooms = [
    { id: 1, name: "Deep Focus Zone", desc: "Silent study room", participants: 12, max: 20, category: "study", host: "John D.", duration: "2h" },
    { id: 2, name: "Coding Marathon", desc: "Building projects", participants: 8, max: 15, category: "coding", host: "Sarah K.", duration: "1h" },
    { id: 3, name: "Creative Corner", desc: "Digital art focus", participants: 5, max: 10, category: "art", host: "Mike R.", duration: "45m" },
    { id: 4, name: "Late Night Study", desc: "For night owls", participants: 15, max: 25, category: "study", host: "Alex T.", duration: "5h" },
];

export default function RoomsScreen() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

    const filtered = rooms.filter((r) => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === "all" || r.category === category;
        return matchSearch && matchCat;
    });

    const getColor = (cat: string) => {
        const c: Record<string, string[]> = {
            study: ["#6366f1", "#8b5cf6"],
            coding: ["#10b981", "#14b8a6"],
            art: ["#ec4899", "#f43f5e"],
        };
        return c[cat] || ["#6366f1", "#8b5cf6"];
    };

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Focus Rooms</Text>
                    <Pressable style={styles.createBtn}>
                        <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.createBtnGrad}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </LinearGradient>
                    </Pressable>
                </View>

                <View style={styles.searchWrap}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#6b7280" />
                        <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#6b7280" value={search} onChangeText={setSearch} />
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
                    {categories.map((c) => (
                        <Pressable key={c.id} style={[styles.chip, category === c.id && styles.chipActive]} onPress={() => setCategory(c.id)}>
                            <Ionicons name={c.icon as any} size={16} color={category === c.id ? "#fff" : "#9ca3af"} />
                            <Text style={[styles.chipText, category === c.id && styles.chipTextActive]}>{c.label}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                    {filtered.map((room) => (
                        <Pressable key={room.id} style={styles.card}>
                            <View style={styles.cardHead}>
                                <LinearGradient colors={getColor(room.category)} style={styles.cardIcon}>
                                    <Ionicons name="videocam" size={22} color="#fff" />
                                </LinearGradient>
                                <View style={styles.cardInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.cardName}>{room.name}</Text>
                                        <View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
                                    </View>
                                    <Text style={styles.cardDesc}>{room.desc}</Text>
                                </View>
                            </View>
                            <View style={styles.meta}>
                                <View style={styles.metaItem}><Ionicons name="people-outline" size={14} color="#9ca3af" /><Text style={styles.metaText}>{room.participants}/{room.max}</Text></View>
                                <View style={styles.metaItem}><Ionicons name="time-outline" size={14} color="#9ca3af" /><Text style={styles.metaText}>{room.duration}</Text></View>
                                <View style={styles.metaItem}><Ionicons name="person-outline" size={14} color="#9ca3af" /><Text style={styles.metaText}>{room.host}</Text></View>
                            </View>
                            <View style={styles.footer}>
                                <View style={styles.avatars}>
                                    {[0, 1, 2].map((i) => <View key={i} style={[styles.avatar, { marginLeft: i > 0 ? -10 : 0 }]}><Text style={styles.avatarT}>{String.fromCharCode(65 + i)}</Text></View>)}
                                </View>
                                <Pressable style={styles.joinBtn}><Text style={styles.joinText}>Join</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></Pressable>
                            </View>
                        </Pressable>
                    ))}
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
    createBtn: { borderRadius: 22, overflow: "hidden" },
    createBtnGrad: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    searchWrap: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    searchInput: { flex: 1, color: "#fff", fontSize: 16, marginLeft: 12 },
    cats: { paddingHorizontal: 20, gap: 10, paddingBottom: 16 },
    chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", gap: 6, marginRight: 10 },
    chipActive: { backgroundColor: "rgba(139,92,246,0.3)", borderColor: "rgba(139,92,246,0.5)" },
    chipText: { color: "#9ca3af", fontSize: 14, fontWeight: "500" },
    chipTextActive: { color: "#fff" },
    list: { paddingHorizontal: 20, gap: 16 },
    card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 4 },
    cardHead: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
    cardIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14 },
    cardInfo: { flex: 1 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
    cardName: { color: "#fff", fontSize: 17, fontWeight: "600" },
    live: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" },
    liveText: { color: "#ef4444", fontSize: 10, fontWeight: "700" },
    cardDesc: { color: "#9ca3af", fontSize: 13 },
    meta: { flexDirection: "row", gap: 16, marginBottom: 14 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { color: "#9ca3af", fontSize: 12 },
    footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
    avatars: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(139,92,246,0.3)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0f0f2a" },
    avatarT: { color: "#fff", fontSize: 12, fontWeight: "600" },
    joinBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(139,92,246,0.3)", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, gap: 6 },
    joinText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
