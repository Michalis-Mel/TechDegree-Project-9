'use strict';
const Sequelize = require('sequelize');

//Creating and exporting the course model
module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}

    Course.init({
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                  msg: "Please enter a user ID",
                }
              }
        },
        title: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                  msg: "Please enter a title",
                }
              }
        },
        description: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                  msg: "Please enter a description",
                }
              }
        },
        estimatedTime: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        },
        materialsNeeded: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        }
    },
    {sequelize});

    Course.associate = (models) => {
        Course.belongsTo(models.User,
            {foreignKey: {
                fieldName: "userId",
                allowNull: false
                }
            }
        )
    };


    return Course
};
