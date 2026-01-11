import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { CameraProvider } from "@/context/CameraContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CameraProvider>
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
            <Stack.Screen name="room/prejoin" options={{ headerShown: false, presentation: "modal" }} />
            <Stack.Screen name="room/[roomId]" options={{ headerShown: false, presentation: "fullScreenModal" }} />
          </Stack>
        </CameraProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
