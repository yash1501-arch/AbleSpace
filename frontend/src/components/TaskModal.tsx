import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import api from '../utils/axios';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
    status: z.enum(['To Do', 'In Progress', 'Review', 'Completed']),
    assignedToId: z.string().min(1, 'Assignee is required'),
});

type TaskInputs = z.infer<typeof taskSchema>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    task?: any;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSuccess, task }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskInputs>({
        resolver: zodResolver(taskSchema),
        defaultValues: task ? {
            ...task,
            dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
            assignedToId: task.assignedToId?._id,
        } : {
            priority: 'Medium',
            status: 'To Do',
            dueDate: new Date().toISOString().slice(0, 16),
        },
    });

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                const { data } = await api.get('/users');
                setUsers(data);
            };
            fetchUsers();
        }
    }, [isOpen]);

    const onSubmit = async (data: TaskInputs) => {
        setLoading(true);
        try {
            if (task) {
                await api.put(`/tasks/${task._id}`, data);
            } else {
                await api.post('/tasks', data);
            }
            onSuccess();
            reset();
        } catch (error) {
            console.error('Failed to save task', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80" onClick={onClose} />

            {/* Modal Body */}
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-xl shadow-xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">{task ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                        <input
                            {...register('title')}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 font-medium"
                            placeholder="Task name"
                        />
                        {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 resize-none font-medium"
                            placeholder="Details..."
                        />
                        {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                            <input
                                {...register('dueDate')}
                                type="datetime-local"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assignee</label>
                            <select
                                {...register('assignedToId')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 font-medium"
                            >
                                <option value="">Select member</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.name}</option>
                                ))}
                            </select>
                            {errors.assignedToId && <p className="text-[10px] text-red-500 mt-1">{errors.assignedToId.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                            <select
                                {...register('priority')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 font-medium"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                            <select
                                {...register('status')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 font-medium"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-slate-800 hover:bg-slate-800 text-white rounded-lg h-10 text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (task ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
