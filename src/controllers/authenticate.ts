import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import { getUserById } from '../services/userService';
import { AuthRequest, IUser } from '../types/interfaces';
import { CustomError } from '../utils/CustomError';
import { get_user_by_id } from '../services/users';
import MagicLink from '../model/magicLink';
// import { generateCode } from '../utils';
// import UserOrganization from '../models/UserOrganization';

export const Login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { passcode } = req.body;
    const user_id = req.user?.id;
    try {
        if (!user_id) throw new CustomError("Not Authorized", 401);
        const user: IUser = await get_user_by_id({ id: user_id });

        const magic = await MagicLink.findOne({
            where: {
                user_id: user.id,
                passcode: passcode,
                used: false
            }
        })

        if (!magic) {
            throw new CustomError("Wrong credential", 401);
        }

        magic.update(
            { used: true },
            { where: { user_id, status: 'active' } }
        );

        const accesstoken = jwt.sign({ user_id: user_id, is_admin: user.is_admin }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        const userData = await get_user_by_id({ id: user_id });

        res.status(200).json({ data: userData, accesstoken });
    } catch (error) {
        next(error);
    }
}
