// app/utils/env.ts
declare global {
    interface Window {
        __env?: {
            API_BASE_URL: string;
            API_URL: string;
            SUPPORT_EMAIL: string;
            // …other variables
        };
    }
}

function getEnv() {
    // In the browser, use the embedded object
    if (typeof window !== "undefined" && window.__env) {
        return window.__env;
    }
    // On the server, fall back to process.env (or a safe default)
    return {
        API_BASE_URL: process.env.API_BASE_URL || "http://localhost:8000",
        API_URL: process.env.API_BASE_URL
            ? process.env.API_BASE_URL + "/api"
            : "http://localhost:8000/api",
        SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "support@wle.com",
    };
}

export const env = getEnv();