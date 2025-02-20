// src/types/auth.ts
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: {
        user_id: number;
        username: string;
        email: string;
    };
}