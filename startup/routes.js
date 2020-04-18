var cors = require('cors')
const express = require('express')
const swaggerDocs = require('../startup/swagger')    
const swaggerUi = require('swagger-ui-express')     
const announcements = require('../routes/announcements')
const chemicalagent=require('../routes/chemicalagents')
const traffic = require('../routes/traffic')
const air_traffic = require('../routes/air_traffic')
const meteo = require('../routes/meteos')
const report = require('../routes/report')

module.exports = function(app) {
    app.use(express.json())
    app.use(cors())
    app.use('/announcements', announcements)
    app.use('/diana-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))   // ADDED
    app.use('/chemical_agents',chemicalagent)
    app.use('/traffic', traffic)
    app.use('/weather', meteo)
    app.use('/air_traffic', air_traffic)
    app.use('/report', report)
}