import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import StandupConfigsModel from './standupConfigs';
import StandupConfigs from './standupConfigs';

interface StandupResponseAttributes {
    id: number;
    user_id: string;
    config_id: number;
    responses: any; // Using 'any' for JSONB type
    submitted_at: Date;
}

interface StandupResponseCreationAttributes
    extends Optional<StandupResponseAttributes, 'id'> { }

class StandupResponse extends Model<StandupResponseAttributes, StandupResponseCreationAttributes>
    implements StandupResponseAttributes {
    public id!: number;
    public user_id!: string;
    public config_id!: number;
    public responses!: any;
    public submitted_at!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // public User?: User;
}

StandupResponse.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: User, key: 'id' },
            onDelete: 'CASCADE',
        },
        config_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: StandupConfigsModel, key: 'id' },
            onDelete: 'CASCADE',
        },
        responses: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        submitted_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'StandupResponse',
        tableName: 'standup_responses',
        timestamps: true,
    }
);

User.hasMany(StandupResponse, { foreignKey: 'user_id' });
StandupResponse.belongsTo(User, { foreignKey: 'user_id' });

StandupConfigs.hasMany(StandupResponse, { foreignKey: 'config_id' });
StandupResponse.belongsTo(StandupConfigs, { foreignKey: 'config_id' });

export default StandupResponse;