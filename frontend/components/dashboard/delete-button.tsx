import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"

export default function DeleteButton() {
    return (
        <Button 
        variant="ghost"
        size='icon'
        className="text-gray-400 hover:text-rose-600 bg-gray-50 border border-gray-200 hover:bg-rose-50 hover:border-rose-200 transition-colors"
         >
           <Trash className="w-4 h-4" />
        </Button>
    )
}