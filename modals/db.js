const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config.js');

// Create a Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: 'mysql',
});

module.exports = sequelize;
