import { authMiddleware } from "../middlewares/auth.middleware";
import { googleSignIn,getUser,logoutUser } from "../controller/auth.controller";
import { Router } from "express";

const router = Router();

router.get('/',authMiddleware,getUser)
router.get("/google/callback",googleSignIn);
router.post("/logout",authMiddleware,logoutUser);

export default router;