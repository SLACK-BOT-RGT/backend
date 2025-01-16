import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
    public id!: string;
    public name!: string;
    public email!: string;
    public timeZone!: string;
}

User.init(
    {
        id: {
            type: DataTypes.STRING,
            // autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        timeZone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true, // Includes createdAt and updatedAt columns
    }
);

export default User;
