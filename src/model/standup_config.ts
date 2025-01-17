import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class StandupConfig extends Model {
    public id!: number;
    public questions!: string;
    
    public reminder_time!: number;
    public reminder_days!: string;
    public is_active!:boolean;


}

StandupConfig.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        questions: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
       
        reminder_time:{
            type: DataTypes.INTEGER,
            allowNull:false,
    
        },
        reminder_days:{
            type: DataTypes.INTEGER,
            allowNull:false,
    

        },
        is_active:{
            type:DataTypes.BOOLEAN,
            allowNull: false
        }

    },
    {
        sequelize,
        modelName: 'StandupConfig',
        tableName: 'standup_config',
        timestamps: true,
    }
);

export default StandupConfig;
