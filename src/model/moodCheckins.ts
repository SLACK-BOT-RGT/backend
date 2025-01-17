import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';

interface MoodCheckinAttributes {
    id: number;
    user_id: string;
    team_id: string;
    mood_score: number;
    note: string | null;
    created_at: Date;
}

interface MoodCheckinCreationAttributes
    extends Optional<MoodCheckinAttributes, 'id' | 'note' | 'created_at'> { }

class MoodCheckin extends Model<MoodCheckinAttributes, MoodCheckinCreationAttributes>
    implements MoodCheckinAttributes {
    public id!: number;
    public user_id!: string;
    public team_id!: string;
    public mood_score!: number;
    public note!: string | null;
    public created_at!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MoodCheckin.init(
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
        team_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: Team, key: 'id' },
            onDelete: 'CASCADE',
        },
        mood_score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'MoodCheckin',
        tableName: 'mood_checkins',
        timestamps: true,
    }
);

export default MoodCheckin;