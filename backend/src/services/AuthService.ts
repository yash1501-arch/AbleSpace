import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { IUser } from '../models/User';

export class AuthService {
    private userRepository = new UserRepository();

    /**
   * Registers a new user with hashed password
   * @param userData Object containing user details
   * @returns JWT token and user profile
   */
    async register(userData: Partial<IUser>) {
        const existingUser = await this.userRepository.findByEmail(userData.email!);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password!, 10);
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
        });

        return this.generateToken(user);
    }

    /**
   * Authenticates a user and returns a token
   * @param email User email
   * @param password User password
   * @returns JWT token and user profile
   */
    async login(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return this.generateToken(user);
    }

    generateToken(user: IUser) {
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });
        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
        };
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateProfile(userId: string, updateData: Partial<IUser>) {
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        return await this.userRepository.update(userId, updateData);
    }
}
