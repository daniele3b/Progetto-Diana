// ALL ADDED
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Diana API',
            description: 'Diana è un strumento per monitorare la salute ambientale della tua città',
            contact: {
                name: 'GIVI5'
            },
            servers: ['http://localhost:']
        }
    },
    apis: ['./routes/*.js']    
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)

module.exports = swaggerDocs