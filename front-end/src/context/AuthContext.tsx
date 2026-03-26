import React, { createContext, useReducer, useEffect, type ReactNode } from "react";
import { getToken, getUser, saveToken, saveUser, clearAuth } from "../utils/storage";

type User = {
    id: string;
    fullName: string;
    email: string;
    role?: string;
};

type State = {
    user: User | null;
    token: string | null;
    loading: boolean;
};

type Action =
    | { type: "RESTORE"; token: string | null; user: User | null }
    | { type: "LOGIN"; token: string; user: User }
    | { type: "LOGOUT" };

type AuthContextType = {
    state: State;
    signIn: (payload: { token: string; user: User }) => void;
    signOut: () => void;
};

const initialState: State = { user: null, token: null, loading: true };

const AuthContext = createContext<AuthContextType>({
    state: initialState,
    signIn: () => { },
    signOut: () => { },
});

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "RESTORE":
            return { ...state, token: action.token, user: action.user, loading: false };
        case "LOGIN":
            return { ...state, token: action.token, user: action.user, loading: false };
        case "LOGOUT":
            return { ...state, token: null, user: null, loading: false };
        default:
            return state;
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const token = getToken();
        const user = getUser();
        dispatch({ type: "RESTORE", token, user });
    }, []);

    const signIn = ({ token, user }: { token: string; user: User }) => {
        saveToken(token);
        saveUser(user);
        dispatch({ type: "LOGIN", token, user });
    };

    const signOut = () => {
        clearAuth();
        dispatch({ type: "LOGOUT" });
    };

    return (
        <AuthContext.Provider value={{ state, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
