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
            return res.data.user as UserState;
        },
        enabled: hasAccessToken,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (query.isLoading) {
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
            login({ ...query.data })
        }
    }, [query.isSuccess, query.data]);

    useEffect(() => {
        if (!hasAccessToken && !hasRefreshToken) {
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
                .then((res) => {
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