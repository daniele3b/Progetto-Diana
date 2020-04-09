const mongoose = require('mongoose')
const config = require('config')

module.exports = function () {
    const db = config.get('db')
    mongoose.connect(db, { useNewUrlParser: true , useUnifiedTopology: true})
            .then(() => console.log('Successfully connected to MongoDB!'))
            .catch(err => console.log("Error encounterd while connecting to MongoDB : " , err.message))
}