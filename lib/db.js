const Sequelize = require('sequelize');
const sequelize = new Sequelize('image', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

const Image = sequelize.define('image', {
    name: Sequelize.STRING,
    islike:{ type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
});

module.exports = {
    Image,
}

sequelize
    .authenticate()
    .then(() => {
        console.log('Database Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Database Unable to connect to the database:', err);
    });

module.exports = {
  sequelize,
  Sequelize,
  Image
}