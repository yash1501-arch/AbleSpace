import { z } from 'zod';

const TaskPriority = z.enum(['Low', 'Medium', 'High', 'Urgent']);
const TaskStatus = z.enum(['To Do', 'In Progress', 'Review', 'Completed']);

export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(100),
        description: z.string(),
        dueDate: z.string().transform((str) => new Date(str)),
        priority: TaskPriority.optional(),
        status: TaskStatus.optional(),
        assignedToId: z.string(),
    }),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        dueDate: z.string().transform((str) => new Date(str)).optional(),
        priority: TaskPriority.optional(),
        status: TaskStatus.optional(),
        assignedToId: z.string().optional(),
    }),
});
