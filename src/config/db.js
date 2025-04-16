import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const DB_PASS = process.env.DB_PASS || 'root'; // Use environment variable or default to 'root'

const sequelize = new Sequelize('DATA', 'root', DB_PASS, {
  host: 'localhost',
  dialect: 'mysql', 
});

export default sequelize;
