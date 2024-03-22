const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const Tool = require('./Tool');
const Project = require('./Project');

const ProjectTool = sequelize.define('project_tool', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    projectID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Project,
            key: 'projectID'
        }
    },
    toolID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Tool,
            key: 'toolID'
        }
    },
    quantityUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter quantity used' },
            isInt: { msg: 'Quantity used must be an integer' }
        }
    }
}, {
    tableName: 'project_tool',
    timestamps: false
});

module.exports = ProjectTool;
