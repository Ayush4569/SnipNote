import {Router}from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { deleteSummary, generateSummary, getAllSummaries, getSummary } from '../controller/summary.controller';


const router = Router();

router.get('/',authMiddleware,getAllSummaries)
router.post('/',authMiddleware,generateSummary)
router.get('/:id',authMiddleware,getSummary)
router.delete('/:id',authMiddleware,deleteSummary)
export default router;