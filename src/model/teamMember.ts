import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';

class TeamMember extends Model {
    public id!: number;
    public role!: string;
    public user_id!: string;
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
    },
    {
        sequelize,
        modelName: 'TeamMember',
        tableName: 'team_members',
        timestamps: true,
    }
);

Team.hasMany(TeamMember, { foreignKey: 'team_id' });
TeamMember.belongsTo(Team, { foreignKey: 'team_id' });

User.hasMany(TeamMember, { foreignKey: 'user_id' });
TeamMember.belongsTo(User, { foreignKey: 'user_id' });

export default TeamMember;
