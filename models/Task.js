const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const User = require("./User");
const Project = require("./Project");

const Task = sequelize.define('task', {
    taskID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter description' }
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'in progress', 'completed'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please choose status' }
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
    projectID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Project,
            key: 'projectID'
        },
        validate: {
            async isProjectExists(value) {
                const project = await Project.findByPk(value);
                if (!project) {
                    throw new Error('Project does not exist');
                }
            }
        }
    }
}, {
    tableName: 'task',
    timestamps: false
});

module.exports = Task;
