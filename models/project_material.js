const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const Material = require("./Material");
const Project = require("./Project");
const ProjectMaterial = sequelize.define('project_material', {
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
    materialID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Material,
            key: 'materialID'
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
    tableName: 'project_material',
    timestamps: false
});

module.exports = ProjectMaterial;
