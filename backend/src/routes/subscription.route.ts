import { Router, raw } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createSubscription, cancelSubscription, webhook } from "../controller/subscription.controller";

export const webHookRouter = Router()
webHookRouter.post("/", raw({ type: "application/json" }), webhook);

const router = Router();

router.post('/', authMiddleware, createSubscription)
router.delete("/cancel", authMiddleware, cancelSubscription)

export const subscriptionRoutes = router;
