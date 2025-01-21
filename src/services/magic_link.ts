import jwt from 'jsonwebtoken';
import MagicLink from '../model/magicLink';
import { generateCode } from '../utils';


export const create_magic_link = async (user_id: number) => {
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await MagicLink.update(
        { status: 'revoked' },
        { where: { user_id, status: 'active' } }
    );

    const magic_link_data = await MagicLink.create({
        token,
        user_id,
        expiresAt,
        used: false,
        passcode: generateCode(),
        status: 'active',
    });


    return { token, magic_link_data };
};

export const get_magic_link_by_token = async (token: string) => {

    const magicLink = await MagicLink.findOne({ where: { token } });

    return magicLink?.dataValues;
}