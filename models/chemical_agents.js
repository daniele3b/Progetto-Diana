const Joi = require('joi')
const mongoose = require('mongoose')

const Agents = Object.freeze({
    O3:'O3',
    NO:'NO',
    NO2: 'NO2',
    NOX:'NOX',
    PM10:'PM10',
    PM25:'PM25',
    BENZENE:'BENZENE',
    CO:'CO',
    SO2:'SO2'
  });

const chemical_agentSchema = new mongoose.Schema({
    reg_date: {
        type: Date,
        required: true  
    },
    value: {
        type: Number,
        required: true 
    },
    types: {
        type: String,
        enum: ['O3','NO','NO2','NOX','PM10','PM25','BENZENE','CO','SO2'],
        uppercase:true,
        required: true,
    }
});



const Chemical_Agent = mongoose.model('Chemical_Agent', chemical_agentSchema)

function validateChemicalAgent(chemical_agent) {
    const schema = {
        reg_date: Joi.date().required(),
        value: Joi.number().required(),
        types:Joi.string().valid('O3','NO', 'NO2','NOX','PM10','PM25','BENZENE','CO','SO2')
    }
    return Joi.validate(chemical_agent,schema)
}

exports.Chemical_Agent = Chemical_Agent
exports.validate = validateChemicalAgent
exports.Agents=Agents