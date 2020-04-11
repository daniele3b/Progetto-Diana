const express = require('express')
const swaggerDocs = require('../startup/swagger')   // ADDED 
const swaggerUi = require('swagger-ui-express')     // ADDED
const announcements = require('../routes/announcements')
const chemicalagent=require('../routes/chemicalagents')
const traffic = require('../routes/traffic')
const meteo = require('../routes/meteos')

module.exports = function(app) {
    app.use(express.json())
    app.use('/announcements', announcements)
    app.use('/diana-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))   // ADDED
    app.use('/chemical_agents',chemicalagent)
    app.use('/traffic', traffic)
    app.use('/meteo', meteo)
}