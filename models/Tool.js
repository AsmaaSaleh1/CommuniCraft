const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const User = require('./User');

const Tool = sequelize.define('tool', {
    toolID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    toolName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a tool name' }
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter quantity' },
            isInt: { msg: 'Quantity must be an integer' }
        }
    },
    cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter the cost' },
            isInt: { msg: 'Cost must be an integer' }
        }
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
    tableName: 'tool',
    timestamps: false
});

module.exports = Tool;
