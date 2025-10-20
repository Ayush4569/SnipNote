import { User } from "@/types/user";
import axios from "axios";
import { ReactNode, createContext, useState, useContext, useEffect } from "react";

type Status = 'authenticated' | 'unauthenticated' | 'loading';

type AuthContextType = {
    user: User | null
    status: Status
    login: (user: User) => void
    logout: () => void
    setLoading: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthContextProvider(
    { children }: { children: ReactNode }
) {
    const [user, setUser] = useState<User | null>(null)
    const [status, setStatus] = useState<Status>("unauthenticated")
    const login = (user: User) => {
        setUser(user)
        setStatus('authenticated')
    }
    const logout = () => {
        setUser(null)
        setStatus('unauthenticated')
    }
    const setLoading = () => setStatus('loading');
    useEffect(() => {
        const fetchUser = async () => {
          const {data} = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`, {
            withCredentials:true
          });
          if (data.success) {
            setUser(data.user);
            console.log("User authenticated:");
            setStatus('authenticated');
          }
        };
        fetchUser();
      }, []);
    return (
        <AuthContext.Provider value={{ user, login, logout, setLoading, status }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctxt = useContext(AuthContext)
    if (ctxt === undefined) {
        throw new Error('useAuthContext must be used within an AuthContextProvider')
    }
    return ctxt;
}