const express = require('express')
const announcements = require('../routes/announcements')
const chemicalagent=require('../routes/chemicalagents')

module.exports = function(app) {
    app.use(express.json())
    app.use('/announcements', announcements)
    app.use('/chemical_agents',chemicalagent)
}