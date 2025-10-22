export { }
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: import("mongoose").Types.ObjectId;
                name: string;
                email: string;
                picture?: string | null;
                isPro: boolean;
            }
        }
    }
}