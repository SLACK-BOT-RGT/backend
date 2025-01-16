import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database"; // Adjust this import to your Sequelize instance setup

interface StandupConfigsAttributes {
    id: number;
    team_id: number;
    questions: string[] | null;
    reminder_time: string | null;
    reminder_days: string[] | null;
    is_active: boolean;
}

interface StandupConfigsCreationAttributes
    extends Optional<StandupConfigsAttributes, "id" | "questions" | "reminder_time" | "reminder_days" | "is_active"> { }

class StandupConfigsModel extends Model<StandupConfigsAttributes, StandupConfigsCreationAttributes>
    implements StandupConfigsAttributes {
    public id!: number;
    public team_id!: number;
    public questions!: string[] | null;
    public reminder_time!: string | null;
    public reminder_days!: string[] | null;
    public is_active!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

StandupConfigsModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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

export default StandupConfigsModel;
