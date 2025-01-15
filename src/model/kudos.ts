import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';

class Kudos extends Model {
    public id!: number;
    public team_id!: number;
    public user_id!: number;
    public catgory!: string;
    public messages!: string;
    public created_at!: number;
}

Kudos.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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

        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
      messages: {
            type: DataTypes.STRING,
            allowNull: false,
           
        },
       created_at: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Kudos',
        tableName: 'kudos',
        timestamps: true, 
    }
);

export default Kudos;
