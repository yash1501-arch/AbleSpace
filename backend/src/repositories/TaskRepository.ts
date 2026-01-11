import Task, { ITask } from '../models/Task';


export class TaskRepository {
    async create(taskData: Partial<ITask>): Promise<ITask> {
        const task = new Task(taskData);
        return await task.save();
    }

    async findById(id: string): Promise<ITask | null> {
        return await Task.findById(id).populate('creatorId assignedToId', 'name email avatar');
    }

    async update(id: string, taskData: Partial<ITask>): Promise<ITask | null> {
        return await Task.findByIdAndUpdate(id, taskData, { new: true }).populate('creatorId assignedToId', 'name email avatar');
    }

    async delete(id: string): Promise<ITask | null> {
        return await Task.findByIdAndDelete(id);
    }

    async find(query: any, sort: any = { dueDate: 1 }): Promise<ITask[]> {
        return await Task.find(query)
            .populate('creatorId assignedToId', 'name email avatar')
            .sort(sort);
    }
}
