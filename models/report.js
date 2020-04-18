const Joi = require('joi')
const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    id_number: {
        type: Number
    },
    CF: { 
        type: String,
        required: true,
        minlength: 16, 
        maxlength: 16
    },
    category: {
        type: String,
        enum: ['Rifiuti', 'Incendio', 'Urbanistica', 'Allagamento', 'Altro'],
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    date: {  
        type: Date
    },
    description: { 
        type: String,
        required: true
    },
    status: {    
        type: String,
        enum: ['in attesa', 'presa in carico', 'risolto']
    },
    visible: {   
        type: Boolean
    }
})


const Report = mongoose.model('Report', reportSchema)


function validateReport(report) {
    
    const schema = {
        CF: Joi.string().min(16).max(16).required(),
        category: Joi.string().valid('Rifiuti', 'Incendio', 'Urbanistica', 'Idrogeologia', 'Altro').required(),  
        address: Joi.string().required(),  
        description: Joi.string().required()
    }

    return Joi.validate(report,schema)
}


exports.Report = Report
exports.validate = validateReport