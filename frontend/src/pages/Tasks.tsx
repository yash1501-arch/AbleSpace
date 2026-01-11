import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Calendar,
    Trash2,
    Edit2,
    MoreHorizontal,
    GripVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
    { id: 'To Do', label: 'To Do', color: 'slate' },
    { id: 'In Progress', label: 'In Progress', color: 'blue' },
    { id: 'Review', label: 'Review', color: 'purple' },
    { id: 'Completed', label: 'Completed', color: 'emerald' },
];

const Tasks = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['allTasks'],
        queryFn: async () => {
            const { data } = await api.get('/tasks');
            return data;
        },
    });

    useEffect(() => {
        socket.on('taskCreated', () => queryClient.invalidateQueries({ queryKey: ['allTasks'] }));
        socket.on('taskUpdated', () => queryClient.invalidateQueries({ queryKey: ['allTasks'] }));
        socket.on('taskDeleted', () => queryClient.invalidateQueries({ queryKey: ['allTasks'] }));

        return () => {
            socket.off('taskCreated');
            socket.off('taskUpdated');
            socket.off('taskDeleted');
        };
    }, [queryClient]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await api.put(`/tasks/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allTasks'] });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/tasks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allTasks'] });
        },
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'text-red-400 bg-red-400/10';
            case 'High': return 'text-orange-400 bg-orange-400/10';
            case 'Medium': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    const handleEdit = (task: any) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this task?')) {
            deleteTaskMutation.mutate(id);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Project Board</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage and track your tasks.</p>
                </div>
                <button
                    onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span>Add Task</span>
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex pb-6 min-w-max">
                    <div className="flex space-x-4">
                        {COLUMNS.map((column) => (
                            <div key={column.id} className="w-72 sm:w-80 flex flex-col space-y-3">
                                <div className="flex items-center justify-between px-2 bg-slate-900 py-2 rounded-t-lg border-x border-t border-slate-800">
                                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">{column.label}</h3>
                                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {tasks?.filter((t: any) => t.status === column.id).length || 0}
                                    </span>
                                </div>

                                <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-b-lg p-3 space-y-3 overflow-y-auto min-h-[300px]">
                                    {tasks?.filter((t: any) => t.status === column.id).map((task: any) => (
                                        <div
                                            key={task._id}
                                            onClick={() => handleEdit(task)}
                                            className="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-pointer hover:border-slate-500 transition-colors group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={clsx("px-2 py-0.5 rounded text-[9px] font-bold uppercase", getPriorityColor(task.priority))}>
                                                    {task.priority}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDelete(task._id, e)}
                                                    className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <h4 className="text-slate-100 font-bold text-sm mb-1">{task.title}</h4>
                                            <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
                                            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                                                    <Calendar size={12} />
                                                    {format(new Date(task.dueDate), 'MMM d')}
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                                                    {task.assignedToId?.avatar ? (
                                                        <img src={task.assignedToId.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        task.assignedToId?.name?.[0]
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {tasks?.filter((t: any) => t.status === column.id).length === 0 && (
                                        <div className="h-20 border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center">
                                            <p className="text-slate-700 text-[10px]">No tasks</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['allTasks'] });
                    }}
                />
            )}
        </div>
    );
};

export default Tasks;
