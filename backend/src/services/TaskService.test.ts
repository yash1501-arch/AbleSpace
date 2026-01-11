import { TaskService } from './TaskService';
import { TaskRepository } from '../repositories/TaskRepository';

jest.mock('../repositories/TaskRepository');

describe('TaskService', () => {
    let taskService: TaskService;

    beforeEach(() => {
        taskService = new TaskService();
    });

    it('should create a task', async () => {
        const mockTask = { title: 'Test Task' };
        jest.spyOn(TaskRepository.prototype, 'create').mockResolvedValue(mockTask as any);

        const result = await taskService.createTask(mockTask as any);

        expect(TaskRepository.prototype.create).toHaveBeenCalledWith(mockTask);
        expect(result.title).toBe('Test Task');
    });

    it('should get task by id', async () => {
        const mockTask = { title: 'Test Task' };
        jest.spyOn(TaskRepository.prototype, 'findById').mockResolvedValue(mockTask as any);

        const result = await taskService.getTaskById('123');

        expect(TaskRepository.prototype.findById).toHaveBeenCalledWith('123');
        expect(result.title).toBe('Test Task');
    });

    it('should throw error if task not found', async () => {
        jest.spyOn(TaskRepository.prototype, 'findById').mockResolvedValue(null);

        await expect(taskService.getTaskById('123')).rejects.toThrow('Task not found');
    });
});
