import { AuthService } from './AuthService';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../repositories/UserRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        userRepository = new UserRepository() as jest.Mocked<UserRepository>;
        authService = new AuthService();
        // Re-assign mocked repository if necessary, but here we use the one imported in the service
        // In our implementation, the service instantiates the repo. This makes it harder to inject.
        // I will refactor the service slightly to allow injection for better testability or just mock the class.
    });

    it('should hash password and create user on register', async () => {
        const mockUser = { _id: '123', name: 'Test', email: 'test@test.com', password: 'hashed' };
        jest.spyOn(UserRepository.prototype, 'findByEmail').mockResolvedValue(null);
        jest.spyOn(UserRepository.prototype, 'create').mockResolvedValue(mockUser as any);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
        (jwt.sign as jest.Mock).mockReturnValue('token');

        process.env.JWT_SECRET = 'secret';

        const result = await authService.register({ name: 'Test', email: 'test@test.com', password: 'password' });

        expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
        expect(UserRepository.prototype.create).toHaveBeenCalled();
        expect(result.token).toBe('token');
    });

    it('should throw error if user already exists', async () => {
        jest.spyOn(UserRepository.prototype, 'findByEmail').mockResolvedValue({ email: 'test@test.com' } as any);

        await expect(authService.register({ email: 'test@test.com' }))
            .rejects.toThrow('User already exists');
    });

    it('should validate password on login', async () => {
        const mockUser = { _id: '123', email: 'test@test.com', password: 'hashed' };
        jest.spyOn(UserRepository.prototype, 'findByEmail').mockResolvedValue(mockUser as any);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('token');

        const result = await authService.login('test@test.com', 'password');

        expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
        expect(result.token).toBe('token');
    });
});
