import { useEffect, useMemo, useState, type ReactNode } from "react";
import api, { setAuthToken } from "../services/api";
import {
  AuthContext,
  type AuthContextType,
  type IUserProfile,
} from "./authContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Prevent multiple automatic refresh attempts (helps avoid rate-limiter on prod)

    const restoreSession = async () => {
      try {
        const response = await api.get("/auth/refresh");
        const sessionUser = response.data.data?.user || response.data.data;
        const authToken = response.data.token;

        if (isMounted && sessionUser && authToken) {
          setUser(sessionUser);
          setTokenState(authToken);
          setAuthToken(authToken);
        }
      } catch {
        // If rate-limited, don't retry automatically; show anonymous session
        if (isMounted) {
          setUser(null);
          setTokenState(null);
          setAuthToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const loggedInUser = response.data.data?.user || response.data.data;
    const authToken = response.data.token;

    setUser(loggedInUser);
    setTokenState(authToken);
    setAuthToken(authToken);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
  ) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      passwordConfirm,
    });
    const registeredUser = response.data.data?.user || response.data.data;
    const authToken = response.data.token;

    setUser(registeredUser);
    setTokenState(authToken);
    setAuthToken(authToken);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout failures on the client. The server will clear the cookie if possible.
    }

    setUser(null);
    setTokenState(null);
    setAuthToken(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
