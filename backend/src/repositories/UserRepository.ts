import User, { IUser } from '../models/User';

export class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id).select('-password');
    }

    async create(userData: Partial<IUser>): Promise<IUser> {
        const user = new User(userData);
        return await user.save();
    }

    async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, userData, { new: true }).select('-password');
    }

    async findAll(): Promise<IUser[]> {
        return await User.find().select('-password');
    }
}
