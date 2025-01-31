import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';

interface KudosAttributes {
    id: number;
    from_user_id: string;
    to_user_id: string;
    team_id: string;
    category: string;
    message: string;
    created_at: Date;
}

interface KudosCreationAttributes
    extends Optional<KudosAttributes, 'id' | 'created_at'> { }

class Kudos extends Model<KudosAttributes, KudosCreationAttributes>
    implements KudosAttributes {
    public id!: number;
    public from_user_id!: string;
    public to_user_id!: string;
    public team_id!: string;
    public category!: string;
    public message!: string;
    public created_at!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Kudos.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        from_user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: User, key: 'id' },
            onDelete: 'CASCADE',
        },
        to_user_id: {
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
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
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
        modelName: 'Kudos',
        tableName: 'kudos',
        timestamps: true,
    }
);

User.hasMany(Kudos, { foreignKey: 'from_user_id' });
User.hasMany(Kudos, { foreignKey: 'to_user_id' });
Kudos.belongsTo(User, { foreignKey: 'from_user_id' });
Kudos.belongsTo(User, { foreignKey: 'to_user_id' });
Team.hasMany(Kudos, { foreignKey: 'team_id' });
Kudos.belongsTo(Team, { foreignKey: 'team_id' });

export default Kudos;