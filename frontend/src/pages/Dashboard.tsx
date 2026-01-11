import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Filter,
    SortAsc,
    CheckCircle2,
    AlertCircle,
    Users,
    Calendar,
    ChevronRight,
    Clock,
    LayoutGrid,
    List
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        assignedTo: user?.id,
    });

    const { data: tasks, isLoading, refetch } = useQuery({
        queryKey: ['tasks', filters],
        queryFn: async () => {
            const { data } = await api.get('/tasks', { params: filters });
            return data;
        },
    });

    const { data: stats } = useQuery({
        queryKey: ['taskStats'],
        queryFn: async () => {
            const [assigned, created, overdue] = await Promise.all([
                api.get('/tasks', { params: { assignedTo: user?.id } }),
                api.get('/tasks', { params: { creator: user?.id } }),
                api.get('/tasks', { params: { overdue: true } }),
            ]);
            return {
                assigned: assigned.data.length,
                created: created.data.length,
                overdue: overdue.data.length,
                completed: assigned.data.filter((t: any) => t.status === 'Completed').length,
            };
        },
        enabled: !!user,
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'text-red-400 bg-red-400/10';
            case 'High': return 'text-orange-400 bg-orange-400/10';
            case 'Medium': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-emerald-400 bg-emerald-400/10';
            case 'Review': return 'text-purple-400 bg-purple-400/10';
            case 'In Progress': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hello, {user?.name}</h1>
                    <p className="text-slate-400 text-sm mt-1">Here is what's happening today.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span>New Task</span>
                </button>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Assigned', value: stats?.assigned || 0, color: 'blue' },
                    { label: 'Completed', value: stats?.completed || 0, color: 'emerald' },
                    { label: 'Created', value: stats?.created || 0, color: 'indigo' },
                    { label: 'Overdue', value: stats?.overdue || 0, color: 'red' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Task Area */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-bold text-white">Tasks Overview</h3>
                    <div className="flex items-center gap-2">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none"
                        >
                            <option value="">All Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-500">
                            <p>Loading tasks...</p>
                        </div>
                    ) : tasks?.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-400">No tasks found matching your criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Priority</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {tasks?.map((task: any) => (
                                    <tr key={task._id} className="hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-200">{task.title}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 sm:hidden">{task.status} • {task.priority}</div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", getStatusColor(task.status))}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", getPriorityColor(task.priority))}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        refetch();
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;
