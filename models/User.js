const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');

// Define the User model
const User = sequelize.define('user', {
    userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a username' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: 'Please enter a valid email' }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8],
                msg: 'Minimum password length is 8 characters'
            }
        }
    },
    interests: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter interests' }
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a location' }
        }
    }
}, {
    tableName: 'user',
    timestamps: false
});

module.exports = User;
