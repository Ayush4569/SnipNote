'use client'
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { User as UserState } from "@/types/user";
import { useEffect } from "react";
import { useAuth } from "@/context/auth.context";
import { toast } from "sonner";
export default function AppInit({
    hasAccessToken,
    hasRefreshToken
}:
    {
        hasAccessToken: boolean,
        hasRefreshToken: boolean
    }) {

    console.log("AppInit rendered with:", { hasAccessToken, hasRefreshToken });
    
    const { login, logout, setLoading ,setStatus} = useAuth();
    const query = useQuery<UserState, Error>({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
                {
                    withCredentials: true,
                }
            );
            console.log("Fetched user data:", res.data);
            
            return res.data.user as UserState;
        },
        enabled: hasAccessToken,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (query.isLoading) {
            console.log("Fetching user data...");
            
            setLoading()
        }
    }, [query.isLoading]);
    useEffect(() => {
        if (query.isError) {
            logout();
            console.error("Error fetching user:", query.error);
        }
    }, [query.isError]);
    useEffect(() => {

        if (query.data) {
            console.log("User data fetched successfully:", query.data);
            login({ ...query.data })
        }
    }, [query.isSuccess, query.data]);

    useEffect(() => {
        if (!hasAccessToken && !hasRefreshToken) {
            console.log("Neither access token nor refresh token present. Logging out.");
            
            logout()
            return;
        }
        else if (!hasAccessToken && hasRefreshToken) {
            
            axios
                .post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
                    null,
                    { withCredentials: true }
                )
                .then(({data}) => {
                    login(data.user);
                    setStatus('authenticated');
                })
                .catch((error) => {
                    console.error("Refresh failed:", error);
                    logout()
                    if (error instanceof AxiosError) {
                        toast.error(error.response?.data.message);
                    } else {
                        toast.error("unexpected error ");
                    }
                });
        }
    }, [hasAccessToken, hasRefreshToken]);

    return null;
}