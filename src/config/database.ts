import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    dialect: 'postgres',
    // dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false, // Adjust based on your security needs
    //     },
    // },
    logging: console.log,
    // logging: true,
});

export default sequelize;
