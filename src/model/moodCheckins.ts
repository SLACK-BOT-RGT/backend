import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';
import { IMoodTracking } from '../types/interfaces';


interface MoodCheckinCreationAttributes
    extends Optional<IMoodTracking, 'id' | 'note' | 'created_at'> { }

class MoodCheckin extends Model<IMoodTracking, MoodCheckinCreationAttributes>
    implements IMoodTracking {
    public id!: number;
    public user_id!: string;
    public team_id!: string;
    public mood_score!: number;
    public is_anonymous!: boolean;
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
        is_anonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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

User.hasMany(MoodCheckin, { foreignKey: 'user_id' });
MoodCheckin.belongsTo(User, { foreignKey: 'user_id' });
Team.hasMany(MoodCheckin, { foreignKey: 'team_id' });
MoodCheckin.belongsTo(Team, { foreignKey: 'team_id' });

export default MoodCheckin;