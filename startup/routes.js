const express = require('express')
const swaggerDocs = require('../startup/swagger')   // ADDED 
const swaggerUi = require('swagger-ui-express')     // ADDED
const announcements = require('../routes/announcements')
const chemicalagent=require('../routes/chemicalagents')

module.exports = function(app) {
    app.use(express.json())
    app.use('/announcements', announcements)
<<<<<<< HEAD
    app.use('/diana-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))   // ADDED
=======
    app.use('/chemical_agents',chemicalagent)
>>>>>>> 0d01ff6a02a901b0f722b9b0ff88581d498a24c5
}