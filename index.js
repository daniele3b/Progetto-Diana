const express = require('express')
const app = express()
<<<<<<< HEAD
=======
const {updateChemicalAgents}=require("./startup/updater")
const config=require ('config')

>>>>>>> 0d01ff6a02a901b0f722b9b0ff88581d498a24c5

const port = process.env.PORT || 8080

require('./startup/db')()
require('./startup/routes')(app)

const server = app.listen(8080, () =>  { console.log("Server listening on port : " , port)})

<<<<<<< HEAD
module.exports = server
=======

//Set the call to function to update data in db about chemical_agents
setInterval(updateChemicalAgents,config.get('aqi_time_int'))
>>>>>>> 0d01ff6a02a901b0f722b9b0ff88581d498a24c5
