import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';

interface PollOption {
    id: string;
    text: string;
    votes: number;
    voters?: { id: string, name: string, submitted_at: Date }[];
}

interface PollAttributes {
    id: number;
    team_id: string;
    creator_id: string;
    question: string;
    options: PollOption[];
    is_anonymous: boolean;
    start_time: Date;
    end_time: Date;
    status: 'draft' | 'active' | 'closed';
    total_votes: number;
}

class Poll extends Model {
    public id!: number;
    public team_id!: string;
    public creator_id!: string;
    public question!: string;
    public options!: PollOption[];
    public is_anonymous!: boolean;
    public start_time!: Date;
    public end_time!: Date;
    // public status!: 'draft' | 'active' | 'closed';
    public total_votes!: number;
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
        creator_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: User, key: 'id' },
            onDelete: 'CASCADE',
        },
        question: {
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
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        // status: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        // },
        total_votes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        sequelize,
        modelName: 'Poll',
        tableName: 'polls',
        timestamps: true,
    }
);

Team.hasMany(Poll, { foreignKey: 'team_id' });
Poll.belongsTo(Team, { foreignKey: 'team_id' });
User.hasMany(Poll, { foreignKey: 'creator_id' });
Poll.belongsTo(User, { foreignKey: 'creator_id' });

export default Poll;