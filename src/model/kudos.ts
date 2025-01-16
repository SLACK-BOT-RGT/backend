import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Team from './team';


class Kudos extends Model {
    public id!: number;
    public user_id!: number;
    public team_id!: number;
    public created_by_id!: number;
    public category!: string;
    public message!: string;
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
        
        created_by_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
     category:{
        type:DataTypes.STRING,
        allowNull:false

       },
        message:{
            type:DataTypes.STRING,
            allowNull:false
        },
        
         
        created_at:{
            type: DataTypes.INTEGER,
            allowNull:false,
    
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
