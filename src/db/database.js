const { Sequelize } = require('sequelize');

module.exports = function database() {
    const sequelize = new Sequelize(process.env.DB_URI)

    sequelize.authenticate()
        .then(() => {
            console.log('DB connection established')
        })
        .catch(err => {
            console.log('Unable to connect to db: ', err)
        })
}