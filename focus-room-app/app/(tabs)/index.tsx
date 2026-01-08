import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    StyleSheet,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// Feature cards data
const features = [
    {
        id: 1,
        icon: "videocam",
        title: "Focus Rooms",
        description: "Join virtual study rooms with video",
        gradient: ["#6366f1", "#8b5cf6"],
    },
    {
        id: 2,
        icon: "people",
        title: "Study Together",
        description: "Connect with focused individuals",
        gradient: ["#8b5cf6", "#a855f7"],
    },
    {
        id: 3,
        icon: "musical-notes",
        title: "Ambient Sounds",
        description: "Lo-fi beats & nature sounds",
        gradient: ["#ec4899", "#f43f5e"],
    },
    {
        id: 4,
        icon: "checkmark-circle",
        title: "Task Manager",
        description: "Track your study goals",
        gradient: ["#10b981", "#14b8a6"],
    },
];

// Active rooms data (mock)
const activeRooms = [
    {
        id: 1,
        name: "Deep Focus Zone",
        participants: 12,
        type: "Study",
        isLive: true,
    },
    {
        id: 2,
        name: "Coding Marathon",
        participants: 8,
        type: "Coding",
        isLive: true,
    },
    {
        id: 3,
        name: "Creative Corner",
        participants: 5,
        type: "Art",
        isLive: true,
    },
];

export default function HomeScreen() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Welcome back! 👋</Text>
                            <Text style={styles.title}>Focus Room</Text>
                        </View>
                        <Pressable style={styles.notificationButton}>
                            <Ionicons name="notifications-outline" size={24} color="#a78bfa" />
                            <View style={styles.notificationBadge} />
                        </Pressable>
                    </View>

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={["rgba(139, 92, 246, 0.2)", "rgba(99, 102, 241, 0.1)"]}
                            style={styles.heroCard}
                        >
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>Start Your Focus Session</Text>
                                <Text style={styles.heroSubtitle}>
                                    Join thousands of learners staying productive together
                                </Text>
                                <Pressable
                                    style={styles.heroButton}
                                    onPress={() => router.push("/rooms")}
                                >
                                    <LinearGradient
                                        colors={["#6366f1", "#8b5cf6"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.heroButtonGradient}
                                    >
                                        <Ionicons name="play" size={20} color="#fff" />
                                        <Text style={styles.heroButtonText}>Join Room</Text>
                                    </LinearGradient>
                                </Pressable>
                            </View>
                            <View style={styles.heroStats}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>2.5k+</Text>
                                    <Text style={styles.statLabel}>Users Online</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>150+</Text>
                                    <Text style={styles.statLabel}>Active Rooms</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Features Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Features</Text>
                        <View style={styles.featuresGrid}>
                            {features.map((feature) => (
                                <Pressable key={feature.id} style={styles.featureCard}>
                                    <LinearGradient
                                        colors={feature.gradient}
                                        style={styles.featureIconContainer}
                                    >
                                        <Ionicons
                                            name={feature.icon as any}
                                            size={24}
                                            color="#fff"
                                        />
                                    </LinearGradient>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>
                                        {feature.description}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Active Rooms Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Active Rooms</Text>
                            <Pressable onPress={() => router.push("/rooms")}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </Pressable>
                        </View>
                        <View style={styles.roomsList}>
                            {activeRooms.map((room) => (
                                <Pressable key={room.id} style={styles.roomCard}>
                                    <View style={styles.roomInfo}>
                                        <View style={styles.roomIconContainer}>
                                            <Ionicons name="videocam" size={20} color="#a78bfa" />
                                        </View>
                                        <View style={styles.roomDetails}>
                                            <View style={styles.roomNameRow}>
                                                <Text style={styles.roomName}>{room.name}</Text>
                                                {room.isLive && (
                                                    <View style={styles.liveBadge}>
                                                        <View style={styles.liveIndicator} />
                                                        <Text style={styles.liveText}>LIVE</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.roomMeta}>
                                                {room.participants} participants • {room.type}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Your Stats Today</Text>
                        <View style={styles.statsContainer}>
                            <LinearGradient
                                colors={["rgba(99, 102, 241, 0.15)", "rgba(139, 92, 246, 0.1)"]}
                                style={styles.statCard}
                            >
                                <Ionicons name="time-outline" size={28} color="#6366f1" />
                                <Text style={styles.statCardNumber}>2h 45m</Text>
                                <Text style={styles.statCardLabel}>Focus Time</Text>
                            </LinearGradient>
                            <LinearGradient
                                colors={["rgba(16, 185, 129, 0.15)", "rgba(20, 184, 166, 0.1)"]}
                                style={styles.statCard}
                            >
                                <Ionicons name="checkmark-done-outline" size={28} color="#10b981" />
                                <Text style={styles.statCardNumber}>8/10</Text>
                                <Text style={styles.statCardLabel}>Tasks Done</Text>
                            </LinearGradient>
                            <LinearGradient
                                colors={["rgba(245, 158, 11, 0.15)", "rgba(251, 191, 36, 0.1)"]}
                                style={styles.statCard}
                            >
                                <Ionicons name="flame-outline" size={28} color="#f59e0b" />
                                <Text style={styles.statCardNumber}>7</Text>
                                <Text style={styles.statCardLabel}>Day Streak</Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Bottom spacing for tab bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 20,
    },
    greeting: {
        color: "#9ca3af",
        fontSize: 14,
        marginBottom: 4,
    },
    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    notificationBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ef4444",
        borderWidth: 2,
        borderColor: "#0a0a1a",
    },
    heroSection: {
        marginBottom: 24,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(139, 92, 246, 0.3)",
    },
    heroContent: {
        marginBottom: 20,
    },
    heroTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    heroSubtitle: {
        color: "#9ca3af",
        fontSize: 15,
        marginBottom: 20,
        lineHeight: 22,
    },
    heroButton: {
        alignSelf: "flex-start",
    },
    heroButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        gap: 8,
    },
    heroButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    heroStats: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 16,
        padding: 16,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: "rgba(139, 92, 246, 0.3)",
    },
    statNumber: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    statLabel: {
        color: "#9ca3af",
        fontSize: 12,
        marginTop: 4,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    seeAllText: {
        color: "#a78bfa",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 16,
    },
    featuresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    featureCard: {
        width: (width - 52) / 2,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    featureTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
    },
    featureDescription: {
        color: "#9ca3af",
        fontSize: 13,
        lineHeight: 18,
    },
    roomsList: {
        gap: 12,
    },
    roomCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    roomInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    roomIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    roomDetails: {
        flex: 1,
    },
    roomNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    roomName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    liveIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#ef4444",
    },
    liveText: {
        color: "#ef4444",
        fontSize: 10,
        fontWeight: "700",
    },
    roomMeta: {
        color: "#9ca3af",
        fontSize: 13,
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    statCardNumber: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 8,
    },
    statCardLabel: {
        color: "#9ca3af",
        fontSize: 11,
        marginTop: 4,
        textAlign: "center",
    },
});
