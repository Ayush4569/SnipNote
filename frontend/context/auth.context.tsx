import { User } from "@/types/user";
import { ReactNode, createContext, useState, useContext } from "react";

type Status = 'authenticated' | 'unauthenticated' | 'loading';

type AuthContextType = {
    user: User | null
    status: Status
    setStatus: (status: Status) => void
    login: (user: User) => void
    logout: () => void
    setLoading: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthContextProvider(
    { children }: { children: ReactNode }
) {
    const [user, setUser] = useState<User | null>(null)
    const [status, setStatus] = useState<Status>("loading")
    const login = (user: User) => {
        setUser(user)
        setStatus('authenticated')
    }
    const logout = () => {
        setUser(null)
        setStatus('unauthenticated')
    }
    const setLoading = () => setStatus('loading');
    return (
        <AuthContext.Provider value={{ user, login, logout, setLoading, status,setStatus }}>
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