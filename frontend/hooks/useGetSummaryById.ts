import { Summary } from "@/types/summary"
import { useQuery } from "@tanstack/react-query"
import axios from "axios";
import { toast } from "sonner";


export const useGetSummaryById = ({summaryId}:{summaryId:string})=>{
    return useQuery<Summary,Error>({
        queryKey:[`summary:${summaryId}`],
        staleTime: 1000 * 60 * 5 , // 1 minute
        refetchOnWindowFocus: false,
        enabled:  !!summaryId,
        queryFn: async ()=>{
            try {
                const {data} = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summary/${summaryId}`,{
                     withCredentials: true
                });
                return data.summary as Summary
            } catch (error) {
                console.log('Error fetching summary by id', error);
                const msg = axios.isAxiosError(error) ? error.response?.data.message : "Failed to fetch summary"
                toast.error(msg)
                throw new Error(msg)
            }
        }
    })
}