import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';

interface PollAttributes {
    id: number;
    team_id: string;
    created_by_id: string;
    title: string;
    options: any; // Using 'any' for JSONB type
    is_anonymous: boolean;
    expires_at: Date;
    created_at: Date;
}

interface PollCreationAttributes
    extends Optional<PollAttributes, 'id' | 'is_anonymous' | 'created_at'> { }

class Poll extends Model<PollAttributes, PollCreationAttributes>
    implements PollAttributes {
    public id!: number;
    public team_id!: string;
    public created_by_id!: string;
    public title!: string;
    public options!: any;
    public is_anonymous!: boolean;
    public expires_at!: Date;
    public created_at!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Poll.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        team_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: Team, key: 'id' },
            onDelete: 'CASCADE',
        },
        created_by_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: User, key: 'id' },
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        options: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        is_anonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Poll',
        tableName: 'polls',
        timestamps: true,
    }
);

export default Poll;