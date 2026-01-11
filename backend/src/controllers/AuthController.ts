import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const user = await authService.getProfile((req as any).user.id);
            res.json(user);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const user = await authService.updateProfile((req as any).user.id, req.body);
            res.json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
