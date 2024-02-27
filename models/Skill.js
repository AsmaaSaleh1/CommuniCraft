const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const User = require("./User");

const Skill = sequelize.define('skill', {
    skillID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    skillName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a skill name' }
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
    tableName: 'skill',
    timestamps: false
});

module.exports = Skill;
