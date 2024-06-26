const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const User = require("./User");
//const Store = require("./Store");
//const Task = require('./Task');
const ProjectMaterial = require("./project_material"); // Import the ProjectMaterial model
//const Project = require("./project_material"); // Import the ProjectMaterial model
const ProjectTool = require("./project_tool");

const Project = sequelize.define('project', {
    projectID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a title' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a description' }
        }
    },
    groupSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter group size' }
        }
    },
    difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please choose difficulty' }
        }
    },
    category: {
        type: DataTypes.ENUM('textile crafts', 'paper crafts', 'wood crafts', 'metal crafts', 'ceramics and pottery', 'glass crafts', 'jewelry making', 'mixed media crafts'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please choose category' }
        }
    },
    creatorID: {
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
                    throw new Error('Creator does not exist');
                }
            }
        }
    },
    /*storeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
            model: Store,
            key: 'storeID'
        },
        validate: {
            async isStoreExists(value) {
                const store = await Store.findByPk(value);
                if (!store && value!=null) {
                    throw new Error('Store does not exist');
                }
            }
        }
    }*/
    cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter the cost' }
        }
    },isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // Default value is false (not completed)
    }
}, {
    tableName: 'project',
    timestamps: false
});
//Project.hasMany(ProjectMaterial, { foreignKey: 'projectID' });
//Project.hasMany(ProjectTool, { foreignKey: 'projectID' });

module.exports = Project;
