const express = require('express')
const announcements = require('../routes/announcements')
const chemicalagent=require('../routes/chemicalagents')
const traffic = require('../routes/traffic')

module.exports = function(app) {
    app.use(express.json())
    app.use('/announcements', announcements)
    app.use('/chemical_agents',chemicalagent)
    app.use('/traffic', traffic)
}