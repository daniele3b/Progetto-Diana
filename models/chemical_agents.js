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
    },
    sensor:{
        type:String,
        required:true,
        minlenght:10,
        maxlenght:70

    },
    uid:{
        type:String,
        required:true,
        minlength:1,
        maxlenght:15
    },
    lat:{
        type:String,
        required:true,
        minlength:1,
        maxlenght:15
    },

    long:{
            type:String,
            required:true,
            minlength:1,
            maxlenght:15
    }
});



const Chemical_Agent = mongoose.model('Chemical_Agent', chemical_agentSchema)

function validateChemicalAgent(chemical_agent) {
    const schema = {
        reg_date: Joi.date().required(),
        value: Joi.number().required(),
        types:Joi.string().valid('O3','NO', 'NO2','NOX','PM10','PM25','BENZENE','CO','SO2'),
        sensor:Joi.string().min(10).max(70).required(),
        uid:Joi.string.min(1).maxlenght(15).required(),
        lat:Joi.string.min(1).maxlenght(15).required(),
        long:Joi.string.min(1).maxlenght(15).required()
        
    }
    return Joi.validate(chemical_agent,schema)
}

exports.Chemical_Agent = Chemical_Agent
exports.validate = validateChemicalAgent
exports.Agents=Agents