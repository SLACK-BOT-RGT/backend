import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Team from './team';


class Polls extends Model {
    public id!: number;
    public team_id!: number;
    public created_by_id!: number;
    public titles!: string;
    public options!: string;
    public is_anonymous!: string;
    public expires_at!: number;
    public created_at!: number;
}

Polls.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
       titles:{
        type:DataTypes.STRING,
        allowNull:false

       },
        options:{
            type:DataTypes.STRING,
            allowNull:false
        },
        is_anonymous:{
            type: DataTypes.STRING,
            allowNull:false,
    
        },
         expires_at:{
            type: DataTypes.INTEGER,
            allowNull:false,
    
        },
        created_at:{
            type: DataTypes.INTEGER,
            allowNull:false,
    
        },
        
    },
    {
        sequelize,
        modelName: 'Polls',
        tableName: 'polls',
        timestamps: true,
    }
);

export default Polls;
