import { Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { TaskService } from '../services/TaskService';

const taskService = new TaskService();

export class TaskController {
    async create(req: Request, res: Response) {
        try {
            const taskData = { ...req.body, creatorId: (req as any).user.id };
            const task = await taskService.createTask(taskData);

            // Emit socket event (will be handled in index.ts or separate socket manager)
            const io = req.app.get('io');
            io.emit('taskCreated', task);
            if (task.assignedToId) {
                io.to(task.assignedToId.toString()).emit('notification', {
                    message: `New task assigned: ${task.title}`,
                    taskId: task._id
                });
            }

            res.status(201).json(task);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const { status, priority, assignedTo, creator, overdue, sortBy, order } = req.query;
            const filters: any = {};
            if (status) filters.status = status;
            if (priority) filters.priority = priority;
            if (assignedTo) filters.assignedToId = assignedTo;
            if (creator) filters.creatorId = creator;
            if (overdue === 'true') filters.overdue = true;

            const sort: any = {};
            if (sortBy) {
                sort[sortBy as string] = order === 'desc' ? -1 : 1;
            } else {
                sort.dueDate = 1;
            }

            const tasks = await taskService.getTasks(filters, sort);
            res.json(tasks);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const task = await taskService.getTaskById(req.params.id as string);
            res.json(task);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const task = await taskService.updateTask(req.params.id as string, req.body);

            const io = req.app.get('io');
            io.emit('taskUpdated', task);

            if (req.body.assignedToId) {
                io.to(req.body.assignedToId.toString()).emit('notification', {
                    message: `Task updated/assigned: ${task.title}`,
                    taskId: task._id
                });
            }

            res.json(task);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await taskService.deleteTask(req.params.id as string);

            const io = req.app.get('io');
            io.emit('taskDeleted', req.params.id);

            res.status(204).send();
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}
