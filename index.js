const express = require('express')
const app = express()

const port = process.env.PORT || 8080

require('./startup/db')()
require('./startup/routes')(app)

app.listen(8080, () =>  { console.log("Server listening on port : " , port)})