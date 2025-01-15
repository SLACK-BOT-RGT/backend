import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';

class TeamMember extends Model {
    public id!: number;
    public role!: string;
    public user_id!: number;
    public team_id!: number;
}

TeamMember.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: 'id' },
            onDelete: 'CASCADE',
        },
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Team, key: 'id' },
            onDelete: 'CASCADE',
        },
    },
    {
        sequelize,
        modelName: 'TeamMember',
        tableName: 'team_members',
        timestamps: true,
    }
);

export default TeamMember;
