// API Configuration for Focus Room Mobile App
// For development, use your computer's local IP address instead of localhost
// because the mobile device/emulator can't access localhost on your computer

// Get the API URL - in production this would come from environment
// For development with Expo, you need to use your machine's IP
export const API_BASE_URL = "http://192.168.1.100:3000"; // Replace with your actual IP

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: "/api/auth/login",
        SIGNUP: "/api/auth/signup",
        PROFILE: "/api/auth/profile",
        UPGRADE: "/api/auth/upgrade",
    },
    // Friends
    FRIENDS: {
        DETAILS: "/api/friends/details",
        REQUEST: "/api/friends/request",
        ACCEPT: "/api/friends/accept",
        REJECT: "/api/friends/reject",
        SEARCH: "/api/friends/search",
    },
    // Stats
    STATS: {
        GET: "/api/stats",
        DASHBOARD: "/api/stats/dashboard",
        SESSION: "/api/stats/session",
    },
    // Todos
    TODOS: {
        LIST: "/api/todos",
        CREATE: "/api/todos",
        UPDATE: "/api/todos",
        DELETE: "/api/todos",
    },
    // Tiers
    TIERS: "/api/tiers",
};

// User Tiers
export const USER_TIERS = {
    GUEST: "guest",
    FREE: "free",
    PREMIUM: "premium",
} as const;

export type UserTier = (typeof USER_TIERS)[keyof typeof USER_TIERS];
