const express = require('express')
const winston=require('winston')
const {logger}=require('./startup/logging')
const app = express()
const config=require('config')
const {updateChemicalAgents}=require('./startup/updater')
const {updateMeteo}=require('./startup/updater_meteo')

const port = process.env.PORT || 8080 

require('./startup/db')()
require('./startup/routes')(app)

const server = app.listen(8080, () =>  { console.log("Server listening on port : " , port)})

setInterval(updateChemicalAgents,config.get('aqi_time_int')) //1 minute

setInterval(updateMeteo, config.get('timer_meteo')) //15 seconds

module.exports = server

