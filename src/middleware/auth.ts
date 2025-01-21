import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, IUser } from '../types/interfaces';
import { get_user_by_id } from '../services/users';

interface DecodedToken {
    user_id: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Access Denied: No Token Provided' });
            return
        }


        const { user_id } = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;


        const user = await get_user_by_id({ id: user_id });
        if (!user) {
            res.status(401).json({ message: 'Access Denied: User Not Found' });
            return
        }

        req.user = user as IUser;
        next();
    } catch (error: unknown) {
        console.error('Token Verification Error:', error);
        res.status(403).json({ message: 'Invalid or Expired Token' });
    }
};

export const authorizeAdmin = () => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                res.status(401).json({ message: 'Access Denied: User Not Authenticated' });
                return;
            }

            if (!user.is_admin) {
                res.status(403).json({ message: 'Access Denied: Insufficient Privileges' });
                return;
            }

            next();
        } catch (error) {
            console.error('Authorization Error:', error);
            res.status(500).json({ message: 'Server Error During Authorization' });
        }
    };
};