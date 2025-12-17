import z from "zod";    

export interface SummaryType {
    idx: number
    heading: string
    points: string[]
}
export const SummarySchema = z.array(z.object({
    idx:z.int({error:"Id is required"}),
    heading:z.string().min(1,"Heading is required"),
    points:z.array(z.string().min(1,'summary is needed')).min(1,'Atleast 1 summary page is required')
}))