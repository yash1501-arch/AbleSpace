import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../utils/axios';
import { User, Mail, Lock, Camera, Loader2, CheckCircle } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

type ProfileInputs = z.infer<typeof profileSchema>;

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileInputs>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name,
            avatar: user?.avatar || '',
        },
    });

    const onSubmit = async (data: ProfileInputs) => {
        setLoading(true);
        setSuccess(false);
        try {
            const cleanedData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== '')
            );

            const response = await api.put('/auth/profile', cleanedData);
            updateUser({
                id: response.data._id,
                name: response.data.name,
                email: response.data.email,
                avatar: response.data.avatar,
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="border-b border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-slate-400 text-sm mt-1">Manage your identity and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="md:col-span-1 border border-slate-800 bg-slate-900 rounded-xl p-6 text-center h-fit">
                    <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 border-2 border-slate-700 overflow-hidden">
                        {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]}
                    </div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <p className="text-slate-400 text-sm">{user?.email}</p>
                    <div className="mt-6 pt-6 border-t border-slate-800 text-left space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 uppercase font-bold">Role</span>
                            <span className="text-blue-400 font-bold">Standard User</span>
                        </div>
                    </div>
                </div>

                {/* Form area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="border border-slate-800 bg-slate-900 rounded-xl p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                    <input
                                        {...register('name')}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Your name"
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avatar URL</label>
                                    <input
                                        {...register('avatar')}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                        placeholder="https://..."
                                    />
                                    {errors.avatar && <p className="text-[10px] text-red-500 mt-1">{errors.avatar.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password (optional)</label>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                        placeholder="********"
                                    />
                                    {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div>
                                    {success && <span className="text-emerald-400 text-xs font-bold">Saved!</span>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
