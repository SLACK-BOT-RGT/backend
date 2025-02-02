import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Poll from './polls';


interface PollResponseAttributes {
    id: number;
    poll_id: number;
    user_id: string;
    response: string;
    submitted_at: Date;
}

class PollResponse extends Model {
    public id!: number;
    public poll_id!: number;
    public user_id!: string;
    public response!: string;
    public submitted_at!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PollResponse.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        poll_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Poll, key: 'id' },
            onDelete: 'CASCADE',
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: User, key: 'id' },
            onDelete: 'CASCADE',
        },
        response: {
            type: DataTypes.TEXT,
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
        modelName: 'PollResponse',
        tableName: 'poll_responses',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['poll_id', 'user_id'],
            },
        ],
    }
);


export default PollResponse;