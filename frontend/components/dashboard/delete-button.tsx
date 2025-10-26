'use client"'
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import axios, { isAxiosError } from "axios"
import { queryClient } from "@/lib/tanstack"
export default function DeleteButton({ summaryId }: { summaryId: string }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const handleDelete = async () => {
        startTransition(async () => {
            try {
                const { data } = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summary/${summaryId}`, {
                    withCredentials: true
                })
                if (data.success) {
                    toast.success(data.message || 'Summary deleted successfully')
                    setOpen(false)
                    queryClient.invalidateQueries(
                        { queryKey: ['summaries'] }
                    )
                }
            } catch (error) {
                console.log('Error deleting summary:', error);
                toast.error(
                    isAxiosError(error) ? error.response?.data.message : 'An error occurred while deleting the summary.'
                )

            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size='icon'
                    className="text-gray-400 hover:text-rose-600 bg-gray-50 border border-gray-200 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                >
                    <Trash className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="[&>button:last-child]:hidden">
                <DialogHeader>
                    <DialogTitle>
                        Are you sure you want to delete this summary?
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your summary and remove all associated data.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        className="bg-gray-100 hover:bg-gray-200 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 mr-2"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-rose-600 hover:bg-rose-700 border-rose-700 hover:border-rose-800 text-white hover:text-white"
                        onClick={handleDelete}
                    >
                        {isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}