/**
 * Server Configuration
 */

const config = {
    port: process.env.PORT || 5000,
    cors: {
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc)
            // Also allow any localhost or network IP
            if (!origin ||
                origin.includes('localhost') ||
                origin.includes('127.0.0.1') ||
                /^http:\/\/192\.168\.\d+\.\d+/.test(origin) ||
                /^http:\/\/10\.\d+\.\d+\.\d+/.test(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
};

module.exports = config;
