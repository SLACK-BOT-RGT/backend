import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';

import { create_user, delete_user_by_id, get_all_users, get_user_by_email, get_user_by_id } from '../services/users';


export const createUserRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, timeZone, id, is_admin } = req.body;

        const existtingUser = await get_user_by_email({ email });

        if (existtingUser) throw new CustomError("User with this email already exist!", 409);

        const newUser = await create_user({ email, name, timeZone, id, is_admin });

        res.status(201).json({ data: newUser, success: true });
    } catch (error) {
        next(error);
    }
};

export const getUsersRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await get_all_users();

        res.status(200).json({ data: users, success: true });
    } catch (error) {
        next(error);
    }
};

export const getUserByIdRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await get_user_by_id({ id: req.params.id });

        if (!user) throw new CustomError('User not found', 404);

        res.status(200).json({ data: user, success: true });
    } catch (error) {
        next(error);
    }
};

export const deleteUserRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await delete_user_by_id({ id: req.params.id });

        res.status(200).json({ data: user, success: true });
    } catch (error) {
        next(error);
    }
};