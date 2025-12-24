/**
 * Authentication Context
 * Manages user authentication state and tier levels:
 * - guest: Not logged in, view only
 * - free: Logged in, full basic features
 * - premium: Paid user, can create private rooms
 */

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// User tiers
export const USER_TIERS = {
    GUEST: 'guest',
    FREE: 'free',
    PREMIUM: 'premium'
};

// Tier permissions
export const TIER_PERMISSIONS = {
    [USER_TIERS.GUEST]: {
        canToggleVideo: false,
        canToggleAudio: false,
        canChat: false,
        canShareScreen: false,
        canCreateRoom: true,
        canCreatePrivateRoom: false,
        canPingUsers: false,
        canSendAttachments: false,
    },
    [USER_TIERS.FREE]: {
        canToggleVideo: true,
        canToggleAudio: true,
        canChat: true,
        canShareScreen: true,
        canCreateRoom: true,
        canCreatePrivateRoom: false,
        canPingUsers: true,
        canSendAttachments: true,
    },
    [USER_TIERS.PREMIUM]: {
        canToggleVideo: true,
        canToggleAudio: true,
        canChat: true,
        canShareScreen: true,
        canCreateRoom: true,
        canCreatePrivateRoom: true,
        canPingUsers: true,
        canSendAttachments: true,
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('focusroom_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('focusroom_user');
            }
        }
        setIsLoading(false);
    }, []);

    // Save user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('focusroom_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('focusroom_user');
        }
    }, [user]);

    // Get current tier
    const tier = user?.tier || USER_TIERS.GUEST;
    const permissions = TIER_PERMISSIONS[tier];

    // Login function
    const login = async (email, password) => {
        // Simulated login - in real app, call API
        return new Promise((resolve) => {
            setTimeout(() => {
                const userData = {
                    id: `user_${Date.now()}`,
                    email,
                    name: email.split('@')[0],
                    tier: USER_TIERS.FREE,
                    createdAt: new Date().toISOString()
                };
                setUser(userData);
                toast.success(`Welcome back, ${userData.name}!`);
                resolve({ success: true, user: userData });
            }, 800);
        });
    };

    // Signup function
    const signup = async (email, password, name) => {
        // Simulated signup - in real app, call API
        return new Promise((resolve) => {
            setTimeout(() => {
                const userData = {
                    id: `user_${Date.now()}`,
                    email,
                    name: name || email.split('@')[0],
                    tier: USER_TIERS.FREE,
                    createdAt: new Date().toISOString()
                };
                setUser(userData);
                toast.success(`Account created! Welcome, ${userData.name}!`);
                resolve({ success: true, user: userData });
            }, 800);
        });
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('focusroom_username');
        toast.success('Logged out successfully');
    };

    // Upgrade to premium (fake payment for now)
    const upgradeToPremium = async () => {
        return new Promise((resolve) => {
            // Simulate payment processing
            setTimeout(() => {
                if (user) {
                    const updatedUser = { ...user, tier: USER_TIERS.PREMIUM };
                    setUser(updatedUser);
                    toast.success('🎉 Upgraded to Premium! Enjoy exclusive features.');
                    resolve({ success: true });
                } else {
                    toast.error('Please login first');
                    resolve({ success: false, error: 'Not logged in' });
                }
            }, 1500);
        });
    };

    // Cancel premium
    const cancelPremium = () => {
        if (user && user.tier === USER_TIERS.PREMIUM) {
            const updatedUser = { ...user, tier: USER_TIERS.FREE };
            setUser(updatedUser);
            toast.success('Premium cancelled');
        }
    };

    // Check if user can perform action
    const canPerformAction = (action) => {
        return permissions[action] || false;
    };

    const value = {
        user,
        tier,
        permissions,
        isLoading,
        isGuest: !user,
        isFree: tier === USER_TIERS.FREE,
        isPremium: tier === USER_TIERS.PREMIUM,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        upgradeToPremium,
        cancelPremium,
        canPerformAction,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
