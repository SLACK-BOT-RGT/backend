import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class StandupResponses extends Model {
    public id!: number;
    public config_id!: string;
    public responses!: string;
    public submitted_at!:number;
}

StandupResponses.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        config_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        response: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
       submited_at: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'StandupResponses',
        tableName: 'standup_responses',
        timestamps: true, 
    }
);

export default StandupResponses;
