import { Router } from 'express';
import { getTipOfTheDay, getRandomTip, getAllTips } from '../controllers/tipController.js';

const router = Router();

router.get('/',       getTipOfTheDay);
router.get('/random', getRandomTip);
router.get('/all',    getAllTips);

export default router;
