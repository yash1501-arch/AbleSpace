import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { createTaskSchema, updateTaskSchema } from '../dtos/task.dto';

const router = Router();
const taskController = new TaskController();

router.get('/', auth, taskController.getAll);
router.get('/:id', auth, taskController.getById);
router.post('/', auth, validate(createTaskSchema), taskController.create);
router.put('/:id', auth, validate(updateTaskSchema), taskController.update);
router.delete('/:id', auth, taskController.delete);

export default router;
