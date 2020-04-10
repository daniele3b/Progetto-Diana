const express = require('express')
const app = express()
const config=require('config')
const {updateChemicalAgents}=require('./startup/updater')

const port = process.env.PORT || 8080

require('./startup/db')()
require('./startup/routes')(app)

const server = app.listen(8080, () =>  { console.log("Server listening on port : " , port)})


setInterval(updateChemicalAgents,config.get('aqi_time_int'))
module.exports = server

