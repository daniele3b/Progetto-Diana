const express = require('express')
const app = express()
const {updateChemicalAgents}=require("./startup/updater")
const config=require ('config')


const port = process.env.PORT || 8080

require('./startup/db')()
require('./startup/routes')(app)

app.listen(8080, () =>  { console.log("Server listening on port : " , port)})


//Set the call to function to update data in db about chemical_agents
setInterval(updateChemicalAgents,config.get('aqi_time_int'))
