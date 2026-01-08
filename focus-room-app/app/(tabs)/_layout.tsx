import { Tabs } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

type TabIconProps = {
    focused: boolean;
    color: string;
    name: keyof typeof Ionicons.glyphMap;
    label: string;
};

function TabIcon({ focused, color, name, label }: TabIconProps) {
    return (
        <View style={styles.tabIconContainer}>
            <View
                style={[
                    styles.iconWrapper,
                    focused && styles.iconWrapperFocused,
                ]}
            >
                <Ionicons
                    name={name}
                    size={24}
                    color={focused ? "#fff" : "#6b7280"}
                />
            </View>
            <Text
                style={[
                    styles.tabLabel,
                    { color: focused ? "#a78bfa" : "#6b7280" },
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#a78bfa",
                tabBarInactiveTintColor: "#6b7280",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            name={focused ? "home" : "home-outline"}
                            label="Home"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="rooms"
                options={{
                    title: "Rooms",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            name={focused ? "grid" : "grid-outline"}
                            label="Rooms"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="friends"
                options={{
                    title: "Friends",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            name={focused ? "people" : "people-outline"}
                            label="Friends"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            name={focused ? "person" : "person-outline"}
                            label="Profile"
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: "rgba(15, 15, 35, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "rgba(139, 92, 246, 0.2)",
        height: 75,
        paddingBottom: 10,
        paddingTop: 10,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabIconContainer: {
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    iconWrapperFocused: {
        backgroundColor: "rgba(139, 92, 246, 0.3)",
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: "600",
    },
});
