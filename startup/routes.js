var cors = require('cors')
const express = require('express')
const swaggerDocs = require('../startup/swagger')    
const swaggerUi = require('swagger-ui-express')     
const announcements = require('../routes/announcements')
const chemicalagent=require('../routes/chemicalagents')
const traffic = require('../routes/traffic')
const air_traffic = require('../routes/air_traffic')
const meteo = require('../routes/meteos')
<<<<<<< HEAD
const registration = require('../routes/registration')
=======
const report = require('../routes/report')
>>>>>>> 4c4363d5bbc95680b91dbeb9a0b0535fad094f9d

module.exports = function(app) {
    app.use(express.json())
    app.use(cors())
    app.use('/announcements', announcements)
    app.use('/diana-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))   // ADDED
    app.use('/chemical_agents',chemicalagent)
    app.use('/traffic', traffic)
    app.use('/weather', meteo)
    app.use('/air_traffic', air_traffic)
<<<<<<< HEAD
    app.use('/registration',registration)
=======
    app.use('/report', report)
>>>>>>> 4c4363d5bbc95680b91dbeb9a0b0535fad094f9d
}