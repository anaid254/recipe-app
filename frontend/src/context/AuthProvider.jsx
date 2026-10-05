import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthSession = async () => {
            try {
                const response = await axios.get("/api/users/me");
                setAuth({ username: response.data.username, ...response.data });
            } catch (err) {
                setAuth({});
            } finally {
                setLoading(false);
            }
        };

        checkAuthSession();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;