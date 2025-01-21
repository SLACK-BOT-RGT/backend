import { create_magic_link, get_magic_link_by_token } from '../services/magic_link';
import { CustomError } from '../utils/CustomError';
import { get_user_by_email, get_user_by_id } from '../services/users';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import MagicLink from '../model/magicLink';
import nodemailer from 'nodemailer';
import { IUser } from '../types/interfaces';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

export const sendMagicLinkRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    try {
        const user = await get_user_by_email({ email });
        if (!user) throw new CustomError('User not found', 404);

        const { token, magic_link_data } = await create_magic_link(user.id);

        const magicLink = `${process.env.BASE_URL}/send-magic-link/verify/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Your Magic Login Link',
            html: `<p>Click the link below to login:</p><a href="${magicLink}">${magicLink}</a>. <p>Use this password: ${magic_link_data.passcode} to login and After change the is.`
        });

        res.status(200).json({ data: { message: 'Magic link sent successfully' }, success: true });
    } catch (error) {
        console.error(error);
        next(error)
    }
};


export const verifyMagicLinkRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    try {
        const magicLink = await get_magic_link_by_token(token);

        if (!magicLink) {
            throw new CustomError('Magic link not found', 404);
        }

        if (magicLink.used) {
            throw new CustomError('This magic link has been used', 400);
        }

        if (magicLink.status === 'revoked') {
            throw new CustomError('This magic link has been revoked', 400);
        }

        if (new Date() > magicLink.expiresAt) {
            throw new CustomError('This magic link has expired', 400);
        }

        const { user_id } = jwt.verify(token, process.env.JWT_SECRET!) as { user_id: string };

        await MagicLink.update(
            { status: 'revoked' },
            { where: { user_id, status: 'active' } }
        );

        const user: IUser = await get_user_by_id({ id: user_id });

        if (!user) throw new CustomError('User not found', 404);

        const accesstoken = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET!, { expiresIn: '7m' });

        res.redirect(`http://localhost:5173/passcode?accesstoken=${accesstoken}`);
    } catch (error) {
        next(error);
    }
};
