const express = require('express')
const swaggerDocs = require('../startup/swagger')    
const swaggerUi = require('swagger-ui-express')     
const announcements = require('../routes/announcements')
const chemicalagent=require('../routes/chemicalagents')
const traffic = require('../routes/traffic')
const air_traffic = require('../routes/air_traffic')
const meteo = require('../routes/meteos')
const auth = require('../routes/auth')
const registration = require('../routes/registration')
const report = require('../routes/report')
const google_auth = require('../routes/google-auth')
const sign_in_complete = require('../routes/signIncomplete')
const token = require('../routes/token')

module.exports = function(app) {
    app.use(express.json())
    
    app.use('/announcements', announcements)
    app.use('/diana-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))   // ADDED
    app.use('/chemical_agents',chemicalagent)
    app.use('/traffic', traffic)
    app.use('/weather', meteo)
    app.use('/air_traffic', air_traffic)
    app.use('/auth', auth)
    app.use('/registration',registration)
    app.use('/report', report)
    app.use('/sign-in/google', google_auth)
    app.use('/sign-in/complete', sign_in_complete)
    app.use('/token', token)
}