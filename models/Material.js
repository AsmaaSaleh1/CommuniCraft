const { DataTypes } = require('sequelize');
const sequelize = require('../modals/db');
const User = require("./User");
const ProjectMaterial = require("./project_material"); // Import the ProjectMaterial model
const Material = sequelize.define('material', {
    materialID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materialName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please enter a material name' }
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
            notNull: { msg: 'Please enter cost' },
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
    tableName: 'material',
    timestamps: false
});
//Material.belongsToMany(Project, { through: ProjectMaterial, foreignKey: 'materialID' });

module.exports = Material;
