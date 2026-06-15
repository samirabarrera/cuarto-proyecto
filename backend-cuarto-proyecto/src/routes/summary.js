import { Router } from 'express';
import {
  getSummary,
  getSummaryByCategory,
  getMonthlyTrend,
} from '../controllers/summaryController.js';

const router = Router();

router.get('/',              getSummary);
router.get('/by-category',   getSummaryByCategory);
router.get('/monthly-trend', getMonthlyTrend);

export default router;
