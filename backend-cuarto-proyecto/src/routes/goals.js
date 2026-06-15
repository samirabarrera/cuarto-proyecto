import { Router } from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';

const router = Router();

router.get('/',     getGoals);
router.post('/',    createGoal);
router.put('/:id',  updateGoal);
router.delete('/:id', deleteGoal);

export default router;
