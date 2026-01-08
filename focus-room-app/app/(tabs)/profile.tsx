import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const stats = [
    { label: "Total Focus", value: "128h", icon: "time-outline", color: "#6366f1" },
    { label: "Tasks Done", value: "342", icon: "checkmark-done-outline", color: "#10b981" },
    { label: "Day Streak", value: "24", icon: "flame-outline", color: "#f59e0b" },
];

const menuItems = [
    { id: "edit", label: "Edit Profile", icon: "person-outline", color: "#a78bfa" },
    { id: "stats", label: "Statistics", icon: "stats-chart-outline", color: "#6366f1" },
    { id: "achievements", label: "Achievements", icon: "trophy-outline", color: "#f59e0b" },
    { id: "settings", label: "Settings", icon: "settings-outline", color: "#9ca3af" },
    { id: "help", label: "Help & Support", icon: "help-circle-outline", color: "#10b981" },
    { id: "logout", label: "Log Out", icon: "log-out-outline", color: "#ef4444" },
];

export default function ProfileScreen() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Profile</Text>
                        <Pressable style={styles.editBtn}>
                            <Ionicons name="create-outline" size={22} color="#a78bfa" />
                        </Pressable>
                    </View>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <LinearGradient colors={["rgba(139,92,246,0.2)", "rgba(99,102,241,0.1)"]} style={styles.profileBg}>
                            <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.avatar}>
                                <Text style={styles.avatarText}>A</Text>
                            </LinearGradient>
                            <Text style={styles.userName}>Aman Kumar</Text>
                            <Text style={styles.userEmail}>aman@example.com</Text>
                            <View style={styles.badges}>
                                <View style={styles.badge}><Ionicons name="star" size={14} color="#f59e0b" /><Text style={styles.badgeText}>Pro Member</Text></View>
                                <View style={styles.badge}><Ionicons name="flame" size={14} color="#ef4444" /><Text style={styles.badgeText}>24 Day Streak</Text></View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        {stats.map((s, i) => (
                            <View key={i} style={styles.statCard}>
                                <Ionicons name={s.icon as any} size={24} color={s.color} />
                                <Text style={styles.statValue}>{s.value}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Quick Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Settings</Text>
                        <View style={styles.settingCard}>
                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="notifications-outline" size={22} color="#a78bfa" />
                                    <Text style={styles.settingLabel}>Notifications</Text>
                                </View>
                                <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#374151", true: "rgba(139,92,246,0.5)" }} thumbColor={notifications ? "#a78bfa" : "#9ca3af"} />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="moon-outline" size={22} color="#a78bfa" />
                                    <Text style={styles.settingLabel}>Dark Mode</Text>
                                </View>
                                <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: "#374151", true: "rgba(139,92,246,0.5)" }} thumbColor={darkMode ? "#a78bfa" : "#9ca3af"} />
                            </View>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <View style={styles.menuCard}>
                            {menuItems.map((item, i) => (
                                <Pressable key={item.id}>
                                    <View style={styles.menuRow}>
                                        <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                                            <Ionicons name={item.icon as any} size={20} color={item.color} />
                                        </View>
                                        <Text style={[styles.menuLabel, item.id === "logout" && { color: "#ef4444" }]}>{item.label}</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                                    </View>
                                    {i < menuItems.length - 1 && <View style={styles.divider} />}
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* App Version */}
                    <Text style={styles.version}>Focus Room v1.0.0</Text>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    content: { paddingHorizontal: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, paddingBottom: 20 },
    title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
    editBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(139,92,246,0.15)", alignItems: "center", justifyContent: "center" },
    profileCard: { marginBottom: 24, borderRadius: 24, overflow: "hidden" },
    profileBg: { alignItems: "center", padding: 28, borderWidth: 1, borderColor: "rgba(139,92,246,0.3)", borderRadius: 24 },
    avatar: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    avatarText: { color: "#fff", fontSize: 36, fontWeight: "bold" },
    userName: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 4 },
    userEmail: { color: "#9ca3af", fontSize: 15, marginBottom: 16 },
    badges: { flexDirection: "row", gap: 12 },
    badge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    badgeText: { color: "#fff", fontSize: 12, fontWeight: "500" },
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    statCard: { flex: 1, alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    statValue: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 8 },
    statLabel: { color: "#9ca3af", fontSize: 11, marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: { color: "#9ca3af", fontSize: 13, fontWeight: "600", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
    settingCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
    settingInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
    settingLabel: { color: "#fff", fontSize: 16 },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 14 },
    menuCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    menuRow: { flexDirection: "row", alignItems: "center", padding: 14 },
    menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
    menuLabel: { flex: 1, color: "#fff", fontSize: 16 },
    version: { textAlign: "center", color: "#6b7280", fontSize: 13, marginTop: 10 },
});
