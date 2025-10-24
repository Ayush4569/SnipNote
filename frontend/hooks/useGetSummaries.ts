import { Summary } from "@/types/summary"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

export const useGetSummaries = (userId:string)=>{
    const pathname = usePathname()
    return useQuery({
        queryKey:['summaries'],
        queryFn: async ()=>{
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summary`,{
                   withCredentials: true
                });
                return res.data.summary as Summary[]
            } catch (error) {
                console.log('Error fetching user summaries', error);
                const msg = axios.isAxiosError(error) ? error.response?.data.message : "Failed to fetch summaries"
                toast.error(msg)
            }
        },
        staleTime: 1000 * 60 ,
        refetchOnWindowFocus: false,
        enabled: !!userId && pathname.startsWith('/dashboard')
    })
}