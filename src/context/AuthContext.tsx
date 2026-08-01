import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import api, { setAuthToken } from "../services/api";

export interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: IUserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get("/auth/refresh");
        const sessionUser = response.data.data?.user || response.data.data;
        const authToken = response.data.token;

        if (sessionUser && authToken) {
          setUser(sessionUser);
          setTokenState(authToken);
          setAuthToken(authToken);
        }
      } catch (error) {
        setUser(null);
        setTokenState(null);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const loggedInUser = response.data.data?.user || response.data.data;
    const authToken = response.data.token;

    setUser(loggedInUser);
    setTokenState(authToken);
    setAuthToken(authToken);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
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
    } catch (err) {
      console.error("Logout failed", err);
    }

    setUser(null);
    setTokenState(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};
