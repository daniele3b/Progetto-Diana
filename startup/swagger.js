// ALL ADDED
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Diana API',
            description: 'Diana è una piattaforma di monitoring degli agenti chimici da fornire alle autorità competenti per salvaguardare il territorio. Attraverso le stazioni dislocate nel territorio è possibile analizzare i dati riguardanti gli agenti chimici in tempo reale e studiarne la relazione con fattori complementari. ',
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