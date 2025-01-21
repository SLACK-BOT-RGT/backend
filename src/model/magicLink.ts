import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user';

class MagicLink extends Model {
    public id!: number;
    public token!: string;
    public user_id!: number;
    public passcode!: number;
    public used!: boolean;
    public expiresAt!: Date;
    public status!: 'active' | 'revoked';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MagicLink.init(
    {
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        used: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        passcode: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'revoked'),
            defaultValue: 'active',
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'MagicLink',
        tableName: 'magic_links',
    }
);

User.hasMany(MagicLink, { foreignKey: 'user_id' });
MagicLink.belongsTo(User, { foreignKey: 'user_id' });

export default MagicLink;


