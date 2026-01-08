import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function SignupScreen() {
    const router = useRouter();
    const { signup } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setError("");
        setLoading(true);
        const result = await signup(name, email, password);
        setLoading(false);
        if (result.success) {
            router.replace("/(tabs)");
        } else {
            setError(result.error || "Signup failed");
        }
    };

    return (
        <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Pressable style={styles.backBtn} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join the Focus Room community</Text>

                            {error ? (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle" size={18} color="#ef4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#6b7280" value={name} onChangeText={setName} />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#6b7280" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#6b7280" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                                    </Pressable>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#6b7280" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
                                </View>

                                <Pressable style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
                                    <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.signupBtnGrad}>
                                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupBtnText}>Create Account</Text>}
                                    </LinearGradient>
                                </Pressable>
                            </View>

                            <View style={styles.loginRow}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <Pressable onPress={() => router.back()}>
                                    <Text style={styles.loginLink}>Sign In</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    header: { paddingHorizontal: 20, paddingTop: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: "center", paddingBottom: 40 },
    title: { color: "#fff", fontSize: 32, fontWeight: "bold", marginBottom: 8 },
    subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 32 },
    errorBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 20, gap: 8 },
    errorText: { color: "#ef4444", fontSize: 14 },
    form: { gap: 16 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: "#fff", fontSize: 16 },
    signupBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
    signupBtnGrad: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
    signupBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
    loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
    loginText: { color: "#9ca3af", fontSize: 15 },
    loginLink: { color: "#a78bfa", fontSize: 15, fontWeight: "600" },
});
