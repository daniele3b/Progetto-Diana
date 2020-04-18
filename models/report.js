const Joi = require('joi')
const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    CF: { 
        type: String,
        required: true,
        minlength: 16, 
        maxlength: 16
    },
    categoria: {
        type: String,
        enum: ['rifiuti', 'incendio', 'altro'],
        required: true
    },
    indirizzo: {
        type: String,
        required: true,
    },
    data: {  
        type: Date
    },
    descrizione: { 
        type: String,
        required: true
    },
    stato: {    
        type: String,
        enum: ['in attesa', 'presa in carico', 'risolto']
    },
    visibile: {   
        type: Boolean
    }
})


const Report = mongoose.model('Report', reportSchema)


function validateReport(report) {
    
    const schema = {
        CF: Joi.string().min(16).max(16).required(),
        categoria: Joi.string().valid('rifiuti', 'incendio', 'altro').required(),  
        indirizzo: Joi.string().required(),  
        //data: Joi.date().required(),   
        descrizione: Joi.string().required()/*,
        stato: Joi.string().valid('in attesa', 'presa in carico', 'risolto').required(),
        visibile: Joi.boolean().required*/
    }

    return Joi.validate(report,schema)
}


exports.Report = Report
exports.validate = validateReport