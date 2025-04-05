const { DataTypes } = require('sequelize')

module.exports = ({sequelize}) => {
    const Configuration = sequelize.define(
        'Configuration',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            rules: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: {}
            }
        }
    )

    return Configuration
}