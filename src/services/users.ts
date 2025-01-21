import { UserModel } from "../model"
import { IUser } from "../types/interfaces"
import { CustomError } from "../utils/CustomError";

export const create_user = async (userData: IUser) => {

    const { email, name, timeZone, id, is_admin } = userData;

    const user = await UserModel.create({ email, name, timeZone, id, is_admin });

    return user.dataValues;
}

export const get_all_users = async () => {

    const users = await UserModel.findAll();

    return users;
}

export const get_user_by_email = async ({ email }: { email: string }) => {

    const user = await UserModel.findOne({
        where: {
            email: email
        }
    });

    return user?.dataValues;
}

export const get_user_by_id = async ({ id }: { id: string }) => {

    const user = await UserModel.findOne({
        where: {
            id: id
        }
    });

    return user?.dataValues;
}

export const delete_user_by_id = async ({ id }: { id: string }) => {

    const user = await UserModel.findOne({
        where: {
            id: id
        }
    });

    if (!user) throw new CustomError("User not found", 404);

    const userData = user?.dataValues;

    user?.destroy();

    return userData;
}