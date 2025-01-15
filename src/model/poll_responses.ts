import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Team from './team';
import User from './user';

class PollsResponses extends Model {
    public id!: number;
    public user_id!: number;
    public polls_id!: number;
    public submitted_at!:number;
    public responses!:string;


}

PollsResponses.init(
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
       polls_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        modelName: 'PollsResponses',
        tableName: 'polls_responses',
        timestamps: true,
    }
);

export default PollsResponses;
