import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Team from './team';
import User from './user';

class MoodCheckins extends Model {
    public id!: number;
    public user_id!: number;
    public team_id!: number;
    public mood_score!: number;
    public note!:string;
    public created_at!:number;


}

MoodCheckins.init(
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
         mood_score:{
            type: DataTypes.INTEGER,
            allowNull: false,
         },
       
        submited_at:{
            type: DataTypes.INTEGER,
            allowNull:false,
    
        },
       

    },
    {
        sequelize,
        modelName: 'MoodCheckins',
        tableName: 'mood_checkins',
        timestamps: true,
    }
);

export default MoodCheckins;
