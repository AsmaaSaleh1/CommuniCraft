const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const User = require("./User");

const Store = sequelize.define('store', {
    storeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a store name' }
        }
    },
    ownerID: {
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
    location: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a location' }
        }
    }
}, {
    tableName: 'store',
    timestamps: false
});

module.exports = Store;
