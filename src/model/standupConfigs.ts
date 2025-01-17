import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Team from "./team";  // Add this import

interface StandupConfigsAttributes {
    id: number;
    team_id: string;
    questions: string[] | null;
    reminder_time: string | null;
    reminder_days: string[] | null;
    is_active: boolean;
}

interface StandupConfigsCreationAttributes
    extends Optional<StandupConfigsAttributes, "id" | "questions" | "reminder_time" | "reminder_days" | "is_active"> { }

class StandupConfigs extends Model<StandupConfigsAttributes, StandupConfigsCreationAttributes>
    implements StandupConfigsAttributes {
    public id!: number;
    public team_id!: string;
    public questions!: string[] | null;
    public reminder_time!: string | null;
    public reminder_days!: string[] | null;
    public is_active!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

StandupConfigs.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        team_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Team,
                key: 'id'
            }
        },
        questions: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        reminder_time: {
            type: DataTypes.TIME,
            allowNull: true,
            defaultValue: null,
        },
        reminder_days: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: null,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "StandupConfigs",
        tableName: "standup_configs",
        timestamps: true,
    }
);

// Define the association directly here
StandupConfigs.belongsTo(Team, { foreignKey: 'team_id' });
Team.hasMany(StandupConfigs, { foreignKey: 'team_id' });

export default StandupConfigs;
