

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user';

class StandupResponses extends Model {
    public id!: number;
    public config_id!: number;
    public user_id!: number;
    public responses!: string;
    public submitted_at! : number

}

StandupResponses.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
       config_id: {
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
        responses:{
            type:DataTypes.STRING,
            allowNull:false
        },
        
        submited_at:{
            type: DataTypes.INTEGER,
            allowNull:false,
    
        },
        
       
       

    },
    {
        sequelize,
        modelName: 'StandupResponses',
        tableName: 'standup_responses',
        timestamps: true,
    }
);

export default  StandupResponses;
