import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/check-profile/${currentUser.email}`);
                    if (res.data.exists && res.data.user.role === "admin") {
                        setUser(currentUser);
                        setIsAdmin(true);
                        setAuthError("");
                    } else {
                        setUser(null);
                        setIsAdmin(false);
                        if (res.data.exists) {
                            setAuthError("Access Denied: You are not an admin.");
                        } else {
                            setAuthError("Account not found. Please contact the system administrator.");
                        }
                        signOut(auth);
                    }
                } catch (error) {
                    console.error("Auth check error:", error);
                    setUser(null);
                    setIsAdmin(false);
                    setAuthError("Unable to verify admin access. Please check if the server is running.");
                    signOut(auth);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, authError, setAuthError, loginWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
