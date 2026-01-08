import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Alert, RefreshControl, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getStats, formatTime, Stats } from "@/services/statsService";

const menuItems = [
    { id: "stats", label: "Statistics", icon: "stats-chart-outline", color: "#6366f1" },
    { id: "achievements", label: "Achievements", icon: "trophy-outline", color: "#f59e0b" },
    { id: "settings", label: "Settings", icon: "settings-outline", color: "#9ca3af" },
    { id: "help", label: "Help & Support", icon: "help-circle-outline", color: "#10b981" },
];

export default function ProfileScreen() {
    const router = useRouter();
    const { user, isLoggedIn, logout } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = useCallback(async () => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        try {
            const data = await getStats();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.log("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, [fetchStats]);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout", style: "destructive", onPress: async () => {
                    await logout();
                    router.replace("/(auth)/login");
                }
            },
        ]);
    };

    const totalStats = stats?.total || { tasks: 0, completed: 0, meetingTime: 0 };

    if (!isLoggedIn) {
        return (
            <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Profile</Text>
                    </View>
                    <View style={styles.loginPrompt}>
                        <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.guestAvatar}>
                            <Ionicons name="person-outline" size={48} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.loginTitle}>Sign in to your account</Text>
                        <Text style={styles.loginSubtitle}>Access your stats, achievements, and settings</Text>
                        <Pressable style={styles.loginBtn} onPress={() => router.push("/(auth)/login")}>
                            <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.loginBtnGrad}>
                                <Text style={styles.loginBtnText}>Sign In</Text>
                            </LinearGradient>
                        </Pressable>
                        <Pressable style={styles.signupBtn} onPress={() => router.push("/(auth)/signup")}>
                            <Text style={styles.signupText}>Create an Account</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Profile</Text>
                    </View>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <LinearGradient colors={["rgba(139,92,246,0.2)", "rgba(99,102,241,0.1)"]} style={styles.profileBg}>
                            <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.avatar}>
                                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
                            </LinearGradient>
                            <Text style={styles.userName}>{user?.name}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                            <View style={styles.badges}>
                                <View style={styles.badge}>
                                    <Ionicons name="star" size={14} color="#f59e0b" />
                                    <Text style={styles.badgeText}>{user?.tier === "premium" ? "Pro Member" : "Free Member"}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Stats */}
                    {loading ? (
                        <ActivityIndicator color="#a78bfa" style={{ marginVertical: 20 }} />
                    ) : (
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Ionicons name="time-outline" size={24} color="#6366f1" />
                                <Text style={styles.statValue}>{formatTime(totalStats.meetingTime)}</Text>
                                <Text style={styles.statLabel}>Total Focus</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="checkmark-done-outline" size={24} color="#10b981" />
                                <Text style={styles.statValue}>{totalStats.completed}</Text>
                                <Text style={styles.statLabel}>Tasks Done</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="trending-up-outline" size={24} color="#f59e0b" />
                                <Text style={styles.statValue}>{Math.round((totalStats.completed / (totalStats.tasks || 1)) * 100)}%</Text>
                                <Text style={styles.statLabel}>Success</Text>
                            </View>
                        </View>
                    )}

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
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                                    </View>
                                    {i < menuItems.length - 1 && <View style={styles.divider} />}
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Logout Button */}
                    <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>

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
    header: { paddingTop: 10, paddingBottom: 20 },
    title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
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
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 16, paddingVertical: 16, gap: 8, marginBottom: 20 },
    logoutText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },
    version: { textAlign: "center", color: "#6b7280", fontSize: 13 },
    loginPrompt: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    guestAvatar: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 24 },
    loginTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
    loginSubtitle: { color: "#9ca3af", fontSize: 15, marginTop: 8, textAlign: "center", lineHeight: 22 },
    loginBtn: { borderRadius: 30, overflow: "hidden", marginTop: 24 },
    loginBtnGrad: { paddingHorizontal: 40, paddingVertical: 14 },
    loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    signupBtn: { marginTop: 16 },
    signupText: { color: "#a78bfa", fontSize: 15, fontWeight: "500" },
});
