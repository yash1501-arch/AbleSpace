import { TaskRepository } from '../repositories/TaskRepository';
import { ITask } from '../models/Task';
import mongoose from 'mongoose';

export class TaskService {
    private taskRepository = new TaskRepository();

    async createTask(taskData: Partial<ITask>) {
        return await this.taskRepository.create(taskData);
    }

    async getTaskById(id: string) {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }

    async updateTask(id: string, updateData: Partial<ITask>) {
        const task = await this.taskRepository.update(id, updateData);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }

    async deleteTask(id: string) {
        const task = await this.taskRepository.delete(id);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }

    async getTasks(filters: any, sort: any) {
        const query: any = {};

        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.assignedToId) query.assignedToId = filters.assignedToId;
        if (filters.creatorId) query.creatorId = filters.creatorId;
        if (filters.overdue) {
            query.dueDate = { $lt: new Date() };
            query.status = { $ne: 'Completed' };
        }

        return await this.taskRepository.find(query, sort);
    }
}
