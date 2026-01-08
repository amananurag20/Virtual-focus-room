import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0a0a1a" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="room/[roomId]" options={{ headerShown: false, presentation: "modal" }} />
        </Stack>
      </SocketProvider>
    </AuthProvider>
  );
}
