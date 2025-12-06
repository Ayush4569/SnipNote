import { Router, raw } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createSubscription ,cancelSubscription,webhook} from "../controller/subscription.controller";

export const webHookRouter = Router()
webHookRouter.post("/webhook", raw({ type: "application/json" }), webhook);

const router = Router();

router.post('/',authMiddleware,createSubscription)
router.delete("/cancel",authMiddleware,cancelSubscription)
export default router