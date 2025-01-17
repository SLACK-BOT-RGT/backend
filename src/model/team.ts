import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Team extends Model {
    public id!: string;
    public name!: string;
    public description!: string;
}

Team.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Team',
        tableName: 'teams',
        timestamps: true,
    }
);

export default Team;
