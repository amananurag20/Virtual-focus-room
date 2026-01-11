import { View, Text, Pressable, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { useCamera, CameraView } from "@/context/CameraContext";
import { useFocusEffect } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PreJoinScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ roomId: string; roomName: string; action: string }>();
    const { createRoom, joinRoom, isConnected } = useSocket();
    const { user, isLoggedIn } = useAuth();
    const {
        hasPermission,
        isAudioEnabled,
        isVideoEnabled,
        cameraError,
        cameraType,
        requestPermissions,
        toggleAudio,
        toggleVideo,
        switchCamera,
        setCameraReady,
        setCameraError,
    } = useCamera();

    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);

    const isCreating = params.action === "create";
    const roomName = params.roomName || "Focus Room";

    // Request permissions on screen focus
    useFocusEffect(
        useCallback(() => {
            const initCamera = async () => {
                if (hasPermission === null || hasPermission === false) {
                    setIsRequestingPermission(true);
                    await requestPermissions();
                    setIsRequestingPermission(false);
                }
            };

            initCamera();

            return () => {
                setCameraReady(false);
            };
        }, [hasPermission])
    );

    const handleJoinRoom = async () => {
        if (!isConnected) {
            setError("Not connected to server. Please wait...");
            return;
        }

        if (!isLoggedIn) {
            setError("Please sign in to join a room");
            return;
        }

        setIsJoining(true);
        setError(null);

        try {
            if (isCreating) {
                const result = await createRoom(
                    roomName,
                    user?.name || "User",
                    user?.tier || "free",
                    user?._id
                );

                if (result.success && result.roomId) {
                    router.replace({
                        pathname: "/room/[roomId]",
                        params: { roomId: result.roomId, roomName },
                    });
                } else {
                    setError(result.error || "Failed to create room");
                }
            } else {
                const result = await joinRoom(
                    params.roomId!,
                    user?.name || "User",
                    user?.tier || "free",
                    user?._id
                );

                if (result.success) {
                    router.replace({
                        pathname: "/room/[roomId]",
                        params: { roomId: params.roomId!, roomName },
                    });
                } else {
                    setError(result.error || "Failed to join room");
                }
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsJoining(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleCameraReady = () => {
        setCameraReady(true);
    };

    const handleCameraError = (error: any) => {
        console.error("Camera error:", error);
        setCameraError("Camera failed to initialize");
    };

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backBtn} onPress={handleCancel}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>{isCreating ? "Create Room" : "Join Room"}</Text>
                        <Text style={styles.roomNameText} numberOfLines={1}>{roomName}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Camera Preview */}
                <View style={styles.previewContainer}>
                    <View style={styles.previewBox}>
                        {isRequestingPermission ? (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#a78bfa" />
                                <Text style={styles.loadingText}>Requesting permissions...</Text>
                            </View>
                        ) : hasPermission === false || cameraError ? (
                            <View style={styles.errorOverlay}>
                                <LinearGradient colors={["rgba(239,68,68,0.2)", "rgba(239,68,68,0.1)"]} style={styles.errorIcon}>
                                    <Ionicons name="videocam-off" size={48} color="#ef4444" />
                                </LinearGradient>
                                <Text style={styles.errorTitle}>Camera Permission</Text>
                                <Text style={styles.errorText}>
                                    {cameraError || "Please allow camera access to join video rooms"}
                                </Text>
                                <Pressable style={styles.retryBtn} onPress={requestPermissions}>
                                    <Text style={styles.retryBtnText}>Grant Permission</Text>
                                </Pressable>
                            </View>
                        ) : hasPermission && isVideoEnabled ? (
                            <CameraView
                                style={styles.camera}
                                facing={cameraType}
                                onCameraReady={handleCameraReady}
                                onMountError={handleCameraError}
                            />
                        ) : (
                            <View style={styles.noVideoOverlay}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
                                </View>
                                <Text style={styles.noVideoText}>Camera is off</Text>
                            </View>
                        )}

                        {/* Switch Camera Button */}
                        {hasPermission && isVideoEnabled && (
                            <Pressable style={styles.switchCameraBtn} onPress={switchCamera}>
                                <Ionicons name="camera-reverse" size={22} color="#fff" />
                            </Pressable>
                        )}

                        {/* Media Status Indicators */}
                        <View style={styles.mediaIndicators}>
                            <View style={[styles.indicator, !isAudioEnabled && styles.indicatorOff]}>
                                <Ionicons name={isAudioEnabled ? "mic" : "mic-off"} size={16} color="#fff" />
                            </View>
                            <View style={[styles.indicator, !isVideoEnabled && styles.indicatorOff]}>
                                <Ionicons name={isVideoEnabled ? "videocam" : "videocam-off"} size={16} color="#fff" />
                            </View>
                        </View>
                    </View>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
                        </LinearGradient>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
                            <Text style={styles.userTier}>{user?.tier || "free"} account</Text>
                        </View>
                    </View>
                </View>

                {/* Media Controls */}
                <View style={styles.controls}>
                    <Pressable style={styles.controlBtn} onPress={toggleAudio}>
                        <LinearGradient
                            colors={isAudioEnabled ? ["#374151", "#1f2937"] : ["#ef4444", "#dc2626"]}
                            style={styles.controlBtnGrad}
                        >
                            <Ionicons name={isAudioEnabled ? "mic" : "mic-off"} size={28} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.controlLabel}>{isAudioEnabled ? "Mute" : "Unmute"}</Text>
                    </Pressable>

                    <Pressable style={styles.controlBtn} onPress={toggleVideo}>
                        <LinearGradient
                            colors={isVideoEnabled ? ["#374151", "#1f2937"] : ["#ef4444", "#dc2626"]}
                            style={styles.controlBtnGrad}
                        >
                            <Ionicons name={isVideoEnabled ? "videocam" : "videocam-off"} size={28} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.controlLabel}>{isVideoEnabled ? "Stop Video" : "Start Video"}</Text>
                    </Pressable>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={18} color="#ef4444" />
                        <Text style={styles.errorBannerText}>{error}</Text>
                    </View>
                )}

                {/* Connection Status */}
                <View style={styles.connectionStatus}>
                    <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
                    <Text style={styles.statusText}>
                        {isConnected ? "Connected to server" : "Connecting..."}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.joinBtn, (!isConnected || isJoining) && styles.joinBtnDisabled]}
                        onPress={handleJoinRoom}
                        disabled={!isConnected || isJoining}
                    >
                        <LinearGradient
                            colors={isConnected && !isJoining ? ["#6366f1", "#8b5cf6"] : ["#4b5563", "#374151"]}
                            style={styles.joinBtnGrad}
                        >
                            {isJoining ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name={isCreating ? "add-circle" : "enter"} size={22} color="#fff" />
                                    <Text style={styles.joinBtnText}>
                                        {isCreating ? "Create & Join" : "Join Room"}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Tip */}
                <View style={styles.tipContainer}>
                    <Ionicons name="bulb-outline" size={16} color="#6b7280" />
                    <Text style={styles.tipText}>
                        Make sure your camera and microphone are working before joining
                    </Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Header
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    headerCenter: { flex: 1, alignItems: "center" },
    title: { color: "#fff", fontSize: 18, fontWeight: "600" },
    roomNameText: { color: "#a78bfa", fontSize: 14, marginTop: 2 },

    // Preview
    previewContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20, alignItems: "center" },
    previewBox: { width: SCREEN_WIDTH - 40, aspectRatio: 4 / 3, borderRadius: 24, overflow: "hidden", backgroundColor: "#1a1a35", borderWidth: 2, borderColor: "rgba(139,92,246,0.3)" },
    camera: { width: "100%", height: "100%" },
    loadingOverlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1a1a35" },
    loadingText: { color: "#a78bfa", fontSize: 14, marginTop: 16 },
    errorOverlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    errorIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    errorTitle: { color: "#ef4444", fontSize: 16, fontWeight: "600", marginBottom: 8 },
    errorText: { color: "#9ca3af", fontSize: 14, textAlign: "center" },
    retryBtn: { marginTop: 16, backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    retryBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
    noVideoOverlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1a1a35" },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(139,92,246,0.3)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(139,92,246,0.5)" },
    avatarText: { color: "#fff", fontSize: 32, fontWeight: "600" },
    noVideoText: { color: "#9ca3af", fontSize: 14, marginTop: 12 },
    switchCameraBtn: { position: "absolute", top: 16, right: 16, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    mediaIndicators: { position: "absolute", bottom: 16, left: 16, flexDirection: "row", gap: 8 },
    indicator: { backgroundColor: "rgba(16,185,129,0.8)", borderRadius: 16, width: 32, height: 32, alignItems: "center", justifyContent: "center" },
    indicatorOff: { backgroundColor: "rgba(239,68,68,0.8)" },

    // User Info
    userInfo: { flexDirection: "row", alignItems: "center", marginTop: 20, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    userAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    userAvatarText: { color: "#fff", fontSize: 20, fontWeight: "600" },
    userDetails: { marginLeft: 14 },
    userName: { color: "#fff", fontSize: 16, fontWeight: "600" },
    userTier: { color: "#9ca3af", fontSize: 13, textTransform: "capitalize", marginTop: 2 },

    // Controls
    controls: { flexDirection: "row", justifyContent: "center", gap: 32, paddingVertical: 20 },
    controlBtn: { alignItems: "center" },
    controlBtnGrad: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
    controlLabel: { color: "#9ca3af", fontSize: 12, marginTop: 8 },

    // Error Banner
    errorBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.15)", marginHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
    errorBannerText: { color: "#ef4444", fontSize: 14 },

    // Connection Status
    connectionStatus: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    online: { backgroundColor: "#10b981" },
    offline: { backgroundColor: "#f59e0b" },
    statusText: { color: "#9ca3af", fontSize: 13 },

    // Actions
    actions: { flexDirection: "row", paddingHorizontal: 20, gap: 12, paddingBottom: 12 },
    cancelBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
    cancelBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    joinBtn: { flex: 2, borderRadius: 16, overflow: "hidden" },
    joinBtnDisabled: { opacity: 0.6 },
    joinBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
    joinBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    // Tip
    tipContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
    tipText: { color: "#6b7280", fontSize: 12, textAlign: "center", flex: 1 },
});
