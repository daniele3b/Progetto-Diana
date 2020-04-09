const express = require('express')
const announcements = require('../routes/announcements')

module.exports = function(app) {
    app.use(express.json())
    app.use('/announcements', announcements)
}