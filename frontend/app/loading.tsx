import { Loader2 } from "lucide-react";

export default function Loading({className=""}:{className?:string}) {
  return (
    <div className={`h-screen w-screen flex items-center justify-center ${className}`}>
      <Loader2
        className="animate-spin text-purple-600 dark:text-fuchsia-400"
        size={50}
      />
    </div>
  );
}