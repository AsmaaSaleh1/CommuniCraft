const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const User = require("./User");

const Material = sequelize.define('material', {
    materialID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materialName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userID'
        },
        validate: {
            async isUserExists(value) {
                const user = await User.findByPk(value);
                if (!user) {
                    throw new Error('User does not exist');
                }
            }
        }
    },
}, {
    tableName: 'material',
    timestamps: false
});

module.exports = Material;